// THIS FILE BUILDS THE CLASSIFICATION TREE

// Classification tree stuff...

// Set Size
var elmnt = document.getElementById("classificationView");

var margin = {top: 20, right: 150, bottom: 120, left: 100},
width =window.parent.document.body.clientWidth*0.7; //elmnt.clientWidth; - margin.right - margin.left,
var height = Math.min(500, window.parent.document.body.clientHeight*0.6- margin.top - margin.bottom) ;
	$("#classificationView-geneList-body").css({'height':height-100});
// Tree Settings
var i = 0,
duration = 750,
root;

var currentNode;

var tree = d3.layout.tree()
.size([height, width]);

var diagonal = d3.svg.diagonal()
.projection(function(d) { return [d.y, d.x]; });

// Create SVG element
var svg = d3.select("#classificationView").append("svg")
.attr("width", width + margin.right + margin.left)
.attr("height", height )
.append("g")
.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// Load Data
d3.json("data/classificationCodes.json", function(error, data) {
	if (error) throw error;
	
	root = data;
	root.x0 = height / 2;
	root.y0 = 0;
	
	function collapse(d) {
		if (d.children) {
			d._children = d.children;
			d._children.forEach(collapse);
			d.children = null;
		}
	}
	
	root.children.forEach(collapse);
	update(root);
	currentNode = root;
});

// Function for updating tree when clicked
function update(source) {
	
	// Compute the new tree layout.
	var nodes = tree.nodes(root).reverse(),
	links = tree.links(nodes);
	
	// Set positions of each layer of tree... (strangely, we use y instead of x here...)
	nodes.forEach(function(d) { 
		// each layer is 180 pixels apart
		d.y = d.depth * (width/7); 
		// except for layer 4 (the gene list) which should go to edge of screen
		if (d.depth == 4) {
			d.y = (width/7)*6;
		}
		
	});
	
	
	// Update the nodes…
	var node = svg.selectAll("g.node")
	.data(nodes, function(d) { return d.id || (d.id = ++i); });
	
	// Enter any new nodes at the parent's previous position.
	var nodeEnter = node.enter().append("g")
	.attr("class", "node")
	.attr("transform", function(d) { return "translate(" + source.y0 + "," + source.x0 + ")"; })
	.on("click", click);
	
	
	// Append circles
	nodeEnter.append("circle")
	.attr("r", 1e-6)
	.style("fill", function(d) { return d._children ? "#99CC00" : "#fff"; })
	.on("mouseover", function(d) {
		d3.select(this).style("stroke", "#999999").style("stroke-width", "3px");
	})                  
	.on("mouseout", function(d) {
		d3.select(this).style("stroke", "#99CC00").style("stroke-width", "1.5px");
	});
	
	
	// Append labels
	nodeEnter.append("text")
	.attr("text-anchor", function(d) {
		if (d.children || d._children) {
			return "middle"
		}
		else {
			return "start"
		}
	})
	.attr("x", function(d) { return ((d.children || d._children) && d.depth < 3) ? -0 : 15; })
	.attr("dy", function(d) {
		return ((d.children || d._children) && d.depth < 3) ? "-1em" : ".35em"
	})
	.text(function(d) { return d.name; })
	.style("fill-opacity", 1e-6);
	
	
	
	// Transition nodes to their new positions
	var nodeUpdate = node.transition()
	.duration(duration)
	.attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; });
	
	nodeUpdate.select("circle")
	.attr("r", function(d) { return d._children ? 8 : 4.5; })
	.style("fill", function(d) { return d._children ? "#99CC00" : "#fff"; });
	
	nodeUpdate.select("text")
	.attr("text-anchor", function(d) { 
		//console.log(d);
		if ((d._children || d.children) && d.depth < 3) {
			return "middle"
		}
		else {
			return "start"
		}
	})
	// adjust label placement if needed
	.attr("x", function(d) {
		if ((d.children || d._children) && d.depth < 3) {
			return 0;
		} 
		else if (d.children && d.depth == 3) {
			return 15;
		} 
		else {
			return 15;
		}
	})
	.attr("dy", function(d) {
		if (d.children || d.depth < 3) {
			return "-1em";
		} 
		else {
			return ".35em";
		}
	})
	.style("font-weight", function(d) {
		if (d.children) {
			return "600";
		} 
		else {
			return "300";
		}
	})
	.style("fill-opacity", 1);
	
	// Transition exiting nodes to the parent's new position.
	var nodeExit = node.exit().transition()
	.duration(duration)
	.attr("transform", function(d) { return "translate(" + source.y + "," + source.x + ")"; })
	.remove();
	
	nodeExit.select("circle")
	.attr("r", 1e-6);
	
	nodeExit.select("text")
	.style("fill-opacity", 1e-6);
	
	// Update the links…
	var link = svg.selectAll("path.link")
	.data(links, function(d) { return d.target.id; });
	
	// Enter any new links at the parent's previous position.
	link.enter().insert("path", "g")
	.attr("class", "link")
	.attr("d", function(d) {
		var o = {x: source.x0, y: source.y0};
		return diagonal({source: o, target: o});
	});
	
	// Transition links to their new position.
	link.transition()
	.duration(duration)
	.attr("d", diagonal);
	
	// Transition exiting nodes to the parent's new position.
	link.exit().transition()
	.duration(duration)
	.attr("d", function(d) {
		var o = {x: source.x, y: source.y};
		return diagonal({source: o, target: o});
	})
	.remove();
	
	// Stash the old positions for transition.
	nodes.forEach(function(d) {
		d.x0 = d.x;
		d.y0 = d.y;
	});
}


