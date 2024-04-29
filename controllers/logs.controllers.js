const { response, request } = require("express");
const fs = require('fs');

const logsGet = async (req = request, res = response) => {
    const logFilePath = "./public/uploads/app.log";

    // Leer el archivo de registro
    fs.readFile(logFilePath, 'utf8', (err, data) => {
        if (err) {
            res.status(500).json({
                "result": false
            })

        }else{

            
            // Dividir las líneas del archivo
            const lines = data.split('\n');
            
            // Obtener las últimas 100 líneas del archivo
            const lastLines = lines.slice(Math.max(lines.length - 100, 0));
            
            res.json(lastLines);
        }

    });
}


module.exports = {
    logsGet
}