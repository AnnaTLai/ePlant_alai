// THIS FILE BUILDS THE DATA TABLE

// Data table stuff
var allPhenotypeData;
var table;
$.ajax({
    url: "data/192393Table_S2_Final_Revised.csv",
    async: false,
    success: function (csvd) {
        allPhenotypeData = $.csv2Array(csvd);
	},
    dataType: "text",
    complete: function () {
        
		// populate data table here
		table = $('#allPhenotypesTable').DataTable( {
			data: allPhenotypeData,
			columns: [
			{ title: "Select" }, //0
			{ title: "Locus" }, //1
			{ title: "Alias" }, //2
			{ title: "Other Aliases" }, //3
			{ title: "Name" }, //4
			{ title: "Confirmed" }, //5
			{ title: "Group" }, //6
			{ title: "Class" }, //7
			{ title: "Classification" }, //8
			{ title: "Description" }, //9
			{ title: "Gene Identification Method" }, //10
			{ title: "Reference Lab" }, //11
			{ title: "Publication Date" }, //11
			{ title: "Redudancy" }, //13
			{ title: "BLASTP E-Value to Top Match" }, //14
			{ title: "Top Arabidopsis Match" }, //15
			{ title: "Function Class" }, //16
			{ title: "Function" }, //17
			{ title: "MIT Localization" }, //18
			{ title: "CPT Localization" } //19
			],
			columnDefs: [ 
            { orderable: false, className: 'select-checkbox',targets: 0 },
			],
			select: {
				style:    'os',
				selector: 'td:first-child'
			},
			
			orderMulti: false, // fix the error when shift clicking in header
			dom: '<"top">rt<"bottom"iflp><"clear">', // move pagination dropdown to bottom
			lengthMenu: [[5, 10, 25, 50, -1], [5, 10, 25, 50, "All"]],
			displayLength: 5,
			order: [[ 1, 'asc' ]]
			
		} );
		
		// Hide some of the columns in the data file
		table.columns( [ 3, 5, 6, 7, 10, 11, 12, 13, 14, 15, 16, 18, 19 ] ).visible( false, false );
		table.columns.adjust().draw( false ); // adjust column sizing and redraw 
		
		updateRecordsShowingIndicator();
		
		// Add a text input to each header cell
		$('#allPhenotypesTable thead th').each(function() {
			//var title = $('#allPhenotypesTable thead th').eq($(this).index()).text();
			// add search box to all but the first column
			if (this.cellIndex != 0) {
				$(this).append('<br><input type="text" class="columnSearch clearable" placeholder="Search" />');
			}
			// in the first column add a Select All button
			else {
				$(this).append("<span id='tableView-selectAllButtonWrapper' class='hint--right' data-hint='Hold shift while clicking checkboxes to select multiple items'><input type='button' id='tableView-selectAllButton' class='phenotype-selectAllButton btn btn-xs' onclick='tableView_selectAllGenes();' value='Select All'/></span>");
				
			}
		});
		
		// Apply the search function
		table.columns().eq(0).each(function(colIdx) {
			
            $('input', table.column(colIdx).header()).on('keyup change', function() {
				if (this.cellIndex != 0 && event.keyCode != 16) {
					
					table
                    .column(colIdx)
                    .search(this.value)
                    .draw();
					
					updateRecordsShowingIndicator();
					
				}
			});
			
            $('input', table.column(colIdx).header()).on('click', function(e) {
				if (this.cellIndex != 0) {
					e.stopPropagation();
				}
			});
		});
		
		
	}
});


var totalRecords;
var recordsShowing;
// custom search box event listener
$(document).ready(function() {
    var dataTable = $('#allPhenotypesTable').dataTable();
    $("#dataTableSearchBox").keydown(function() {
		if (event.keyCode != 16) { // don't respond to Shift button
			dataTable.fnFilter(this.value);
			updateRecordsShowingIndicator();
		}
	}); 
});



function updateRecordsShowingIndicator() {
	// update the number of records showing
	totalRecords   = $('#allPhenotypesTable').dataTable().fnSettings().fnRecordsTotal();
	recordsShowing = $('#allPhenotypesTable').dataTable().fnSettings().fnRecordsDisplay();
	
	var percent = parseInt(recordsShowing) / parseInt(totalRecords) * 100;
	$("#currentlyDisplayingIndicator").css("width", percent+"%");
	
	$("#currentlyDisplaying").text("Displaying "+Math.round( percent * 10 ) / 10+"% of genes in table")     
}

function tableView_selectAllGenes() {
	
	if ($('#tableView-selectAllButton').val() == "Select All") {
		$('tr').addClass("selected");
		$('#tableView-selectAllButton').val('Unselect All')
	}
	else {
		$('tr').removeClass("selected");
		$('#tableView-selectAllButton').val('Select All')
	}
}

function tableView_downloadSelectedGenes() {
	var selectedGenes = [];
	table.$('.selected').each(function(){
		var locus = $(this).find("td").eq(1).text();
		selectedGenes.push(locus);
	});
	
	if (selectedGenes.length < 1) {
		alert("You need to select some genes first.")
	}
	else {
		//alert("Downloading:\n" + selectedGenes);
		downloadSelectedGenes(selectedGenes);

	}
}