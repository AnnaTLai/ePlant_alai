// THIS FILE HANDLES THE TERMINAL DRAWING TAB

// dynamically activate list items when clicked
$(".nav.nav-pills li").on("click",function(){
  $(".nav.nav-pills li").removeClass("active");
  $(this).addClass("active");
});


/* TERMINAL DRAWINGS SELECTOR STUFF */

function openTerminalDrawingGeneList(id) {

  // change border color of active tile
  if ($("#"+id).hasClass("terminalDrawingActive")) {
    $(".terminalDrawing").removeClass("terminalDrawingActive");
    closeTerminalDrawingGeneList();
  }
  else {
    $(".terminalDrawing").removeClass("terminalDrawingActive");
    $("#"+id).addClass("terminalDrawingActive");
    $("#terminalDrawing-geneList-container").addClass("hide").removeClass("bounceOutUp show bounceInDown");

    // open gene list
    setTimeout(function() {
      populateTerminalDrawingGeneList(id);

      $("#terminalDrawing-geneList-container").addClass("show bounceInDown");
    }, 250);
  
  }
}

// Hide gene list function
function closeTerminalDrawingGeneList() {
  $("#terminalDrawing-geneList-container").addClass("bounceOutUp");
  $(".terminalDrawing").removeClass("terminalDrawingActive");
  // hide gene list
  setTimeout(function() {
          $("#terminalDrawing-geneList-container").removeClass("show bounceInDown bounceOutUp");
          $("#terminalDrawing-geneList-container").addClass("hide");
  }, 500);
}



