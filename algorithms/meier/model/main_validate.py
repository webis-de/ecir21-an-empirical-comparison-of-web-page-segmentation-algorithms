import numpy as np
import matplotlib.pyplot as plt
import keras
from keras import backend as K
from keras.models import Model
from keras.callbacks import ModelCheckpoint, EarlyStopping
from keras.preprocessing import image
from keras.utils import multi_gpu_model
import tensorflow as tf
from keras.preprocessing.image import ImageDataGenerator, array_to_img, img_to_array, load_img
import random
from PIL import Image
import json
import matplotlib.gridspec as gridspec
import time
from plotnine import *
import pandas as pd
import os
import glob
import re
import json
import random
import argparse
import sys # TODO: remove

import meier2017
import setup_folders
import callback_epoch_end
import id_list
import helper
import custom_image_generator
import custom_image_generator_validation
import custom_image_generator_test
import plot_ranking_new
import my_metrics


# CLI Arguments
parser = argparse.ArgumentParser()
parser.add_argument("--random", action="store_true", help="random hyper parameters")
parser.add_argument("--optimizer", type=str, help="set optimizer", choices=["SGD","Adam"])
parser.add_argument("--lr", type=float, help="set learning rate")
parser.add_argument("--momentum", type=float, help="set momentum")
parser.add_argument("--l2-lambda", type=float, help="set L2 lambda")
parser.add_argument("--steps-train", type=int, help="set steps train")
parser.add_argument("--steps-val", type=int, help="set steps validation")
parser.add_argument("--batch-size", type=int, help="set batch size")
parser.add_argument("--epochs", type=int, help="set number of epochs")
parser.add_argument("--input-size", type=int, help="set input width and height in pixels")
parser.add_argument("--no-text-boxes", action="store_true", help="deactivate multimodal input")
parser.add_argument("--no-augmentation", action="store_true", help="deactivate input augmentation")
parser.add_argument("--single-augmentation", type=str, help="select a single augmentation method", choices=["zoom","horizontal_flip", "brightness_range", "channel_shift_range"])
parser.add_argument("--cross-val-fold", type=int, help="which fold; k-fold cross validation (0,1, ..., 9)")
parser.add_argument("--weights-file", type=str, help="reload weights from previous training")
args = parser.parse_args()

output_folder = '../data/output'
input_folder = '../data/input'

first_results_folder = output_folder + '/results-' + '1'.zfill(7) + '/'
folder = ''

if not os.path.exists(first_results_folder):
  os.makedirs(first_results_folder)
  folder = first_results_folder
else:
  output_folders = glob.glob(output_folder + '/results-*')
  output_folders.sort()
  output_folders_num = str(int(re.search('\d+', output_folders[-1])[0]) + 1)
  folder = output_folder + '/results-' + output_folders_num.zfill(7) + '/'

setup_folders.create(folder)

#sys.exit()


# Standard Hyperparameters

hyper = {
  'optimizer': 'SGD', # SGD and Adam
  'lr': 0.01, # meier2017 paper: 0.01
  'momentum': 0.0,
  'l2_lambda': 0.0001, # meier2017 paper: 0.0001
  'steps_train': 50000, # 50000
  'steps_val': 1581, # 1581
  'batch_size': 16,
  'epochs': 5, # 5
  'input_size': 256,
  'no_text_boxes': False,
  'no_augmentation': False,
  'cross_val_fold': 0,
  'single_augmentation':""
}

# Random Hyperparameters

if args.random:
  hyper['optimizer'] = random.choice(['Adam', 'SGD'])
  hyper['lr'] = 10 ** random.uniform(-5,-1)
  hyper['l2_lambda'] = 10 ** random.uniform(-5,0)
  hyper['batch_size'] = random.choice([8, 12, 16, 24, 32])

  if hyper['optimizer'] == 'SGD':
    hyper['momentum'] = 10 ** random.uniform(-0.3,0) # between ~0.5 and 1 

# Custom Hyperparameters

for par in ['optimizer', 'lr', 'momentum', 'l2_lambda', 'steps_train', 'steps_val', 'batch_size', 'epochs', 'input_size', 'no_text_boxes', 'cross_val_fold', 'no_augmentation', 'single_augmentation']:
  val = getattr(args, par)
  if val is not None:
    hyper[par] = val

