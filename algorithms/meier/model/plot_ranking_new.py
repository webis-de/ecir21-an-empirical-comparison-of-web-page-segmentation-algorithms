import numpy as np
import matplotlib.pyplot as plt
import matplotlib.image as mpimg
import keras
from keras.models import Model
from keras.preprocessing import image
from keras.preprocessing.image import ImageDataGenerator, array_to_img, img_to_array, load_img
import random
from PIL import Image
import json
import matplotlib.gridspec as gridspec
import time
import pandas as pd
import os
import subprocess
import re
import json

def iou_single(rect_gt, rect_pr):
      # determine the (x, y)-coordinates of the intersection rectangle
  x1 = max(rect_gt['x1'], rect_pr['x1'])
  y1 = max(rect_gt['y1'], rect_pr['y1'])  
  x2 = min(rect_gt['x2'], rect_pr['x2'])
  y2 = min(rect_gt['y2'], rect_pr['y2'])
 
  interArea = max(0,  x2 - x1) * max(0, y2 - y1)

  if interArea > 0:
   
    boxAArea = (rect_gt['x2'] - rect_gt['x1']) * (rect_gt['y2'] - rect_gt['y1'])
    boxBArea = (rect_pr['x2'] - rect_pr['x1']) * (rect_pr['y2'] - rect_pr['y1'])

    iou = interArea / (boxAArea + boxBArea - interArea)
       
    if interArea == boxBArea and boxAArea == boxBArea:
      iou = 1

  elif interArea == 0:
    iou = 0
     
  return iou

def iou_slice(rects_pr, filename):

    with open('rectangles-per-slice.json') as json_file:  
        data = json.load(json_file)


    filename_correct = re.sub('-epoch-\d+', '', filename)

    rects_gt = data[filename_correct]['rectangles']

    max_per_gt_sum = 0

    iou_per_gt = 0
    iou_per_pr = 0

    if len(rects_gt) > 0 and len(rects_pr) > 0:
        # Iterate ground truth
        for rect_gt in rects_gt:

            ious_per_gt = list()

            # Iterate predictions
            for rect_pr in rects_pr:

                iou = iou_single(rect_gt[0], rect_pr)
                ious_per_gt.append(iou)
            
            max_per_gt_sum += max(ious_per_gt)

        iou_per_gt = max_per_gt_sum / len(rects_gt)
        iou_per_pr = max_per_gt_sum / len(rects_pr)

    return {'iou_per_gt': iou_per_gt, 'iou_per_pr': iou_per_pr}


def extract_rectangles(folder, output_path, output_name):
    
    mask_rect_temp_path =  folder + 'masks-rectangles-temp/' + output_name
    mask_rect_path = folder + 'masks-rectangles/' + output_name

    cmd = ('convert ' + output_path + ' '
    '-threshold 50% '
    '-channel RGB -negate '
    '-channel rgba '
    '-alpha set '
    '-define connected-components:verbose=true '
    '-define connected-components:mean-color=true '
    '-define connected-components:area-threshold=50 '
    '-connected-components 4 '
    '-auto-level '
    + mask_rect_temp_path)

    # Leave out first and last line, because they don't contain rectangle coordinates
    out = subprocess.check_output(cmd, shell=True).decode("utf-8").split('\n')[1:-1]

    re_coords = re.compile('.*\d+: (\d+)x(\d+)\+(\d+)\+(\d+).*\s+(\d+)\s+srgba\((\d+)')

    rects = list()
    rect_str = '' 
    for line in out:
        m = re_coords.match(line)

        # Alpha value
        a = int(m.group(5))
            
        if a != 0 and m.group(6) == u'0':
            w = int(m.group(1))
            h = int(m.group(2))

            # Top left corner
            x1 = int(m.group(3))
            y1 = int(m.group(4))

            # Bottom right corner
            x2 = x1 + w
            y2 = y1 + h 

            rect_str += ('-draw "rectangle ' + str(x1) + ',' + str(y1) + ' ' + str(x2-1) + ',' + str(y2-1) + '" ')
            rects.append({'x1': x1, 'x2': x2, 'y1':y1, 'y2': y2})

    # Binarized output mask with bounding boxes
    
    draw = 'convert ' + mask_rect_temp_path + ' -fill none -strokewidth 2 -stroke red ' + rect_str + ' ' + mask_rect_path
    subprocess.check_output(draw, shell=True)
    return rects, mask_rect_path

