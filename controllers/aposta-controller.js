const errorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const Aposta = require('../models/Aposta');
const Rodada = require('../models/Rodada');
const mongoose = require('mongoose');


//Tela apostas - App
exports.newAposta = asyncHandler(async (req, res, next) => {

    //verifico se essa rodada está recebendo apostas
    const rodada = await Rodada.findById(req.body.rodada_id).select(status);

    if(rodada.status.localeCompare("Recebendo_Apostas") != 0){
        return next(new errorResponse(`Essa rodada já não aceita mais apostas`, 404));
    }

    const aposta = await Aposta.create(req.body);

    if(!aposta){
        return next(new errorResponse(`Não foi possível criar essa nova aposta`, 404));
    }

    res.status(200).json({
        success: true,
        data: aposta
    });
});


//tela de verificar aposta - App
exports.getAposta = asyncHandler(async (req, res, next) => {
    res.status(200).json(res.advancedResults);
});


//Realiza Pagamento da aposta premiada
exports.pagamentoAposta = asyncHandler(async (req, res, next) => {

    const SESSION = await mongoose.startSession();

    await SESSION.startTransaction();

    try {

        const aposta_premiada = await Aposta.findByIdAndUpdate(req.body.aposta_id, {
            status: "Pago",
            data_pagamento: Date.now(),
            new: true
        });

        if(!aposta_premiada){
            await SESSION.abortTransaction();
            return next(new errorResponse(`Não há apostas com esse ID`, 404));
        }

        const rodada = await Rodada.findById(req.body.rodada_id);

        if(!rodada){
            await SESSION.abortTransaction();
            return next(new errorResponse(`Não há rodadas com esse ID`, 404));
        }

        rodada.total_pago = rodada.total_pago + parseInt(aposta_premiada.premio);

        await rodada.save({
            validateBeforeSave: false
        });

        res.status(200).json({
            success: true,
            data: aposta_premiada
        });

    } catch (error) {
        await SESSION.abortTransaction();
        return next(new errorResponse(`Erro não identificado`, 404));
    } finally {
        SESSION.endSession();
    }  
});