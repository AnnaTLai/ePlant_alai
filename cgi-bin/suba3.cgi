#!/usr/bin/python3

import cgi
import json
import urllib.request, urllib.error, urllib.parse

# Processes an array of locations
# scores - dictionary of location : score
# value - number of scores each location is worth
def processLocation(locations, scores, value):
    if not locations:
        return
    for location in locations:
        if len(location) == 0: continue
        if not location in scores:
            scores[location] = 0
        scores[location] += value

# Check if localisation is predicted or not
def checkDocumented(locations, experimental):
    # check if we already know it is documented
    if experimental == "yes":
        return "yes"

    # If it is not documented
    if not locations:
        return experimental    # Do not change if there are no localisation of this experiment
    for location in locations:
        if len(location) > 0: 
            return "yes"    # Found a Documented one
    return experimental    # Nothing found, Don't change

def correctAnnotatedLocations(locations):
    for n in range(len(locations)):
        locations[n] = locations[n][0:locations[n].find(':')]
    return locations

# Retrieve parameters
arguments = cgi.FieldStorage()
id = arguments['id'].value
try:
    includePredicted = arguments['include_predicted'].value
except:
    includePredicted = "yes"

# Print header
print('Content-Type: application/json\n')

try:
    url = 'http://bar.utoronto.ca/eplant/cgi-bin/suba_app.php?locus=' + id
    #url = 'http://suba.plantenergy.uwa.edu.au/cgi/suba-app.py/suba3?start=0&limit=50&sort=locus&dir=ASC&table=suba3&where=@' + id
    response = json.loads(urllib.request.urlopen(url).read())
    #print json.dumps(response)
    if response['count'] > 0:
        data = response['rows'][0]
        scores = {}
        experimental = "no" # By default, all localisations are predicted. If this variable chanes to yes, there are experimental predictions
   
        if includePredicted == "yes":
            predscore = 2
            processLocation(data['location_adaboost'], scores, predscore)
            processLocation(data['location_atp'], scores, predscore)
            processLocation(data['location_bacello'], scores, predscore)
            processLocation(data['location_chlorop'], scores, predscore)
            processLocation(data['location_epiloc'], scores, predscore)
            processLocation(data['location_ipsort'], scores, predscore)
            processLocation(data['location_mitopred'], scores, predscore)
            processLocation(data['location_mitoprot2'], scores, predscore)
            processLocation(data['location_multiloc2'], scores, predscore)
            processLocation(data['location_nucleo'], scores, predscore)
            processLocation(data['location_pclr'], scores, predscore)
            processLocation(data['location_plantmploc'], scores, predscore)
            processLocation(data['location_predotar'], scores, predscore)
            processLocation(data['location_predsl'], scores, predscore)
            processLocation(data['location_pprowler'], scores, predscore)
            processLocation(data['location_pts1'], scores, predscore)
            processLocation(data['location_slpfa'], scores, predscore)
            processLocation(data['location_slplocal'], scores, predscore)
            processLocation(data['location_subloc'], scores, predscore)
            processLocation(data['location_targetp'], scores, predscore)
            processLocation(data['location_wolfpsort'], scores, predscore)
            processLocation(data['location_yloc'], scores, predscore)
    
        annotscore = 10
        locations = correctAnnotatedLocations(data['location_amigo'].split(';'))
        processLocation(locations, scores, annotscore)
        experimental = checkDocumented(locations, experimental)

        locations = correctAnnotatedLocations(data['location_swissprot'].split(';'))
        processLocation(locations, scores, annotscore)
        experimental = checkDocumented(locations, experimental)

        locations = correctAnnotatedLocations(data['location_tair'].split(';'))
        processLocation(locations, scores, annotscore)
        experimental = checkDocumented(locations, experimental)
    
        gfpscore = 10
        locations = correctAnnotatedLocations(data['location_gfp'].split(';'))
        processLocation(locations, scores, gfpscore)
        experimental = checkDocumented(locations, experimental)
    
        msscore = 10
        locations = correctAnnotatedLocations(data['location_ms'].split(';'))
        processLocation(locations, scores, msscore)
        experimental = checkDocumented(locations, experimental)
    
        # Get valid compartments
        finalOutput = {}
        validScores = {}
        validLocations = ['cytoskeleton', 'cytosol', 'endoplasmic reticulum', 'extracellular', 'golgi', 'mitochondrion', 'nucleus', 'peroxisome', 'plasma membrane', 'plastid', 'vacuole']
        for location in scores:
            if location in validLocations:
                validScores[location] = scores[location]
        finalOutput = {'data': validScores, 'includes_predicted': includePredicted, 'includes_experimental': experimental}
        print(json.dumps(finalOutput))
    else:
        print('{}')
except:
    print('{}')
