

const { logger } = require('../helpers/utils');

const socketController = (socket) => {
    logger.info("Socket: Conectado");
    socket.on('disconnet', () => {
       logger.info("Server: Desconectado")
    })
    // socket.on('message', (payload, callback) => {
    //     console.log(payload);
    //     this.io.emit('message', {
    //         'received': true,
    //         'data': payload
    //     });
    //     // this.io.emit('devolver-mensaje',payload);
    //  })
};

module.exports = {
    socketController
}