######################################################################################
# Plot the n best or worst outputs 
######################################################################################

def plot_rows (epoch, pos, gridspec, plt, folder, model, Image, test_X, test_y, accs, np):
    grid_h = gridspec.GridSpec(10, 4, wspace=0.01, hspace=0.05)

    for i in range(1,11):

        if pos == "highest":
            j = -i
        elif pos == "lowest":
            j = i

        # Worker Annotation Rectangles
        axes_1 = plt.subplot(grid_h[i-1,0])
        axes_1.axis('off')
        mask_worker = np.squeeze(test_y[accs[j][2]] * 255).astype('uint8')
        mask_worker = Image.fromarray(mask_worker)
        axes_1.imshow(mask_worker)

        # Original Screenshot
        axes_2 = plt.subplot(grid_h[i-1,1])
        axes_2.axis('off')
        original_image = np.squeeze(test_X[accs[j][2]] * 255).astype('uint8')
        original_image = Image.fromarray(original_image)
        plt.imshow(original_image)
        
        # Network Output
        axes_3 = plt.subplot(grid_h[i-1,2])
        axes_3.axis('off')
        # TODO: normalize over all masks instead of per mask
        # TODO: color bar
        prediction = model.predict(np.expand_dims(test_X[accs[j][2]], 0))
        prediction[0] = prediction[0] - prediction[0].min()
        prediction[0] *= 255 / prediction[0].max()
        prediction_image = np.squeeze(prediction[0].astype('uint8'))
        prediction_image = Image.fromarray(prediction_image)
        axes_3.imshow(prediction_image)

        # Network Output blended on Original Screenshot
        axes_4 = plt.subplot(grid_h[i-1,3])
        axes_4.axis('off')
        blended_image = Image.blend(original_image, prediction_image, alpha=0.7) 
        axes_4.imshow(blended_image)
    
    #plt.tight_layout()
    plt.savefig(folder + "accuracy/" + pos + "-10-epoch-" + str(epoch).zfill(10) + ".png")
    plt.close()