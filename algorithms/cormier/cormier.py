import random
import math
import numpy as np
from scipy.stats import norm
from scipy.ndimage import convolve

import cv2

import sys
import json

import argparse

# Label line directions
horiz = 0
vert = 1
dir_h = 0
dir_v = 1
# Define Sobel filters
v_filter = np.multiply(np.array([[1], [2], [1]]), np.array([[-1, 0, 1]]))
h_filter = np.transpose(v_filter)
# Set parameters
min_l = 15 # Minimum size of a region; also half-window width
threshold = 0.5 # Threshold probability to accept a line as semantically significant
prior = 0.01 # Prior probability that a given pixel is an edge
line_length = 256 # Maximum line segment length for recursion
mcs_rp = 100 # Trials for Monte Carlo simulation (lower than original papers, but seems to work fine)
mcs_prob = 0.3 # Minimum proportion of locally significant edges in Monte Carlo trials

# Class representing an edge (used for data storage)
class Edge:
    # Edge constructor
    def __init__(self, start_row, start_col, end_row, end_col):
        if start_row == end_row and start_col == end_col:
            raise ValueError("found pixel edge at", start_row, start_col)
        if start_row != end_row and start_col != end_col:
            raise ValueError("found diagonal edge from", start_row, start_col, "to", end_row, end_col)
        if start_row == end_row:
            self.direction = horiz
            self.start_row = start_row
            self.start_col = min(start_col, end_col)
            self.length = max(start_col, end_col) - self.start_col + 1
        else:
            self.direction = vert
            self.start_col = start_col
            self.start_row = min(start_row, end_row)
            self.length = max(start_row, end_row) - self.start_row + 1
    # Utility function to produce a list of pixel coordinates
    def to_pixels(self):
        pixels = []
        if self.direction == horiz:
            for cur_col in range(self.start_col, self.start_col + self.length):
                pixels.append([self.start_row, cur_col])
        else:
            for cur_row in range(self.start_row, self.start_row + self.length):
                pixels.append([cur_row, self.start_col])
        return pixels

# Class representing a node in a segmentation tree
class SegmentNode:
    def __init__(self, t, b, l, r):
        self.t = t
        self.b = b
        self.l = l
        self.r = r
        self.children = []

    def to_list(self):
        result = [[self.t, self.b, self.l, self.r]]
        for child in self.children:
            result.extend(child.to_list())
        return result


# Function for converting to greyscale by summing all channels
def to_grayscale(img):
    return np.sum(img[:, :, :3], axis=2, dtype='float')

# Perform convolution with Sobel filters and determine the probability that
# each edge is locally significant
def sobel(img):
    bw_img = to_grayscale(img)
    h = convolve(bw_img, h_filter)
    v = convolve(bw_img, v_filter)
    h, v = cdf(h, v)
    print(np.histogram(h, bins=20))
    return h, v

