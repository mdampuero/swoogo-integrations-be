const express = require('express')
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const { dbConnection } = require('./database/config');
const { socketController } = require('./controllers/socket.controllers');
const bodyParser = require('body-parser');

class Server {

    constructor() {
        this.app = express();
        this.port = process.env.PORT || 3000
        this.server = require('http').createServer(this.app)
        this.io = require('socket.io')(this.server,{
            cors: {
              origin: '*',
            }
          })
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
        const whitelist = ['https://clickgroup.swoogo.com'];
        const corsOptions = {
            origin: function (origin, callback) {
                if (whitelist.indexOf(origin) !== -1 || !origin) {
                    callback(null, true);
                } else {
                    callback(new Error('Not allowed by CORS'));
                }
            }
        };
    
        this.app.use(cors(corsOptions));
        this.app.use(bodyParser.json({ limit: '50mb' }));
        this.app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
        this.app.use(morgan('dev'));
        this.app.use(express.json());
        this.app.use((req, res, next) => {
            req.io = this.io;
            next();
        });
    }

    routes() {
        this.app.use('/api/auth',require('./routes/auth.routes'));
        this.app.use('/api/payments', require('./routes/payment.routes'));
        this.app.use('/api/users', require('./routes/user.routes'));
        this.app.use('/api/demos', require('./routes/demo.routes'));
        this.app.use('/api/events', require('./routes/event.routes'));
        this.app.use('/api/eventSwoogos', require('./routes/eventSwoogos.routes'));
        this.app.use('/api/registrants', require('./routes/registrant.routes'));
        this.app.use('/api/integrations', require('./routes/integration.routes'));
        this.app.use('/api/transactions', require('./routes/transaction.routes'));
        this.app.use('/api/webhooks', require('./routes/webhook.routes'));
        this.app.use('/api/mocks', require('./routes/mock.routes'));
        this.app.use('/api/categories', require('./routes/category.routes'));
        this.app.use('/api/notifications', require('./routes/notification.routes'));
        this.app.use('/api/settings', require('./routes/setting.routes'));
        this.app.use('/api/v2/users', require('./routes/publicUsers.routes'));
        this.app.use(express.static(path.join(__dirname, 'public')));
        this.app.get('*', (req, res) => {
            res.sendFile(path.join(__dirname, 'public/index.html'));
        });
    }

    sockets(){
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