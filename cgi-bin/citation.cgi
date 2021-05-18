#!/usr/bin/python3

import cgi
import json

# Retrieve parameters
arguments = cgi.FieldStorage()
view = arguments['view'].value

# Print header
print('Content-Type: application/json\n')

try:
    f = open('../data/citations.json', 'r')
    data = json.loads(f.read())
    f.close()

    for entry in data:
        if entry['view'] == view:
            print(json.dumps(entry))
            break
except:
    print("{}")
