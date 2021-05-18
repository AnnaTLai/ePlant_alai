#!/usr/bin/python3

import cgi
import json
import urllib.request, urllib.error, urllib.parse

# Print header
print('Content-Type: application/json\n')

try:
    # Retrieve parameters
    arguments = cgi.FieldStorage()

    id = arguments['id'].value
    includePredicted = None
    
    try:
        includePredicted = arguments['include_predicted'].value
    except:
        pass

    compartments = ['NUCLEUS', 'ENDOPLASMIC RETICULUM', 'PEROXISOME', 'GOLGI', 'MITOCHONDRION', 'PLASTID', 'CYTOSKELETON', 'VACUOLE', 'CYTOSOL', 'EXTRACELLULAR', 'PLASMA MEMBRANE']
    hasValue = [False] * 11

    if (includePredicted == "yes" or includePredicted == "no"):
        url = 'http://bar.utoronto.ca/eplant/cgi-bin/suba3.cgi?id=' + id + '&include_predicted=' + includePredicted
    else:
        url = 'http://bar.utoronto.ca/eplant/cgi-bin/suba3.cgi?id=' + id + '&include_predicted=yes'

    response = json.loads(urllib.request.urlopen(url).read())
    predicted = response['includes_predicted']
    experimental = response['includes_experimental']
    response = response['data']
    finalOutput = {} 
    output = []

    for key in response:
        index = compartments.index(key.upper())
        if (index >= 0):
            output.append({
                'name': compartments[index],
                'value': response[key]
            })
            hasValue[index] = True

    for index, flag in enumerate(hasValue):
        if not flag:
            output.append({
                'name': compartments[index],
                'value': 0
            })
            
    finalOutput = { 'data': output, 'includes_predicted': predicted, 'includes_experimental': experimental } 

    print(json.dumps(finalOutput))
except:
    print('{}')
