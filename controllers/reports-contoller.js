const errorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const Rodada = require('../models/Rodada');
const Cambista = require('../models/Cambista');
const fs = require('fs');

exports.getRodada = asyncHandler(async(req, res, next) => {

    let string  = '';
    const rodada = await Rodada.findById(req.query.id).lean();

    if(!rodada)
        return next(new errorResponse('Nenhuma rodada foi encontrada com esse ID', 404));

    if(rodada.status != 'Finalizada' && rodada.status != 'Em_Pagamento')
        return next(new errorResponse('Essa rodada ainda não foi apurada', 404));

    //Montagem do CSV
    string += 'Informacao,Dados\n';
    string += 'Premio 10 Pontos, R$'+rodada.dez_pontos_real+'\n'; 
    string += 'Premio 9 Pontos, R$'+rodada.nove_pontos_real+'\n'; 
    string += 'Premio Menos Pontos, R$'+rodada.menos_pontos_real+'\n'; 
    string += 'Premio 4 a 8 Pontos, R$'+rodada.quatro_a_oito_pontos_real+'\n'; 
    string += 'Total Cambista, R$'+rodada.total_cambista_real+'\n'; 
    string += 'Acertos Menos Pontos,'+rodada.acertos_menos_pontos+'\n'; 
    string += 'Quantidade de Participantes,'+rodada.qtd_participantes+'\n'; 
    string += 'Total Arrecadado, R$'+rodada.total_arrecadado+'\n'; 
    string += 'Numero da Rodada,'+rodada.rodada_num+'\n'; 
    string += 'Valor da Aposta, R$'+rodada.valor_aposta+'\n'; 
    string += 'Insercao,'+getShortDate(rodada.data_insercao)+'\n'; 
    string += 'Inicio,'+getShortDate(rodada.data_inicio)+'\n'; 
    string += 'Termino,'+getShortDate(rodada.data_termino)+'\n'; 
    string += 'Quantidade de Sorteios,'+rodada.qtd_sorteios+'\n'; 

    enviaRelatorio(res, string, 'Relatorio de Rodada '+rodada.rodada_num+' - Completo.csv', next);
});

exports.getPagamentos = asyncHandler(async(req, res, next) => {

    const rodada = await Rodada.findById(req.query.id).populate('apostas').lean();
    let string  = '';

    const apostas = rodada.apostas;

    if(!rodada)
        return next(new errorResponse('Nenhuma rodada foi encontrada com esse ID', 404));

    if(rodada.status != 'Finalizada' && rodada.status != 'Em_Pagamento')
        return next(new errorResponse('Essa rodada ainda não foi apurada', 404));

    //Montagem do CSV
    string += 'Apostador,NSU,Data Aposta,Premio,Estado,Data Pagamento\n';
    apostas.forEach((aposta) => {
        string += aposta.nome_jogador+','+aposta.nsu+','+getShortDate(aposta.data_insercao)+','+aposta.premio+','+aposta.status;
        //enum: ['Ativa', 'Aguardando Pagamento', 'Não Premiado', 'Pago'],
        if(aposta.status == 'Pago'){
            string += getShortDate(aposta.data_pagamento)+'\n';
        }else {
            string += '\n';
        }
    });

    string += '\n\n';
    string += 'Total em Prêmios,'+rodada.total_premio+'\n'; 
    string += 'Total Pago,'+rodada.total_pago+'\n'; 

    enviaRelatorio(res, string, 'Relatorio de Pagamentos Rodada '+rodada.rodada_num+'.csv', next);
});