// Toggle children on click.
function click(d) {
	if (d.children) {
		d._children = d.children;
		d.children = null;
		} else {
		d.children = d._children;
		d._children = null;
		// open the gene list
		if (d.depth == 3) {
			//console.log(d);
			showGeneList(d);
		}
	}
	// If the node has a parent, then collapse its child nodes
	// except for this clicked node.
	if (d.parent) {
		d.parent.children.forEach(function(element) {
			if (d !== element) {
				collapse(element);
				// close the gene list
				hideGeneList();
			}
		});
	}
	update(d);
	currentNode = d;
}

// Collapse nodes function
function collapse(d) {
	if (d.children) {
		d._children = d.children;
		d._children.forEach(collapse);
		d.children = null;
		hideGeneList();
	}
}

// Open gene list function
function showGeneList(d) {
	setTimeout(function() {
		$("#classificationView-geneList-container").removeClass("hide bounceOutUp");
		populateGeneList(d);
		$("#classificationView-geneList-container").addClass("show bounceInDown");
	}, 500);
}

// Hide gene list function
function hideGeneList() {
	$("#classificationView-geneList-container").addClass("bounceOutUp");
	setTimeout(function() {
		$("#classificationView-geneList-container").addClass("hide");
	}, 500);
	
}

// Populate gene list
function populateGeneList(d) {
	
	//console.log(d);
	$("#classificationView-geneList-header").text("Phenotype Group: "+d.symbol);
	$("#classificationView-geneList-body").text("");
	// find genes in allPhenotypeData that have matching symbol in column 8
	var results = searchArrayForValue(8, d.symbol);
	
	// add "total found" line
	$("#classificationView-geneList-body").append('');
	$("#classificationView-geneList-body").append("<span id='classificationView-genelist-totalFound' class='phenotype-geneList-totalFound'><input type='button' id='classificationView-geneList-selectAllButton' class='phenotype-selectAllButton btn btn-xs' onclick='classificationView_selectAllGenes();' value='Select All' /> "+results.length+" genes found</span>");
	
	// add lines to gene list
	for (var i=0; i< results.length; i++) {
		var geneElement = '<div class="phenotype-geneElement" id="classificationView-'+allPhenotypeData[results[i]][1]+'">';
		geneElement += '<img src="images/info-small.png" class="phenotype-infoIcon" id="cv-info-'+allPhenotypeData[results[i]][1]+'"onmouseover="showGeneInfoPopup(this);">';
		geneElement += '<input type="checkbox" class="phenotype-checkbox" id="cv-'+allPhenotypeData[results[i]][1]+'">';
		geneElement += allPhenotypeData[results[i]][1];
		geneElement += '</div>';
		
		$("#classificationView-geneList-body").append(geneElement);
		
	}
	
}



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
	popupContents += "<td class='phenotype-geneInfoPopup_leftColumn'>Locus</td>";
	popupContents += "<td class='phenotype-geneInfoPopup_rightColumn' style='font-weight:600'>"+locus+"</td>";
	popupContents += "</tr>";
	// alias
	popupContents += "<tr>";
	popupContents += "<td class='phenotype-geneInfoPopup_leftColumn'>Aliases</td>";
	popupContents += "<td class='phenotype-geneInfoPopup_rightColumn'>"+alias+"</td>";
	popupContents += "</tr>";
	// full gene name
	popupContents += "<tr>";
	popupContents += "<td class='phenotype-geneInfoPopup_leftColumn'>Full Gene Name</td>";
	popupContents += "<td class='phenotype-geneInfoPopup_rightColumn'>"+fullGeneName+"</td>";
	popupContents += "</tr>";
	// confirmed
	popupContents += "<tr>";
	popupContents += "<td class='phenotype-geneInfoPopup_leftColumn'>Confirmed</td>";
	popupContents += "<td class='phenotype-geneInfoPopup_rightColumn'>"+confirmed+"</td>";
	popupContents += "</tr>";
	// Description of mutant phenotype
	popupContents += "<tr>";
	popupContents += "<td class='phenotype-geneInfoPopup_leftColumn'>Description of mutant phenotype</td>";
	popupContents += "<td class='phenotype-geneInfoPopup_rightColumn' style='font-weight:600'>"+descriptionOfMutantPhenotype+"</td>";
	popupContents += "</tr>";
	// reference lab
	popupContents += "<tr>";
	popupContents += "<td class='phenotype-geneInfoPopup_leftColumn'>Reference Lab</td>";
	popupContents += "<td class='phenotype-geneInfoPopup_rightColumn'>"+referenceLab+"</td>";
	popupContents += "</tr>";
	// Publication date
	popupContents += "<tr>";
	popupContents += "<td class='phenotype-geneInfoPopup_leftColumn'>Publication Date</td>";
	popupContents += "<td class='phenotype-geneInfoPopup_rightColumn'>"+publicationDate+"</td>";
	popupContents += "</tr>";
	// Publication date
	popupContents += "<tr>";
	popupContents += "<td class='phenotype-geneInfoPopup_leftColumn'>Genetic Redundancy</td>";
	popupContents += "<td class='phenotype-geneInfoPopup_rightColumn'>"+geneticRedundancy+"</td>";
	popupContents += "</tr>";
	// BLASP E-value to Top Match 
	popupContents += "<tr>";
	popupContents += "<td class='phenotype-geneInfoPopup_leftColumn'>BLASP E-value to Top Match </td>";
	popupContents += "<td class='phenotype-geneInfoPopup_rightColumn'>"+BLASPeValuetoTopMatch+"</td>";
	popupContents += "</tr>";
	// top Arabidopsis match
	popupContents += "<tr>";
	popupContents += "<td class='phenotype-geneInfoPopup_leftColumn'>Top Arabidopsis Match</td>";
	popupContents += "<td class='phenotype-geneInfoPopup_rightColumn'>"+topArabidopsisMatch+"</td>";
	popupContents += "</tr>";
	// predicted function of gene product 
	popupContents += "<tr>";
	popupContents += "<td class='phenotype-geneInfoPopup_leftColumn'>Predicted Function of Gene Product </td>";
	popupContents += "<td class='phenotype-geneInfoPopup_rightColumn'>"+predictedFunctionOfGeneProduct+"</td>";
	popupContents += "</tr>";
	// close the table
	popupContents += "</table>"
	
	// add contents to the box
	$("#classificationView-geneInfoPopup").html(popupContents);
	
	/*/ set position
		var offset = $("#"+item.id).position();
		var panelHeight = $("#classificationView-geneInfoPopup").height();
		$("#classificationView-geneInfoPopup").css("top", offset.top-panelHeight);
	*/
	
	// display popup
	$("#classificationView-geneInfoPopup").removeClass("fadeOut hide").addClass("fadeIn");
}

