
const express = require("express");

const {
    getRodadas,
    createRodada,
    getTelaPagamentos,
    getRodadasAposta,
    updateRodadas,
    setCambistasPagos
} = require('../controllers/rodada-contoller');

const router = express.Router();
const {protect} = require('../middleware/auth');
const Rodada = require('../models/Rodada');
const advancedResults = require('../middleware/advancedResults');

router.route('')
    .get(protect, advancedResults(Rodada), getRodadas)
    .put(protect, updateRodadas)
    .post(protect, createRodada);

router.route('/telaPagamentos')
    .get(protect, getTelaPagamentos);

router.route('/pagarCambistas/:id')
    .post(protect, setCambistasPagos);
    
router.route('/aposta')
    .get(protect, getRodadasAposta);

module.exports = router;