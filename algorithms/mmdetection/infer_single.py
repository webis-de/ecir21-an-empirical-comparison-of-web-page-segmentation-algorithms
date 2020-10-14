from mmdet.apis import init_detector, inference_detector, show_result
import pycocotools.mask as maskUtils
import numpy as np
import mmcv
import sys
import os
import json
from threading import Thread, Lock

def get_segm_left(mask):
    return mask.any(0).argmax()

def get_segm_right(mask):
    return mask.shape[1] - np.fliplr(mask).any(0).argmax()

def get_segm_top(mask):
    return mask.any(1).argmax()

def get_segm_bottom(mask):
    return mask.shape[0] - np.flipud(mask).any(1).argmax()

def get_segm_bounds(mask):
    left = get_segm_left(mask)
    right = get_segm_right(mask)
    top = get_segm_top(mask)
    bottom = get_segm_bottom(mask)
    if left is not None and right is not None and top is not None and bottom is not None:
        return left, right, top, bottom
    else:
        raise ValueError('Could not determine bounds for segment')

lock = Lock()

def infer(model, imgfile, id):
    outfile = open("/out/" + id + ".json", 'w')
    img = mmcv.imread(imgfile)
    
    lock.acquire()
    result = inference_detector(model, img)
    lock.release()

    if isinstance(result, tuple):
        bbox_result, segm_result = result
    else:
        bbox_result, segm_result = result, None

    bboxes = np.vstack(bbox_result)
    segm_polygon_list = []
    bbox_polygon_list = []

    if segm_result is not None:
        segms = mmcv.concat_list(segm_result)
        inds = np.where(bboxes[:, -1] > 0.0)[0]
        for i in inds:
            mask = maskUtils.decode(segms[i]).astype(np.bool)
            try:
                left, right, top, bottom = get_segm_bounds(mask)

                if left is not None and right is not None and top is not None and bottom is not None:
                    segm_polygon_list.append([[[[left.item(), top.item()], [left.item(), bottom.item()], [right.item(), bottom.item()], [right.item(), top.item()], [left.item(), top.item()]]]])
            except ValueError:
                print()

    for bbox in bboxes:
        bbox_int = bbox.astype(np.int32)
        left = bbox_int[0]
        top = bbox_int[1]
        right = bbox_int[2]
        bottom = bbox_int[3]

        bbox_polygon_list.append([[[[left.item(), top.item()], [left.item(), bottom.item()], [right.item(), bottom.item()], [right.item(), top.item()], [left.item(), top.item()]]]])

    out_obj = dict(height=img.shape[0], width=img.shape[1], id=id, segmentations=dict(mmdetection_bboxes=bbox_polygon_list, mmdetection_segms=segm_polygon_list))
    json.dump(out_obj, outfile)
    

if len(sys.argv) != 2:
    print("Invalid number of arguments.")
    print("Usage: python3 " + sys.argv[0] + " <id>")
    sys.exit(1)

# directory = os.fsencode(sys.argv[1])
config_file = '/mmdetection/configs/htc/htc_dconv_c3-c5_mstrain_400_1400_x101_64x4d_fpn_20e.py'
checkpoint_file = '/resources/checkpoints/htc_dconv_c3-c5_mstrain_400_1400_x101_64x4d_fpn_20e_20190408-0e50669c.pth'
model = init_detector(config_file, checkpoint_file, device='cuda:0')

id = sys.argv[1]
imgfile = os.path.join("/pages", id, "screenshot.png")
infer(model, imgfile, id)

# i = 0
# files_ids = []
# for f in os.listdir(directory):
#     filename = os.fsdecode(f)
#     if filename.endswith(".png"):
#         id = os.path.splitext(filename)[0]
#         files_ids.append((os.path.join(directory, f), id))
#         i += 1;
# 
#     if i == 8:
#         threads = []
#         for j in range(i):
#             print("Inferring for page " + str(files_ids[j][1]) + ", file " + str(files_ids[j][0].decode("utf-8")))
#             t = Thread(target=infer, args=(model, files_ids[j][0].decode("utf-8"), files_ids[j][1]))
#             threads += [t]
#             t.start()
# 
#         for thread in threads:
#             thread.join()
# 
#         i = 0
#         files_ids = []