# Calculate CDF of gradient magnitudes
def cdf(h, v):
    h, v = np.abs(np.array(h, dtype='float')), np.abs(np.array(v, dtype='float'))
    res_h, res_v = np.ones_like(h, dtype='float'), np.ones_like(v, dtype='float')
    nrows, ncols = len(h), len(v[0])
    for i in range(0, nrows):
        print("cdf row", i)
        for j in range(0, ncols):
            bound_t = max(0, i - min_l)
            bound_b = min(ncols, i + min_l + 1)
            bound_l = max(0, j - min_l)
            bound_r = min(nrows, j + min_l + 1)
            local_t = h[bound_t:i, bound_l:bound_r]
            local_b = h[i+1:bound_b, bound_l:bound_r]
            local_l = v[bound_t:bound_b, bound_l:j]
            local_r = v[bound_t:bound_b, j+1:bound_r]
            flat_t, flat_b = local_t.flatten(), local_b.flatten()
            flat_l, flat_r = local_l.flatten(), local_r.flatten()
            count_t, count_b = float(len(flat_t) + 2), float(len(flat_b) + 2)
            count_l, count_r = float(len(flat_l) + 2), float(len(flat_r) + 2)
            target_h, target_v = h[i][j], v[i][j]
            
            lower_t = np.sum(norm.cdf(target_h, flat_t, 0.1))
            lower_b = np.sum(norm.cdf(target_h, flat_b, 0.1))
            lower_l = np.sum(norm.cdf(target_v, flat_l, 0.1))
            lower_r = np.sum(norm.cdf(target_v, flat_r, 0.1))
            #lower_t = np.sum(np.where(flat_t < target_h, 1.0, 0.0))
            #lower_b = np.sum(np.where(flat_b < target_h, 1.0, 0.0))
            #lower_l = np.sum(np.where(flat_l < target_v, 1.0, 0.0))
            #lower_r = np.sum(np.where(flat_r < target_v, 1.0, 0.0))
            sig_t = (lower_t + 0.5) / count_t  # 1 - Pr(S_{x,y,s} | !E_{x,y}, P)
            sig_b = (lower_b + 0.5) / count_b
            sig_l = (lower_l + 0.5) / count_l
            sig_r = (lower_r + 0.5) / count_r
            sig_t = 1 - sig_t
            sig_b = 1 - sig_b
            sig_l = 1 - sig_l
            sig_r = 1 - sig_r
            res_t = (prior * (1 + sig_t - prior * sig_t)) / (prior + sig_t - prior * sig_t)
            res_b = (prior * (1 + sig_b - prior * sig_b)) / (prior + sig_b - prior * sig_b)
            res_l = (prior * (1 + sig_l - prior * sig_l)) / (prior + sig_l - prior * sig_l)
            res_r = (prior * (1 + sig_r - prior * sig_r)) / (prior + sig_r - prior * sig_r)
            res_h[i][j] = res_t + res_b - res_t * res_b  # getting OR of two independent events
            res_v[i][j] = res_l + res_r - res_l * res_r
            # res_h[i][j], res_v[i][j] = max(sig_t, sig_b), max(sig_l, sig_r)
    return res_h, res_v

# Function to segment a page (image stored in the specified file)
def segment(filename):
    img = cv2.imread(filename)
    horiz, vert = sobel(img)
    global edge_list
    edge_list = []
    segment_list = segment_rec(horiz, vert, 0, 0, len(horiz), 0, len(horiz[0])).to_list()
#    print(segment_list)
    return segment_list, img

# Function to recursively segment a page
def segment_rec(h, v, level, t, b, l, r, d=None, empty=False):
    self = SegmentNode(t, b, l, r)
    if level > 20 or b - t < min_l or r - l < min_l:
        return self
    print(level, t, b, l, r, d)
    h_curr, v_curr = h[t:b, l:r], v[t:b, l:r].transpose()
    h_prob, v_prob = np.ones(len(h_curr) - min_l * 2, dtype='float'), np.ones(len(v_curr) - min_l * 2, dtype='float')
    if d is None or d == dir_h:
        for i, row in enumerate(h_curr):
            if i < min_l or i >= len(h_curr) - min_l:
                continue
            h_prob[i - min_l] = evaluate_line(row)
        #print(min(h_prob), max(h_prob))
    if d is None or d == dir_v:
        for i, col in enumerate(v_curr):
            if i < min_l or i >= len(v_curr) - min_l:
                continue
            v_prob[i - min_l] = evaluate_line(col)
        #print(min(v_prob), max(v_prob))
    h_pass, v_pass = [], []
    h_max, v_max = 0, 0
    prev = 0
    if d is None or d == dir_h:
        for i in range(len(h_prob)):
            if i < prev:
                continue
            if h_prob[i] > threshold and h_prob[i] == np.max(h_prob[max(0, i - min_l):min(i + min_l, len(h_prob))]):
                h_pass.append(i + min_l)
                h_max = max(h_max, h_prob[i])
                prev = i + min_l
    prev = 0
    if d is None or d == dir_v:
        for i in range(len(v_prob)):
            if i < prev:
                continue
            if v_prob[i] > threshold and v_prob[i] == np.max(v_prob[max(0, i - min_l):min(i + min_l, len(v_prob))]):
                v_pass.append(i + min_l)
                v_max = max(v_max, v_prob[i])
                prev = i + min_l
    if d is None:
        d = dir_h if h_max > v_max else dir_v
    prev = 0
    if d == dir_h:
        if len(h_pass) == 0 and empty:
            return self
        for h_p in h_pass:
            start, end = prev + t, h_p + t
            self.children.append(segment_rec(h, v, level + 1, start, end, l, r, dir_v))
            edge_list.append(Edge(end, l, end, r - 1))
            prev = h_p
        self.children.append(segment_rec(h, v, level + 1, prev + t, b, l, r, dir_v, len(h_pass) == 0))
    else:
        if len(v_pass) == 0 and empty:
            return self
        for v_p in v_pass:
            start, end = prev + l, v_p + l
            self.children.append(segment_rec(h, v, level + 1, t, b, start, end, dir_h))
            edge_list.append(Edge(t, end, b - 1, end))
            prev = v_p
        self.children.append(segment_rec(h, v, level + 1, t, b, prev + l, r, dir_h, len(v_pass) == 0))
    return self

