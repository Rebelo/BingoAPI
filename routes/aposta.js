const express = require("express");

const {
    newAposta, 
    getAposta,
    pagamentoAposta
} = require('../controllers/aposta-controller');

const router = express.Router();
const {protect} = require('../middleware/auth');
const Aposta = require('../models/Aposta');
const advancedResults = require('../middleware/advancedResults');

router.route('')
    .post(protect, newAposta) 
    .get(protect, advancedResults(Aposta), getAposta);   
    
router.route('/pagamento')
    .put(protect, pagamentoAposta);  
    
module.exports = router;