#!/bin/sh

folders="training validation test"
inputs="annotation-boxes screenshots text-boxes"

start=$1
end=$2
epochs=$3

cd /src/workspace/data/input

for i in $(seq $start $end);
do
	val=$i
	test=$((($i + 1) % 10))
	for j in $(seq 0 9);
	do
		if [ $j -ne $val ] && [ $j -ne $test ];
		then
			for input in $inputs;
			do
        mkdir -p training/$input/cross-val-0;
				cd training/$input/cross-val-0;
				ln -s ../../../folds/$input/cross-val-${j}/* .;
				cd ../../../;
			done;
		fi;
	done;
	for input in $inputs;
	do
		mkdir -p validation/$input/cross-val-0;
		cd validation/$input/cross-val-0;
		ln -s ../../../folds/$input/cross-val-${val}/* .;
		cd ../../../;
		mkdir -p test/$input/cross-val-0;
		cd test/$input/cross-val-0;
		ln -s ../../../folds/$input/cross-val-${test}/* .;
		cd ../../../;
	done;
	cd /src/workspace/model;
	python main.py --batch-size=128 --epochs=$epochs --cross-val-fold=0;
	cd /src/workspace/data/input;
	for folder in $folders;
	do
    rm -r $folder/$input;
	done;
done
