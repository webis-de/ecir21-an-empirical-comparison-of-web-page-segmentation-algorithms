Meier et al.
============

Detailed instructions for the approach of Meier et al.

Make sure your system fulfills the requirements as listed [in the main README](../../README.md#meier-et-al).

Build the docker image
----------------------
You probably don't need to do this, as the image is hosted on [dockerhub](https://hub.docker.com/r/webis/meier17-web-page-segmentation) and Docker will automatically fetch it from there.
```
sudo docker build -f docker/Dockerfile . -t webis/meier17-web-page-segmentation:1.0.4
```

### Re-creation
If you want to re-create the data instead of downloading it, use these commands (the use of `optipng` is optional, but greatly reduces the size of the PNG files):

Cropping/extending a `screenshot.png` to 4096px (`screenshot-4096px.png`):
```
convert -extent 1366x4096+0x0 -background white path/to/screenshot.png path/to/screenshot-4096px.png
optipng path/to/screenshot-4096px.png
```

Creating the ground truth masks (`ground-truth-mask-4096px.png`):
```
Rscript path/to/cikm20-web-page-segmentation-revisited-evaluation-framework-and-dataset/src/main/r/plot-segmentation-mask.R --input path/to/ground-truth.json --height 4096 --output path/to/ground-truth-mask-4096px.png
optipng path/to/ground-truth-mask-4096px.png
```

Creating the text masks (`text-mask-4096px.png`):
```
Rscript path/to/cikm20-web-page-segmentation-revisited-evaluation-framework-and-dataset/src/main/r/plot-text-mask.R --input path/to/nodes.csv --height 4096 --output path/to/text-mask-4096px.png
optipng path/to//text-mask-4096px.png
```

Cropping/extending the ground truth (ground-truth-4096px.json):
```
Rscript path/to/cikm20-web-page-segmentation-revisited-evaluation-framework-and-dataset/src/main/r/crop-segmentations.R --input path/to/ground-truth.json --height 4096 --output path/to/ground-truth-4096px.json
```


Train the model
---------------
You first need to [setup the directory structure](../../README.md#meier-et-al).

For each fold number (0 to 9), you can train the corresponding model like this:
```
gpu=0 # The ID of the GPU to use
fold=0 # The fold left for testing
batch_size=16 # decrease for smaller GPUs, increase for larger ones
epochs=100 # maximum number of epochs for training
nvidia-docker run -it --rm -u $(id -u):$(id -g) --env NVIDIA_VISIBLE_DEVICES=$gpu -v ${PWD}/webis-webseg-20-meier/:/src/workspace/data -e KERAS_BACKEND=tensorflow webis/meier17-web-page-segmentation:1.0.4 python main.py --batch-size=$batch_size --epochs=$epochs --cross-val-fold=$fold 1> log$fold.txt 2>&1
```

