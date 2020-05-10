const errorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const Maquina = require('../models/Maquina');



//Tela máquina
exports.updateMaquina = asyncHandler(async (req, res, next) => {
    const maquina = await Maquina.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    if(!maquina){
        return next(new errorResponse(`Maquina de numero ${req.params.id} não foi encontrada para ser atualizada`, 404));
    }

    res.status(200).json({success: true, data: maquina});
});

//Tela máquina
exports.deleteMaquina = asyncHandler(async (req, res, next) => {
    
    const maquina = await Maquina.findByIdAndDelete(req.params.id);

    if(!maquina){
        return next(new errorResponse(`Maquina com id ${req.params.id} não foi encontrada para ser deletada`, 400));
    }

    res.status(200).json({success: true});
});

//Tela máquina
exports.createMaquina = asyncHandler(async (req, res, next) => {
    const maquina = await Maquina.create(req.body);

    res.status(201).json({
        success: true,
        data: maquina
    });
});

//Tela máquina
exports.getMaquinas = asyncHandler(async (req, res, next) => {
    res.status(200).json(res.advancedResults);
});