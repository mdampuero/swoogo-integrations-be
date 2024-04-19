#!/bin/bash
folderName=$(basename "$PWD")
echo "---- STOP CONTAINER ----"
docker stop c-"$folderName"

