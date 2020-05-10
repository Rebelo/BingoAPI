const mongoose = require('mongoose');
const Banca = require('../models/Banca');

const RodadaSchema = new mongoose.Schema({
     
    dez_pontos: {
        type: Number,
        default: 0,
        min: 0
    },
    nove_pontos: {
        type: Number,
        default: 0,
        min: 0
    },
    menos_pontos: {
        type: Number,
        default: 0,
        min: 0
    },
    quatro_a_oito_pontos: {
        type: Number,
        default: 0,
        min: 0
    },
    total_cambista: {
        type: Number,
        default: 0,
        min: 0
    },

    qtd_participantes: {
        type: Number,
        default: 0,
        min: 0
    },

    banca_total: {
        type: Number
    },

    valor_aposta:{
        type:  Number
    },

    //o premio destinado a cada um que acertar essa quantidade
    dez_pontos_real: {
        type: Number,
        alias: 'Prêmio - 10 pontos'
    },
    nove_pontos_real: {
        type: Number,
        alias: 'Prêmio - 9 pontos'
    },

    menos_pontos_real:{
        type: Number,
        alias: 'Prêmio - Menos pontos'
    },

    quatro_a_oito_pontos_real:{
        type: Number,
        alias: 'Prêmio - 4 a 8 pontos'
    },

    total_cambista_real:{
        type: Number,
        default: 0,
        alias: 'Prêmio - Cambista'
    },

    acertos_menos_pontos:{
        type: Number,
        alias: 'Acertos - Menos pontos'
    },
    
    total_arrecadado:{
        type: Number,
        alias: 'Total Arrecadado'
    },

    total_premio:{
        type: Number,
        alias: 'Prêmio Total'
    },

    total_pago:{
        type: Number,
        default: 0,
        alias: 'Total já pago'
    },

    numeros_sorteados: [{
        type: Number,
        min: 0,
        max: 80,
        alias: 'Números Sorteados'
    }],

    banca_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Banca'
    },

    rodada_num: {
        type: Number,
        alias: 'Número da Rodada'
    },

    cambistas: [{
        _id: '',
        cambista_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Cambista'
        },
        nome: {
            type: String,
            default: 'Sem Nome'
        },
        vencedor: {
            type: Boolean,
            default: false
        },
        premios: {
            type: Number, //premios a serem pagos por esse cambista
            default: 0
        },
        arrecadado: {
            type: Number,
            default: 0
        },
        jogos_feitos: {
            type: Number,
            default: 0
        }, //qtd de jogos feitos por esse cambista
        pago: {
            type: Boolean, 
            default: false
        } //se ele ja foi pago
    }],

    apostas: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Aposta',
    }],

    data_insercao: {
        type: Date,
        alias: 'Data de inserção'
    },

    data_inicio: {
        type: Date,
        alias: 'Data de início'
    },

    data_termino: {
        type: Date,
        alias: 'Data de término'
    },

    qtd_sorteios: {
        type: Number,
        default: 0,
        alias: 'Quantidade de Sorteios'
    },

    status: {
        type: String,
        enum: [
            'Recebendo_Apostas', //ainda nao chegou na data de início (que recebe primeiro sorteio)
            'Em Sorteio', //Já recebeu o primeiro sorteio, não é apostável
            'Em Premiação', //em processo de premiar, o sorteio que deu um vencedor acabou de acontecer
            'Em_Pagamento', //ja premiados, agora o jogadores podem receber
            'Finalizada' //os jogadores ja receberam
        ],
        default: 'Recebendo_Apostas',
        alias: 'Estado'
    },

    sorteios: [{
        type: mongoose.Schema.Types.ObjectId
    }]
});



RodadaSchema.pre('save', async function(next){

    if(this.isModified('banca_id') === false){
        next();
    }else{

        const banca = await Banca.findById(this.banca_id);
        this.rodada_num = (banca.rodada_num_geral + 1) || 0;

        this.data_inicio.setHours( this.data_inicio.getHours() + 3 );
        this.data_insercao = Date.now() - (3600000*3);

        await Banca.findByIdAndUpdate(this.banca_id, { rodada_num_geral: this.rodada_num }, {
            upsert: true
        });
    }
});


module.exports = mongoose.model('Rodada', RodadaSchema);

