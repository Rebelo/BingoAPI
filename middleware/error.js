const ErrorResponse = require('../utils/errorResponse');

const errorHandler = (err, req, res, next) => {

    let error = {...err};

    error.message = err.message;

    console.log(err);

    if(err.name === 'CastError'){
        const message = `Recurso não encontrado com o id ${err.value}`;
        error = new ErrorResponse(message, 404);
    }

    //duplicate keys
    if(err.code ===  11000){
        const message = `Chave duplicada detectada`;
        error = new ErrorResponse(message, 400);
    }

    //validation error
    if(err.name === 'ValidationError'){
        const message = Object.values(err.errors).map(val => val.message);
        error = new ErrorResponse(message, 400);
    }

    res.status(err.statusCode || 500).json({
        success: false,
        error: error.message || 'Server Error'
    });
}

module.exports = errorHandler;