def iou_all(folder, epoch, accs_df):

    for i in range(accs_df.shape[0]):
        base = os.path.basename(accs_df.iloc[i]['filename'])
        output_name = os.path.splitext(base)[0] + '-epoch-' + str(epoch) + '.png'
        output_path = folder + 'masks/' + output_name
        rects_pr, mask_rect_path = extract_rectangles(folder, output_path, output_name)
        # Workaroun, not using this iou anymore
        #iou = iou_slice(rects_pr, output_name)
        iou = {'iou_per_gt': 0, 'iou_per_pr': 0}

        accs_df.at[i, 'iou_per_gt'] = iou['iou_per_gt']
        accs_df.at[i, 'iou_per_pr'] = iou['iou_per_pr']
        accs_df.at[i, 'mask_rect_path'] = mask_rect_path
 
    return accs_df


######################################################################################
# Plot the n best or worst outputs 
######################################################################################

def plot_row(folder, epoch, accs_df, pos):
    
  fig = plt.figure(figsize=(20, 32))
  fig.patch.set_facecolor('lightgray')

  grid_h = gridspec.GridSpec(
    20, 6, 
    wspace=0.06, hspace=0.07, 
    height_ratios=[
      0.2, 1, 
      0.2, 1,
      0.2, 1,
      0.2 ,1,
      0.2, 1,
      0.2, 1,
      0.2, 1,
      0.2, 1,
      0.2, 1,
      0.2, 1
    ])

  for i in range(1,21,2):
    df_row = int((i+1) / 2 - 1)

    # Row Headline
    axes_text = plt.subplot(grid_h[i-1,0:6])
    axes_text.text(
        0,0.5,
        "file: " + accs_df.iloc[df_row]["filename"] + ", accuracy: " + str(np.round_(accs_df.iloc[df_row]["acc"],3)),
        horizontalalignment='left',
        verticalalignment='center',
        fontsize=16)
    axes_text.axis('off')
    fig.add_subplot(axes_text)

    # Original Screenshot
    axes_1 = plt.subplot(grid_h[i,0])
    axes_1.axis('off')
    original_image = np.squeeze(accs_df.iloc[df_row]['x1'] * 255).astype('uint8')

    args_grayscale = {
      'cmap': 'gray',
      'vmin': 0,
      'vmax': 256
    }

    original_image = Image.fromarray(original_image, mode='L') # mode `L` stands for 8-bit pixels, black and white
    axes_1.imshow(original_image, **args_grayscale)
    fig.add_subplot(axes_1)

    # Worker Annotation Rectangles
    axes_2 = plt.subplot(grid_h[i,1])
    axes_2.axis('off')
    mask_worker = np.squeeze(accs_df.iloc[df_row]['y'] * 255).astype('uint8')
    mask_worker = Image.fromarray(mask_worker)
    axes_2.imshow(mask_worker, **args_grayscale)
    fig.add_subplot(axes_2)

    # Text Boxes
    axes_3 = plt.subplot(grid_h[i,2])
    axes_3.axis('off')
    text_boxes = np.squeeze(accs_df.iloc[df_row]['x2'] * 255).astype('uint8')
    text_boxes = Image.fromarray(text_boxes)
    axes_3.imshow(text_boxes, **args_grayscale)
    fig.add_subplot(axes_3)

    # Network Output
    axes_3 = plt.subplot(grid_h[i,3])
    axes_3.axis('off')
    prediction_im = accs_df.iloc[df_row]['prediction']
    prediction_im = prediction_im - prediction_im.min()
    prediction_im *= 255 / prediction_im.max()
    prediction_image = np.squeeze(prediction_im).astype('uint8')
    prediction_image_inv = np.squeeze(255 - prediction_im).astype('uint8')
    prediction_image_inv = Image.fromarray(prediction_image_inv)
    prediction_image = Image.fromarray(prediction_image)
    axes_3.imshow(prediction_image, **args_grayscale)
    fig.add_subplot(axes_3)

    # Network Output blended on Original Screenshot
    axes_4 = plt.subplot(grid_h[i,4])
    axes_4.axis('off')
    blended_image = Image.blend(original_image, prediction_image_inv, alpha=0.7) 
    axes_4.imshow(blended_image, **args_grayscale)
    fig.add_subplot(axes_4)

    # Binarized Mask with bounding boxes
    axes_5 = plt.subplot(grid_h[i,5])
    axes_5.axis('off')
    img_bb = mpimg.imread(accs_df.iloc[df_row]['mask_rect_path'])
    axes_5.imshow(img_bb)
    fig.add_subplot(axes_5)

  plt.savefig(fname=folder + "accuracy/" + pos + "-10-epoch-" + str(epoch).zfill(10), format='png', facecolor=fig.get_facecolor())
  plt.close(fig)
  plt.close()

