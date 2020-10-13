import numpy as np
from PIL import Image
from plotnine import *
import pandas as pd

######################################################################################
# Filters
######################################################################################

def filter_no_rect(screens, rects, ids):

  to_remove = []

  for i in range(rects.shape[0]):
    if not 1 in rects[i]:
      to_remove.append(i)

  keep_screens = np.delete(screens, to_remove, 0)
  keep_rects = np.delete(rects ,to_remove, 0)
  keep_ids = np.delete(ids, to_remove, 0)

  return keep_screens, keep_rects, keep_ids
  

def filter_complete_rect(screens, rects, ids):

  to_remove = []
  for i in range(rects.shape[0]):
    not_zero = np.count_nonzero(rects[i] == 1)
    if not_zero == 256 * 256:
      to_remove.append(i)

  keep_screens = np.delete(screens, to_remove, 0)
  keep_rects = np.delete(rects ,to_remove, 0)
  keep_ids = np.delete(ids, to_remove, 0)

  return keep_screens, keep_rects, keep_ids

def coverage_ranking(screens, rects, ids):

  print(screens.shape)
  print(rects.shape)
  print(len(ids))

  coverages = []
  coverage_sum = 0
  bigger_95 = []
  
  for i in range(rects.shape[0]):
    not_zero = np.count_nonzero(rects[i] == 1) / (256 * 256) * 100
    if not_zero >= 95:
      image = Image.fromarray(np.squeeze(rects[i] * 255).astype('uint8') )
      image.save('test-bigger-95/' + str(i).zfill(10) + '-mask.png')

    if not_zero >= 99:
      np.savetxt('test-rects-txt/'+str(i).zfill(10) + '.txt', np.squeeze(rects[i]))
    coverage_sum += not_zero
    coverages.append(not_zero)

  coverages.sort()
  coverage_sum /= len(rects)

  return coverages, coverage_sum

######################################################################################
# Single Plot
######################################################################################

