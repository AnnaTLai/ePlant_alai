<?php
////////////////////////////////////////////////////////////////////////////////
// This webservice gets Phyre Data given a file name
// Author: Asher
// Date: October 7th, 2016
////////////////////////////////////////////////////////////////////////////////

// Test input data
function test_input($data) {
	$data = trim($data);
	$data = stripslashes($data);
	$data = htmlspecialchars($data);
	return $data;
}

// Check for file name
function is_file_valid($id) {
	$result = false;
	if (preg_match('/^Phyre2_AT[12345CM]g\d+\.\d\.pdb$/i', $id)) {
		$result = true;
	} elseif (preg_match('/^....\.pdb$/i', $id)) {
		$result = true;
	} else {
		output_error("BAR: File name is invalid");
	}
	
	$result = (bool) $result;
	return $result;
}

// Output the final results
function output_error($data) {
	echo $data;
	exit();
}

// Output the final results
function output_results($data) {
	echo $data;
	exit();
}

# Open the file and read the data
function readData($name) {
	$myfile = fopen($name, "r") or output_error("Unable to open file!");
	$data = fread($myfile, filesize($name));
	fclose($myfile);
	return $data;	
}

function main() {
	header('Content-Type: text/html');
	if ($_SERVER["REQUEST_METHOD"] == "GET") {
		// Id
		if (empty($_GET["file"])) {
			output_error("BAR: No file parameter.");
		} else {
			$id = test_input($_GET["file"]);
		}
		if (is_file_valid($id)) {
			$filename = "/DATA/CDD3D_structures/TAIR10-Phyre2/" . $id;
			$data = readData($filename);
			output_results($data);
		} else {
			output_error("File name is not valid");
		}
	}
}

main();
?>