exports.getPagamentosCambista = asyncHandler(async(req, res, next) => {

    //buscar dentro das apostas da rodada aquelas que tem o id do cambista em questão e montar o relatorio.  parecido com o de cima
    const rodada = await Rodada.findById(req.query.id).populate('apostas').lean();
    const cambista = await Cambista.findById(req.query.cambista_id);

    if(!rodada)
        return next(new errorResponse('Nenhuma rodada foi encontrada com esse ID', 404));

    if(rodada.status != 'Finalizada' && rodada.status != 'Em_Pagamento')
        return next(new errorResponse('Essa rodada ainda não foi apurada', 404));

    if(!cambista)
        return next(new errorResponse('Nenhum cambista foi encontrado com esse id', 404));    

    let string  = '';

    const apostas = rodada.apostas;

    let total_premio = 0;
    let total_pago = 0;

    //Montagem do CSV
    string += 'Apostador,NSU,Data Aposta,Premio,Estado,Data Pagamento\n';
    apostas.forEach((aposta) => {
        if(aposta.cambista_id.equals(req.query.cambista_id == true)){
            string += aposta.nome_jogador+','+aposta.nsu+','+getShortDate(aposta.data_insercao)+','+aposta.premio+','+aposta.status;
            if(aposta.status == 'Pago'){
                string += getShortDate(aposta.data_pagamento)+'\n';
                total_premio = total_premio + aposta.premio;
                total_pago = total_pago + aposta.premio;
            }else {
                string += '\n';
                total_premio = total_premio + aposta.premio;
            }
        }
    });

    string += '\n\n';
    string += 'Total em Prêmios,'+total_premio+'\n'; 
    string += 'Total Pago,'+total_pago+'\n'; 

    enviaRelatorio(res, string, 'Relatorio Rodada '+rodada.rodada_num+' - Cambista '+ cambista.nome+'.csv', next);
});

exports.getRanking = asyncHandler(async(req, res, next) => {
    
    const rodada = await Rodada.findById(req.query.id).populate('apostas').lean();

    if(!rodada)
        return next(new errorResponse('Nenhuma rodada foi encontrada com esse ID', 404));

    if(rodada.status == 'Recebendo_Apostas')
        return next(new errorResponse('Essa rodada ainda não iniciou os sorteios', 404));

    let apostas = rodada.apostas;
    apostas.sort((a, b) => (a.certos < b.certos) ? 1 : -1);

    let string  = '';

    //Montagem do CSV
    string += 'Apostador,NSU,Data Aposta, Acertos\n';
    apostas.forEach((aposta) => {
        string += aposta.nome_jogador+','+aposta.nsu+','+getShortDate(aposta.data_insercao)+','+aposta.certos+'\n';
    });

    enviaRelatorio(res, string, 'Ranking Rodada '+rodada.rodada_num+'.csv', next);
});

exports.getApostas = asyncHandler(async(req, res, next) => {

    const rodada = await Rodada.findById(req.query.id).populate('apostas').lean();

    if(!rodada)
        return next(new errorResponse('Essa rodada ainda não iniciou os sorteios', 404));

    let apostas = rodada.apostas;

    let string  = '';

    //Montagem do CSV
    string += 'Apostador,NSU,Data Aposta\n';
    apostas.forEach((aposta) => {
        string += aposta.nome_jogador+','+aposta.nsu+','+getShortDate(aposta.data_insercao)+'\n';
    });

    enviaRelatorio(res, string, 'Apostas da Rodada '+rodada.rodada_num+'.csv', next);
});


getShortDate = (current_datetime) => {
    const months = ["JAN", "FEV", "MAR","ABR", "MAI", "JUN", "JUL", "AGO", "SET", "OUT", "NOV", "DEZ"];
    let formatted_date = current_datetime.getDate() + "/" + months[current_datetime.getMonth()] + "/" + current_datetime.getFullYear();
    return formatted_date;
}

enviaRelatorio = (res, string, downloadName, next) => {
    const fileName = 'RodadaReport'+Date.now()+'.csv';
    fs.writeFile(fileName, string, (err) => {
        if(err) return next(new errorResponse(err, 404));
        res.download(fileName, downloadName, (err) => {
            if(err) return next(new errorResponse(err, 404));
            fs.unlink(fileName, (err) => {
                if(err) return next(new errorResponse(err, 404));
            });
        });
    });
}