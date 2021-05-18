// initialize ClearSearch function
$(function() {
    // init plugin (with callback)
    $('.clearable').clearSearch({ callback: function() { console.log("cleared"); } } );
	
    // update value
    $('.clearable').val('').change();
    
    // change width
    //$('.clearable').width('200px').change();
});



function searchArrayForValue(column,value) {
	// this function returns the index number of the data array in which a 'value' is present in a defined 'column'
	var results = [];
	for (var i=0; i<allPhenotypeData.length; i++) {
		var cellContents = allPhenotypeData[i][column].split(', ');
		for (var j=0; j< cellContents.length; j++) {
			if (cellContents[j] == value) {
				results.push(i);
			}
		}
	}
	return results;
}

// initialize pill selector
$('#terminalDrawingsTabSelector a').click(function (e) {
	e.preventDefault()
	$(this).tab('show')
})


function downloadSelectedGenes(str) {
	
	var geneList = str.toString().split(",");
	if (geneList.length < 1) {
		alert("You need to select some genes first.");
	}
	else if(geneList.length <10){
		/*var outputFile = [];
			for (var i=0; i<geneList.length; i++) {
			lineNumber = searchArrayForValue(1, geneList[i]);
			outputFile.push(allPhenotypeData[lineNumber] + "\n");
			}
			// fileSaver plugin from: https://github.com/eligrey/FileSaver.js
			var blob = new Blob(outputFile, {type: "text/plain;charset=utf-8"});
		saveAs(blob, "PhenotypeList.txt");*/
		art.dialog.data('mutantPhenotypeSelectorGenes',geneList.join(','));
		art.dialog.close();
	}
	else{
		

		var errorInfo='It may take a while to load that many genes. Are you sure?';
		var dialog = window.top.art.dialog({
			content: errorInfo,
			width: 600,
			minHeight: 0,
			resizable: false,
			draggable: false,
			lock: true,
			ok :function(event, ui) {
				art.dialog.data('mutantPhenotypeSelectorGenes',geneList.join(','));
				art.dialog.close();
			},
			cancelVal: 'Back to Selection Menu',
			cancel: true
		})
	}
	
	
}