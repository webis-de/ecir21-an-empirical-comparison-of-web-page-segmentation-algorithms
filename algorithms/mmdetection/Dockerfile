ARG PYTORCH="nightly-devel"
ARG CUDA="9.2"
ARG CUDNN="7"

FROM pytorch/pytorch:${PYTORCH}-cuda${CUDA}-cudnn${CUDNN}

RUN apt-get update && apt-get install -y ffmpeg libglib2.0-0 libsm6 libxrender-dev libxext6 \
 && apt-get clean \
 && rm -rf /var/lib/apt/lists/*

# Install mmdetection
RUN conda update -n base -c defaults conda
RUN conda install cython -y && conda clean --all
RUN git clone https://github.com/open-mmlab/mmdetection.git /mmdetection
WORKDIR /mmdetection
RUN git checkout 8d010d7de9c2643e715aaf6033ff7fd5c60ebdc2
COPY ./requirements.txt ./infer.py ./infer_single.py /mmdetection/
ENV CUDA_HOME=/usr/local/cuda LD_LIBRARY_PATH=/usr/local/cuda/lib64${LD_LIBRARY_PATH:+:${LD_LIBRARY_PATH}}
RUN pip install --no-cache-dir -e .