if getattr(args, 'cross_val_fold') is not None:

  train_files_base = input_folder + '/training/annotation-boxes/'
  train_files = glob.glob(train_files_base + "cross-val-" + str(hyper["cross_val_fold"]) + "/*.png")
  train_files_num = len(train_files)

  val_files_base = input_folder + '/validation/annotation-boxes/'
  val_files = glob.glob(val_files_base + "cross-val-" + str(hyper["cross_val_fold"]) +  "/*.png")
  val_files_num = len(val_files)

  if getattr(args, 'steps_train') is None:
    hyper['steps_train'] = train_files_num
  if getattr(args, 'steps_val') is None:
    hyper['steps_val'] = val_files_num

with open(folder + 'hyperparameters.json', 'w') as outfile:
    json.dump(hyper, outfile, indent=2)


# Model
with tf.device("/gpu:0"):
	model_in, model_out = meier2017.model(hyper['l2_lambda'], hyper['input_size'], hyper['no_text_boxes'])

	model = Model(inputs=model_in, outputs=model_out)

# model = multi_gpu_model(model, gpus=8)

class printbatch(keras.callbacks.Callback):

  def __init__(self, model, folder, input_size):
    self.model_for_saving = model
    self.folder = folder
    self.input_size = input_size

  def on_train_begin(self, logs={}):
    self.i = 0 # counts the epochs 
    self.x = [] # accumulates the epoch numbers
    self.losses = []
    self.val_losses = []
    self.acc = []
    self.val_acc = []
    self.precision = []
    self.val_precision= []
    self.recall = []
    self.val_recall = []
    self.bal_acc = []
    self.val_bal_acc = []
    self.fig = plt.figure()
    self.logs = []
    self.mean_iou_gt = []
    self.mean_iou_pr = []
    self.iou = []
    self.val_iou = []

  def on_epoch_end(self, epoch, logs):

    if epoch > -1:

      # plot_ ranking before plotSingle because iou values get calculated in plot_ranking
      # plot_ranking_new.plot_rows(input_folder, folder, epoch, self, logs, hyper['steps_val'], hyper['no_text_boxes'], hyper['cross_val_fold'])
      
      # Accuracy Ranking
      # helper.plotSingle(np, plt, Image, self, epoch, self.folder, logs)

      # Save Model Weights
      self.model_for_saving.save_weights(self.folder + 'weights/epoch-' + str(epoch).zfill(8) + '-weights.h5')

if hyper['optimizer'] == 'SGD':
  opti = keras.optimizers.SGD(lr=hyper['lr'], momentum=hyper['momentum'], nesterov=True)

if hyper['optimizer'] == 'Adam':
  opti = keras.optimizers.Adam(lr=hyper['lr'])

model.compile(opti, loss='binary_crossentropy', metrics=['acc', my_metrics.precision, my_metrics.recall, my_metrics.bal_acc, my_metrics.iou])

model.load_weights(getattr(args, 'weights_file'))

start = time.time()

# model.fit_generator(custom_image_generator.generator_train(input_folder, folder, hyper), 
#   steps_per_epoch= hyper['steps_train'] / hyper['batch_size'],
#   callbacks=[printbatch(model, folder, hyper['input_size']), EarlyStopping(patience=10, verbose=1)],
#   epochs=hyper['epochs'],
#   verbose=1,
#   validation_data=custom_image_generator_validation.generator_val(input_folder, folder, hyper['input_size'], hyper['no_text_boxes'], hyper['cross_val_fold']),
#   validation_steps=hyper['steps_val']
#   )

result = model.evaluate_generator(custom_image_generator_validation.generator_val(input_folder, folder, hyper['input_size'], hyper['no_text_boxes'], hyper['cross_val_fold']), callbacks=[printbatch(model, folder, hyper['input_size'])], steps=hyper['steps_val'], verbose=1)

for i in range(len(result)):
	print(model.metrics_names[i] + " " + str(result[i]))

end = time.time()
training_duration = str(int((end - start) / 60))

# How long did the training take?
#file = open(folder + "training-duration-minutes.txt","w")
#file.write(training_duration) 
#file.close() 

exit()
