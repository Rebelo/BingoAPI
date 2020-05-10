const errorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const Sorteio = require('../models/Sorteio');

//Tela sorteios
exports.getSorteios = asyncHandler(async (req, res, next) => {
    res.status(200).json(res.advancedResults);
});

exports.createSorteio = asyncHandler(async (req, res, next) => {

    let dezenas = [];

    let data = req.body;

    if(!data.sorteio_1 || !data.sorteio_2 || !data.sorteio_3 || !data.sorteio_4 || !data.sorteio_5){
        next();
    } else{
        dezenas.push(parseInt(data.sorteio_1));
        dezenas.push(parseInt(data.sorteio_2));
        dezenas.push(parseInt(data.sorteio_3));
        dezenas.push(parseInt(data.sorteio_4));
        dezenas.push(parseInt(data.sorteio_5));

        delete data.sorteio_1;
        delete data.sorteio_2;
        delete data.sorteio_3;
        delete data.sorteio_4;
        delete data.sorteio_5;

        data.dezenas = dezenas;

        console.log(data);
        console.log(dezenas);

        const sorteio = await Sorteio.create(data);

        if(!sorteio){
            return next(new errorResponse(`Não foi possível adicioanr um sorteio`, 400));
        }

        res.status(201).json({
            success: true,
            data: sorteio
        });
    }
});