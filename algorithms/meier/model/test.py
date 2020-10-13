import numpy as np
import imageio
import meier2017
from keras.models import Model
from keras.utils import multi_gpu_model
from keras.optimizers import SGD, Adam
from tensorflow import device
import custom_image_generator_test
import my_metrics
import setup_folders
import sys
import os
from glob import glob
from re import search

if len(sys.argv) != 4:
    print("Usage: python " + sys.argv[0] + " <input_folder> <fold> <weights_file>")
    sys.exit(1)

output_folder = '../data/output'
input_folder = sys.argv[1]
fold = sys.argv[2]
input_files = glob(input_folder + '/screenshots/cross-val-' + fold + "/*.png")
input_files_num = len(input_files)

first_results_folder = output_folder + '/results-' + '1'.zfill(7) + '/'
folder = ''

if not os.path.exists(first_results_folder):
    os.makedirs(first_results_folder)
    folder = first_results_folder
else:
    output_folders = glob(output_folder + '/results-*')
    output_folders.sort()
    output_folders_num = str(int(search('\d+', output_folders[-1])[0]) + 1)
    folder = output_folder + '/results-' + output_folders_num.zfill(7) + '/'

setup_folders.create(folder)

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

# Model
with(device("/gpu:0")):
    model_in, model_out = meier2017.model(hyper['l2_lambda'], hyper['input_size'], hyper['no_text_boxes'])

    model = Model(inputs=model_in, outputs=model_out)

# model = multi_gpu_model(model, gpus=8)

weights_file = sys.argv[3]

if hyper['optimizer'] == 'SGD':
    opti = SGD(lr=hyper['lr'], momentum=hyper['momentum'], nesterov=True)

if hyper['optimizer'] == 'Adam':
    opti = Adam(lr=hyper['lr'])

model.compile(opti, loss='binary_crossentropy', metrics=['acc', my_metrics.precision, my_metrics.recall, my_metrics.bal_acc, my_metrics.iou])

model.load_weights(weights_file)

out = model.predict_generator(custom_image_generator_test.generator_test(input_folder, hyper['no_text_boxes'], fold), steps=input_files_num, verbose=1)

for i in range(len(out)):
    mask = out[i] -out[i].min()
    mask *= 255 / mask.max()
    mask = np.squeeze(mask.astype('uint8'))
    imageio.imwrite(folder + str(i).zfill(6) + '.png', mask)
