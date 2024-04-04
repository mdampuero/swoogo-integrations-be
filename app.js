
require('dotenv').config();
const cron = require('node-cron');
const { disableEvent } = require('./helpers/crons');

const Server = require('./server');

const server = new Server();

server.listen();

cron.schedule('0 * * * *', () => {
    disableEvent();
});