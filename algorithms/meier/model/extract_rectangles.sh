#!/bin/bash

INPUT_FOLDER=${1%/}
OUTPUT_FOLDER=${2%/}
SRC_FOLDER=$(dirname $0)

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
  OUTNAME=${FILENAME%.*}
  echo "Extracting bounding boxes for" "$i" "to" "${OUTPUT_FOLDER}/${OUTNAME}.json"
  python $SRC_FOLDER/extract_rectangles.py "$i" "${OUTPUT_FOLDER}/${OUTNAME}.json"
done
