import os

def create(folder):

  if not os.path.exists(folder):
    os.makedirs(folder)

  if not os.path.exists(folder + 'masks'):
    os.makedirs(folder + 'masks')

  if not os.path.exists(folder + 'masks-rectangles'):
    os.makedirs(folder + 'masks-rectangles')

  if not os.path.exists(folder + 'masks-rectangles-temp'):
    os.makedirs(folder + 'masks-rectangles-temp')

  if not os.path.exists(folder + 'metrics-per-epoch'):
    os.makedirs(folder + 'metrics-per-epoch')
      
  if not os.path.exists(folder + 'filters'):
      os.makedirs(folder + 'filters')

  if not os.path.exists(folder + 'history'):
      os.makedirs(folder + 'history')

  if not os.path.exists(folder + 'history-iou'):
    os.makedirs(folder + 'history-iou')

  if not os.path.exists(folder + 'history-csv'):
    os.makedirs(folder + 'history-csv')

  if not os.path.exists(folder + 'combined-plot'):
      os.makedirs(folder + 'combined-plot')
      
  if not os.path.exists(folder + 'accuracy'):
      os.makedirs(folder + 'accuracy')

  if not os.path.exists(folder + 'weights'):
      os.makedirs(folder + 'weights')


