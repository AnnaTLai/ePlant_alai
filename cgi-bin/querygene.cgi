#!/usr/bin/python3

import cgi
import MySQLdb
import json
import urllib.request, urllib.error, urllib.parse

# Retrieve parameters
arguments = cgi.FieldStorage()
species = arguments['species'].value
term = arguments['term'].value

# Print header
print('Content-Type: application/json\n')

try:
    gene = {}
    if species == 'Arabidopsis_thaliana':
        con = MySQLdb.connect('localhost', 'hans', 'un1pr0t', 'eplant2')
        cur = con.cursor()
        terms = term.split('/')
        # This doesn't work if AGI an annotation is entered!
        if len(terms) > 1:
            query = 'SELECT agi FROM agi_alias WHERE agi LIKE "%' + terms[0] + '%" LIMIT 1;'
        else:
            query = 'SELECT agi FROM agi_alias WHERE agi LIKE "%' + term + '%" OR alias LIKE "%' + term + '%" LIMIT 1;'
        cur.execute(query)
        result = cur.fetchone()
        if not result:
            query = 'SELECT geneId FROM tair10_gff3 WHERE (type=\"gene\" OR type=\"transposable_element_gene\") AND geneId LIKE "%' + term + '%" LIMIT 1;'
            cur.execute(query)
            result = cur.fetchone()
        if result:
            id = result[0]
            query = 'SELECT geneId,start,end,strand FROM tair10_gff3 WHERE (type=\"gene\" or type=\"transposable_element_gene\") AND geneId=\"' + id + '\" AND Source=\"TAIR10\";'
            cur.execute(query)
            data = cur.fetchone()
            gene['id'] = data[0]
            gene['chromosome'] = 'Chr' + gene['id'][2:3]
            gene['start'] = data[1]
            gene['end'] = data[2]
            gene['strand'] = data[3]
            query = 'SELECT alias FROM agi_alias WHERE agi=\"' + id + '\";'
            cur.execute(query)
            aliases = []
            for row in cur:
                aliases.append(row[0])
            gene['aliases'] = aliases
            query = 'SELECT annotation FROM agi_annotation WHERE agi=\"' + gene['id'] + '\";'
            cur.execute(query)
            gene['annotation'] = None
            for row in cur:
                temp = row[0].split('__')
                if len(temp) > 1:
                    gene['annotation'] = temp[1]
                else:
                    gene['annotation'] = temp[0]

            # Get subcellular localizations
            #url = 'http://suba.plantenergy.uwa.edu.au/cgi/suba-app.py/suba3?start=0&limit=50&sort=locus&dir=ASC&table=suba3&where=@' + gene['id']
            #response = json.loads(urllib2.urlopen(url).read())
            #gene['localisation'] = None
            #if response['count'] > 0:
                #gene['localisation'] = response['rows'][0]
    print(json.dumps(gene))
except:
    print('{}')

