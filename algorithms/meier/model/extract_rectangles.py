import re
import subprocess
import sys
import json

if len(sys.argv) != 3:
    print("Invalid number of arguments.")
    print("Usage: python3 " + sys.argv[0] + " <input png> <output json>")
    sys.exit(1)

infile = sys.argv[1]
filename = infile.rsplit('/', 1)[1].rsplit('.', 1)[0]
outfilename = sys.argv[2]

cmd = ('convert ' + infile + ' ' +
'-threshold 35% '
'-define connected-components:verbose=true '
'-define connected-components:area-threshold=50 '
'-connected-components 1 '
+ '/tmp/tmp.png')

# Leave out first and last line, because they don't contain rectangle coordinates
out = subprocess.check_output(cmd, shell=True).decode("utf-8").split('\n')[1:-1]

re_coords = re.compile('\s*?\d+:\s*?(\d+)x(\d+)\+(\d+)\+(\d+).*srgb\((\d+),(\d+),(\d+)\)')

rects = list()
rect_str = '' 
for line in out:
    m = re_coords.match(line)
    
    r = int(m.group(5))
    g = int(m.group(6))
    b = int(m.group(7))
        
    if r == 0 and g == 0 and b == 0:
        w = int(m.group(1))
        h = int(m.group(2))
    
        # Top left corner
        x1 = int(m.group(3))
        y1 = int(m.group(4))
    
        # Bottom right corner
        x2 = x1 + w
        y2 = y1 + h 
    
        rects.append({'x1': x1, 'x2': x2, 'y1':y1, 'y2': y2})

try:
    outfile = open(outfilename, 'w')
    
    polygon_list = []
    for rect in rects:
        polygon_list.append([[[[rect['x1'],rect['y1']], [rect['x1'],rect['y2']], [rect['x2'],rect['y2']], [rect['x2'],rect['y1']], [rect['x1'],rect['y1']]]]])

    out_obj = dict(height=4096, width=1366, id=filename, segmentations=dict(meier=polygon_list))
    json.dump(out_obj, outfile)
except FileNotFoundError:
    print("Unable to create file " + filename + ".json")
