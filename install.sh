#!/bin/bash
folderName=$(basename "$PWD")
# Verificar si se proporcionó el puerto como argumento
if [ $# -eq 0 ]; then
    echo "Usage: $0 <port>"
    exit 1
fi

puerto=$1

echo "---- DELETE CONTAINER ----"
docker rm c-"$folderName"
echo "---- BUILD CONTAINER ----"
docker build -t i-"$folderName" .
echo "---- RUN CONTAINER ----"
docker run -d -p $puerto:3000 --name c-"$folderName" i-"$folderName"

