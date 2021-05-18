<?php
////////////////////////////////////////////////////////////////////////////////
// This script returns php data used for Micheal's project.
// Author: Asher
// Date: June, 2016
////////////////////////////////////////////////////////////////////////////////

// These functions are for validing input data
// This is from w3schools
function test_input($data) {
	$data = trim($data);
	$data = stripslashes($data);
	$data = htmlspecialchars($data);
	return $data;
}

// Check for AGI
function is_locus_valid($locus) {
	$result = false;
	if (preg_match('/^at[12345mc]g\d{5}\.*\d*$/i', $locus)) {
		$result = true;
	} else {
		output_error("AGI is invalid");
	}
	
	$result = (bool) $result;
	return $result;
}

// These functions are for actual processing
// Connect to database
function connect_db() {
	$servername = "localhost";
	$username = "bar_user";
	$password = "bAr_B07";
	$dbname = "eplant2";

	$conn = mysqli_connect($servername, $username, $password, $dbname);
	if (!$conn) {
		output_error("Failed to connect to the database.");
	} else {
		return $conn;
	}
}

// Query the eplant2 database and get the results.
function get_results($locus) {
	$data = "";
	$results = array();
	$final_result = "";

	// Create database connection
	$conn = connect_db();
	
	// Query the server
	// Add .1 by default to locus if there isn't any
	if (preg_match('/^at[12345mc]g\d{5}$/i', $locus)) {
		$locus = $locus . ".1";
	}

	$locus = "Phyre2_" . $locus;
	$locus = mysqli_real_escape_string($conn, $locus);
	$sql = "SELECT residue, position from binding where id = '$locus';";
	$sql_output = mysqli_query($conn, $sql);

	// Process results
	if (mysqli_num_rows($sql_output) > 0) {
		while ($row = mysqli_fetch_assoc($sql_output)) {
			if ($row["residue"] == "TRP") {
				array_push($results, "W" . $row["position"]);
			} else {
				mysqli_close($conn);
				output_error("Warning: database has new residue.");
			}
		}
	} else {
		mysqli_close($conn);
		output_error("No records found!");
	}

	// Disconnect and resturn results.
	mysqli_close($conn);
	$final_result = implode(",", $results);
	return $final_result;
}

// The function are for output results.
// This function output results
function output_results($results) {
	$output["status"] = "success";
	$output["result"] = $results;
	echo json_encode($output);
	exit();
}

// This function outputs error
function output_error($message) {
	$output["status"] = "fail";
	$output["error"] = $message;
	echo json_encode($output);
	exit();
}

// The main function 
function main() {
	$locus = "";
	$results = "";

	header('Content-Type: application/json');

	if ($_SERVER["REQUEST_METHOD"] == "GET") {
		if (! empty($_GET["locus"])) {
			$locus = test_input($_GET["locus"]);

			if (is_locus_valid($locus)) {
				$results = get_results($locus);
				output_results($results);
			} else {
				output_error("Locus is not valid.");
			}
		} else {
			output_error("No locus provided.");
		}
	}
}

main();
?>		
