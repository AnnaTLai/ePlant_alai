/* Search button autocomplete */

// add new options like this: { label: "xyz", value: "url" },
var autocompleteOptions = [ 
	  { label: "How do I load multiple genes?", value: "help-loadMultipleGenes" },
	  { label: "Is it possible to load more than one gene at a time?", value: "help-loadMultipleGenes" },
	  { label: "I don't know the name of the gene I'm looking for.", value: "help-expressionAngler" },
	  { label: "Why can I only load Arabdiopsis genes?", value: "help-whyArabidopsis" },
	  { label: "What is the Heat Map viewer?", value: "help-heatMapviewer" },
	  { label: "How do I use the heatmap view?", value: "help-heatMapviewer" },
	  { label: "What is the World eFP?", value: "help-worldviewer" },
	  { label: "How do I view natural variation of a gene?", value: "help-worldviewer" },
	  { label: "What is the Plant eFP?", value: "help-plantviewer" },
	  { label: "Arabdiopsis developmental map", value: "help-plantviewer" },
	  { label: "Where do I see gene expression across development?", value: "help-plantviewer" },
	  { label: "What is the Experiment eFP viewer?", value: "help-experimentviewer" },
	  { label: "Where do I see gene expression in specific tissues?", value: "help-plantviewer" },
	  { label: "Where is the Embryo Development eFP?", value: "help-experimentviewer" },
	  { label: "Where is the Guard and Mesyphyl Cell eFP?", value: "help-experimentviewer" },
	  { label: "Where is the Microgametogenesis eFP?", value: "help-experimentviewer" },
	  { label: "Where is the Root eFP?", value: "help-experimentviewer" },
	  { label: "Where is the Stigma and Ovaries eFP?", value: "help-experimentviewer" },
	  { label: "Where is the Chemical Experiment eFP?", value: "help-experimentviewer" },
	  { label: "Where is the Abiotic Stress Experiment eFP?", value: "help-experimentviewer" },
	  { label: "Where is the Xylem and Cork eFP?", value: "help-experimentviewer" },
	  { label: "Where is the Guard Cell Suspension Cell ABA Response with ROS Scavenger eFP?", value: "help-experimentviewer" },
	  { label: "Where is the Stem Epidermis eFP?", value: "help-experimentviewer" },
	  { label: "Where is the Guard Cell and Mutant Wild Type Guard Cell eFP?", value: "help-experimentviewer" },
	  { label: "Where is the Pollen Germination eFP?", value: "help-experimentviewer" },
	  { label: "Where is the Guard Cell Meristemoids eFP?", value: "help-experimentviewer" },
	  { label: "Where is the Shoot Apical Meristem eFP?", value: "help-experimentviewer" },
	  { label: "What is the Cell eFP", value: "help-cellviewer" },
	  { label: "How do I view subcellular localization of genes?", value: "help-cellviewer" },
	  { label: "What is the Chromosome viewer?", value: "help-chromosomeviewer" },
	  { label: "How can I see where my gene is located in the genome?", value: "help-chromosomeviewer" },
	  { label: "What is the Protein Interactons viewer?", value: "help-interactionsviewer" },
	  { label: "How do I view predicted and confirmed protein-protein interactions?", value: "help-interactionsviewer" },
	  { label: "What is the Molecular viewer?", value: "help-molecularviewer" },
	  { label: "I'd like to see a 3D model of the protein structure.", value: "help-molecularviewer" },
	  { label: "What is the Sequence Browser?", value: "help-sequenceBrowser" },
	  { label: "Can I access JBrowse here?", value: "help-sequenceBrowser" },
	  { label: "What are the Links To External Tools?", value: "help-externalTools" },
	  { label: "Does ePlant connect to other services?", value: "help-externalTools" },
	  { label: "How do I adjust the global options?", value: "help-globalOptions" },
	  { label: "How can I turn off the zoom transitions?", value: "help-globalOptions" },
	  { label: "Is it possible to turn off the tool tips?", value: "help-globalOptions" },
	  { label: "Can I save my work session?", value: "help-globalOptions" },
	  { label: "How do I generate a URL link that automatically reloads the page?", value: "help-globalOptions" },
	  { label: "Can I turn off those pesky popups?", value: "help-globalOptions" },
	  { label: "What are view intrusions?", value: "help-globalOptions" },
	  { label: "How do I select a Rapid Serial Visual Presentation mode?", value: "help-whatIsRSVP" },
	  { label: "What is RSVP?", value: "help-whatIsRSVP" },
	  { label: "I want to re-order the genes in my list.", value: "help-sortGenes" },
	  { label: "Is it possible to sort genes by expression level?", value: "help-sortGenes" },
	  { label: "How do I make a copy of a chart?", value: "help-screengrab" },
	  { label: "I want to download a screen capture.", value: "help-screengrab" },
	  { label: "I can't see red.", value: "help-colorPalette" },
	  { label: "How do I change the color gradient?", value: "help-colorPalette" },
	  { label: "Where can I post a comment?", value: "help-comments" },
	  { label: "I'd like to give you some feedback.", value: "help-comments" },
	  { label: "Report an error.", value: "help-bugReport" },
	  { label: "I found a bug.", value: "help-bugReport" },

	  { label: "", value: "help-" },
	  { label: "", value: "help-" },
	  { label: "", value: "help-" },
	  { label: "", value: "help-" }
	  
	 ]

var url;
      
$( "#helpInput" ).autocomplete({
    select: function(event, ui) { 
	        url = ui.item.value; 
	        event.preventDefault(); 
	        $("#helpInput").val(ui.item.label); 
		    $('html, body').animate({
		        scrollTop: $("#"+url).offset().top
		  	  }, 500);
	        $("#"+url).click(); 
		   	},
 	// put the label in the text box, not the value
	focus: function(event, ui) { 
	        url = ui.item.value; 
 	        event.preventDefault(); 
 	        $("#helpInput").val(ui.item.label);},

	source: autocompleteOptions
});


function submitButton() {
	// make sure we have a valid entry
	var valid = false;
	for (var i=0; i<autocompleteOptions.length; i++){
		if (autocompleteOptions[i].label === $('#helpInput').val()) {
			valid = true;
			break;
		}
	}

	if (valid) {
		$('#'+url).click();
	}
	
	else {
		alert("No matches found. Please try again.");
	}
}

