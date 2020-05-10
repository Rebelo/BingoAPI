const mongoose = require('mongoose');
const Banca = require('../models/Banca');
const Rodada = require('../models/Rodada');
const Cambista = require('../models/Cambista');

const ApostaSchema = new mongoose.Schema({

    dezenas: [{
        type: Number,
        required: true,
        min: 0,
        max: 80
    }],

    rand_num: {
        type: String
    },

    cambista_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Cambista'
    },

    nome_jogador: {
        type: String,
        default: 'Sem Nome'
    },

    data_insercao: {
        type: Date,
        default: Date.now
    },

    certos: {
        type: Number,
        default: 0
    },

    premio: {
        type: Number,
        default: 0
    },

    data_pagamento: {
        type: Date
    },

    status: {
        type: String,
        enum: ['Ativa', 'Aguardando Pagamento', 'Não Premiado', 'Pago'],
        default: 'Ativa'
    },

    banca_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Banca'
    },

    rodada_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Rodada'
    },

    nsu: {
        type: Number
    }
});


//Generate the 
ApostaSchema.pre('save', async function(next){

    if(!this.isNew){
        next();
    }else {
        let rand_num = '';
        for(let i = 0; i < 6; i++)
            rand_num += getRandChar();
        this.rand_num = rand_num;

        const banca = await Banca.findById(this.banca_id);
        this.nsu = (banca.nsu_geral + 1) || 0;

        await Banca.findByIdAndUpdate(this.banca_id, { nsu_geral: this.nsu }, {
            upsert: true
        });

        
        let rodada_aux = await Rodada.findByIdAndUpdate(this.rodada_id, { 
            $addToSet: {
                apostas: this._id
            },
            $inc: {qtd_participantes: 1}
        });

        //cambista existente
        var tr = false;
        for (var i = 0; i < rodada_aux.cambistas.length; i++) {
            //cambista existente
            if(rodada_aux.cambistas[i].cambista_id.equals(this.cambista_id) == true){
                rodada_aux.cambistas[i].arrecadado = rodada_aux.cambistas[i].arrecadado + rodada_aux.valor_aposta;
                tr = true;
            }
        }

        const cambista = await Cambista.findById(this.cambista_id, 'nome');

        //cambista novo
        if(tr == false){
            rodada_aux.cambistas.push({
                cambista_id: this.cambista_id,
                nome: cambista.nome,
                arrecadado: rodada_aux.valor_aposta
            });
        }

        await rodada_aux.save();
    }
});

function getRandChar(){
    //1 a 62
    const char = Math.floor(Math.random() * 62) + 1;
    
    if(char === 10){
        return '?';
    }if(char < 10){
        return char;
    }if(char > 10 && char <= 36){
        return String.fromCharCode(char+54);
    }if(char >= 37 && char <= 62){
        return String.fromCharCode(char+60);
    } 

    return '@';
}

module.exports = mongoose.model('Aposta', ApostaSchema);