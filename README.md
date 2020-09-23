# Code for the Paper "Reproducing Web Page Segmentation Algorithms"

## Algorithms
We here describe how to get the code and how to run each algorithm for one page, so that it produces a segmentation in the common format. The instructions here use the page with ID 000000 so that it also works with the sample ZIP archive of the [dataset](https://doi.org/10.5281/zenodo.3354902), webis-webseg-20-000000.zip: download this zip file, extract it next to this README, and rename the directory from `webis-webseg-20-000000` to `webis-webseg-20` to follow the instructions. All instructions produce a segmentation (a JSON file in the `segmentations` directory) which can then be used in the [evaluation](#evaluation).


### Baseline
Preparation:
  - Check out this repository
  - If not done already, get the [source code](https://github.com/webis-de/cikm20-web-page-segmentation-revisited-evaluation-framework-and-dataset/archive/master.zip) of the evaluation framework paper, extract it next to this README, and rename the extracted directory (`cikm20-web-page-...`) to `cikm20`.
  - Make sure your system fulfills all the [requirements of the evaluation framework](https://github.com/webis-de/cikm20-web-page-segmentation-revisited-evaluation-framework-and-dataset/tree/235bb0b1b673da351e267b3966da811021c20e63#requirements).
  - If it does not exist yet, create the directory `segmentations` next to this README.
  - In a shell, go to the directory that contains this README.

Execution:
```
Rscript algorithms/baseline/src/main/r/segmentation-baseline.R \
  --input webis-webseg-20/000000/screenshot.png \
  --output segmentations/baseline.json
```

### VIPS
Preparation:
Execution:
Todo: Lars

### HEPS
Preparation:
Execution:
Todo: Lars

### Cormier et al.
Preparation:
Execution:
Todo: Lars

### MMDetection
Preparation:
Execution:
Todo: Lars

### Meier et al.
Preparation:
Execution:
Todo: Lars

### Ensemble
Preparation:
Execution:
Todo: Johannes


## Evaluation
Preparation:
  - If not done already, get the [source code](https://github.com/webis-de/cikm20-web-page-segmentation-revisited-evaluation-framework-and-dataset/archive/master.zip) of the evaluation framework paper, extract it next to this README, and rename the extracted directory (`cikm20-web-page-...`) to `cikm20`.
  - Make sure your system fulfills all the [requirements of the evaluation framework](https://github.com/webis-de/cikm20-web-page-segmentation-revisited-evaluation-framework-and-dataset/tree/235bb0b1b673da351e267b3966da811021c20e63#requirements).
  - If it does not exist yet, create the directory `results` next to this README.
  - In a shell, go to the directory that contains this README.

If you want to produce an image for the ground-truth:
```
Rscript cikm20/src/main/r/plot-segmentations.R \
  --input webis-webseg-20/000000/ground-truth.json \
  --color-per-segment \
  --output results/ground-truth.png
```

Execution (exemplified for the algorithm 'baseline'):
```
# Show the segmentation
#  - Produces results/baseline.png
Rscript cikm20/src/main/r/plot-segmentations.R \
  --input segmentations/baseline.json \
  --screenshot webis-webseg-20/000000/screenshot.png \
  --color-per-segment \
  --output results/baseline.png

# Get BCubed precision, recall, and F-measure
#  - Exemplified for 'pixels' as atomic elements
#    Other options: 'edges-fine', 'edges-coarse', 'nodes', 'chars'
#  - Produces results/baseline-pixels.csv
Rscript cikm20/src/main/r/evaluate-segmentation.R \
  --algorithm segmentations/baseline.json \
  --ground-truth webis-webseg-20/000000/ground-truth.json \
  --size-function pixels \
  --output results/baseline-pixels.csv
```

The agreement of two algorithms is calculated the same way (using `cikm20/src/main/r/evaluate-segmentation.R`), but with the segmentation of the second algorithm as the "ground-truth".

