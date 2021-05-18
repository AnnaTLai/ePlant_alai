#!/usr/bin/python3
# Rewritten by Asher to accept Special HTML characters
import cgi
import json
import urllib.request, urllib.parse, urllib.error
import urllib.request, urllib.error, urllib.parse
print('Content-Type: application/json\n')

try:
    # Retrieve parameters
    arguments = cgi.FieldStorage()
    samples = json.loads(arguments['samples'].value)
    id = arguments['id'].value
    datasource = arguments['datasource'].value

    output = []

    for sample in samples:
        query_args = {'dataSource': datasource, 'primaryGene': id, 'sample': sample }
        encoded_args = urllib.parse.urlencode(query_args)

        url = 'http://bar.utoronto.ca/eplant/cgi-bin/agiToSignal.php?' + encoded_args
        response = json.loads(urllib.request.urlopen(url).read())
        
        output.append({
            'name': sample,
            'value': response[list(response.keys())[0]]
        })

    print(json.dumps(output))
except:
    print("[]")
