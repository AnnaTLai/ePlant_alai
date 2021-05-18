<?php
# This script is the backend webservice of SUBA3 project
# Author: Asher
# Date: October, 2016
################################################################################
# Validation functions

# Stardard validate data function from W3Schools
function testInput($data) {
	$data = trim($data);
	$data = stripslashes($data);
	$data = htmlspecialchars($data);
	return $data;
}

# This function takes the locus ID and validates it.
function isValidLocus($locus) {
	$result = false;
	if (preg_match("/^AT[1-5|C|M]G\d{5}\.*\d*$/i", $locus)) {
		$result = true;
	}
	return $result;
}

################################################################################
# Data processing functions

# This function takes result from SQL Query and returns final JSON data
function getProcessedData($result) {
	# finalData is the AIP Gold Standard output
	$finalData = array();
	$data = array();
	
	# Read each row of results and build the. Note: there would only be one row, so break at the end of loop
	while ($row = mysqli_fetch_assoc($result)) {
		foreach($row as $key => $value) {
			# Null or empty values
			if (is_null($value)) {
				$data[$key] = null;
			} elseif (empty($value)) {
				$data[$key] = "";
			} elseif ($value == "") {
				$data[$key] = "";
			} elseif (preg_match("/,/", $value)) {
				# More than one
				$data[$key] = explode(",", $value);
			} elseif ($key == "location_amigo" || $key == "location_swissprot" || $key == "location_tair" || $key == "location_gfp" || $key == "location_ms") {
				# These must not be in array
				$data[$key] = $value; 
			} else {
				# Single value
				$data[$key] = array($value);
			}
		}
	}

	# Now make the final array
	$finalData = array('count' => 1, 'rows' => array($data), 'status' => 'success');

	# Return the AIP Gold Standard JSON data
	return json_encode($finalData);
}

################################################################################
# General functions

# Gives out error and stop the program
function outputError($string) {
	$finalError = array('count' => 0, 'error' => $string, 'status' => 'fail');
	header('Content-Type: application/json');
	echo json_encode($finalError);
	exit();
}

# The main program
function runMain($locus) {
	
	# Database and password information
	$servername = "localhost";
	$username = "InteractionsUser";
	$password = "InteractionsUser";
	$dbname = "localisations";

	# Connect to the database
	$conn = mysqli_connect($servername, $username, $password, $dbname);

	# If the connection fails:
	if (!$conn) {
		outputError("Failed to connect to the BAR database.");
	}
	
	# If the user want published data, use bindid not null
	$locus = mysqli_real_escape_string($conn, $locus);
	$sql = "SELECT location_adaboost, location_atp, location_bacello, location_chlorop, location_epiloc, location_ipsort, location_mitopred, location_mitoprot2, location_multiloc2, location_nucleo, location_plantmploc, location_pclr, location_predotar, location_predsl, location_pprowler, location_pts1, location_slpfa, location_slplocal, location_subloc, location_targetp, location_wolfpsort, location_yloc, location_amigo, location_tair, location_swissprot, location_ms, location_gfp, location_consensus, location_gs FROM suba3 WHERE locus = '$locus'"; 
	$result = mysqli_query($conn, $sql);
	
	header('Content-Type: application/json');
	if (mysqli_num_rows($result) > 0) {
		$finalResults = getProcessedData($result);
		echo $finalResults;
	} else {
		echo json_encode(array('count' => 0, 'error' => 'No results', 'status' => 'failed'));
	}
	
	# close the connection
	if ($conn) {
		mysqli_close($conn);
	}
}

################################################################################
# The script starts here

# Get the AGI ID
if (empty($_GET["locus"])) {
	outputError("Locus ID is empty.");
} else {
	$locus = $_GET["locus"];	# AGI ID like AT1G010101
}

# Validate data
$locus = testInput($locus);

# Stop if not valid
if (!isValidLocus($locus)) {
	outputError("Invalid locus");
}

# Add .1 if not there
if (preg_match("/^AT[1-5|C|M]G\d{5}$/i", $locus)) {
	$locus = $locus . ".1";
}
$locus = strtoupper($locus);

# If the program did not stop, get the output
runMain($locus);

################################################################################
