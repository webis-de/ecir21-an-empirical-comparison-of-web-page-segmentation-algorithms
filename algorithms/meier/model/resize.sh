#!/bin/bash

INPUT_FOLDER=${1%/}
OUTPUT_FOLDER=${2%/}

if [ $# -ne 2 ]
then
  echo "Invalid number of arguments."
  echo "Usage:" "bash" "$0" "<directory containing input pngs>" "<target directory>"
  exit 1
fi

if [ ! -d $OUTPUT_FOLDER ]
then
  mkdir -p $OUTPUT_FOLDER
fi

for i in ${INPUT_FOLDER}/*.png
do
  FILENAME=$(basename ${i})
  echo "Resizing" "${i}" "to" "${OUTPUT_FOLDER}/${FILENAME}"
  convert "$i" -interpolate Integer -filter point -resize 1366x4096\! ${OUTPUT_FOLDER}/${FILENAME} || break
done
