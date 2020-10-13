import numpy as np
import random
from keras.preprocessing.image import ImageDataGenerator

def invert_colors(input_image):
    test = random.random() 
    if test < 0.5: 
        return input_image 
    else:
        return 255 - input_image

def generator_train(input_folder, output_folder, hyper):
  img_cols = 256
  img_rows = 768
  seed = 1
    
  args_flow_common = {
    'target_size':(img_rows, img_cols),
    'classes':['cross-val-' + str(hyper['cross_val_fold'])],
    'class_mode':None, 
    'seed':seed, 
    'batch_size': hyper['batch_size'], 
    'color_mode':'grayscale'
  }

  args_gen_common = {
    'horizontal_flip': True,
    'zoom_range': 0.3
  }

  args_gen_input = {
    'brightness_range': (0.5,1.0),
    'channel_shift_range': 0.3
  }

  if hyper['no_augmentation']:  
    args_gen_common = {}
    args_gen_input = {}

  if hyper['single_augmentation'] == "zoom":
    args_gen_common = { 'zoom_range': 0.3 }
    args_gen_input = {}

  if hyper['single_augmentation'] == "horizontal_flip":
      args_gen_common = { 'horizontal_flip': True }
      args_gen_input = {}

  if hyper['single_augmentation'] == "brightness_range":
    args_gen_common = {}
    args_gen_input = {'brightness_range': (0.5,1.0)}

  if hyper['single_augmentation'] == "channel_shift_range":
    args_gen_common = {}
    args_gen_input = {'channel_shift_range': 0.3}

  # Screenshots
  genX1 = ImageDataGenerator(**args_gen_common, **args_gen_input).flow_from_directory(
    input_folder + '/training/screenshots', 
    **args_flow_common,
    #save_to_dir=output_folder + 'train-generator',
    #save_prefix='input-screenshot',
    #save_format='png'
    )

  # Text Bounding Boxes
  genX2 = ImageDataGenerator(**args_gen_common, **args_gen_input).flow_from_directory(
    input_folder + '/training/text-boxes', 
    **args_flow_common,
    #save_to_dir=output_folder + 'train-generator',
    #save_prefix='input-textbox',
    #save_format='png'
    )

  # Annotations
  genY  = ImageDataGenerator(**args_gen_common).flow_from_directory(
    input_folder + '/training/annotation-boxes',
    **args_flow_common
    )

  while True:

    if hyper['no_text_boxes']:
      input_x = np.divide(genX1.next(),255)
    else:
      input_x = np.concatenate((np.divide(genX1.next(),255), np.divide(genX2.next(),255)), axis=3)

    output_y = np.divide(genY.next(), 255) # normalize!

    yield input_x, output_y
