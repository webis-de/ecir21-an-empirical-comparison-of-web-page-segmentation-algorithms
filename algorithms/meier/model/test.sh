#!/bin/bash
input=$1
fold=$2
weights=$3
output=$4
tmp_output=$output.tmp/
tmp_output_renamed=$output.renamed.tmp/
tmp_output_resized=$output.resized.tmp/

python test.py $input $fold $weights $tmp_output
./copy.sh $input/screenshots/cross-val-$fold $tmp_output $tmp_output_renamed
./resize.sh $tmp_output_renamed $tmp_output_resized
./extract_rectangles.sh $tmp_output_resized $output/

