# Code for the Paper "Reproducing Web Page Segmentation Algorithms"

## Algorithms
We here describe how to get the code and how to run each algorithm for one page, so that it produces a segmentation in the common format (a JSON file in the `segmentations` directory) which can then be used in the [evaluation](#evaluation).

The instructions here use the page with ID 000000 so that they work with both the sample ZIP archive, `webis-webseg-20-000000.zip`, as well as with the full [dataset](https://doi.org/10.5281/zenodo.3354902). For the sample ZIP archive, download it from the [dataset page](https://doi.org/10.5281/zenodo.3354902), extract it next to this README, and rename the directory from `webis-webseg-20-000000` to `webis-webseg-20`. If you download and extract the full dataset, it should already have the correct name. Then follow the instructions below.


### Baseline
#### Preparation:
  - Check out this repository
  - If not done already, get the [source code](https://github.com/webis-de/cikm20-web-page-segmentation-revisited-evaluation-framework-and-dataset/archive/master.zip) of the evaluation framework paper, extract it next to this README, and rename the extracted directory (`cikm20-web-page-...`) to `cikm20`.
  - Make sure your system fulfills all the [requirements of the evaluation framework](https://github.com/webis-de/cikm20-web-page-segmentation-revisited-evaluation-framework-and-dataset/tree/235bb0b1b673da351e267b3966da811021c20e63#requirements).
  - If it does not exist yet, create the directory `segmentations` next to this README.
  - In a shell, go to the directory that contains this README.

#### Execution:
```
Rscript algorithms/baseline/src/main/r/segmentation-baseline.R \
  --input webis-webseg-20/000000/screenshot.png \
  --output segmentations/baseline.json
```

### VIPS

We use a TypeScript port of Tomáš Popela's [vips_java](https://github.com/tpopela/vips_java), transpiled to JavaScript. We thank the original author for providing his implementation.

#### Preparation:

##### Prerequisites

  - Install [Docker](https://www.docker.com/)
  - Install a Java Development Kit (JDK), such as [OpenJDK](https://openjdk.java.net)
  - Check out this repository
  - Get the [source code](https://github.com/webis-de/webis-web-archiver/archive/master.zip) of the Webis Web Archiver and extract it next to this README.
  - Get the [binaries](https://github.com/webis-de/webis-web-archiver/releases/download/0.1.0/webis-web-archiver.jar) for the Webis Web Archiver and place them next to this README.
  - Get the sample web archive ZIP, `webis-web-archive-17-000000.zip` or the full [dataset](https://webis.de/data/webis-web-archive-17.html) and extract it next to this README. If you use the sample web archive ZIP, rename the directory from `webis-web-archive-17-000000`to `webis-web-archive-17`.
  - If not done already, get the [source code](https://github.com/webis-de/cikm20-web-page-segmentation-revisited-evaluation-framework-and-dataset/archive/master.zip) of the evaluation framework paper, extract it next to this README, and rename the extracted directory (`cikm20-web-page-...`) to `cikm20`.
  - Make sure your system fulfills all the [requirements of the evaluation framework](https://github.com/webis-de/cikm20-web-page-segmentation-revisited-evaluation-framework-and-dataset/tree/235bb0b1b673da351e267b3966da811021c20e63#requirements).

##### Building the script

The script must be supplied to the reproduction environment as a JAR file.

- Compile [`VIPSScript.java`](algorithms/vips/VIPSScript.java)

```
javac -cp "webis-web-archiver.jar:." \
  --release 8 \
  algorithms/vips/VIPSScript.java
```

- Create the appropriate directory for the script

```
mkdir -p scripts/VIPSScript-1.0.0
```

- Assemble the JAR

```
jar cfM scripts/VIPSScript-1.0.0/VIPSScript.jar \
  -C algorithms/vips VIPSScript.class \
  -C algorithms/vips pdoc.txt \
  -C algorithms/vips vipsjs.js
```

- Place the supplied `script.conf` alongside `VIPSScript.jar`

```
cp algorithms/vips/script.conf scripts/VIPSScript-1.0.0/
```

#### Execution:

As the reproduction environment has no knowledge of the page ID, the output file is initially named `out.json` and the `id` field therein contains the placeholder string `TBFWID`.

- Create the segmentation:

```
webis-web-archiver-master/src-bash/reproduce.sh \
  --archive webis-web-archive-17/pages/000000 \
  --url "http://008345152.blog.fc2.com/blog-date-201305.html" \
  --script VIPSScript \
  --scriptsdirectory scripts \
  --output segmentations
```

For segmenting other pages from webis-web-archive-17, you may find the corresponding URLs in the `sites-and-pages.txt` file supplied there.

- Insert the ID and rename the output file

```
sed s/TBFWID/000000/ < segmentations/script/out.json > segmentations/vips.json
```

The `segmentations/logs` and `segmentations/script` folder can then be safely deleted.

As the segmentations that VIPS produces are hierarchical, they need to be flattened before evaluation.

```
Rscript cikm20/src/main/r/flatten-task.R \
  --input segmentations/vips.json \
  --output segmentations/vips_flattened.json
```

Adjusting the PDoC is done by replacing the file `pdoc.txt` within the JAR:

```
echo 1 > pdoc.txt
zip -j -u scripts/VIPSScript-1.0.0/VIPSScript.jar pdoc.txt
```

### HEPS
#### Preparation:
#### Execution:
Todo: Lars

### Cormier et al.
#### Preparation:
#### Execution:
Todo: Lars

### MMDetection
#### Preparation:
#### Execution:
Todo: Lars

### Meier et al.
#### Preparation:
#### Execution:
Todo: Lars

### Ensemble
#### Preparation:
#### Execution:
Todo: Johannes


## Evaluation
#### Preparation:
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

#### Execution (exemplified for the algorithm 'baseline'):
The segmentation of the algorithm should be now contained in a JSON file `segmentations/baseline.json`. If not, run the algorithm as described above.
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

