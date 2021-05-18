<?php
# This script gets ranks of expression values
# Author: Asher
# Date: November, 2015
# Usage: http://bar.utoronto.ca/webservices/aip/interactions/get_interactions.php?locus=AT1G01010&published=false

################################################################################
# Validation functions

# Stardard validate data function from W3Schools
function testInput($data) {
	$data = trim($data);
	$data = stripslashes($data);
	$data = htmlspecialchars($data);
	return $data;
}

# This function test if expression is valid
function isValidExpression($data) {
	$result = false;
	if (preg_match("/^\d+.?\d*$/", $data)) {
		$result = true;
	}
	return $result;
}


################################################################################
# Data processing functions

# This function takes result from SQL Query and returns final JSON data
function getProcessedData($result, $expression) {
	# finalData is the AIP Gold Standard output
	$finalData = array();
	$data = array();
	
	# Read each row of results and build the 
	while ($row = mysqli_fetch_assoc($result)) {
		# Format the result and push them into array
		$rank = (float)$row["rank"];
		$actual_expression = (float)$row["expression"];
		$rank = $rank / 22810 * 100;
		array_push($data, array('input' => $expression, 'expression' => $actual_expression, 'percentile' => $rank)); 
	}

	# Now make the final array
	$finalData = array('result' => $data, 'status' => 'success');

	# Return the AIP Gold Standard JSON data
	return json_encode($finalData);
}

################################################################################
# General functions

# Gives out error and stop the program
function outputError($string) {
	$finalError = array('error' => $string, 'status' => 'fail');
	header('Content-Type: application/json');
	echo json_encode($finalError);
	exit();
}

# The main program
function runMain($expression) {

	# Connect to the database
	$conn = mysqli_connect("localhost", "efp_user", "efp_user", "atgenexp_plus");

	# If the connection fails:
	if (!$conn) {
		outputError("Failed to connect to the BAR database.");
	}
	
	# Query data
	$expression = mysqli_real_escape_string($conn, $expression);
	$sql = "SELECT ABS(expression - '$expression') AS distance, expression, `rank` FROM ranks ORDER BY distance LIMIT 1;";
	$sql = "SELECT ABS(expression - '$expression') AS distance, expression, `rank` FROM (( SELECT expression, `rank` FROM ranks WHERE expression >= '$expression' ORDER BY expression limit 3) UNION ALL (SELECT expression, `rank` FROM ranks WHERE expression < '$expression' ORDER BY expression DESC LIMIT 3)) AS n ORDER BY distance LIMIT 1;";
	$result = mysqli_query($conn, $sql);
	
	header('Content-Type: application/json');
	if (mysqli_num_rows($result) > 0) {
		$finalResults = getProcessedData($result, $expression);
		echo $finalResults;
	} else {
		echo json_encode(array('error' => 'No results', 'status' => 'failed'));
	}
	
	# close the connection
	if ($conn) {
		mysqli_close($conn);
	}
}

################################################################################
# The script starts here

# Get the expression
if (empty($_GET["expression"])) {
	outputError("Expression is empty.");
} else {
	$expression = $_GET["expression"];	# expression
}

# Validate data
$expression = testInput($expression);

# Stop if not valid
if (!isValidExpression($expression)) {
	outputError("Invalid gene expression");
}

# If the program did not stop, get the output
runMain($expression);

################################################################################
