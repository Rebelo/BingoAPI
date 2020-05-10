const mongoose = require('mongoose');


const MaquinaSchema = new mongoose.Schema({
    banca_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Banca'
    },
    data_insercao: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: {
            values: ['Ativo', 'Bloqueado', 'Roubado', 'Preso', 'Manutenção'],
            message: 'É necessário escolher um status válido'
        },
        default: 'Ativo'
    },
    ultima_associacao: {
        type: Date
    },
    sn: {
        type: String,
        minlength: [10, 'O número de série deve ter no mínimo 10 caracteres'],
        maxlength: [25, 'O número de série deve ter no máximo 25 caracteres'],
        required: true,
        unique: true
    },
    data_delecao: {
        type: Date,
        select: false
    },
    cambista_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Cambista'
    },
    associado: {
        type: Boolean,
        default: false
    }
});


module.exports = mongoose.model('Maquina', MaquinaSchema);