// Populate gene list
function populateTerminalDrawingGeneList(id) {
  //console.log(id);
  $("#terminalDrawing-geneList-header").text("Terminal Drawing Group: "+id);
  $("#terminalDrawing-geneList-body").text("");
  
  /*
  // find genes in allPhenotypeData that have matching symbol in column 8
  var results = searchArrayForValue(8, d.symbol);

  // add "total found" line
  $("#terminalDrawing-geneList-body").append('');
  $("#terminalDrawing-geneList-body").append("<span id='terminalDrawing-genelist-totalFound'><input type='button' id='terminalDrawing-geneList-selectAllButton' class='btn btn-xs' onclick='terminalDrawing_selectAllGenes();' value='Select All' /> "+results.length+" genes found</span>");

  // add lines to gene list
  for (var i=0; i< results.length; i++) {
    var geneElement = '<div class="terminalDrawing-geneElement" id="terminalDrawing-'+allPhenotypeData[results[i]][1]+'">';
        geneElement += '<img src="images/info-small.png" class="cv-infoIcon" id="cv-info-'+allPhenotypeData[results[i]][1]+'"onmouseover="showGeneInfoPopup(this);">';
        geneElement += '<input type="checkbox" class="cv-checkbox" id="cv-'+allPhenotypeData[results[i]][1]+'">';
        geneElement += allPhenotypeData[results[i]][1];
        geneElement += '</div>';

    $("#terminalDrawing-geneList-body").append(geneElement);

  }
  */

}
/*

// Gene Info Popup
function showGeneInfoPopup(item) {

  // get locus from item.id
  var locus = item.id.substring(8, item.id.length);

  // get information from table based on locus
  var line = searchArrayForValue(1, locus)
  line = line[0];

  var alias = allPhenotypeData[line][2];
  var otherAliases = allPhenotypeData[line][3];
  if (otherAliases != "") {
    alias += "; "+otherAliases;
  }

  var fullGeneName = allPhenotypeData[line][4];
  var confirmed = allPhenotypeData[line][5];
  if (confirmed == "C") {
    confirmed = "Yes";
  }
  else {
    confirmed = "Not confirmed";
  }

  var descriptionOfMutantPhenotype = allPhenotypeData[line][9];
  var referenceLab = allPhenotypeData[line][11];
  var publicationDate = allPhenotypeData[line][12];
  var geneticRedundancy = allPhenotypeData[line][13];
  var BLASPeValuetoTopMatch = allPhenotypeData[line][14];
  var topArabidopsisMatch = allPhenotypeData[line][15];
  var predictedFunctionOfGeneProduct = allPhenotypeData[line][17];


  // populate popup
  // build a table line by line
  var popupContents =  "<table>";
      // locus
      popupContents += "<tr>";
      popupContents += "<td class='cv-arrow_box_leftColumn'>Locus</td>";
      popupContents += "<td class='cv-arrow_box_rightColumn' style='font-weight:600'>"+locus+"</td>";
      popupContents += "</tr>";
      // alias
      popupContents += "<tr>";
      popupContents += "<td class='cv-arrow_box_leftColumn'>Aliases</td>";
      popupContents += "<td class='cv-arrow_box_rightColumn'>"+alias+"</td>";
      popupContents += "</tr>";
      // full gene name
      popupContents += "<tr>";
      popupContents += "<td class='cv-arrow_box_leftColumn'>Full Gene Name</td>";
      popupContents += "<td class='cv-arrow_box_rightColumn'>"+fullGeneName+"</td>";
      popupContents += "</tr>";
      // confirmed
      popupContents += "<tr>";
      popupContents += "<td class='cv-arrow_box_leftColumn'>Confirmed</td>";
      popupContents += "<td class='cv-arrow_box_rightColumn'>"+confirmed+"</td>";
      popupContents += "</tr>";
      // Description of mutant phenotype
      popupContents += "<tr>";
      popupContents += "<td class='cv-arrow_box_leftColumn'>Description of mutant phenotype</td>";
      popupContents += "<td class='cv-arrow_box_rightColumn' style='font-weight:600'>"+descriptionOfMutantPhenotype+"</td>";
      popupContents += "</tr>";
      // reference lab
      popupContents += "<tr>";
      popupContents += "<td class='cv-arrow_box_leftColumn'>Reference Lab</td>";
      popupContents += "<td class='cv-arrow_box_rightColumn'>"+referenceLab+"</td>";
      popupContents += "</tr>";
      // Publication date
      popupContents += "<tr>";
      popupContents += "<td class='cv-arrow_box_leftColumn'>Publication Date</td>";
      popupContents += "<td class='cv-arrow_box_rightColumn'>"+publicationDate+"</td>";
      popupContents += "</tr>";
      // Publication date
      popupContents += "<tr>";
      popupContents += "<td class='cv-arrow_box_leftColumn'>Genetic Redundancy</td>";
      popupContents += "<td class='cv-arrow_box_rightColumn'>"+geneticRedundancy+"</td>";
      popupContents += "</tr>";
     // BLASP E-value to Top Match 
      popupContents += "<tr>";
      popupContents += "<td class='cv-arrow_box_leftColumn'>BLASP E-value to Top Match </td>";
      popupContents += "<td class='cv-arrow_box_rightColumn'>"+BLASPeValuetoTopMatch+"</td>";
      popupContents += "</tr>";
      // top Arabidopsis match
      popupContents += "<tr>";
      popupContents += "<td class='cv-arrow_box_leftColumn'>Top Arabidopsis Match</td>";
      popupContents += "<td class='cv-arrow_box_rightColumn'>"+topArabidopsisMatch+"</td>";
      popupContents += "</tr>";
      // predicted function of gene product 
      popupContents += "<tr>";
      popupContents += "<td class='cv-arrow_box_leftColumn'>Predicted Function of Gene Product </td>";
      popupContents += "<td class='cv-arrow_box_rightColumn'>"+predictedFunctionOfGeneProduct+"</td>";
      popupContents += "</tr>";
      // close the table
      popupContents += "</table>"

  // add contents to the box
  $("#classificationView-geneInfoPopup").html(popupContents);
  $("#terminalDrawing-geneInfoPopup").html(popupContents);

*/
  /*/ set position
  var offset = $("#"+item.id).position();
  var panelHeight = $("#classificationView-geneInfoPopup").height();
  $("#classificationView-geneInfoPopup").css("top", offset.top-panelHeight);
  */

/*
  // display popup
  $("#classificationView-geneInfoPopup").removeClass("fadeOut hide").addClass("fadeIn");
  $("#terminalDrawing-geneInfoPopup").removeClass("fadeOut hide").addClass("fadeIn");

}

function terminalDrawing_hideGeneInfoPopup() {
  $("#terminalDrawing-geneInfoPopup").removeClass("fadeIn").addClass("fadeOut");
}

function terminalDrawing_selectAllGenes() {
  if ($('#classificationView-geneList-selectAllButton').val() == "Select All") {
      $('input:checkbox').prop('checked',true);
      $('#classificationView-geneList-selectAllButton').val('Unselect All')
    }
  else {
      $('input:checkbox').prop('checked',false);
      $('#classificationView-geneList-selectAllButton').val('Select All')
    }
}

function terminalDrawing_loadGenes() {
  var selected = [];
    $("#classificationView-geneList-body input:checked").each(function() {
      var locus = $(this).attr('id');
      locus = locus.substring(3,locus.length);
      selected.push(locus);
    });
    
    if (selected.length < 1) {
      alert("Select some genes first.")
    }
    else {
      // SEND THIS TO THE GENE LOADER IN EPLANT
      alert("Downloading: "+selected);
    }
}
*/