def plotSingle(np, plt, Image, self, epoch, folder, logs):

  # Filters
  layer_num = 2
  
  rows = len(self.model_for_saving.layers[layer_num].get_weights()[0])                 #  5
  cols = len(self.model_for_saving.layers[layer_num].get_weights()[0][0])              #  5
  channels = len(self.model_for_saving.layers[layer_num].get_weights()[0][0][0])       #  1
  filters = len(self.model_for_saving.layers[layer_num].get_weights()[0][0][0][0])     # 32
  
  fig = plt.figure()
  fig.suptitle('Filters of 1st Conv2D Layer', fontsize=20)

  for filter in range(filters):
    exampleFilter = np.zeros((rows,cols))
    for row in range(rows):
      for col in range(cols):
          exampleFilter[row, col] = self.model_for_saving.layers[layer_num].get_weights()[0][row][col][0][filter]
    
    exampleFilter = exampleFilter - exampleFilter.min()
    exampleFilter *= 255 / exampleFilter.max()

    #if filter == 0:
    #  np.savetxt(folder + 'filters-txt/filter-epoch-' + str(epoch).zfill(8) +'-1.txt', exampleFilter.astype(int))
    #if filter == 2:
    #  np.savetxt(folder + 'filters-txt/filter-epoch-' + str(epoch).zfill(8) +'-3.txt', exampleFilter.astype(int))
    #if filter == 4:
    #  np.savetxt(folder + 'filters-txt/filter-epoch-' + str(epoch).zfill(8) +'-5.txt', exampleFilter.astype(int))
    plt.subplot(4,8,filter+1)
    plt.rcParams["image.cmap"] = "Greys"
    plt.imshow(exampleFilter, vmin = 0, vmax = 255)
    plt.grid(False)
    frame1 = plt.gca()
    frame1.axes.get_xaxis().set_visible(False)
    frame1.axes.get_yaxis().set_visible(False)

  plt.savefig(folder + 'filters/filters-epoch' + str(epoch).zfill(8) +'.png')
  plt.close(fig)
  plt.close()

  # History
  plt.clf()
  self.logs.append(logs)
  self.x.append(self.i)
  self.losses.append(logs.get('loss'))
  self.val_losses.append(logs.get('val_loss'))
  self.acc.append(logs.get('acc'))
  self.val_acc.append(logs.get('val_acc'))

  self.precision.append(logs.get('precision'))
  self.val_precision.append(logs.get('val_precision'))
  self.recall.append(logs.get('recall'))
  self.val_recall.append(logs.get('val_recall'))

  self.bal_acc.append(logs.get('bal_acc'))
  self.val_bal_acc.append(logs.get('val_bal_acc'))
  self.mean_iou_gt.append(logs.get('mean_iou_gt'))
  self.mean_iou_pr.append(logs.get('mean_iou_pr'))

  self.iou.append(logs.get('iou'))
  self.val_iou.append(logs.get('val_iou'))


  self.i += 1

  print(logs)

  f, (ax1, ax2) = plt.subplots(1, 2, sharex=True, figsize=(15, 5))
  
  ax1.set_yscale('log')
  ax1.plot(self.x, self.losses, label="loss")
  ax1.plot(self.x, self.val_losses, label="val_loss")
  ax1.legend()
  
  ax2.plot(self.x, self.acc, label="accuracy")
  ax2.plot(self.x, self.val_acc, label="validation accuracy")
  ax2.legend()
  
  plt.savefig(folder + 'history/history-epoch-' + str(epoch).zfill(8) +'.png')
  plt.close(fig)
  plt.close()

  df = {
    'x': self.x,
    'precision': self.precision,
    'val_precision': self.val_precision,
    'recall': self.recall,
    'val_recall': self.val_recall,
    'acc': self.acc,
    'val_acc': self.val_acc,
    'bal_acc': self.bal_acc,
    'val_bal_acc': self.val_bal_acc,
    'mean_iou_gt': self.mean_iou_gt,
    'mean_iou_pr': self.mean_iou_pr,
    'iou': self.iou,
    'val_iou': self.val_iou
    #'loss': self.losses
    }

  d1 = pd.DataFrame(data=df)
  d = d1.melt(id_vars=['x'], value_vars=['acc', 'val_acc', 'bal_acc', 'val_bal_acc'], var_name='epoch', value_name='metric')

  p = (ggplot(d)
  + aes(x='x', y='metric',group='epoch',color='epoch')
  + scale_x_continuous(breaks=range(0,len(d1.loc[:,'x'])))
  + labs(color = "Metric Name")
  + xlab("Epoch")
  + ylab("Value")
  + geom_line(size=1)
  + theme_bw() 
  + theme(
    #panel_border = element_blank(), 
    panel_grid_major = element_blank(),
    panel_grid_minor = element_blank()
    #axis_line = element_line(colour = "black")
  )

 )
  p.save(filename=folder + 'history/history-accs-epoch-' + str(epoch).zfill(8) + '.png', verbose=False)

  # PRECISION AND RECALL

  d = pd.DataFrame(data=df)
  d = d.melt(id_vars=['x'], value_vars=['precision', 'val_precision', 'recall', 'val_recall'], var_name='epoch', value_name='metric')

  p = (ggplot(d)
  + aes(x='x', y='metric',group='epoch',color='epoch')
  + geom_line()
  #+ geom_hline(yintercept=0.4, linetype="dashed", color = "red")
  #+ geom_hline(yintercept=0.25, linetype="dashed", color = "cyan")
  + theme_bw() 
  + theme(
    panel_grid_major = element_blank(),
    panel_grid_minor = element_blank()
  )
 )
  p.save(filename=folder + 'history/history-prre-epoch-' + str(epoch).zfill(8) + '.png', verbose=False)


  # IOU

  d = pd.DataFrame(data=df)
  d = d.melt(id_vars=['x'], value_vars=['mean_iou_gt', 'mean_iou_pr'], var_name='epoch', value_name='metric')

  p = (ggplot(d)
  + aes(x='x', y='metric',group='epoch',color='epoch')
  + geom_line()
  #+ geom_hline(yintercept=0.4, linetype="dashed", color = "red")
  #+ geom_hline(yintercept=0.25, linetype="dashed", color = "cyan")
  + theme_bw() 
  + theme(
    panel_grid_major = element_blank(),
    panel_grid_minor = element_blank()
  )
 )
  p.save(filename=folder + 'history-iou/history-epoch-' + str(epoch).zfill(8) + '.png', verbose=False)


  # Write to csv
  d = pd.DataFrame(data=df)
  d.to_csv(folder + 'metrics-per-epoch/epoch-'+ str(epoch).zfill(8) + '.csv', index=False)



######################################################################################
# Combined Plot
######################################################################################

