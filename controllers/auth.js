const errorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const Cambista = require('../models/Cambista');

exports.register = asyncHandler(async (req, res, next) => {
    const cambista = await Cambista.create(req.body);


    res.status(200).json({
        success: true,
        data: cambista
    });
});

exports.login = asyncHandler(async (req, res, next) => {

    const {email, password} = req.body;

    if(!email || !password){
        return next(new errorResponse('Envie email e senha', 400));
    }

    const cambista = await Cambista.findOne({"email": email}).select('+password');

    if(!cambista){
        return next(new errorResponse('Credenciais Inválidas', 401));
    }

    const isMatch = await cambista.matchPassword(password);

    if(!isMatch){
        return next(new errorResponse('Credenciais Inválidas', 401));
    }

    sendTokenResponse(cambista, 200, res);
});

exports.getMe = asyncHandler(async (req, res, next) => {
    const cambista = await Cambista.findById(req.cambista.id);

    if(!cambista){
        return next(new errorResponse(`Nenhum cambista foi encontrado com numero ${req.cambista.id}`, 400));
    }

    res.status(200).json({
        success: true,
        data: cambista,
        option: 'login',
        ret: ''
    });
});

exports.logout = asyncHandler(async (req, res, next) => {});

exports.trocarSenha = asyncHandler(async (req, res, next) => {

    const cambista = await Cambista.findOne({email: req.body.email});

    if(!cambista){
        return next(new errorResponse('Não existe usuário com esse email', 404));
    }

    const resetToken = cambista.getResetPasswordToken();

    await cambista.save({validateBeforeSave: false});

    res.status(200).json({
        success: true,
        data: cambista
    });

});

//Get token from model, create cookie and send response
const sendTokenResponse = (cambista, statusCode, res) => {
    const token = cambista.getSignedJwtToken();
    const banca_id = cambista.banca_id;

    const options = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60* 1000),
        httpOnly: true
    };

    if(process.env.NODE_ENV == 'production'){
        options.secure = true;
    }

    res.status(statusCode).cookie('token', token, options).json({
        success: true,
        data: {
            banca_id: banca_id,
            _id: cambista._id,
            codigo: cambista.codigo,
            nome: cambista.nome,
            logo: "Meu Logo",
            token
        }
    });
}