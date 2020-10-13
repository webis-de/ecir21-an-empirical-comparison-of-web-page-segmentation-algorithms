import json

def getIds():
    file_path = '../../rectangles-fixed.json'

    ids = []

    with open(file_path, 'r') as f:
            array = json.load(f)

            #for i in range(len(array)):
     #               ids.append((array[i]['id_url'], array[i]['id_assignment']))
    return array  