def plotCombined(Image, plt, G, self, epoch, inner, np, folder, test_X):
  # Mask
  num = 1109
  image = test_X[num]
  image = np.expand_dims(image, 0)
  image_plot = Image.fromarray(np.squeeze(test_X[num] * 255).astype('uint8') )
  
  pred_test = self.model.predict(image)

  mask = pred_test[0] -pred_test[0].min()
  mask *= 255 / mask.max()
  mask = np.squeeze(mask.astype('uint8'))
  
  # End to End Output
  np.savetxt(folder + 'output-txt/output-epoch-' + str(epoch).zfill(8) +'.txt', np.squeeze(pred_test[0]))
  im_mask = Image.fromarray(mask)
  im_mask.save(folder + 'masks/mask-epoch-' + str(epoch).zfill(8) + '.png')

  multi_fig = plt.figure(figsize=(6, 10)) # TODO: move down (?)
  axes_1 = plt.subplot(G[:2, 0])
  plt.imshow(image_plot, cmap="Greys", interpolation='nearest')
  axes_2 = plt.subplot(G[:2, 1])
  plt.imshow(im_mask)
  axes_3 = plt.subplot(G[:2, 2])
  blended = Image.blend(image_plot, im_mask, alpha=0.7)
  plt.imshow(blended)

  axes_4 = plt.subplot(G[2:5, :])
  axes_4.set_title("Accuracy History")
  axes_4.plot(self.x, self.val_acc, label="validation accuracy")
  axes_4.plot(self.x, self.acc, label="training accuracy")
  axes_5 = plt.subplot(G[5:8, :])
  axes_5.set_title("Filter visualization of Conv2D Layer 1_1")
  axes_5.axis('off')
  axes_5.text(0.0,-0.1, "Epoch: " + str(epoch), size=12, transform=axes_5.transAxes)

  axes_6 = plt.subplot(G[8:10, :])

  # Filters of Conv2D Layer 6_2
  # TODO:
  weights_12_5 = self.model_for_saving.layers[60].get_weights()
  means = np.zeros(16) 
  stds = np.zeros(16)
  np_weights_12_5 = np.array(weights_12_5[0])
  print(np_weights_12_5.shape)
  for filter in range(len(weights_12_5[0][0][0][0])):
    #print(np_weights_12_5[...,filter])
    means[filter] = np.mean(np_weights_12_5[...,filter].flatten())
    stds[filter] = np.std(np_weights_12_5[...,filter].flatten())
  #print(means)
  #print(stds)
  y = means
  x = range(16)
  e = stds 

  axes_6.errorbar(x, y, e, linestyle='None', marker='^')
  axes_6.set_title("Filters of Conv2D Layer 6_2")

  # Filters 1st Conv2D Layer
  layer_num = 2
  
  rows = len(self.model_for_saving.layers[layer_num].get_weights()[0])                 #  5
  cols = len(self.model_for_saving.layers[layer_num].get_weights()[0][0])              #  5
  channels = len(self.model_for_saving.layers[layer_num].get_weights()[0][0][0])       #  1
  filters = len(self.model_for_saving.layers[layer_num].get_weights()[0][0][0][0])     # 32

  for filter in range(filters):
    exampleFilter = np.zeros((rows,cols))
    for row in range(rows):
      for col in range(cols):
          exampleFilter[row, col] = self.model_for_saving.layers[layer_num].get_weights()[0][row][col][0][filter]
    # TODO: Normalize filter because it has no bounds and we want an gray-scale image 
    exampleFilter = (exampleFilter + 1) * 0.5 * 255

    # Distribute Subplots on rows of length 8
    ax = plt.Subplot(multi_fig, inner[filter // 8, filter % 8])
    multi_fig.add_subplot(ax)
    plt.xticks(())
    plt.yticks(())
    plt.imshow(exampleFilter, vmin = 0, vmax = 255)

  plt.tight_layout()
  plt.savefig(folder + 'combined-plot/combined-plot-' + str(epoch).zfill(8) +'.png')
  plt.close(multi_fig)
  plt.close()
  return plt


def plot_history(model, dest_folder):
    
    # summarize history for accuracy
    plt.subplot(121)
    plt.plot(history['acc'])
    plt.plot(history['val_acc'])
    plt.title('model accuracy')
    plt.ylabel('accuracy')
    plt.xlabel('epoch')
    plt.legend(['train', 'test'], loc='best')
    
    # summarize history for loss
    plt.subplot(122)
    plt.plot(history['loss'])
    plt.plot(history['val_loss'])
    plt.title('model loss')
    plt.ylabel('loss')
    plt.xlabel('epoch')
    plt.legend(['train', 'test'], loc='best')
    plt.show()
    plt.savefig(dest_folder + 'history-epoch-' + str(epoch).zfill(8) +'.png')
    plt.close(multi_fig)
    plt.close()


