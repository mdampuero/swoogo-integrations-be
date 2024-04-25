


const socketController = (socket) => {
    console.log("Socket: Conectado");
    socket.on('disconnet', () => {
       console.log("Server: Desconectado")
    })
    socket.on('message', (payload, callback) => {
        console.log(payload);
        callback({
            'msg': 'respuesta a esa peticion'
        })
        // this.io.emit('devolver-mensaje',payload);
     })
};

module.exports = {
    socketController
}