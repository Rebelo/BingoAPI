
const express = require("express");

const {
    getMaquinas, 
    updateMaquina, 
    deleteMaquina,
    createMaquina
} = require('../controllers/maquina-contoller');

const Maquina = require('../models/Maquina');
const advancedResults = require('../middleware/advancedResults');

const router = express.Router();
const {protect} = require('../middleware/auth');


router.route('/:id')
    .put(protect, updateMaquina)
    .delete(protect, deleteMaquina);

router.route('')
    .post(protect, createMaquina)
    .get(protect, advancedResults(Maquina), getMaquinas);                 


module.exports = router;