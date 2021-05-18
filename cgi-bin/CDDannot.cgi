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
my %CDDhits = ();


print 'Content-type: text/html'."\n\n";

sanitizeQuery();
CDD_RPS();
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




sub CDD_RPS {
	
	my $rpsbprocResults = File::Temp->new();
	
	#my $rpsbprocCMD = 'rpsblast -query '.$TempFASTA.' -db /DATA/CDD3D/NCBI-CDD/Cdd_NCBI -evalue 0.0001 -outfmt 5 | rpsbproc -m full -t feats -o '.$rpsbprocResults;
	#my $rpsbprocCMD = 'rpsblast -query '.$FASTAfile.' -db /DATA/CDD3D/NCBI-CDD/Cdd_NCBI -evalue 0.0001 -outfmt 5 | rpsbproc -m full -t feats -o '.$rpsbprocResults;
	my $rpsbprocCMD = 'rpsblast+ -query '.$FASTAfile.' -db /DATA/CDD3D/NCBI-CDD/Cdd_NCBI -evalue 0.0001 -outfmt 5 | rpsbproc -m full -t feats -o '.$rpsbprocResults;
	
	my $results = `$rpsbprocCMD`;

	open (RESULTS, "<$rpsbprocResults") || die "Failed to open results file\n";

	#print 'Cdd_NCBI Results'."\n";
	#print $rpsbprocCMD."\n";

	while (<RESULTS>) {

		#SITES
		#1	Query_1	Specific	ADP binding site	G27,S28,G29,K30,T31,T32,R127,X134,L180	9	9	238260
	
		chomp $_;
	
		#print $_."\n";
	
		if ($_ =~ /(1)(\t)(Query_1)(\t)(Specific)(\t)(.*)/) {
	
			my $line = $7;
			my @temp_results = split(/\t/,$line);
		
			$CDDhits{$temp_results[0].'_'.$temp_results[4]} = $temp_results[1];
		}
	}
	
	close RESULTS || die "Failed to close results file\n";
}



sub printJSON {

	#Geoffrey my json has this format (domain name, start index, end index):
	#[{"domainName":"Some Domain 1","startIndex":1,"endIndex":259},{"domainName":"Some another domain2","startIndex":258,"endIndex":515}]
	
	#my %CDD_parsed;
	
	#print Dumper(%CDDhits);
	
	#foreach my $desc (keys %CDDhits) {
	#	print $CDDhits{$desc}.'<br>';
	#}

	my $json = encode_json \%CDDhits;
	
	print $json;
}
