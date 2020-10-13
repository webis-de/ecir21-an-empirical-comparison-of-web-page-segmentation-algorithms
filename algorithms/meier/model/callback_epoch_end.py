######################################################################################
# Custom Callback to save a sample mask after each epoch
######################################################################################

import numpy as np
import keras
import matplotlib.pyplot as plt
import matplotlib.gridspec as gridspec
from PIL import Image

import time

import helper
import plot_ranking
import plot_all_kernels

class PlotStuff(keras.callbacks.Callback):

    def on_train_begin(self, logs={}):
      self.i = 0
      self.x = []
      self.losses = []
      self.val_losses = []
      self.acc = []
      self.val_acc = []
      self.fig = plt.figure()
      self.logs = [] 

    def __init__(self, model, folder, test_X, test_y, ids):
        self.model_for_saving = model
        self.folder = folder
        self.test_X = test_X
        self.test_y = test_y
        self.ids = ids

    def on_epoch_end(self, epoch, logs={}):
        # print(self.model_for_saving.layers)
        global plt

        # Single Plot
        # helper.plotSingle(np, plt, Image, self, epoch, self.folder, logs)

        # Combined Plot
        G = gridspec.GridSpec(12, 3)
        inner = gridspec.GridSpecFromSubplotSpec(4,8, subplot_spec=G[5:8, :], wspace=0.01, hspace=0.05)
        # plt = helper.plotCombined(Image, plt, G, self, epoch, inner, np, self.folder, self.test_X)

        # Plot all Kernels
        plot_all_kernels.plot_kernels(plt, self, epoch)


        # Find best and worst accuracy
        # opti = keras.optimizers.Adam()
        # self.model_for_saving.compile(opti, loss='mean_squared_error', metrics=['acc']) # adam, adamax

        # accs = []
        # for i in range(len(self.test_X)):
        #   acc = self.model_for_saving.test_on_batch(
        #     np.expand_dims(self.test_X[i,...],axis=0), # loss 
        #     np.expand_dims(self.test_y[i,...],axis=0)  # accuracy
        #   )
        #   accs.append((self.ids[i]['id_url'], self.ids[i]['id_assignment'], i, acc[1]))
        # accs.sort(key=lambda tup: tup[3])

        # # Save List of accuracies
        # with open(self.folder + 'accuracy/ranking-epoch-'+str(epoch).zfill(10) +'.txt', 'w') as fp:
        #     fp.write('\n'.join('%s %s %s %s' % x for x in accs))
            
        # grid_h = gridspec.GridSpec(10, 4, wspace=0.01, hspace=0.05)
        
        # plot_ranking.plot_rows(epoch, "highest", gridspec, plt, self.folder, self.model, Image, self.test_X, self.test_y, accs, np)
        # plot_ranking.plot_rows(epoch, "lowest", gridspec, plt, self.folder, self.model, Image, self.test_X, self.test_y, accs, np)

        
