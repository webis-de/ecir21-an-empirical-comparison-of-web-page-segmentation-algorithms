#ARG cuda_version=9.0
#ARG cudnn_version=7
FROM nvidia/cuda:10.0-cudnn7-devel-ubuntu16.04

# Install system packages
RUN apt-get update && apt-get install -y --no-install-recommends \
      bzip2 \
      g++ \
      git \
      graphviz \
      libgl1-mesa-glx \
      libhdf5-dev \
      openmpi-bin \
      libpng12-0 \
      libpng-dev \
      wget \
      software-properties-common && \
    add-apt-repository -y ppa:cheah/imagemagick6-xenial && \
    apt-get update && \
    apt-get -y install imagemagick && \
    rm -rf /var/lib/apt/lists/*

# Install conda
ENV CONDA_DIR /opt/conda
ENV PATH $CONDA_DIR/bin:$PATH

RUN wget --quiet --no-check-certificate https://repo.continuum.io/miniconda/Miniconda3-4.2.12-Linux-x86_64.sh && \
    echo "c59b3dd3cad550ac7596e0d599b91e75d88826db132e4146030ef471bb434e9a *Miniconda3-4.2.12-Linux-x86_64.sh" | sha256sum -c - && \
    /bin/bash /Miniconda3-4.2.12-Linux-x86_64.sh -f -b -p $CONDA_DIR && \
    rm Miniconda3-4.2.12-Linux-x86_64.sh && \
    echo export PATH=$CONDA_DIR/bin:'$PATH' > /etc/profile.d/conda.sh

# Install Python packages and keras
ENV NB_USER keras
ENV NB_UID 1009 

RUN useradd -m -s /bin/bash -N -u $NB_UID $NB_USER && \
   chown $NB_USER $CONDA_DIR -R && \
   mkdir -p /src && \
   chown $NB_USER /src

USER $NB_USER

ARG python_version=3.6

RUN conda install -y python=${python_version}
RUN pip install \
      imageio==2.5.0 \
      plotnine==0.6.0 \
      cython==0.29.13 \
      numpy==1.16.5 \
			tensorflow-gpu==1.13.1 \
		  h5py==2.9.0 \
		  matplotlib==3.1.1 \
		  mkl==2019.0 \
		  nose==1.3.7 \
		  notebook==6.0.1 \
		  Pillow==6.1.0 \
		  pandas==0.25.1 \
		  pydot==1.4.1 \
		  pyyaml==5.1.2 \
		  scikit-learn==0.21.2 \
		  six==1.12.0 \
			keras==2.2.5 \
      Keras-Preprocessing==1.1.0 \
			sklearn_pandas==1.8.0 && \
    pip install bcolz && \
    conda clean -yt && \
    rm -r /home/$NB_USER/.cache

ENV PYTHONPATH='/src/:$PYTHONPATH'

WORKDIR /src/workspace/model

COPY ./model /src/workspace/model
