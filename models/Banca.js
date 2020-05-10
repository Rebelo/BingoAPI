const mongoose = require('mongoose');

const BancaSchema = new mongoose.Schema({

    dez_pontos:{
        type: Number,
        default: 0.2,
        min : 0
    },
    nove_pontos: {
        type: Number,
        default: 0.1,
        min : 0
    },
    menos_pontos: {
        type: Number,
        default: 0.1,
        min : 0
    },
    quatro_a_oito_pontos: {
        type: Number,
        default: 0.1,
        min : 0
    },
    total_cambista: {
        type: Number,
        default: 0.1,
        min : 0
    },
    total_banca: {
        type: Number,
        default: 0.1,
        min : 0
    },
    valor_aposta: {
        type: Number,
        default: 50,
        min : 0
    },
    nome: {
        type: String,
        default: 'Sem Nome'
    },
    banca_num: {
        type: Number,
        required: true
    },
    logo_nome: {
        type: String,
        default: 'logo.jpg',
        match: [/[A-zÀ-ú\s]+/, 'Forneça um nome sem caracteres especiais e números'],
        maxlength: [70, 'Seu nome não pode ter mais de 30 caracteres'],
        minLength: [10, 'Seu nome não pode ter menos de 5 caracteres']
    },
    frase: {
        type: String,
        default: 'Banca dahora Phrase',
        match: [/[A-zÀ-ú\s]+/, 'Forneça um nome sem caracteres especiais e números'],
        maxlength: [70, 'Seu nome não pode ter mais de 30 caracteres'],
        minLength: [10, 'Seu nome não pode ter menos de 5 caracteres']
    },
    habilitado: {
        type: Boolean,
        default: true
    },
    nsu_geral: {
        type: Number,
        default: 0
    },

    rodada_num_geral: {
        type: Number,   
        default: 0
    },

    data_delecao: {
        type: Date
    },

    data_insercao: {
        type: Date,
        default: Date.now
    }

});


module.exports = mongoose.model('Banca', BancaSchema);