def plot_rows (input_folder, folder, epoch, self, logs, steps_val, no_text_boxes, cross_val_fold):
    start = time.time()

    # Note: shuffle must be `False` in order for the filenames to be correct later
    shared_args = {
        "target_size": (self.input_size, self.input_size),
        "classes": ["cross-val-" + str(cross_val_fold)],
        "class_mode": None, 
        "batch_size": 1, 
        "color_mode": "grayscale",
        "shuffle": False
    }

    # Original Screenshots
    image_gen = ImageDataGenerator().flow_from_directory(
        input_folder + '/validation/screenshots', 
        **shared_args
        )

    # Text Boxes
    text_gen = ImageDataGenerator().flow_from_directory(
        input_folder + '/validation/text-boxes', 
        **shared_args
        )

    # Annotations
    genY  = ImageDataGenerator().flow_from_directory(
        input_folder + '/validation/annotation-boxes',
        **shared_args
        )

    accs = list()

#    for i in range(0, steps_val):
    for i in range(0, 11):
        x1 = np.divide(image_gen.next(),255)
        x2 = np.divide(text_gen.next(),255)

        if no_text_boxes:
            x = x1
        else:
            x = np.concatenate((x1,x2), axis=3)
            
        y = np.divide(genY.next(),255)
        
        # Metrics order: loss, acc, precision, recall, bal_acc

        metrics = self.model_for_saving.test_on_batch(x, y)
        pred = self.model_for_saving.predict(x)

        prediction_image = pred
        prediction_image = prediction_image - prediction_image.min()
        prediction_image *= 255 / prediction_image.max()
        prediction_image = np.squeeze(255 - prediction_image).astype('uint8')
        prediction_image = Image.fromarray(prediction_image)
        
        base = os.path.basename(image_gen.filenames[i])
        output_name = os.path.splitext(base)[0] + '-epoch-' + str(epoch) + '.png'
        output_path = folder + 'masks/' + output_name
        prediction_image.save(output_path)

        accs.append({
            "loss": metrics[0], 
            "acc": metrics[1],
            "precision": metrics[2],
            "recall": metrics[3],
            "bal_acc": metrics[4], 
            "x1":x1,"x2":x2,"y":y, 
            "prediction": pred, 
            "iou_per_gt": None, "iou_per_pr": None, 
            "filename": image_gen.filenames[i],
            "mask_rect_path": None
        })

    accs_df = pd.DataFrame(accs)

    # IOU calculation
    accs_df = iou_all(folder, epoch, accs_df)

    logs['mean_iou_gt'] = accs_df.loc[:,'iou_per_gt'].mean()
    logs['mean_iou_pr'] = accs_df.loc[:,'iou_per_pr'].mean()

    accs_export = accs_df.drop(['prediction','x1','x2','y', 'mask_rect_path'], axis=1)
    accs_export.to_csv (folder + 'history-csv/history-epoch-' + str(epoch) + '.csv', index = None, header=True) 

    # Highest acc:
    plot_row(folder, epoch, accs_df.sort_values('acc', ascending=False), 'highest')
    # Lowest acc:
    plot_row(folder, epoch, accs_df.sort_values('acc'), 'lowest')
    # Mid range acc:
    num_row_middle = int(accs_df.shape[0] / 2)
    plot_row(folder, epoch, accs_df.sort_values('acc').iloc[num_row_middle-5 : num_row_middle+5, ],'middle')
    # Fixed sample":
    np.random.seed(42)
    #plot_row(folder, epoch, accs_df.iloc[np.random.choice(range(0,steps_val),10).tolist()],'fixed')
    plot_row(folder, epoch, accs_df.iloc[np.random.choice(range(0,11),10).tolist()],'fixed')

    end = time.time()
    print(str(steps_val), " predictions took", str(end - start))