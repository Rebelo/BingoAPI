const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const cors = require('cors');
const chalk = require('chalk');
const cookieParser = require('cookie-parser');
const serverless = require('serverless-http');
const {schedule} = require('./utils/scheduler');

const errorHandler = require('./middleware/error');
const connectDB = require('./config/db');

dotenv.config({path: './config/config.env'});

connectDB();

const auth = require('./routes/auth');
const aposta = require('./routes/aposta');
const banca = require('./routes/banca');
const cambista = require('./routes/cambista');
const rodada = require('./routes/rodada');
const report = require('./routes/report');
const sorteio = require('./routes/sorteio');
const maquina = require('./routes/maquina');

const app = express();

app.use(cors());
app.use(express.urlencoded({ extended: true, strict: false }));
app.use(express.json());
app.use(cookieParser());

if(process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

app.use('/', express.static('static'));
app.use('/aposta', aposta);
app.use('/auth', auth);
app.use('/banca', banca);
app.use('/cambista', cambista);
app.use('/maquina', maquina);
app.use('/rodada', rodada);
app.use('/report', report);
app.use('/sorteio', sorteio);
app.use(errorHandler);

if(process.env.NODE_ENV === 'development'){

    const PORT = process.env.PORT || 5000;

    //const server = app.listen(PORT, '192.168.0.104', console.log(chalk.blue.bold(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)));
    const server = app.listen(PORT, () => {
        console.log(chalk.blue.bold(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`));
        schedule();
    });

    process.on('unhandledRejection', (err, promise) => {
        console.log(chalk.red.bold(`Error: ${err.message}`));
        server.close(() => process.exit(1));
    });

} else if(process.env.NODE_ENV === 'production') {

    const handler = serverless(app);
    module.exports.server = async (event, context) => {
        schedule();
        return await handler(event, context);
    };
}
