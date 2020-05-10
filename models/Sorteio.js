
const mongoose = require('mongoose');
const {apuracao} = require('../utils/apuracao');
const Rodada = require('../models/Rodada');

const SorteioSchema = new mongoose.Schema({
    
    dezenas: [{
        type: Number,
        required: true,
        min: 0,
        max: 80
    }],

    id: String,

    data_insercao: {
        type: Date,
        default: Date.now
    },

    data_sorteio: {
        type: Date
    },

    periodo: {
        type: String,
        enum: ['Manhã', 'Tarde', 'Noite']
    },

    banca_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Banca'
    }
});


SorteioSchema.post('save', async function(doc, next) {
    apuracao(doc.dezenas,  this._id, this.banca_id, next);
});


module.exports = mongoose.model('Sorteio', SorteioSchema);