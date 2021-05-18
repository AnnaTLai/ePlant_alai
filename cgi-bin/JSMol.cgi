#!/usr/bin/perl
################################################################################
# This is the JSmol webservice that returns the link to TAIR10 Phyre2 pdb file
# given an AGI.
# Author: Asher
# Date: March 2014
# Usage Example: http://bar.utoronto.ca/eplant/cgi-bin/JSMol.cgi?agi=At1g01010
################################################################################
use warnings;
use strict;
use CGI;
use JSON;
use DBI;

my $cgiObj = new CGI;	# The CGI Oject
my $agi = $cgiObj->param('agi');	# AGI supplied by the user

# Check input for errors, and return correct AGI or exit
end("No AGI provided.") if (!defined($agi));
main();

################################################################################
# Subroutines
################################################################################

# This subroutine check AGI ID for errors, etc
sub checkAGI {
	my $agi = shift;

	$agi = uc($agi);
	if ($agi =~ /^(AT[\d|M|C]G\d{5}\.?\d?)$/) {
		$agi = $1;
		return $agi;
	} else {
		end("Invalid AGI.");
	}
}

# Get experimental link
sub getExpLink {
	my $agi = shift;
	my $link = "";
	my $dataFile = "";
	
	# Remove .\d from the end
	$agi =~ s/\.\d$//g;

	# Query database and find the results
	my $dbh = DBI->connect('DBI:mysql:eplant2', 'hans', 'un1pr0t') or end("Could not connect to database!.");
	my $sth = $dbh->prepare('SELECT agi, model FROM pdb_experimental where agi = ?') or end("Could not prepare statement!.");
	$sth->execute($agi) or end("Could not execute statement!.");

	# If something is found, return it.
	if ($sth->rows > 0) {
		while (my @data = $sth->fetchrow_array()) {
			$dataFile = "/DATA/CDD3D_structures/TAIR10-Phyre2/" . lc($data[1]) . ".pdb";	# SymLink to pdb files
			if (-e $dataFile) {
				$link = "//bar.utoronto.ca/eplant_legacy/java/Phyre2-Models/" . lc($data[1]) . ".pdb";
			}
		}
	}

	$sth->finish();
	$dbh->disconnect;

	return $link;
}

# This subroutine returns the link to pdb files
sub getLink {
	my $agi = shift;
	my $link = "";	# Link to pdb files
	my $dataDir = "/DATA/CDD3D_structures/TAIR10-Phyre2/";	# SymLink to pdb files
	my $ePlant = "//bar.utoronto.ca/eplant_legacy/java/Phyre2-Models/";	# Link
	
	$agi = "Phyre2_".$agi;
	if ($agi =~ /\.\d$/) {
		$agi .= ".pdb";
		if (-e $dataDir.$agi) {
			$link = $ePlant . $agi;
		}
	} else {
		# Start with .1, .2, .3, .4, .5
		if (-e $dataDir.$agi.".1.pdb") {
			$link = $ePlant . $agi . ".1.pdb";
		} elsif (-e $dataDir.$agi.".2.pdb") {
			$link = $ePlant . $agi . ".2.pdb";
		} elsif (-e $dataDir.$agi.".3.pdb") {
			$link = $ePlant . $agi . ".3.pdb";
		} elsif (-e $dataDir.$agi.".4.pdb") {
			$link = $ePlant . $agi . ".4.pdb";
		} elsif (-e $dataDir.$agi.".5.pdb") {
			$link = $ePlant . $agi . ".5.pdb";
		} elsif (-e $dataDir.$agi.".6.pdb") {
			$link = $ePlant . $agi . ".6.pdb";
		} elsif (-e $dataDir.$agi.".7.pdb") {
			$link = $ePlant . $agi . ".7.pdb";
		} elsif (-e $dataDir.$agi.".8.pdb") {
			$link = $ePlant . $agi . ".8.pdb";
		} elsif (-e $dataDir.$agi.".9.pdb") {
			$link = $ePlant . $agi . ".9.pdb";
		} else {
			$link = "";
		}
	}
	return $link;
}

