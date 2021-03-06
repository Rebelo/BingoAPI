const jwt = require('jsonwebtoken');
const asyncHandler = require('./async');
const errorResponse = require('../utils/errorResponse');
const Cambista = require('../models/Cambista');

// 
exports.protect = asyncHandler(async (req, res, next) => {

    let token;


    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    else if(req.cookies.token){
        token = req.cookies.token;
    }

    if(!token){
        return next(new errorResponse('Não autorizado para acessar essa rota', 401));
    } 

    try{
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.cambista = await Cambista.findById(decoded.id);
        next();

    }catch(err){
        return next(new errorResponse('Não autorizado para acessar essa rota', 401));  
    }

});
