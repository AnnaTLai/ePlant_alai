#!/usr/bin/python3

import cgi

# Retrieve parameters
arguments = cgi.FieldStorage()
species = arguments['species'].value

# Print header
print('Content-Type: application/json\n')

try:
    f = open('../data/chromosome/' + species + '.json', 'r')
    print(f.read())
    f.close()
except:
    print("{}")
