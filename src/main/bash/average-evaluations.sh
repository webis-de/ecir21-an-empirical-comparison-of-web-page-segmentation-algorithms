#!/bin/bash

echo "algorithm,elementtype,tasks.valid,bcubed.precision,bcubed.recall,bcubed.f1,bcubed.f1.star"
cat $@ \
  | grep -v "^algorithm," \
  | grep -v ",NA" \
  | awk -F, '{
      algorithm = $1
      elementtype = $2
      algorithms[algorithm] = 1
      elementtypes[elementtype] = 1
      precision = $3
      recall = $4
      f = $5

      key = algorithm" "elementtype
      counts[key] += 1
      precisions[key] += precision
      recalls[key] += recall
      fs[key] += f 
    } END {
      for (algorithm in algorithms) {
        for (elementtype in elementtypes) {
	  key = algorithm" "elementtype
	  count = counts[key]
	  precision = precisions[key] / count
	  recall = recalls[key] / count
	  f = fs[key] / count
	  fstar = 2 * precision * recall / (precision + recall)
	  printf "%s,%s,%d,%.2f,%.2f,%.2f,%.2f\n", algorithm, elementtype, count, precision, recall, f, fstar
	}
      }
    }' \
  | sort
