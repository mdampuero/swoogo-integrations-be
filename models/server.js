const express = require('express')
const cors = require('cors');
const morgan = require('morgan');
const { dbConnection } = require('../database/config');

class Server {

    constructor() {
        this.app = express();
        this.port = process.env.PORT || 3000
        this.server = require('http').createServer(this.app)
        this.io = require('socket.io')(this.server)
        //Connect DB
        this.connectDB();

        //Middlewares
        this.middlewares();

        //Routes
        this.routes();

        //Sockets
        this.sockets();
    }

    async connectDB() {
        await dbConnection();
    }

    middlewares() {
        this.app.use(morgan('dev'))
        this.app.use(cors())
        this.app.use((req, res, next) => {
            res.header('Access-Control-Allow-Origin', '*');
            res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
            res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
            res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');
            next();
        });

        this.app.use(express.json())
        this.app.use(express.static('public'))
    }

    routes() {
        this.app.use('/api/payments', require('../routes/payment.routes'));
        this.app.use('/api/users', require('../routes/user.routes'));
        this.app.use('/api/demos', require('../routes/demo.routes'));
        this.app.use('/api/events', require('../routes/events.routes'));
        this.app.use('/api/registrants', require('../routes/registrant.routes'));
        this.app.use('/api/integrations', require('../routes/integration.routes'));
        this.app.use('/api/transactions', require('../routes/transaction.routes'));
        this.app.use('/api/webhooks', require('../routes/webhook.routes'));
    }

    sockets(){
        this.io.on('connection', socket => {
            console.log("Conectado");
            socket.on('disconnet', () => {
               console.log("Desconectado")
            })
            socket.on('mensaje', (payload, callback) => {
                console.log(payload);
                callback({
                    'msg': 'respuesta a esa peition'
                })
                // this.io.emit('devolver-mensaje',payload);
             })
        })
    }

    listen() {
        this.server.listen(this.port, () => {
            console.log('Servidor corriendo en ' + this.port);
        })
    }
}

module.exports = Server;