
const express = require("express");

const {
    getCambistas,
    updateCambista, 
    deleteCambista,
    getAssociacoes,
    createAssociacao,
    deleteAssociacao
} = require('../controllers/cambista-contoller');

const Cambista = require('../models/Cambista');
const advancedResults = require('../middleware/advancedResults');
const router = express.Router();
const {protect} = require('../middleware/auth');

router.route('/associacao')
    .get(protect, advancedResults(Cambista, 'maquina_id'), getAssociacoes)
    .put(protect, createAssociacao)
    .delete(protect, deleteAssociacao);


router.route('/:id')
    .put(protect, updateCambista)
    .delete(protect, deleteCambista);

router.route('/')
    .get(protect, advancedResults(Cambista), getCambistas)
    

module.exports = router;