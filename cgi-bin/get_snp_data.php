<?php
////////////////////////////////////////////////////////////////////////////////
// This script is ussed to download SNP data
// Author: Asher Pasha
// Date: January 2020
// Usage: http:/bar.utoronto.ca/eplant/cgi-bin/get_snp_data.php?agi=AT3G24650
////////////////////////////////////////////////////////////////////////////////

// Check if AGI is valid
function is_agi_valid($agi) {
	// Assume it is valid and fail on invalid one.
	$result = true;

	if (preg_match('/^at[12345mc]g\d{5}\.*\d*$/i', $agi)) {
		// Data is valid. Moving on
		return $result;
	} else {
		// Invalid data found 
		$result = false;
		return $result;
	}	
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
		output_error("HTTP status from 1001 web service is not 200.");
		return;
	}
}

// Process data
function process_data($data) {
	$obj = json_decode($data, true);
	$gen_id = "";	// Genome ID
	$genome = "";	// Genome Name
	
	// MySQL Connection
	$conn = mysqli_connect("localhost", "hans", "un1pr0t", "eplant2");

	if (mysqli_connect_errno()) {
		output_error("Could not connect to the database!");
		exit();
	}

	if (!$stmt = mysqli_prepare($conn, "SELECT lookup FROM 1001_genomes_lookup WHERE id=?")) {
		output_error("Failed to prepare SQL statement!");
		exit();
	}

	mysqli_stmt_bind_param($stmt, "s", $gen_id);
	

	// Lookup table
	$code_array = ['ALA' => 'A','ARG' => 'R','ASN' => 'N','ASP' => 'D','CYS' => 'C','GLU' => 'E','GLN' => 'Q','GLY' => 'G','HIS' => 'H','ILE' => 'I', 'LEU' => 'L','LYS' => 'K','MET' => 'M','PHE' => 'F','PRO' => 'P','SER' => 'S','THR' => 'T','TRP' => 'W','TYR' => 'Y','VAL' => 'V'];

	// Parse the data and make changes
	foreach ($obj as $key => $arrays) {
		foreach ($arrays as $i => $items) {
			// Example: "p.Ala8Val/c.23C"
			preg_match('/\.(\D\D\D)(\d*)(\D\D\D)/', $items[7], $matches);

			// Modify the ref and snp AA
			$ref_aa = $code_array[strtoupper($matches[1])];
			$snp_aa = $code_array[strtoupper($matches[3])];
			$aa = $ref_aa . $snp_aa;

			// Modify the object: Note JS frontend is code to use zero index, so subtract one!
			$obj[$key][$i][1] = $matches[2] - 1;
			$obj[$key][$i][7] = $aa;

			// Modify the Genome
			$gen_id = strval($obj[$key][$i][2]);
			$genome = "";
			mysqli_stmt_execute($stmt);
			mysqli_stmt_bind_result($stmt, $genome);
			mysqli_stmt_fetch($stmt);
			$obj[$key][$i][2] = $genome;
		}
	}

	mysqli_stmt_close($stmt);
	mysqli_close($conn);
	return json_encode($obj);
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
		if (empty($_GET["agi"])) {
			output_error("No AGI parameter.");
		} else {
			$agi = $_GET["agi"];

			// validate data
			if (is_agi_valid($agi) == false) {
				output_error("AGI is not valid");
			}

			// Add .1 if it's not there	
			if (preg_match('/^at[12345mc]g\d{5}$/i', $agi)) {
				$agi .= ".1";
			}
		
			// Data is valid, moving on:	
			// Old URL not working anymore
			//$url = "http://gator.masc-proteomics.org/data/latest/gator?agi=" . $agi . "&service=" . $service;
			$url = "https://tools.1001genomes.org/api/v1.1/effects.json?type=snps;accs=all;gid=" . $agi . ";effect=missense_variant";
				
			// Get the SNP data
			$data = get_data($url);
			
			// Process data 
			$data = process_data($data);
				
			// Output the image
			header('Content-Type: application/json');
			print $data;			
		}
	}
}

// Run the main program and exit gracefully
main();
exit();
?>
