######################################################################################
# Model meier2017
######################################################################################

#import keras
#from keras.models import Sequential, Model
from keras.layers import Add, Activation, Conv2D, Convolution2D, Conv2DTranspose, Dense, Dropout, Flatten, Input, MaxPooling2D, BatchNormalization, UpSampling2D
#from keras.callbacks import ModelCheckpoint
from keras.optimizers import SGD
from keras.preprocessing import image
from keras import regularizers

def model(l2_lambda, input_size, no_text_boxes):


  # Multimodal input (screenshots and text boxes)?
  if no_text_boxes:
    input_num = 1
  else:
    input_num = 2

#  input = Input(shape=(256, 768, input_num)) # die 1 am ende weg!?
  input = Input(shape=(768, 256, input_num)) # rows, cols, input_num?

# ===========================================================================================
  dropout1 = Dropout(0.3, input_shape=(256, 768, input_num))(input)                          # Step 1
  conv1_1 = Conv2D(filters=32, kernel_size=(5,5), strides=(1,1), padding="same", activation="relu",
                   kernel_regularizer=regularizers.l2(l2_lambda))(dropout1)
  norm1_1 = BatchNormalization()(conv1_1)
  conv1_2 = Conv2D(filters=16, kernel_size=(3,3), strides=(1,1), padding="same", activation="relu",
                   kernel_regularizer=regularizers.l2(l2_lambda))(norm1_1)
  
  norm1_2 = BatchNormalization()(conv1_2)
# ===========================================================================================
  pool1 = MaxPooling2D(pool_size=(2,2), strides=(2,2), padding="valid")(norm1_2)     # Step 2

  dropout2 = Dropout(0.3)(pool1)                                                     
  conv2_1 = Conv2D(filters=16, kernel_size=(5,5), strides=(1,1), padding="same", activation="relu",
                   kernel_regularizer=regularizers.l2(l2_lambda))(dropout2)
  norm2_1 = BatchNormalization()(conv2_1)
  conv2_2 = Conv2D(filters=16, kernel_size=(3,3), strides=(1,1), padding="same", activation="relu",
                   kernel_regularizer=regularizers.l2(l2_lambda))(norm2_1)
  norm2_2 = BatchNormalization()(conv2_2)
# ===========================================================================================  
  pool2 = MaxPooling2D(pool_size=(2,2), strides=(2,2), padding="valid")(norm2_2)     # Step 3

  dropout3 = Dropout(0.5)(pool2)                                                     
  conv3_1 = Conv2D(filters=16, kernel_size=(3,3), strides=(1,1), padding="same", activation="relu",
                   kernel_regularizer=regularizers.l2(l2_lambda))(dropout3)
  norm3_1 = BatchNormalization()(conv3_1)
  conv3_2 = Conv2D(filters=16, kernel_size=(3,3), strides=(1,1), padding="same", activation="relu",
                   kernel_regularizer=regularizers.l2(l2_lambda))(norm3_1)
  norm3_2 = BatchNormalization()(conv3_2)
# ===========================================================================================  
  pool3 = MaxPooling2D(pool_size=(2,2), strides=(2,2), padding="valid")(norm3_2)     # Step 4

  dropout4 = Dropout(0.5)(pool3)                                                     
  conv4_1 = Conv2D(filters=64, kernel_size=(3,3), strides=(1,1), padding="same", activation="relu",
                   kernel_regularizer=regularizers.l2(l2_lambda))(dropout4)
  norm4_1 = BatchNormalization()(conv4_1)
  conv4_2 = Conv2D(filters=64, kernel_size=(3,3), strides=(1,1), padding="same", activation="relu",
                   kernel_regularizer=regularizers.l2(l2_lambda))(norm4_1)
  norm4_2 = BatchNormalization()(conv4_2)
# ===========================================================================================
  pool4 = MaxPooling2D(pool_size=(2,2), strides=(2,2), padding="valid")(norm4_2)     # Step 5
     
  dropout5 = Dropout(0.5)(pool4)                                                     
  conv5_1 = Conv2D(filters=64, kernel_size=(3,3), strides=(1,1), padding="same", activation="relu",
                   kernel_regularizer=regularizers.l2(l2_lambda))(dropout5)
  norm5_1 = BatchNormalization()(conv5_1)
  conv5_2 = Conv2D(filters=128, kernel_size=(3,3), strides=(1,1), padding="same", activation="relu",
                   kernel_regularizer=regularizers.l2(l2_lambda))(norm5_1)
  norm5_2 = BatchNormalization()(conv5_2)
