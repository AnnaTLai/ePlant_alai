#!/usr/bin/python3

import cgi
import MySQLdb
import json

# Retrieve parameters
arguments = cgi.FieldStorage()
id = arguments['id'].value

# Print header
print('Content-Type: application/json\n')

try:
    con = MySQLdb.connect('localhost', 'hans', 'un1pr0t', 'eplant2')
    cur = con.cursor()
    query = 'SELECT geneId,start,end,strand FROM tair10_gff3 WHERE type=\"gene\" AND geneId=\"' + id + '\" AND Source=\"TAIR10\";'
    cur.execute(query)
    data = cur.fetchone()
    gene = {}
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
    print(json.dumps(gene))
except:
    print('{}')

