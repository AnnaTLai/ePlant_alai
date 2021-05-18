#!/usr/bin/perl -wT

use CGI qw/:standard/;
use CGI::Carp qw(fatalsToBrowser);
use JSON;
use File::Temp;
use Data::Dumper;


# Set PATH and remove some environment variables for running in taint mode (because of GET calls? also, necessary to delete parameters? check hash syntax?)
$ENV{ 'PATH' } = '/bin:/usr/bin:/usr/local/bin';
delete @ENV{ 'IFS', 'CDPATH', 'ENV', 'BASH_ENV' };



# Expect fixed to 1*10^-10

my $cgiobject = new CGI;
my $FASTAsubmit = $cgiobject->param('FASTAseq');
my $FASTAsubmit_clean;
my $FASTAfile = File::Temp->new(SUFFIX => ".fasta");
my %Pfam_hits = ();


print 'Content-type: text/html'."\n\n";

sanitizeQuery();
Pfam_HMMSCAN();
printJSON();

exit 0;


# =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=

sub sanitizeQuery {

	$FASTAsubmit =~ s/\n//g;
	$FASTAsubmit =~ s/\r//g;
	$FASTAsubmit =~ s/<br>//g;
	
	#print $FASTAsubmit;
	
	####
	# routine to check for common 20 letter amino acid library only
	####
	
	my @tempfasta = split(//,$FASTAsubmit);            # note array indices start at 0, add 1 when referencing to this array to get actual seq position
    
	if ((scalar(@tempfasta)) > 5000) { die "Maximum character length of 5000\n"; }
	
	if ((scalar(@tempfasta)) == 0) { die 'Please submit protein sequence data using single-letter codes for the 20 common amino acids (all caps)'."\n"; }
	
    foreach my $char (@tempfasta) {
        
		#print $char."\n";
		
        if ($char eq 'A' ||   #check fasta for common 20 amino acid library
            $char eq 'C' ||
            $char eq 'D' ||
            $char eq 'E' ||
            $char eq 'F' ||
            $char eq 'G' ||
            $char eq 'H' ||
            $char eq 'I' ||
            $char eq 'K' ||
            $char eq 'L' ||
            $char eq 'M' ||
            $char eq 'N' ||
            $char eq 'P' ||
            $char eq 'Q' ||
            $char eq 'R' ||
            $char eq 'S' ||
            $char eq 'T' ||
            $char eq 'V' ||
            $char eq 'W' ||
            $char eq 'Y') { next; }
        
        else { die 'Please submit one-letter codes for the 20 common amino acids (all caps)'."\n"; }
    }                                        
	
	if ($FASTAsubmit =~ /(\w*)/) { $FASTAsubmit_clean = $1; }
	#print $FASTAsubmit_clean;
	
	open (FASTAsubmit, ">$FASTAfile") || die "Failed to write temp FASTA submission file\n";
	print FASTAsubmit '>querySEQ'."\n";
	print FASTAsubmit $FASTAsubmit;
	close FASTAsubmit || die "Failed to close temp FASTA submission file\n";

}




sub Pfam_HMMSCAN {
	
	# populate Pfam domain annotations
	# good lord man, move this to mysql...!
	
	my %Pfam_Annots;

	open (PfamAnnots, "</DATA/Pfam/PfamHMM/Pfam-A.annots") || die "Failed to open Pfam annotations file\n";
	
	# PF10417.4	1-cysPrx_C	C-terminal domain of 1-Cys peroxiredoxin	 This is the C-terminal domain of...
	
	while (<PfamAnnots>) {
		
		chomp $_;
		
		my @line = split(/\t/,$_);
		
		$Pfam_Annots{$line[0]}[0] = $line[1];
		$Pfam_Annots{$line[0]}[1] = $line[2];
		$Pfam_Annots{$line[0]}[2] = $line[3];
	
	}
	
	close PfamAnnots || die "Failed to close temp results file\n";
	
	
	
	my $tempPfamResults = File::Temp->new();
	
	my $hmmscanCMD = 'hmmscan --domtblout '.$tempPfamResults.' --cpu 4 --acc --noali -E 0.0000000001 /DATA/Pfam/PfamHMM/Pfam-A.hmm '.$FASTAfile;
	
	my $tempResults = `$hmmscanCMD`;
	
	open (PfamResults, "<$tempPfamResults") || die "Failed to open temp results file\n";
	
	##                                                                            --- full sequence --- -------------- this domain -------------   hmm coord   ali coord   env coord
	## target name        accession   tlen query name           accession   qlen   E-value  score  bias   #  of  c-Evalue  i-Evalue  score  bias  from    to  from    to  from    to  acc description of target
	##------------------- ---------- ----- -------------------- ---------- ----- --------- ------ ----- --- --- --------- --------- ------ ----- ----- ----- ----- ----- ----- ----- ---- ---------------------
	#WHEP-TRS             PF00458.15    56 querySeq             -           1534  4.5e-247  798.0 143.3   1  12   2.4e-26   1.2e-22   79.3   2.8     1    55   177   232   177   233 0.95 WHEP-TRS domain
	
	while (<PfamResults>) {
		
		#%Pfam_hits
		
		chomp $_;
		if ($_ =~ /\#/) { next; }
		
		my @tempLine = split(/ +/,$_);
		
		my $tempName = $tempLine[0];
		my $tempAcc = $tempLine[1];
		my $tempE = $tempLine[12];
		my $tempStart = $tempLine[19];
		my $tempEnd = $tempLine[20];
		my $tempDesc = $tempLine[22];

		#print $tempName."\t".$tempAcc."\t".$tempE."\t".$tempStart."\t".$tempEnd."\t".$tempDesc."\n";
		
		if (exists($Pfam_hits{$tempAcc})) {		# for handling multiple domains mapping to same accession, eg repetitive domains
			
			my $tempIndex = 1 + scalar(@{$Pfam_hits{$tempAcc}});
			${$Pfam_hits{$tempAcc}}[$tempIndex][0] = $tempName;
			${$Pfam_hits{$tempAcc}}[$tempIndex][1] = $tempE;
			${$Pfam_hits{$tempAcc}}[$tempIndex][2] = $tempStart;
			${$Pfam_hits{$tempAcc}}[$tempIndex][3] = $tempEnd;
			${$Pfam_hits{$tempAcc}}[$tempIndex][4] = $tempDesc;
			#${$Pfam_hits{$tempAcc}}[$tempIndex][5] = $Pfam_Annots{$tempAcc}[2];
			my $temp_annot = $Pfam_Annots{$tempAcc}[2];
			#if ($temp_annot ne 'NA_') { $temp_annot =~ s/(.{1,60})/$1<br>/gs; }	# add <br> after 60 characters
			${$Pfam_hits{$tempAcc}}[$tempIndex][5] = $temp_annot;
			
		}
		
		else {
			
			${$Pfam_hits{$tempAcc}}[0][0] = $tempName;
			${$Pfam_hits{$tempAcc}}[0][1] = $tempE;
			${$Pfam_hits{$tempAcc}}[0][2] = $tempStart;
			${$Pfam_hits{$tempAcc}}[0][3] = $tempEnd;
			${$Pfam_hits{$tempAcc}}[0][4] = $tempDesc;
			#${$Pfam_hits{$tempAcc}}[0][5] = $Pfam_Annots{$tempAcc}[2];
			my $temp_annot = $Pfam_Annots{$tempAcc}[2];
			#$temp_annot =~ s/(.{1,60})/$1<br>/gs;	# add <br> after 60 characters
			${$Pfam_hits{$tempAcc}}[0][5] = $temp_annot;
			
			$Pfam_ranges{$tempACC}{'start'} = $tempStart;
			$Pfam_ranges{$tempACC}{'end'} = $tempEnd;
			$Pfam_ranges{$tempACC}{'evalue'} = $tempE;
		}
	}
	
	close PfamResults || die "Failed to close temp results file\n";
	
	
	# for some reason, undefined array values are inserted in the above parsing when there are multiple instances of the same domain... removed below:
	
	foreach my $PfamACC (keys %Pfam_hits) {
		
		my @temp_array = grep defined, @{$Pfam_hits{$PfamACC}};
		
		@{$Pfam_hits{$PfamACC}} = @temp_array;
	}
}



sub printJSON {

	#Geoffrey my json has this format (domain name, start index, end index):
	#[{"domainName":"Some Domain 1","startIndex":1,"endIndex":259},{"domainName":"Some another domain2","startIndex":258,"endIndex":515}]
	
	my %Pfam_parsed;
	
	foreach my $PfamACC (keys %Pfam_hits) {
		
		for (my $x = 0; $x < scalar(@{$Pfam_hits{$PfamACC}}); $x++) {
		
			my $uniqueID = $PfamACC.'_'.$x;
			
			#print $PfamACC."\t".$first_res."\t".$last_res."\n";
			
			$Pfam_parsed{$uniqueID}{'domainName'} = $PfamACC;
			$Pfam_parsed{$uniqueID}{'PfamAnnot'} = $Pfam_hits{$PfamACC}[$x][4];
			$Pfam_parsed{$uniqueID}{'Expect'} = $Pfam_hits{$PfamACC}[$x][1];
			$Pfam_parsed{$uniqueID}{'startIndex'} = $Pfam_hits{$PfamACC}[$x][2];
			$Pfam_parsed{$uniqueID}{'endIndex'} = $Pfam_hits{$PfamACC}[$x][3];
		}
	}

	my $json = encode_json \%Pfam_parsed;
	
	print $json;
}
