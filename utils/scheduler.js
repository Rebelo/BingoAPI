const schedule = require('node-schedule');
const Rodada = require('../models/Rodada');
const asyncHandler = require('../middleware/async');


module.exports.schedule = asyncHandler(async () => {
    schedule.scheduleJob('7 0 * * *', async function(){

        //todo: comparar somente o dia
        await Rodada.updateMany ({data_inicio: {$lt: Date.now()}, status: 'Recebendo_Apostas'},{
            status: "Em Sorteio"
        });
    });
});
