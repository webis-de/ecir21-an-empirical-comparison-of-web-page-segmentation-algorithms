# Repository for the Paper "Reproducing Web Page Segmentation Algorithms"
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

Set the PDoC parameter by changing the value in the [vips.conf](algorithms/vips/scripts/VIPSScript-1.0.0/vips.conf).

  - Install [Docker](https://www.docker.com/).
  - In a shell, go to the directory that contains this README.

You can find the corresponding URL for an archive of the webis-web-archive-17 in the [sites-and-pages.txt](https://zenodo.org/record/4064019/files/sites-and-pages.txt). Note that the docker image may take quiet some time to download when you run it the first time.
```
# Execute VIPS while reproducing the web page from the archive
./algorithms/vips/vips.sh \
  --archive webis-web-archive-17/pages/000000/ \
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

You can find the corresponding URL for an archive of the webis-web-archive-17 in the [sites-and-pages.txt](https://zenodo.org/record/4064019/files/sites-and-pages.txt). Note that the docker image may take quiet some time to download when you run it the first time.
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
python3 algorithms/cormier/cormier.py webis-webseg-20/000000/screenshot.png 000000 segmentations
```
where `000000` is the ID and `segmentations` the name of the output directory.


### MMDetection
Todo: Lars

  - Install [Docker](https://www.docker.com/).
  - Install the [Nvidia Container Toolkit](https://docs.nvidia.com/datacenter/cloud-native/container-toolkit/install-guide.html#docker).
  - Download the [pre-trained model](https://s3.ap-northeast-2.amazonaws.com/open-mmlab/mmdetection/models/htc/htc_dconv_c3-c5_mstrain_400_1400_x101_64x4d_fpn_20e_20190408-0e50669c.pth) and place it next to this README.

### Meier et al.

The neural network is implemented in [Keras](https://keras.io) using the [TensorFlow](https://www.tensorflow.org) backend. We provide a [Docker container]() that can be used to train the model and perform inference with Nvidia GPUs. By default, the container uses the first available GPU.

  - Install [Docker](https://www.docker.com/).
  - Install the [Nvidia Container Toolkit](https://docs.nvidia.com/datacenter/cloud-native/container-toolkit/install-guide.html#docker).
  - In a shell, go to the directory that contains this README.

#### Training

To train the model on [Webis-WebSeg-20](https://doi.org/10.5281/zenodo.3354902), you must download the TODO: [webis-webseg-20-meier.zip]() archive containing the prepared screenshots cropped/padded to 4096 px height, as well as ground truth annotation and DOM text node masks.

TODO: how/where to extract

```
# Train the model across all 10 folds for a maximum of 100 Epochs
# Usage of run.sh: bash run.sh <first fold> <last fold> <max. number of epochs>
sudo nvidia-docker run -it \
  -v <path>/<to>/meier17/data:/src/workspace/data \
  -e KERAS_BACKEND=tensorflow \
  webis/meier17-web-page-segmentation \
  bash model/train.sh 0 9 100 > log.txt 2>&1
```

The file `log.txt` then contains a log of the training process. From this, you can identify the total number of epochs trained for each fold. Each fold will output to a sequentially numbered folder in `meier17/data/output`. Saved weights for each epoch are sequentially numbered and contained in the subfolder `weights`. The best-performing weights for a fold are either contained in the epoch weights file 10 epochs before the last (as the `EarlyStopping` callback is used with a `patience` parameter of 10), or the last epoch weights file if the epoch limit specified in the command above has been reached.

#### Inference

```
# Infers segmentation for all images in fold 0 using the specified weight file
# Usage of test.py: python model/test.py <folder containing input folds> <fold number> <weights file>
sudo nvidia-docker run -it \
  -v ${PWD}/data:/src/workspace/data \
  -e KERAS_BACKEND=tensorflow \
  webis/meier17-web-page-segmentation \
  python model/test.py data/input/folds/ 0 data/output/results-0000001/weights/epoch-0000000-weights.h5
```

The images will appear in the output folder (`results-XXXXXXX`) sequentially numbered in the order of their appearance in the input folder. They can be copied to their original filenames with the included [`copy.sh`](algorithms/meier/model/copy.sh) script.

```
# Copies all images in the specified result directory based on the fold's screenshot names they were inferred from to the target directory.
# Usage of copy.sh: bash copy.sh <fold directory> <result directory> <target directory>
sudo nvidia-docker run -it \
  -v ${PWD}/data:/src/workspace/data \
  -e KERAS_BACKEND=tensorflow \
  webis/meier17-web-page-segmentation \
  bash model/copy.sh data/input/folds/screenshots/cross-val-0 data/output/results-0000001 data/output/renamed
```

As the output images are of size 256x768 px, they must be resized before extracting the rectangles into the evaluation JSON format with the included [`resize.sh`](algorithms/meier/model/resize.sh).

```
# Resizes all images in the specified input folder, writing them into the given output folder.
# Usage of resize.sh: bash resize.sh <directory containing input pngs> <target directory>
sudo nvidia-docker run -it \
  -v ${PWD}/data:/src/workspace/data \
  -e KERAS_BACKEND=tensorflow \
  webis/meier17-web-page-segmentation \
  bash model/resize.sh data/output/renamed data/output/resized
```

Finally, the bounding boxes of segmented areas can be extracted into the evaluation JSON format using [`extract_rectangles.py`](algorithms/meier/model/extract_rectangles.py). The process can be automated for an entire folder with the included [`extract_rectangles.sh`](algorithms/meier/model/extract_rectangles.sh) script.

```
# Extract rectangles of one resized output image.
# Usage of extract_rectangles.py: python3 extract_rectangles.py <input png> <output json>
sudo nvidia-docker run -it \
  -v ${PWD}/data:/src/workspace/data \
  -e KERAS_BACKEND=tensorflow \
  webis/meier17-web-page-segmentation \
  python3 model/extract_rectangles.py data/output/resized/000000.png data/output/json/000000.json

# Extract bounding boxes for a folder of resized output images.
# Usage of extract_rectangles.sh: bash extract_rectangles.sh <directory containing input pngs> <target directory>
sudo nvidia-docker run -it \
  -v ${PWD}/data:/src/workspace/data \
  -e KERAS_BACKEND=tensorflow \
  webis/meier17-web-page-segmentation \
  bash model/extract_rectangles.sh data/output/resized data/output/json
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

# Create the ensemble segmentation
Rscript cikm20/src/main/r/fuse-segmentations.R \
  --input segmentations/all.json \
  --segments-min-annotators 2 \
  --size-function pixels \
  --disagreement-threshold 0.5 \
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

