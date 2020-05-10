
const Cambista = require('../models/Cambista');
const Rodada = require('../models/Rodada');
const errorResponse = require('../utils/errorResponse');
const mongoose = require('mongoose');

module.exports.apuracao = async (sorteados, sorteio_id, banca_id, next) => {

    const SESSION = await mongoose.startSession();

    await SESSION.startTransaction();

    try {

        //APURAÇÃO:
        let rodadas_em_sorteio_populadas = await Rodada.find({status: 'Em Sorteio', banca_id}).populate('apostas').cursor();
        
        await rodadas_em_sorteio_populadas.eachAsync(async function(rodada){

            //adiciona o id de sorteio ao historico de sorteios da rodada
            rodada.sorteios.push(sorteio_id);
            rodada.qtd_sorteios++;
            
            //soma os acertos e põe a rodada em premiação se necessário
            rodada.apostas.forEach(async aposta => {
                for(let i = 0; i < aposta.dezenas.length; i++){
                    sorteados.forEach(dezena_sorteada => {
                        if((rodada.numeros_sorteados.indexOf(dezena_sorteada) === -1) && (aposta.dezenas[i] === dezena_sorteada)){
                            aposta.certos++;
                            if(aposta.certos >= 10){
                                rodada.status = 'Em Premiação';
                                for(let i = 0; i < rodada.cambistas.length; i++){
                                    const a = rodada.cambistas[i].cambista_id.toString();
                                    const b = aposta.cambista_id.toString();
                                    if(a.localeCompare(b) == 0){
                                        rodada.cambistas[i].vencedor = true;
                                    }
                                }
                            }
                        }
                    });
                }
                await aposta.save();
            });

            //se não tiver sido sorteado previamente,
            //adiciona o numero sorteado ao historico de sorteados da rodada
            sorteados.forEach(sorteado => {
                if(rodada.numeros_sorteados.indexOf(sorteado) === -1) 
                    rodada.numeros_sorteados.push(sorteado);
            });

            await rodada.save();
        });

    } catch (error) {
        await SESSION.abortTransaction();
        return next(new errorResponse(`Erro não identificado na apuração`, 404));
    } finally {
        SESSION.endSession();
    }  

    //await rodadas_em_sorteio_populadas.save();

    const SESSION2 = await mongoose.startSession();
    await SESSION2.startTransaction();

    try {
        //PREMIAÇÃO:
        let rodadas_em_premiacao_populadas = await Rodada.find({status: "Em Premiação", banca_id}).populate('apostas').cursor();

        await rodadas_em_premiacao_populadas.eachAsync(async function(rodada){

            //qtd de vencedores em cada modalidade
            let apostadores_10 = 0; 
            let apostadores_9 = 0;
            let apostadores_8 = 0;
            let apostadores_menos = 0;
            let camb = rodada.cambistas;
            let cambistas_vencedores = 0;

            for(let i = 0; i < camb.length; i++)
                if(camb[i].vencedor == true) 
                    cambistas_vencedores++

            //com quantos acertos é pago o menos pontos
            rodada.acertos_menos_pontos = 20;
            for(let i = 0; i < rodada.apostas.length; i++){
                if(rodada.apostas[i].certos < rodada.acertos_menos_pontos){
                    rodada.acertos_menos_pontos = rodada.apostas[i].certos;
                }
            }

            //calcular total arrecadado
            rodada.total_arrecadado = rodada.valor_aposta * rodada.qtd_participantes;

            //contar quantidade de vencedores em cada modalidade
            //adicionar um cambista vencedor
            //finalizar o status da aposta
            rodada.apostas.forEach(async aposta => {
                if(aposta.certos >= 10){
                    aposta.status = 'Aguardando Pagamento';
                    apostadores_10++;
                } else if(aposta.certos === 9){
                    aposta.status = 'Aguardando Pagamento';
                    apostadores_9++;
                } else if(aposta.certos <= 8 && aposta.certos >= 4){
                    aposta.status = 'Aguardando Pagamento';
                    apostadores_8++;
                } else if(aposta.certos == rodada.acertos_menos_pontos){
                    aposta.status = 'Aguardando Pagamento';
                    apostadores_menos++;
                } else {
                    aposta.premio = 0;
                    aposta.status = 'Não Premiado';
                }
                await aposta.save();
            });

            rodada.dez_pontos = rodada.total_arrecadado;
            
            //Descobrir qto vai pagar cada tipo de premio:
            if(apostadores_9 == 0){
                rodada.nove_pontos_real = 0;
            } else if(rodada.nove_pontos <= 1){
                rodada.nove_pontos_real = rodada.total_arrecadado * rodada.nove_pontos / apostadores_9;
                rodada.dez_pontos -= rodada.total_arrecadado * rodada.nove_pontos;
            } else {
                rodada.nove_pontos_real = rodada.nove_pontos / apostadores_9;
                rodada.dez_pontos -= rodada.nove_pontos;
            }

            if(apostadores_8 == 0){
                rodada.quatro_a_oito_pontos_real = 0;
            } else if(rodada.quatro_a_oito_pontos <= 1){
                rodada.quatro_a_oito_pontos_real = rodada.total_arrecadado * rodada.quatro_a_oito_pontos / apostadores_8;
                rodada.dez_pontos -= rodada.total_arrecadado * rodada.quatro_a_oito_pontos;
            } else {
                rodada.quatro_a_oito_pontos_real = rodada.quatro_a_oito_pontos / apostadores_8;
                rodada.dez_pontos -= rodada.quatro_a_oito_pontos;
            }

            if(apostadores_menos == 0){
                rodada.menos_pontos_real = 0;
            } else if(rodada.menos_pontos <= 1){
                rodada.menos_pontos_real = rodada.total_arrecadado * rodada.menos_pontos / apostadores_menos;
                rodada.dez_pontos -= rodada.total_arrecadado * rodada.menos_pontos;
            } else {
                rodada.menos_pontos_real = rodada.menos_pontos / apostadores_menos;
                rodada.dez_pontos -= rodada.menos_pontos;
            }

            if(rodada.total_cambista <= 1){
                rodada.total_cambista_real = rodada.total_arrecadado * rodada.total_cambista / cambistas_vencedores;
                rodada.dez_pontos -= rodada.total_arrecadado * rodada.total_cambista;
            } else {
                rodada.total_cambista_real = rodada.total_cambista / cambistas_vencedores;
                rodada.dez_pontos -= rodada.total_cambista;
            }

            //calcula o que restou como premio de quem acertou 10 ou mais
            //todo: banca_total_real
            if(rodada.banca_total <= 1){
                rodada.banca_total = rodada.banca_total * rodada.total_arrecadado;
                rodada.banca_total = rodada.banca_total.toPrecision(2);
            } else {
                rodada.banca_total = rodada.banca_total.toPrecision(2);
            }
            
            rodada.dez_pontos -= rodada.banca_total;
            rodada.dez_pontos_real = rodada.dez_pontos / apostadores_10;

            //colocar em cada aposta o premio devido a cada uma:
            rodada.apostas.forEach(aposta => {
                
                if(aposta.certos >= 10){
                    aposta.premio = rodada.dez_pontos_real.toPrecision(2);
                    
                } else if(aposta.certos == 9){
                    aposta.premio = rodada.nove_pontos_real.toPrecision(2);
                } else if(aposta.certos <= 8 && aposta.certos >= 4){
                    aposta.premio = rodada.quatro_a_oito_pontos_real.toPrecision(2);
                } else if(aposta.certos == rodada.acertos_menos_pontos){
                    aposta.premio = rodada.menos_pontos_real.toPrecision(2);
                }

                if(aposta.premio > 0){

                    rodada.total_premio = rodada.total_premio + aposta.premio;

                    //acerta a quantidade de premio que esse cambista deverá receber tanto pra ele
                    //quanto para os apostadores dele
                    for (let i = 0; i < camb.length; i++) {
                        if(camb[i].cambista_id.equals(aposta.cambista_id) == true)
                            camb[i].premios = camb[i].premios + parseInt(aposta.premio).toPrecision(2);

                        if(camb[i].vencedor == true)
                            camb[i].premios = camb[i].premios + parseInt(rodada.total_cambista_real).toPrecision(2);
                    }
                }
            });

            rodada.status = 'Em_Pagamento';
            rodada.data_termino = Date.now();

            await rodada.save();
        });
    } catch (error) {
        await SESSION2.abortTransaction();
        return next(new errorResponse(`Erro não identificado na premiação`, 404));
    } finally {
        SESSION2.endSession();
    }  
}