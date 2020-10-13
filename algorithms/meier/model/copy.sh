#!/bin/bash

FOLD_FOLDER=${1%/}
RESULT_FOLDER=${2%/}
OUTPUT_FOLDER=${3%/}

if [ $# -ne 3 ]
then
  echo "Invalid number of parameters."
  echo "Usage:" "bash" "$0" "<fold directory>" "<result directory>" "<target directory>"
  exit 1
fi

if [ ! -d $OUTPUT_FOLDER ]
then
  mkdir -p $OUTPUT_FOLDER
fi

echo "Copying folder" "$RESULT_FOLDER" "to" "$OUTPUT_FOLDER"
k=0
while IFS= read -r line;
do
    cp ${RESULT_FOLDER}/`printf %06d $k`.png ${OUTPUT_FOLDER}/${line}
    let "k=k+1"
done < <(ls -l ${FOLD_FOLDER}/*.png | awk -F'/' '{ print $6 }')
