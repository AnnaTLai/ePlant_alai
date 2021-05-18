#!/usr/bin/python3

import cgi
import json
import urllib.request, urllib.error, urllib.parse

# Print header
print('Content-Type: application/json\n')

try:
    # Retrieve parameters
    arguments = cgi.FieldStorage()
    samples = json.loads(arguments['samples'].value)
    id = arguments['id'].value

    output = []

    for sample in samples:
        url = 'http://bar.utoronto.ca/eplant/cgi-bin/agiToSignal.php?dataSource=arabidopsis_ecotypes&primaryGene=' + id + '&sample=' + sample
        response = json.loads(urllib.request.urlopen(url).read())
        output.append({
            'name': sample,
            'value': response[list(response.keys())[0]]
        })

    print(json.dumps(output))
except:
    print("[]")