# ===========================================================================================  
  pool5 = MaxPooling2D(pool_size=(2,2), strides=(2,2), padding="valid")(norm5_2)     # Step 6
     
  dropout6 = Dropout(0.3)(pool5)                                                     
  conv6_1 = Conv2D(filters=128, kernel_size=(3,3), strides=(1,1), padding="same", activation="relu",
                   kernel_regularizer=regularizers.l2(l2_lambda))(dropout6)
  norm6_1 = BatchNormalization()(conv6_1)
  conv6_2 = Conv2D(filters=256, kernel_size=(3,3), strides=(1,1), padding="same", activation="relu",
                   kernel_regularizer=regularizers.l2(l2_lambda))(norm6_1)
  norm6_2 = BatchNormalization()(conv6_2)
# =========================================================================================== 
  pool6 = MaxPooling2D(pool_size=(2,2), strides=(2,2), padding="valid")(norm6_2)     # Step 7

  dropout7 = Dropout(0.3)(pool6)                                                     
  conv7_1 = Conv2D(filters=256, kernel_size=(3,3), strides=(1,1), padding="same", activation="relu",
                   kernel_regularizer=regularizers.l2(l2_lambda))(dropout7)
  norm7_1 = BatchNormalization()(conv7_1)
# =========================================================================================== 
  t_conv8_1 = Conv2DTranspose(filters=128, kernel_size=(2,2),strides=(2,2), activation="relu",
                              kernel_regularizer=regularizers.l2(l2_lambda))(norm7_1) # Step 8
#norm8_1 = BatchNormalization()(t_conv8_1) # WRONG!
  # add layers perform element-wise addition of their input and the given layer `p`
  add8 = Add()([pool5, t_conv8_1])
# =========================================================================================== 
  t_conv9_1 = Conv2DTranspose(filters=64, kernel_size=(2,2),strides=(2,2), activation="relu",
                              kernel_regularizer=regularizers.l2(l2_lambda))(add8)     # Step 9
# norm9_1 = BatchNormalization()(t_conv9_1)
# =========================================================================================== 
  add9 = Add()([pool4,t_conv9_1])

  t_conv10_1 = Conv2DTranspose(filters=16, kernel_size=(2,2),strides=(2,2), activation="relu",
                               kernel_regularizer=regularizers.l2(l2_lambda))(add9)    # Step 10
#  norm10_1 = BatchNormalization()(t_conv10_1)
# =========================================================================================== 
  add10 = Add()([pool3,t_conv10_1])
                                                                                       # Step 11
  t_conv11_1 = Conv2DTranspose(filters=16, kernel_size=(4,4), strides=(4,4), padding="same",
                               kernel_regularizer=regularizers.l2(l2_lambda))(add10)
#  norm11_1 = BatchNormalization()(t_conv11_1)
                                                                                       # Step 12
  conv12_1 = Conv2D(filters=32, kernel_size=(5,5), strides=(1,1), padding="same", activation="relu",
                    kernel_regularizer=regularizers.l2(l2_lambda))(t_conv11_1)

  norm12_1 = BatchNormalization()(conv12_1)
  conv12_2 = Conv2D(filters=32, kernel_size=(5,5), strides=(1,1), padding="same", activation="relu",
                    kernel_regularizer=regularizers.l2(l2_lambda))(norm12_1)
  norm12_2 = BatchNormalization()(conv12_2)
  conv12_3_s = Conv2D(filters=8, kernel_size=(1,1), strides=(1,1), padding="same", activation="sigmoid",
                      kernel_regularizer=regularizers.l2(l2_lambda))(norm12_2)
# ===========================================================================================                       
  # norm12_3 = BatchNormalization()(conv12_3_s) # WRONG!
  dropout12 = Dropout(0.3)(conv12_3_s)
  conv12_4 = Conv2D(filters=32, kernel_size=(5,5), strides=(1,1), padding="same", activation="relu",
                    kernel_regularizer=regularizers.l2(l2_lambda))(dropout12)
  norm12_4 = BatchNormalization()(conv12_4)
  conv12_5 = Conv2D(filters=16, kernel_size=(3,3), strides=(1,1), padding="same", activation="relu",
                    kernel_regularizer=regularizers.l2(l2_lambda))(norm12_4)
  norm12_5 = BatchNormalization()(conv12_5)

                                                                                      # Step 13
  conv13_1_s = Conv2D(filters=1, kernel_size=(1,1), strides=(1,1), padding="same", activation="sigmoid")(norm12_5)
  #norm13_1 = BatchNormalization()(conv13_1_s) # WRONG!
# ===========================================================================================                       

  upscale13 = UpSampling2D(size=(2,2), interpolation='bilinear')(conv13_1_s)
  
  return input, upscale13