# Get Exp sequence of the pdb
# These sequences are from: http://www.rcsb.org/pdb/download/download.do#FASTA
sub getExpSequence {
	my $link = shift;
	my $seq = "";
	my $dataDir = "/DATA/CDD3D_structures/TAIR10-Phyre2/";	# PDB files
	my $file = "";
	
	# If the link has a file name, parse it
	if ($link =~ /Phyre2.+\/(.+pdb$)/) {
		# Get the FASTA file name
		$file = $1;
		$file =~ s/.pdb$/.fasta/g;
		$file = $dataDir . $file;
		
		# Get the sequence
		if (-e $file) {
			open(my $infh, "<", $file) or end();
			while (<$infh>) {
				chomp($_);
				unless ($_ =~ /^>/) {
					$seq .= $_;
				}
			}
			close $infh;
		}
	}
	return $seq;
}

# Get the protein pdb seqeunce of the link
sub getSequence {
	my $link = shift;
	my $seq = "";
	my $dataDir = "/DATA/CDD3D_structures/TAIR10-Phyre2/";	# PDB files
	my $file = "";
	
	# If the link has a file name, parse it
	if ($link =~ /Phyre2-Models\/(Phyre2_.+pdb$)/) {
		# Get the FASTA file name
		$file = $1;
		$file =~ s/.pdb$/_FASTA.fas/g;
		$file = $dataDir . $file;
		
		# Get the sequence
		if (-e $file) {
			open(my $infh, "<", $file) or end();
			while (<$infh>) {
				chomp($_);
				unless ($_ =~ /^>/) {
					$seq .= $_;
				}
			}
			close $infh;
		}
	}
	return $seq;
}

# Get prediction from the database
sub getPrediction {
	my $link = shift;
	my $template = "";
	my $hmmpredEValue = "";
	my $pathToResults = "";
	
	# If the link has a name, parse it
	if ($link =~ /Phyre2-Models\/Phyre2_(.+)\.pdb$/) {
		my $agi = $1;

		# Query database and find the results
		my $dbh = DBI->connect('DBI:mysql:eplant2', 'hans', 'un1pr0t') or end("Could not connect to database!.");
		my $sth = $dbh->prepare('SELECT agi, template, hmmpred_evalue, link FROM hmmpred where agi = ? limit 1') or end("Could not prepare statement!.");
		$sth->execute($agi) or end("Could not execute statement!.");

		# If something is found, return it.
		if ($sth->rows > 0) {
			while (my @data = $sth->fetchrow_array()) {
				$template = $data[1];
				$hmmpredEValue = $data[2];
				$pathToResults = $data[3];
			}
		}

		$sth->finish();
		$dbh->disconnect;
	}
	return ($template, $hmmpredEValue, $pathToResults);
}

# This program exits the script
sub end {
	my $errMsg = shift || "";
	my %jsonHash;
	
	print $cgiObj->header('application/json');

	# If there is no error, output a {}. If there is error, output error.
	if ($errMsg eq "") {
		print '{}';
	} else {
		$jsonHash{'error'} = $errMsg;
		print encode_json(\%jsonHash);
	}
	exit(0);
}

# The main function
sub main {
	my $link = "";	# This to file
	my $seq = "";	# The FASTA sequence of pdb file
	my $jsonObj;	# This is the final JSON object
	my %jsonHash;	# The json hash
	my $predicted = "null";	# Is PDB predicted
	
	# Check AGI for errors
	$agi = checkAGI($agi);

	# First try the experimental data
	$link = getExpLink($agi);
	if ($link ne "") {
		$seq = getExpSequence($link);
		$predicted = "false";
	}

	# Get the linked the TAIR10 phyre2 file
	if ($link eq "") {
		$link = getLink($agi);
		if ($link ne "") {
			$seq = getSequence($link);
			$predicted = "true";
		}
	}
	
	# Get HMM Prediction data
	my ($template, $hmmpredEValue, $pathToResults) = getPrediction($link);

	# Make json object
	$jsonHash{'link'} = $link;
	$jsonHash{'sequence'} = $seq;
	$jsonHash{'template'} = $template;
	$jsonHash{'HMMpred_e-value'} = $hmmpredEValue;
	$jsonHash{'Phyre2_server_link'} = $pathToResults;
	$jsonHash{'predicted'} = $predicted;
	$jsonObj = encode_json(\%jsonHash);

	# Output results
	print $cgiObj->header('application/json');
	print $jsonObj;
}
	



