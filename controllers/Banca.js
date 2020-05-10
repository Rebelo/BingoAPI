const errorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const Banca = require('../models/Banca');

//PostMan
exports.createBanca = asyncHandler(async (req, res, next) => {
    const banca = await Banca.create(req.body);

    res.status(200).json({
        success: true,
        banca
    });
});


//Tela configuração --Gestão
exports.updateBanca = asyncHandler(async (req, res, next) => {
    
    console.log(req.params.id);
    const banca = await Banca.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
        upsert: true
    });

    if(!banca){
        return next(new errorResponse(`Banca de numero ${req.params.id} não foi encontrada para ser atualizada`, 404));
    }

    res.status(200).json({success: true, data: banca});
});

//Tela configuração --Gestão
exports.getBanca = asyncHandler(async (req, res, next) => {

    res.status(200).json(res.advancedResults);

});


