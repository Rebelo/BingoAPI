
const express = require("express");

const {
    updateBanca,
    createBanca,
    getBanca
} = require('../controllers/Banca');

const router = express.Router();
const {protect} = require('../middleware/auth');
const Banca = require('../models/Banca');
const advancedResults = require('../middleware/advancedResults');


router.route('/:id')
    .put(protect, updateBanca);

router.route('')
    .get(protect, advancedResults(Banca), getBanca)
    .post(protect, createBanca);

module.exports = router;