


const socketController = (socket) => {
    console.log("Socket: Conectado");
    socket.on('disconnet', () => {
       console.log("Server: Desconectado")
    })
    socket.on('message', (payload, callback) => {
        console.log(payload);
        this.io.emit('message', {
            'received': true,
            'data': payload
        });
        // this.io.emit('devolver-mensaje',payload);
     })
};

module.exports = {
    socketController
}