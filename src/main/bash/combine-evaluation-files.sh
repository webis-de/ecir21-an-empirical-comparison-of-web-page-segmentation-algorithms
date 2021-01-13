#!/bin/bash

algorithms="baseline cormier-t_l256-s_min45-unfitted cormier-t_l256-s_min45 cormier-t_l256-s_min90-unfitted cormier-t_l256-s_min90 cormier-t_l512-s_min45-unfitted cormier-t_l512-s_min45 cormier-t_l512-s_min90-unfitted cormier-t_l512-s_min90 heps meier-4096px-unfitted meier-4096px min-vote-3at1 min-vote-3at2 min-vote-3at3 min-vote-4at1 min-vote-4at2 min-vote-4at3 min-vote-4at4 mmdetection-unfitted mmdetection mmdetection-bboxes-unfitted vips-pdoc1 vips-pdoc2 vips-pdoc3 vips-pdoc4 vips-pdoc5 vips-pdoc6 vips-pdoc7 vips-pdoc8 vips-pdoc9 vips-pdoc10 vips-pdoc11"
element_types="pixels edges-fine edges-coarse nodes chars"

for directory in $@;do
  echo "$directory"
  output=$directory/evaluation.csv
  echo "algorithm,elementtype,bcubed.precision,bcubed.recall,bcubed.f1" > $output
  for algorithm in $algorithms;do
    for element_type in $element_types;do
      echo -n "$algorithm,$element_type,"
      evaluation_file=$directory/evaluation-$algorithm-$element_type.txt
      if [ -e $evaluation_file ];then
	cat $evaluation_file | grep "majority-vote" | cut -d, -f2-
      else
        echo "NA,NA,NA"
      fi
    done
  done >> $output
done
