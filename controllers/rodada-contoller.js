const errorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const Rodada = require('../models/Rodada');
const Cambista = require('../models/Cambista');
const Aposta = require('../models/Aposta');

//Tela Rodadas
exports.getRodadas = asyncHandler(async (req, res, next) => {

    res.status(200).json(res.advancedResults);

});

exports.createRodada = asyncHandler(async (req, res, next) => {

    var copy = JSON.parse(JSON.stringify(req.body));

    if(copy.nove_pontos.includes("%")){
        copy.nove_pontos = percentageToNumber(copy.nove_pontos);
    }

    if(copy.menos_pontos.includes("%")){
        copy.menos_pontos = percentageToNumber(copy.menos_pontos);
    }

    if(copy.banca_total.includes("%")){
        copy.banca_total = percentageToNumber(copy.banca_total);
    }

    if(copy.total_cambista.includes("%")){
        copy.total_cambista = percentageToNumber(copy.total_cambista);
    }

    if(copy.quatro_a_oito_pontos.includes("%")){
        copy.quatro_a_oito_pontos = percentageToNumber(copy.quatro_a_oito_pontos);
    }

    const rodada = await Rodada.create(copy);

    if(!rodada){
        return next(new errorResponse(`Não foi possível criar uma rodada`, 400));
    }

    res.status(201).json({
        success: true,
        data: rodada
    });
});

exports.updateRodadas = asyncHandler(async (req, res, next) => {

    console.log(req.params._id);

    const rodadas = await Rodada.findByIdAndUpdate(req.query._id, req.body, {
        new: true,
        runValidators: true
    });

    if(!rodadas){
        return next(new errorResponse(`Nenhuma Aposta foi encontrada para atualizar`, 400));
    }

    res.status(200).json({success: true, data: rodadas});
});

exports.getTelaPagamentos = asyncHandler(async (req, res, next) => {

    const result = await Rodada.findById(req.params._id, {cambistas_pagos, total_arrecadado, total_premio, total_pago, cambistas});

    if(!result){
        return next(new errorResponse(`Nenhuma Aposta foi encontrada`, 400));
    }

    res.status(200).json({success: true, data: result});

});

//Tela pagamentos
exports.setCambistasPagos = asyncHandler(async (req, res, next) => {
    
    const rodada = await Rodada.findByIdAndUpdate(req.params.id, {"cambistas.pago": true}, {
        runValidators: true
    });

    if(!rodada){
        return next(new errorResponse(`Cambista de número ${req.params.id} não foi encontrado para ser deletado`, 404));
    }

    res.status(200).json({success: true, data: rodada});
});

exports.getRodadasAposta = asyncHandler(async(req, res, next) => {

    const rodadas = await Rodada.find({status: 'Recebendo_Apostas', banca_id: req.params.banca_id},{
        _id: '_id',
        data_inicio: 'data_inicio',
        valor_aposta: 'valor_aposta'
    });//.sort({ rodada_num: -1 });

    if(!rodadas){
        return next(new errorResponse(`Nenhuma Aposta foi encontrada`, 400));
    }

    res.status(200).json({
        success: true, 
        data: rodadas
    });
});

percentageToNumber = (value) => {
    
    let auxStr = value.replace("%", "");
    
    let auxFloat = parseFloat(auxStr)/100;

    return auxFloat.toString();
    
}