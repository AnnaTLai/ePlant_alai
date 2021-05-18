<?php
////////////////////////////////////////////////////////////////////////////////
// This script downloads the word cloud from m2sb.org site.
// Author: Asher Pasha
// Date: August 2016
// Usage: http:/bar.utoronto.ca/eplant/cgi-bin/gene_cloud.php?gene=At1g59840&gene=At2g07727&gene=At2g26500&gene=At3g26710&gene=At3g57190
////////////////////////////////////////////////////////////////////////////////

// Check if data is valid
function is_data_valid($data) {
	// Assume it is valid and fail on invalid one.
	$result = true;

	foreach ($data as $gene) {
		if (preg_match('/^gene=at[12345mc]g\d{5}$/i', $gene)) {
			// Data is valid. Moving on
		} else {
			// Invalid data found 
			$result = false;
			return $result;
		}	
	} 
	
	return $result;
}

// Get data
function get_data($url) {
	// Create curl resource
	$ch = curl_init();

	// Set parameters
	curl_setopt($ch, CURLOPT_URL, $url);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
	curl_setopt($ch, CURLOPT_FAILONERROR, true);
	curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 120);
	curl_setopt($ch, CURLOPT_USERAGENT, 'The BAR PHP Client');
	
	// Get data
	$output = curl_exec($ch);
	$http_status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
	$error = curl_error($ch);
	
	if ($http_status == 200) {
		curl_close($ch);
		return $output;
	} else {
		curl_close($ch);
		output_error("HTTP status from m2sb.org is not 200.");
		return;
	}
}

// Output error
function output_error($error_text) {
	$output["status"] = "fail";
	$output["error"] = $error_text;

	// Output a JSON error message	
	header('Content-Type: application/json');
	echo json_encode($output);
	exit();
}

// Main program
function main() {
	
	// For all GET requests
	if ($_SERVER["REQUEST_METHOD"] == "GET") {

		// Gene
		if (empty($_GET["gene"])) {
			output_error("No gene parameter.");
		} else {
			// Split data to verify input
			$gene_array = explode('&', $_SERVER["QUERY_STRING"]);
			if (is_data_valid($gene_array)) {
				// If input is valid, rejoin data
				$url = join('&', $gene_array);
				$url = "https://m2sb.org/php/GeneCloudBAR.php?output=graphic&" . $url;
				
				// Get the png image
				$data = get_data($url);	
				
				// Output the image
				header('Content-Type: image/png');
				print $data;			
			} else {
				output_error("Data is not valid");
			}
		}
	}
}

// Run the main program and exit gracefully
main();
exit();
?>
