const express = require('express')
const cors = require('cors');
const morgan = require('morgan');
const { dbConnection } = require('../database/config');

class Server {

    constructor() {
        this.app = express();
        this.port = process.env.PORT || 3000

        //Connect DB
        this.connectDB();

        //Middlewares
        this.middlewares();

        //Routes
        this.routes();
    }

    async connectDB(){
        await dbConnection();
    }

    middlewares() {
        this.app.use(morgan('dev'))
        this.app.use(cors())
        this.app.use(express.json())
        this.app.use(express.static('public'))
    }

    routes() {
        this.app.use('/api/payments',require('../routes/payment.routes'));
        this.app.use('/api/users',require('../routes/user.routes'));
        this.app.use('/api/demos',require('../routes/demo.routes'));
        this.app.use('/api/events',require('../routes/events.routes'));
        this.app.use('/api/integrations',require('../routes/integration.routes'));
        this.app.use('/api/transactions',require('../routes/transaction.routes'));
    }

    listen() {
        this.app.listen(this.port, () => {
            console.log('Servidor corriendo en ' + this.port);
        })
    }
}

module.exports = Server;