function hideGeneInfoPopup() {
	$("#classificationView-geneInfoPopup").removeClass("fadeIn").addClass("fadeOut");
}

function classificationView_selectAllGenes() {
	if ($('#classificationView-geneList-selectAllButton').val() == "Select All") {
		$('input:checkbox').prop('checked',true);
		$('#classificationView-geneList-selectAllButton').val('Unselect All')
	}
	else {
		$('input:checkbox').prop('checked',false);
		$('#classificationView-geneList-selectAllButton').val('Select All')
	}
}

function classificationView_loadGenes() {
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
		//alert("Downloading: "+selected);
		downloadSelectedGenes(selected);
	}
}



/* TERMINAL DRAWINGS SELECTOR STUFF */
// dynamically activate list items when clicked
$(".nav.nav-pills li").on("click",function(){
	$(".nav.nav-pills li").removeClass("active");
	$(this).addClass("active");
});
var resize = function() {
	width =window.parent.document.body.clientWidth*0.7;
	height = Math.min(500, window.parent.document.body.clientHeight*0.6- margin.top - margin.bottom);
	$("#classificationView svg").attr("width", width + margin.right + margin.left)
	.attr("height", height );
  	tree.size([height, width]);
  	if(currentNode){
		update(currentNode);
	}
	$("#classificationView-geneList-body").css({'height':height-100});
};
$( window ).resize(resize);
