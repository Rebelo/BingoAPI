const mongoose = require('mongoose');
const slugify = require('slugify');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');


const CambistaSchema = new mongoose.Schema({

    nome: {
        type: String,
        required: [true, 'Por favor, adicione um nome'],
        unique: false,
        trim: true,
        match: [/[A-zÀ-ú\s]+/, 'Forneça um nome sem caracteres especiais e números'],
        maxlength: [70, 'Seu nome não pode ter mais de 70 caracteres'],
        minLength: [10, 'Seu nome não pode ter menos de 10 caracteres'],
    },

    slug: {
        type: String,
        select: false
    },

    numero_celular: {
        type: String,
        required: [true, 'Por favor, adicione um telefone'],
        length: 11
    },

    email: {
        type: String,
        required: [true, 'Por favor, insira seu email'],
        unique: true,
        match: [
            /^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$/, 
            'Por favor, insira um email válido'
        ]
    },

    role: {
        type: String,
        enum: ['cambista', 'dono'],  
        default: 'cambista',
        select: false
    },

    password: {
        type: String,
        required: [true, 'Por favor, adicione uma senha'],
        minlength: 6,
        select: false
    },
    
    resetPasswordToken: {
        type: String,
        select: false
    },

    resetPasswordExpire: {
        type: Date,
        select: false
    },
    
    data_insercao: {
        type: Date,
        default: Date.now,
        select: false
    },

    endereco: {
        logradouro: {
            type: String
        },
        numero:{
            type: String
        },
        complemento: {
            type: String
        },
        cep: {
            type: String
        },
        bairro:{
            type: String
        },
        cidade: {
            type: String
        },
        estado:{
            type: String
        },
        pais:{
            type: String
        }
    },

    historico_localizacoes: [{
        type:{
            type: String,
            enum: ['Point', 'Area'],
            default: 'Point'
        },
    
        coordinates: {
            type: [Number],
            index: '2dsphere'
        },

        data: {
            type: Date,
            default: Date.now
        },
        select: false
    }],

    data_delecao: {
        type: Date,
        select: false
    },

    codigo: {
        type: String,
        length: 3,
        required: true,
        default: 'ABC'
    },

    banca_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Banca'
    },

    maquina_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Maquina'
    },

    associado: {
        type: Boolean,
        default: false
    },

    habilitado: {
        type: Boolean,
        default: true
    }
});

//SLUGIFY
CambistaSchema.pre('save', function(next){
    
    this.slug = slugify(this.nome, {
        lower: true,
    });
    next();
});


//before save the password
CambistaSchema.pre('save', async function(next){

    if(!this.isModified('password') || this.password === ''){
        next();
    }
    
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);

});


//create and return the sign token
CambistaSchema.methods.getSignedJwtToken = function(){
    return jwt.sign(
        {id: this._id} ,
        process.env.JWT_SECRET,
        {expiresIn: process.env.JWT_EXPIRE}
    );
};

//Match cambista entered password to hashed password in database
CambistaSchema.methods.matchPassword = async function(enteredPassword) {

    return await bcrypt.compare(enteredPassword, this.password);
}

CambistaSchema.methods.getResetPasswordToken = function() {
    const resetToken = crypto.randomBytes(20).toString('hex');

    this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

    return resetToken;
}

module.exports = mongoose.model('Cambista', CambistaSchema);