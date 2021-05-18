#!/usr/bin/python3

import cgi
import json
import urllib.request, urllib.error, urllib.parse

# Print header
print('Content-Type: application/json\n')

try:
    # Retrieve parameters
    arguments = cgi.FieldStorage()
    ids = json.loads(arguments['ids'].value)

    # Try to read the value of include_predicted, if not then pass yes
    try:
        includePredicted = arguments['include_predicted'].value
    except:
        includePredicted = 'yes'

    output = []

    for id in ids:
        url = 'http://bar.utoronto.ca/eplant/cgi-bin/suba3.cgi?id=' + id + "&include_predicted=" + includePredicted
        response = json.loads(urllib.request.urlopen(url).read())
        output.append({
            "id": id,
            "data": response['data'],
            "includes_predicted": response['includes_predicted'],
            "includes_experimental": response['includes_experimental']
        })

    print(json.dumps(output))
except:
    print("[]")
