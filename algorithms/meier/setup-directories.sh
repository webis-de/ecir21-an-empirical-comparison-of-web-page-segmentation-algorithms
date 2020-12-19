#!/bin/bash

if [ $# -ne 2 ];then
  echo "Usage: $0 <path/to/webis-webseg-20> <path/to/webis-webseg-20-folds.txt>"
  exit 1
fi

webseg=$(readlink -f $1)
folds_file=$(readlink -f $2)
output=$(readlink -f webis-webseg-20-meier)


folds_directory=$output/folds
echo "Setup folds in $folds_directory"

function cp_files() {
  local fold=$1
  local original_filename=$2
  local links_directory=$3

  mkdir -p $links_directory
  pushd $links_directory
  for task in $(cat $folds_file | grep "^$fold " | cut -d" " -f2);do
    cp $webseg/$task/$original_filename $task.png
  done
  popd > /dev/zero
}

for fold in $(seq 0 9);do
  fold_directory=$folds_directory/fold$fold
  cp_files $fold screenshot-4096px.png $fold_directory/screenshots
  cp_files $fold text-mask-4096px.png $fold_directory/text-boxes
  cp_files $fold ground-truth-mask-4096px.png $fold_directory/annotation-boxes
done


# SETUP DIRECTORY STRUCTURE
cross_validation_directory=$output/input
echo "Setup cross validation directory structure in $cross_validation_directory"

function link_fold() {
  local cross_validation_fold=$1
  local cross_validation_fold_type=$2
  local original_fold=$3

  for input_type in screenshots text-boxes annotation-boxes;do
    links_directory=$cross_validation_directory/$cross_validation_fold_type/$input_type/cross-val-$cross_validation_fold
    mkdir -p $links_directory
    pushd $links_directory
      ln -s ../../../../folds/fold$original_fold/$input_type/* .
    popd > /dev/zero
  done
}

for cross_validation_fold in $(seq 0 9);do
  validation_fold=$cross_validation_fold
  test_fold=$((($cross_validation_fold + 1) % 10))

  link_fold $cross_validation_fold validation $validation_fold
  link_fold $cross_validation_fold test $test_fold
  for training_fold in $(seq 0 9 | grep -v "^$validation_fold$" | grep -v "^$test_fold$");do
    link_fold $cross_validation_fold training $training_fold
  done
done

