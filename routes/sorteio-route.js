
const express = require("express");

const {
    getSorteios,
    createSorteio
} = require('../controllers/sorteio-contoller');

const router = express.Router();
const {protect} = require('../middleware/auth');
const Sorteio = require('../models/Sorteio');
const advancedResults = require('../middleware/advancedResults');

router.route('')
    .get(protect, advancedResults(Sorteio), getSorteios)
    .post(protect, createSorteio);              

module.exports = router;