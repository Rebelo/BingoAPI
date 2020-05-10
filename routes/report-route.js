
const express = require("express");

const {
    getRanking,
    getPagamentos,
    getRodada,
    getPagamentosCambista,
    getApostas
} = require('../controllers/reports-contoller');

const router = express.Router();
const {protect} = require('../middleware/auth');

router.route('/ranking').get(protect, getRanking);
router.route('/pagamentos').get(protect, getPagamentos);
router.route('/rodada').get(protect, getRodada);
router.route('/cambista').get(protect, getPagamentosCambista);
router.route('/apostas').get(protect, getApostas);

module.exports = router;