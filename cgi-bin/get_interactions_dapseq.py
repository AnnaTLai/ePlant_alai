#!/usr/bin/python3
"""
This program gets interactions between interactions including PDIs
Author: Asher
Date: January, 2018
Usage: python3 getLargeData.py
Example: http://www.bar.utoronto.ca/eplant/cgi-bin/get_interactions_dapseq.py?locus=AT3G24650
"""
import MySQLdb
import cgi
import re
import json
from sys import exit


def connect():
    """
    Connect to the database
    :return: Database connection
    """

    try:
        conn = MySQLdb.connect(host='localhost', user='InteractionsUser', passwd='InteractionsUser', db='interactions')
    except MySQLdb.Error:
        output_error('Can not connect to database!')

    return conn


def first_query(conn, agi):
    """
    Get the results of the first query (Proteins only).
    :param conn: MySQL connection
    :param str agi: AGI ID
    :return: An Hash of protein
    """

    proteins = {}
    results = []

    # Prepare query
    cursor = conn.cursor()
    sql = 'SELECT Protein1, Protein2 FROM interactions_eplant_v4 WHERE aiv_index < 2 AND Protein1 = %s'

    # Run query
    try:
        cursor.execute(sql, (agi, ))
        results = cursor.fetchall()
    except MySQLdb.Error as e:
        conn.close()
        output_error('Could not query database.')

    # Check if there are no results
    if len(results) == 0:
        print({})
        conn.close()
        exit()

    # Get data from results
    for row in results:
        # Add query proteins
        if row[0] not in proteins:
            proteins[row[0]] = ''

        # Add interactions
        if row[1] not in proteins:
            proteins[row[1]] = ''

    return proteins


def second_query(conn, agis):
    """
    This function runs the second query of proteins
    :param conn: connection
    :param agis: hash of agis
    :return: list of dictionaries of proteins and dna
    """
    proteins = {}
    results = []

    # Query PPIs
    cursor = conn.cursor()
    sql = 'SELECT Protein1, Protein2, aiv_index, Quality, Pcc, Bind_id FROM interactions_eplant_v4 WHERE aiv_index < 2 AND Protein1 IN ("' + '", "'.join(
        agis.keys()) + '")'

    # Run query
    try:
        cursor.execute(sql)
        results = cursor.fetchall()
    except MySQLdb.Error:
        conn.close()
        output_error('Could not query database.')

    # Check if there are no results
    if len(results) == 0:
        conn.close()
        print({})
        exit()

    for row in results:
        # Protein/DNA check
        interaction = row[0] + "\t" + row[1]
        if interaction not in proteins:
            proteins[interaction] = row

    return proteins


def hash_filter(first_hits, second_hits):
    """
    This function filters the second network using dictionaries
    :param first_hits: Network from first query
    :param second_hits: Network from second query
    :return: filtered network
    """

    protein_filtered = {}

    # Now filter

    # Protein
    for interaction, row in second_hits.items():
        p1, p2 = interaction.split("\t")
        if p2 in first_hits:
            protein_filtered[interaction] = row

    return protein_filtered


def remove_duplicates(data):
    """
    This function removes duplicates from the interactome
    :param data: Hash filtered data
    :return: data with duplicates removed
    """

    uniq_proteins = dict()
    final_data = []

    # Proteins
    for interaction, row in data.items():
        p1, p2 = interaction.split("\t")
        query = p2 + "\t" + p1
        if query in uniq_proteins:
            pass
        else:
            uniq_proteins[interaction] = row

    # Final data is array of array like the one returned by MySQL
    for interaction, row in uniq_proteins.items():
        final_data.append(row)

    return final_data


def add_PDIs(conn, agi, data):
    """
    Add PDIs in the result as a final step
    :param conn: MySQL connection
    :param agi: Locus gene
    :param data: Dataset so far
    :return: Full data set.
    """
    results = []

    # Query PPIs
    cursor = conn.cursor()
    sql = 'SELECT Protein1, Protein2, aiv_index, Quality, Pcc, Bind_id  FROM interactions_eplant_v4 WHERE aiv_index = 2 AND Protein1 = %s'

    # Run query
    try:
        cursor.execute(sql, (agi,))
        results = cursor.fetchall()
    except MySQLdb.Error:
        conn.close()
        output_error('Could not query database.')

    # Check if there are no results
    if len(results) == 0:
        return data

    for row in results:
        data.append(row)

    return data


def output_data(recursive, agi, data):
    """
    This functions outputs interactions.
    :param recursive: If there is interaction between interactors
    :param agi: Gene ID of query
    :param data: rows returned from MySQL
    :return:
    """

    final_output = dict()
    final_output[agi] = []

    for row in data:
        output = dict()
        output['source'] = row[0]
        output['target'] = row[1]
        output['index'] = str(row[2])

        if row[3] is None:
            output['interolog_confidence'] = None
        else:
            output['interolog_confidence'] = float(row[3])

        if row[4] is None:
            output['correlation_coefficient'] = None
        else:
            output['correlation_coefficient'] = float(row[4])

        # Set default for published
        if row[5] is None:
            output['published'] = False
            output['reference'] = "None"
        else:
            output['published'] = True
            output['reference'] = row[5]

        # Now If it a predicted DNA, then set published = false
        if row[3] is not None:
            if row[2] == 2 and (0 < row[3] < 1):
                output['published'] = False

        final_output[agi].append(output)

    if recursive:
        final_output[agi].append({'recursive': 'true'})
    else:
        final_output[agi].append({'recursive': 'false'})

    print(json.dumps(final_output))
    exit()


def is_locus_valid(locus):
    """
    This function checks if locus is valid
    :param locus: string Input AGI
    :return: boolean. True if worked. False if format is not right.
    """
    if re.match(r"^AT[12345CM]G\d{5}$", locus, re.IGNORECASE):
        return True
    else:
        return False


def output_error(message):
    """
    This function outputs error messages
    :param message: string
    :return:
    """
    output = dict()
    output['status'] = 'fail'
    output['error'] = message
    print(json.dumps(output))
    exit()


def main():
    """
    The main program.

    :return:
    """

    print('Content-type: application/json\n')

    try:
        arguments = cgi.FieldStorage()
        locus = arguments['locus'].value
    except Exception:
        output_error('Could not read locus parameter of GET request.')

    # Validate locus
    if is_locus_valid(locus):
        pass
    else:
        output_error('Locus is invalid.')

    # Connect to database
    conn = connect()

    # Run the first query
    first_hits = first_query(conn, locus)

    # Run the second query using protein in first queries result
    second_hits = second_query(conn, first_hits)

    # Hash filter
    hash_filtered_second_hits = hash_filter(first_hits, second_hits)
    final_data = remove_duplicates(hash_filtered_second_hits)

    # Add PIDs
    final_output = add_PDIs(conn, locus, final_data)
    conn.close()

    # Output the final data, So far, recursive is set to true.
    # Are we not doing interactions between interactors?
    output_data(True, locus, final_output)


if __name__ == '__main__':
    main()
