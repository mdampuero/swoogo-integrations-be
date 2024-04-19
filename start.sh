#!/bin/bash
folderName=$(basename "$PWD")
echo "---- START CONTAINER ----"
docker start c-"$folderName"

