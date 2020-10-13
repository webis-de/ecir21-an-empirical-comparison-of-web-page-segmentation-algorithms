#!/bin/sh

folders="training validation test"
inputs="annotation-boxes screenshots text-boxes"

cd /src/workspace/data/input

for folder in $folders;
do
	for input in $inputs;
	do
		rm $folder/$input/cross-val-0/*;
	done;
done;
