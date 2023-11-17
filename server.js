const express = require('express')
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const { dbConnection } = require('./database/config');
const { socketController } = require('./controllers/socket.controllers');

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
        this.app.use((req, res, next) => {
            res.header('Access-Control-Allow-Origin', 'https://clickgroup.swoogo.com');
            res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
            res.header('Access-Control-Allow-Headers', 'Content-Type');
            next();
        });
        this.app.use((req, res, next) => {
            req.io = this.io
            res.header('Access-Control-Allow-Origin', '*');
            res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
            res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
            res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');
            next();
        });
        // console.log(path.basename())
        this.app.use(express.json())

    }

    routes() {
        this.app.use('/api/auth', require('./routes/auth.routes'));
        this.app.use('/api/payments', require('./routes/payment.routes'));
        this.app.use('/api/users', require('./routes/user.routes'));
        this.app.use('/api/demos', require('./routes/demo.routes'));
        this.app.use('/api/events', require('./routes/events.routes'));
        this.app.use('/api/registrants', require('./routes/registrant.routes'));
        this.app.use('/api/integrations', require('./routes/integration.routes'));
        this.app.use('/api/transactions', require('./routes/transaction.routes'));
        this.app.use('/api/webhooks', require('./routes/webhook.routes'));
        this.app.use('/api/mocks', require('./routes/mock.routes'));
        this.app.use(express.static(path.join(__dirname, 'public')));

        // this.app.use(express.static('/public'))
        // this.app.get('*', (req,res) => {
        //     res.sendFile(path.join(__dirname+'/../', '/public/index.html'));
        // });
        this.app.get('*', (req, res) => {

            res.sendFile(path.join(__dirname, 'public/index.html'));
        });
    }

    sockets() {
        this.io.on('connection', socketController)
    }

    listen() {
        this.server.listen(this.port, () => {
            console.log('Servidor corriendo en ' + this.port);
        })
    }
}
module.exports.io =
    module.exports = Server;