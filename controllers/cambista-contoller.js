const errorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const Cambista = require('../models/Cambista');
const Maquina = require('../models/Maquina');
const mongoose = require('mongoose');


//tela de perfil do app
//tela cambista --gestão
exports.updateCambista = asyncHandler(async (req, res, next) => {
    
    const cambista = await Cambista.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    if(!cambista){
        return next(new errorResponse(`Cambista de numero ${req.params.id} não foi encontrado para ser atualizado`, 404));
    }

    res.status(200).json({
        success: true, 
        data: cambista
    });
});

//tela cambista --Gestão
exports.deleteCambista = asyncHandler(async (req, res, next) => {

    const cambista = await Cambista.findByIdAndDelete(req.params.id);

    if(!cambista){
        return next(new errorResponse(`Cambista com id ${req.params.id} não foi encontrado para ser deletado`, 400));
    }

    res.status(200).json({success: true});
});

//Tela cambista --Gestão
exports.getCambistas = asyncHandler(async (req, res, next) => {
    res.status(200).json(res.advancedResults);

});

//Devolve as máquinas e vendedores associados dessa banca
exports.getAssociacoes = asyncHandler(async (req, res, next) => {
    res.status(200).json(res.advancedResults);
});

exports.createAssociacao = asyncHandler(async (req, res, next) => {

    const SESSION = await mongoose.startSession();

    await SESSION.startTransaction();

    try {
        const cambista = await Cambista.findByIdAndUpdate(req.query._id, {
            maquina_id: req.query.maquina_id,
            associado: true,
            new: true
        });

        if(!cambista){
            await SESSION.abortTransaction();
            return next(new errorResponse(`Cambista com id ${req.params.id} não foi encontrado para realizar a associação`, 400));
        }

        const maquina = await Maquina.findByIdAndUpdate(req.query.maquina_id, {
            cambista_id: req.query._id,
            associado: true,
            ultima_associacao: Date.now()
        });

        if(!maquina){
            await SESSION.abortTransaction();
            return next(new errorResponse(`Maquina com id ${req.params.id} não foi encontrado para realizar a associação`, 400));
        }

        res.status(200).json({
            success: true,
            data: cambista
        });
    } catch (error) {
        await SESSION.abortTransaction();
        return next(new errorResponse(`Erro não identificado`, 404));
    } finally {
        SESSION.endSession();
    }  
});

exports.deleteAssociacao = asyncHandler(async (req, res, next) => {

    const SESSION = await mongoose.startSession();

    await SESSION.startTransaction();

    try {

        const cambista = await Cambista.findByIdAndUpdate(req.query._id, {
            maquina_id: null,
            associado: false
        });

        if(!cambista){
            //await SESSION.abortTransaction();
            return next(new errorResponse(`Cambista com id ${req.params.id} não foi encontrado para realizar a associação`, 400));
        }

        const maquina = await Maquina.findByIdAndUpdate(req.query.maquina_id, {
            cambista_id: null,
            associado: false
        });

        if(!maquina){
            //await SESSION.abortTransaction();
            return next(new errorResponse(`Maquina com id ${req.params.id} não foi encontrado para realizar a associação`, 400));
        }

        res.status(200).json({
            success: true
        });

    } catch (error) {
        await SESSION.abortTransaction();
    } finally {
        SESSION.endSession();
    }  
});