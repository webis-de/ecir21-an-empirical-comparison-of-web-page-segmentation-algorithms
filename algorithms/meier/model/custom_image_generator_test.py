import numpy as np
import random
from keras.preprocessing.image import ImageDataGenerator

def generator_test(input_folder, no_text_boxes, cross_val_fold):
    img_cols = 256
    img_rows = 768
    batchsize = 1
    seed = 1
    fold = 'cross-val-' + str(cross_val_fold)

    # Screenshots
    genX1 = ImageDataGenerator().flow_from_directory(
            input_folder + '/screenshots',
            target_size=(img_rows,img_cols),
            classes=[fold],
            class_mode=None,
            shuffle=False,
	    batch_size=batchsize,
            color_mode='grayscale',
            #save_to_dir=output_path + 'validation-generator',
            #save_prefix='input-screenshot',
            #save_format='png'
            )

    # Text Bounding Boxes
    genX2 = ImageDataGenerator().flow_from_directory(
            input_folder + '/text-boxes',
            target_size=(img_rows,img_cols),
            classes=[fold],
            class_mode=None,
	    shuffle=False,
            batch_size=batchsize,
            color_mode='grayscale',
            #save_to_dir=output_path + 'validation-generator',
            #save_prefix='input-textbox',
            #save_format='png'
            )

    count = 0

    while True:
        if(no_text_boxes):
            input_x = np.divide(genX1.next(),255)
        else:
            input_x = np.concatenate((np.divide(genX1.next(),255), np.divide(genX2.next(),255)), axis=3)

        yield input_x