# Function to estimate the probability that a line is semantically significant
def evaluate_line(line):
    if len(line) < line_length:
        return monte_carlo_simulation(line)
    return evaluate_line(line[:math.ceil(len(line) / 2)]) * evaluate_line(line[math.ceil(len(line) / 2):])

# Function to use a Monte Carlo simulation to estimate the probability that a
# minimum proportion of the pixels in a line are locally significant
def monte_carlo_simulation(line):
    over = 0
    line_len = float(len(line))
    for _ in range(mcs_rp):
        sim = np.array([1 if random.random() < p else 0 for p in line], dtype='float')
        total = np.sum(sim) / line_len
        #if total > mcs_prob:
        #    print(total)
        over += 1.0 if (np.sum(sim) / line_len) > mcs_prob else 0.0
    #print(over)
    return over / float(mcs_rp)

# Function to show edges in an image
def _mark_edges(data, edges):
    for e in edges:
        for pixel in e.to_pixels():
            if pixel[0] >= len(data) or pixel[1] >= len(data[pixel[0]]):
                continue
            data[pixel[0]][pixel[1]] = [255, 0, 0]
    return data

edge_list = []


parser = argparse.ArgumentParser(description='Segmentation algorithm of Cormier et al.')
parser.add_argument('--image', help="The screenshot of the web page", required=True)
parser.add_argument('--id', help="The ID of the web page", required=True)
parser.add_argument('--output', dest="output_directory", help="The output directory for the segmentation", required=True)
parser.add_argument('--min-l', dest="min_l", type=int, default=min_l, help="The minimum size of a region (default: " + str(min_l) + ")")
parser.add_argument('--line-length', dest="line_length", type=int, default=line_length, help="The maximum line segment length for recursion (default: " + str(line_length) + ")")
args = parser.parse_args()

min_l = args.min_l
line_length = args.line_length

try:
    outfile = open(args.output_directory + "/cormier.json", 'w')
    s_list, pic = segment(args.image)

    polygon_list = []
    for segment in s_list:
        top     = segment[0]
        bottom  = segment[1]
        left    = segment[2]
        right   = segment[3]

        polygon_list.append([[[[left, top], [left, bottom], [right, bottom], [right, top], [left, top]]]])

    out_obj = dict(height=pic.shape[0], width=pic.shape[1], id=args.id, segmentations=dict(cormier=polygon_list))
    json.dump(out_obj, outfile)
except FileNotFoundError:
    print("Unable to create file " + args.output_directory + "/cormier.json")
