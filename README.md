# Repository for the ECIR21 Reproducibility Paper "An Empirical Comparison of Web Page Segmentation Algorithms"
Paper by Johannes Kiesel, Lars Meyer, Florian Kneist, Benno Stein, and Martin Potthast.

This repository enables the reproduction of the experiments from the paper, but also to run the algorithms on new data.

Outline:
  - [Common Preparations](#common-preparations): necessary setup steps
  - [Algorithms](#algorithms): running each segmentation algorithm on the Webis-WebSeg-20: [Baseline](#baseline), [VIPS](#vips), [HEPS](#heps), [Cormier et al.](#cormier-et-al), [MMDetection](#mmdetection), [Meier et al.](#meier-et-al), [Ensemble](#ensemble)
  - [Evaluation](#evaluation): evaluating the segmentations
  - [Plotting Segmentations](#plotting-segmentations): visually checking on segmentations

## Common Preparations
  - Check out this repository.
  - If not done already, get the [source code](https://github.com/webis-de/cikm20-web-page-segmentation-revisited-evaluation-framework-and-dataset/archive/master.zip) of the evaluation framework paper, extract it next to this README, and rename the extracted directory (`cikm20-web-page-...`) to `cikm20`.
  - Make sure your system fulfills all the [requirements of the evaluation framework](https://github.com/webis-de/cikm20-web-page-segmentation-revisited-evaluation-framework-and-dataset/tree/235bb0b1b673da351e267b3966da811021c20e63#requirements).
  - If it does not exist yet, create the directory `segmentations` next to this README.


## Algorithms
We here describe how to get the code and how to run each algorithm for one page, so that it produces a segmentation in the common format (a JSON file in the `segmentations` directory) which can then be used in the [evaluation](#evaluation).

The instructions here use the page with ID 000000 so that they work with the sample ZIP archives, `webis-webseg-20-000000.zip` and `webis-web-archive-17-000000.zip`, as well as with the full datasets of [segmentations](https://doi.org/10.5281/zenodo.3354902) and [archives](https://doi.org/10.5281/zenodo.1002203). For the sample ZIP archives, download them from the respective full dataset pages, extract them next to this README, and rename them by removing the `-000000` suffix. If you download and extract the full datasets, they already have the correct name. Then follow the instructions below.


### Baseline
The baseline creates a single segment that contains the entire web page.

  - In a shell, go to the directory that contains this README.

```
Rscript algorithms/baseline/src/main/r/segmentation-baseline.R \
  --input webis-webseg-20/000000/screenshot.png \
  --output segmentations/baseline.json
```


### VIPS
We use a TypeScript port of Tomáš Popela's [vips_java](https://github.com/tpopela/vips_java), transpiled to JavaScript. We thank the original author for providing his implementation.

The implementation is in the [vips.js](algorithms/vips/scripts/VIPSScript-1.0.0/vips.js). This file is loaded into the webis-web-archiver to run on web pages that are reproduced from web archives. If needed, you can use the [compile.sh](algorithms/vips/compile.sh) to re-compile the Java part that controls the browser and executes the VIPS JavaScript (re-compilation requires a Java 8 JDK or above installed).

  - Install [Docker](https://www.docker.com/).
  - In a shell, go to the directory that contains this README.

You can find the corresponding URL for an archive of the webis-web-archive-17 in the [sites-and-pages.txt](https://zenodo.org/record/4064019/files/sites-and-pages.txt). Note that the docker image may take quite some time to download when you run it the first time.
```
# Execute VIPS while reproducing the web page from the archive
./algorithms/vips/vips.sh \
  --archive webis-web-archive-17/pages/000000/ \
  --pdoc 5 \
  --url "http://008345152.blog.fc2.com/blog-date-201305.html" \
  --id 000000 \
  --output segmentations

# Convert hierarchical segmentation to a flat one
Rscript cikm20/src/main/r/flatten-segmentations.R \
  --input segmentations/vips.json \
  --output segmentations/vips-flattened.json
```


### HEPS
We use a slightly modified version of Manabe et al.'s [HEPS implementation](https://github.com/tmanabe/HEPS) that outputs bounding box coordinates instead of text segments. We thank the original authors for providing their implementation.

The implementation is in the [heps.js](algorithms/heps/scripts/HEPSScript-1.0.0/heps.js). This file is loaded into the webis-web-archiver to run on web pages that are reproduced from web archives. If needed, you can use the [compile.sh](algorithms/heps/compile.sh) to re-compile the Java part that controls the browser and executes the HEPS JavaScript (re-compilation requires a Java 8 JDK or above installed).

  - Install [Docker](https://www.docker.com/).
  - In a shell, go to the directory that contains this README.

You can find the corresponding URL for an archive of the webis-web-archive-17 in the [sites-and-pages.txt](https://zenodo.org/record/4064019/files/sites-and-pages.txt). Note that the docker image may take quite some time to download when you run it the first time.
```
# Execute HEPS while reproducing the web page from the archive
./algorithms/heps/heps.sh \
  --archive webis-web-archive-17/pages/000000/ \
  --url "http://008345152.blog.fc2.com/blog-date-201305.html" \
  --id 000000 \
  --output segmentations
```


### Cormier et al.
We use a Python implementation graciously provided by [Michael Cormier](https://cs.uwaterloo.ca/~m4cormie/) and Zhuofu Tao, to whom we express our gratitude.

You may adjust the `min_l` and `line_length` parameters in [`cormier.py`](algorithms/cormier/cormier.py).

  - Install [Python 3](https://www.python.org/downloads/) (e.g., for Debian/Ubuntu: `sudo apt install python3`).
  - Install `pip3` (e.g., for Debian/Ubuntu: `sudo apt install python3-pip`).
  - In a shell, go to the directory that contains this README.
  - Install the required Python packages: `pip3 install -r algorithms/cormier/requirements.txt`.

```
python3 algorithms/cormier/cormier.py --image webis-webseg-20/000000/screenshot.png --id 000000 --output segmentations
```


### MMDetection
We use the [original implementation](https://github.com/open-mmlab/mmdetection) provided by the authors. The provided inference scripts are suitable for use with Nvidia GPUs. By default, the container uses the first available GPU.

  - Install [Docker](https://www.docker.com/).
  - Install the [Nvidia Container Toolkit](https://docs.nvidia.com/datacenter/cloud-native/container-toolkit/install-guide.html#docker).
  - Download the [pre-trained model](https://s3.ap-northeast-2.amazonaws.com/open-mmlab/mmdetection/models/htc/htc_dconv_c3-c5_mstrain_400_1400_x101_64x4d_fpn_20e_20190408-0e50669c.pth) and place it next to this README.

```
# Infer segments for page with ID 000000 (use 'infer.py' to segment all)
mkdir -p webis/mmdetection19-web-page-segmentation
nvidia-docker run -it \
  -v "${PWD}/htc_dconv_c3-c5_mstrain_400_1400_x101_64x4d_fpn_20e_20190408-0e50669c.pth":"/resources/checkpoints/htc_dconv_c3-c5_mstrain_400_1400_x101_64x4d_fpn_20e_20190408-0e50669c.pth" \
  -v ${PWD}/webis-webseg-20/:/pages \
  -v ${PWD}/segmentations/mmdetection:/out \
  webis/mmdetection19-web-page-segmentation \
  python infer_single.py 000000

# Fit segments
Rscript cikm20/src/main/r/fit-segmentations-to-dom-nodes.R \
  --input segmentations/mmdetection/000000.json \
  --segmentations mmdetection_segms \
  --nodes webis-webseg-20/000000/nodes.csv \
  --output segmentations/mmdetection.json

# Rename segmentation
sed -i 's/mmdetection_segms.fitted/mmdetection/' segmentations/mmdetection.json
```


### Meier et al.
The neural network is implemented in [Keras](https://keras.io) using the [TensorFlow](https://www.tensorflow.org) backend. We provide a [Docker container](https://hub.docker.com/layers/webis/meier17-web-page-segmentation/1.0.4/images/sha256-24ee082e1bee6f20b5e41140d081a52e5048298ff56e59a634a00239960d68db?context=explore) that can be used to train the model and perform inference with Nvidia GPUs. By default, the container uses the first available GPU.

  - Install [Docker](https://www.docker.com/).
  - Install the [Nvidia Container Toolkit](https://docs.nvidia.com/datacenter/cloud-native/container-toolkit/install-guide.html#docker).
  - In a shell, go to the directory that contains this README.

The algorithm expects a specific directory structure for training and testing:
  - Download the `webis-webseg-20-folds.txt` and `webis-webseg-20-4096px.zip` from [Zenodo](https://doi.org/10.5281/zenodo.4146889) and extract the ZIP file.
  - Use `./algorithms/meier/setup-directories.sh <path/to/extracted/webis-webseg-20> <path/to/webis-webseg-20-folds.txt>`. The directory structure will be created in `./webis-webseg-20-meier`.
  - Download the `webis-webseg-20-meier-models.zip` from [Zenodo](https://doi.org/10.5281/zenodo.4146889) and extract it into the created `./webis-webseg-20-meier` directory.

Instructions to create the input files and to train the models are provided in our [README for the algorithm](algorithms/meier/README.md).

```
# Run the algorithm on all screenshots of a fold, resizes the output to the original size, and extracts the segments from the masks.
gpu=0 # The ID of the GPU to use
fold=0 # Do this for each integer from 0 to 9
sudo nvidia-docker run -it --rm -u $(id -u):$(id -g) --env NVIDIA_VISIBLE_DEVICES=$gpu -v ${PWD}/webis-webseg-20-meier/:/src/workspace/data -e KERAS_BACKEND=tensorflow webis/meier17-web-page-segmentation:1.0.4 ./test.sh ../data/input/test/ $fold ../data/webis-webseg-20-meier-models/model-fold$fold-weights.h5 ../data/segmentations-fold$fold
```


### Ensemble
The Ensemble uses the segmentation fusion algorithm.

  - If one of these files is missing in `segmentations`, run the corresponding algorithm as described above: `vips.json`, `heps.json`, `cormier.json`, and `mmdetection.json`.
  - In a shell, go to the directory that contains this README.

```
# Create one segmentation file that contains VIPS, HEPS, Cormier et al., and MMDetection segmentations
Rscript cikm20/src/main/r/combine-segmentation-files.R \
  segmentations/vips.json \
  segmentations/heps.json \
  segmentations/cormier.json \
  segmentations/mmdetection.json \
  segmentations/all.json

# Create the ensemble segmentation for Min-vote@2
Rscript cikm20/src/main/r/fuse-segmentations.R \
  --input segmentations/all.json \
  --segments-min-annotators 2 \
  --size-function pixels \
  --disagreement-threshold 0.375 \
  --output segmentations/ensemble.json
```


## Evaluation
The evaluation is here exemplified for the `baseline` algorithm and for `pixels` as atomic elements (the other options are `edges-fine`, `edges-coarse`, `nodes`, and `chars`).

  - The segmentation of the algorithm should be contained in a JSON file `segmentations/baseline.json`. If not, run the algorithm as described above.
  - If it does not exist yet, create the directory `results` next to this README.
  - In a shell, go to the directory that contains this README.
  
```
# Get BCubed precision, recall, and F-measure
Rscript cikm20/src/main/r/evaluate-segmentation.R \
  --algorithm segmentations/baseline.json \
  --ground-truth webis-webseg-20/000000/ground-truth.json \
  --size-function pixels \
  --output results/baseline-pixels.csv
```

The agreement of two algorithms is calculated the same way, but with the segmentation of the second algorithm as the "ground-truth".


## Plotting Segmentations
```
Rscript cikm20/src/main/r/plot-segmentations.R \
  --input <path/to/segmentation>.json \
  --color-per-segment \
  --output <path/to/output-image>.png
```

