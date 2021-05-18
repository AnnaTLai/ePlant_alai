<?php
################################################################################
# This script return signal from gene expression databases, given an AGI ID. 
# This was rewritten using Hardeep's old AgiToSignal.php script. 
# Author: Asher
# Date: May, 2014
# Usage: http://bar.utoronto.ca/webservices/agiToSignal.php?primaryGene=At1g44575&dataSource=atgenexp_plus&sample=ATGE_2_A
################################################################################

main();

################################################################################
# Functions
################################################################################

# A generic funtion to remove html/script from input. Acknowledgements: W3C Schools PHP tutorial
function cleanInput($data) {
	$data = trim($data);
	$data = stripslashes($data);
	$data = htmlspecialchars($data);
	return $data;	
}

# Validate AGI data. This will prevent SQLi
function getVerifiedAGI($type, $data) {
	$error = array();
	$match = array();
	
	# Regex match
	if (preg_match("/^(AT[1-5|M|C]G[0-9]{5}$)/i", $data, $match)) {
		$data = $match[1];
	} else {
		$error[$type] = $data;
		$error['error'] = "Incorrect " . $type . " name";
		output($error);
	}
	return $data;
}

# Validate Mode data. Relative and Compare mode needs to be added
function getVerifiedMode($data) {
	$error = array();
	$match = array();

	# Regex match
	if (preg_match("/^(Absolute)$/", $data, $match)) {
		$data = $match[1];
	} else {
		$error['mode'] = $data;
		$error['error'] = "Incorrect mode";
		output($error);
	}
	return $data;
}

# Validate data source. More data sources can be added to the datasource array
function getVerifiedDataSource($data) {
	$error = array();
	$datasources = array();
	$match = array();

	# Build the array: More databases can be added and deleted here. 
	# This was made using Vim commands
	array_push($datasources, 'arabidopsis_ecotypes');
	array_push($datasources, 'atgenexp');
	array_push($datasources, 'atgenexp_hormone');
	array_push($datasources, 'atgenexp_pathogen');
	array_push($datasources, 'atgenexp_plus');
	array_push($datasources, 'atgenexp_stress');
	array_push($datasources, 'barley_annotations_lookup');
	array_push($datasources, 'barley_mas');
	array_push($datasources, 'barley_rma');
	array_push($datasources, 'guard_cell');
	array_push($datasources, 'lateral_root_initiation');
	array_push($datasources, 'light_series');
	array_push($datasources, 'maize_RMA_linear');
	array_push($datasources, 'maize_RMA_log');
	array_push($datasources, 'medicago_mas');
	array_push($datasources, 'medicago_rma');
	array_push($datasources, 'medicago_seed');
	array_push($datasources, 'meristem_db');
	array_push($datasources, 'poplar');
	array_push($datasources, 'potato_dev');
	array_push($datasources, 'potato_stress');
	array_push($datasources, 'rice_mas');
	array_push($datasources, 'rice_metabolite');
	array_push($datasources, 'rice_rma');
	array_push($datasources, 'root');
	array_push($datasources, 'seed_db');
	array_push($datasources, 'seedcoat');
	array_push($datasources, 'tomato');
	array_push($datasources, 'tomato_ils');
	array_push($datasources, 'tomato_ils2');
	array_push($datasources, 'tomato_renormalized');
	array_push($datasources, 'tomato_s_pennellii');
	array_push($datasources, 'triticale');
	array_push($datasources, 'triticale_mas');

	# Add the germination database to an array for rnaseq data
	array_push($datasources, 'germination');
	array_push($datasources, 'klepikova');
	array_push($datasources, 'klepikova_stress');
	array_push($datasources, 'root_Schaefer_lab');
	array_push($datasources, 'shoot_apex');
	array_push($datasources, 'single_cell');
	array_push($datasources, 'gc_drought');

	#$data = strtolower($data);

	# Check and see if the datasource in matches. implode function could also be used
	foreach ($datasources as $pattern) {
		if ( preg_match("/^(" . $pattern . ")$/", $data, $match)) {
			return $match[1];
		}
	}

	# If you are here, that means there was an error
	$error['dataSource'] = $data;
	$error['error'] = "Data source is not correct";
	output($error);
}

