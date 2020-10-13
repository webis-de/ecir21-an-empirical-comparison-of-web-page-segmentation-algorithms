# import plotnine
import numpy as np
import matplotlib.gridspec as gridspec

def plot_layer(plt, f, G, weights, pos, pos_to):

  rows = len(weights[0])                 #  5
  cols = len(weights[0][0])              #  5
  channels = len(weights[0][0][0])       #  1
  filters = len(weights[0][0][0][0])     # 32

  if filters == 16:
      row_length = 8 
      inner = gridspec.GridSpecFromSubplotSpec(int(filters/row_length),row_length, subplot_spec=G[pos, 0], wspace=0.01, hspace=0.05)
  elif filters == 32:
      row_length = 16 
      inner = gridspec.GridSpecFromSubplotSpec(int(filters/row_length),row_length, subplot_spec=G[pos, 0], wspace=0.01, hspace=0.05)
  elif filters == 64:
      row_length = 16
      inner = gridspec.GridSpecFromSubplotSpec(int(filters/row_length),row_length, subplot_spec=G[pos:pos_to, 0], wspace=0.01, hspace=0.05)


  # sub = plt.figure(figsize =(int(filters/8),8))

  for filter in range(filters):
    exampleFilter = np.zeros((rows,cols))
    for row in range(rows):
      for col in range(cols):
          exampleFilter[row, col] = weights[0][row][col][0][filter]
    # TODO: Normalize filter because it has no bounds and we want an gray-scale image 
    exampleFilter = (exampleFilter + 1) * 0.5 * 255

    sub_ax = plt.Subplot(f, inner[filter // row_length, filter % row_length])
    # sub_ax.set_title('test')
    f.add_subplot(sub_ax)
    plt.xticks(())
    plt.yticks(())
    plt.imshow(exampleFilter, vmin = 0, vmax = 255)

def plot_kernels(plt, self, epoch):

  # (plotnine.ggplot(self.model.model_for_saving) 
  #     + aes(layers[2].get_weights()
  # )
  plt.gray()
  f = plt.figure()
  G = gridspec.GridSpec(10,1, figure=f)

  # First Kernels
  axis_1 = plt.subplot(G[0,0])
  axis_1.set_title('test', fontdict={'fontsize': 8})
  axis_1.axis('off')
  plot_layer(plt, f, G, self.model_for_saving.layers[2].get_weights(), 0, -1)
  plot_layer(plt, f, G, self.model_for_saving.layers[4].get_weights(), 1, -1)

  plot_layer(plt, f, G, self.model_for_saving.layers[8].get_weights(), 2, -1)
  plot_layer(plt, f, G, self.model_for_saving.layers[10].get_weights(), 3, -1)

  plot_layer(plt, f, G, self.model_for_saving.layers[14].get_weights(), 4, -1)
  plot_layer(plt, f, G, self.model_for_saving.layers[16].get_weights(), 5, -1)

  plot_layer(plt, f, G, self.model_for_saving.layers[20].get_weights(), 6, 8)
  plot_layer(plt, f, G, self.model_for_saving.layers[22].get_weights(), 8, 10)

  plt.tight_layout()
  plt.savefig(self.folder + 'all-kernels/all-kernels-' + str(epoch).zfill(8) +'.png')
  plt.close(f)
  plt.close()