# Get verified sample
function getVerifiedSample($data) {
	$error = array();

	# Check for weird character
	if (preg_match("/[!|#|=|,|%|@|&]/", $data)) {
		$error['sample'] = null;
		$error['error'] = "Error in sample ID". $data;
		output($error);
	}

	# Length check
	if (strlen($data) > 100) {
		$error['sample'] = null;
		$error['error'] = "Sample id too long";
		output($error);
	}

	return $data;
}

# If the service failed
function output($data) {
	header('Content-Type: application/json');
	echo json_encode($data);
	exit();
}

# Get values
function getVariables() {
	$error = array();
	
	#GET variables. This will in the URL.
	$primary_agi = '';
	$secondary_agi = '';
	$mode = '';
	$data_source = '';
	$sample = '';

	# Get the primary gene
	if (isset($_GET['primaryGene'])) {
		$primary_agi = getVerifiedAGI('primary gene', cleanInput($_GET['primaryGene']));
	} else {
		$error['primary gene'] = null;
		$error['error'] = "Incorrect primary gene name";
		output($error);
	}

	# Get the secondary gene. This is optional
	if (isset($_GET['secondaryGene'])) {
		$secondary_agi = getVerifiedAGI('secondary gene', cleanInput($_GET['secondaryGene']));
	}
	
	# Get the mode, Default = Absolute
	if (isset($_GET['mode'])) {
		$mode = getVerifiedMode(cleanInput($_GET['mode']));
	} else {
		$mode = 'Absolute';
	}

	# Get data source. Default = atgenexp_plus
	if (isset($_GET['dataSource'])) {
		$data_source = getVerifiedDataSource(cleanInput($_GET['dataSource']));
	} else {
		$data_source = 'atgenexp_plus';
	}
	
	# Get sample 
	if (isset($_GET['sample'])) {
		$sample = getVerifiedSample(cleanInput($_GET['sample']));
	} else {
		$error['sample'] = null;
		$error['error'] = "Incorrect sample name";
		output($error);
	}

	return array ($primary_agi, $secondary_agi, $mode, $data_source, $sample);
}

# Get Signal
function getSignal($primary_agi, $secondary_agi, $mode, $data_source, $sample) {
	$error = array();
	$signal = null;

	# Array for RNA Seq data
	$RNASeqData = array('germination', 'klepikova', 'klepikova_stress', 'root_Schaefer_lab', 'shoot_apex', 'single_cell', 'gc_drought');

	# Connect to database
	$con = mysqli_connect("localhost", "efp_user", "efp_user", $data_source);

	if (mysqli_connect_errno()) {
		$error['Error'] = "Failed to connect to database";
		output($error);
	}
	mysqli_select_db($con, $data_source);

	# Variables for sql query
	$date = mysqli_real_escape_string($con, "2009-07-29");
	$primary_agi = mysqli_real_escape_string($con, $primary_agi);
	$secondary_agi = mysqli_real_escape_string($con, $secondary_agi);
	$sample = mysqli_real_escape_string($con, $sample);

	# For absolute mode
	if (in_array($data_source, $RNASeqData)) {
		// RNA Seq data
		$query = "SELECT data_signal FROM sample_data WHERE data_bot_id='$sample' AND data_probeset_id='$primary_agi'";
	}
	else {
		$query = "SELECT data_signal FROM sample_data WHERE data_bot_id='$sample' AND data_probeset_id=(SELECT t2.probeset FROM annotations_lookup.at_agi_lookup t2 WHERE t2.agi='$primary_agi' AND t2.date='$date' LIMIT 1)";
	}


	if ($result = mysqli_query($con, $query)) {
		$row = mysqli_fetch_assoc($result);
		mysqli_close($con);
		return $row['data_signal'];	
	} else {
		mysqli_close($con);
		$error['Error'] = "Query failed to execute";
		output($error);
	}

	return $signal;
}


# The main function
function main() {
	#GET variables. This will in the URL.
	$primary_agi = '';
	$secondary_agi = '';
	$mode = '';
	$data_source = '';
	$sample = '';

	# Variable for this service (non-GET variable)
	$signal = '';
	$outputData = array();
	
	# GET parameters from URL
	list($primary_agi, $secondary_agi, $mode, $data_source, $sample) = getVariables();

	$signal = getSignal($primary_agi, $secondary_agi, $mode, $data_source, $sample);
	$outputData[$sample] = $signal;
	output($outputData);
}
?>

