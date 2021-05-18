(function() {

/**
 * Eplant.Views.ExperimentalView class
 * Coded by Hans Yu
 * UI designed by Jamie Waese
 *
 * ePlant View for browsing gene expression data of plant tissues during development as eFP.
 *
 * @constructor
 * @augments Eplant.Experimental.EFPView
 * @param {Eplant.GeneticElement} geneticElement The GeneticElement associated with this view.
 */
Eplant.Views.BioticStressErysipheorontiiView = function(geneticElement) {
	// Get constructor
	var constructor = Eplant.Views.BioticStressErysipheorontiiView;

	// Call parent constructor
	Eplant.View.call(this,
		constructor.displayName,			// Name of the View visible to the user
		constructor.viewName,
		constructor.hierarchy,			// Hierarchy of the View
		constructor.magnification,			// Magnification level of the View
		constructor.description,			// Description of the View visible to the user
		constructor.citation,			// Citation template of the View
		constructor.activeIconImageURL,		// URL for the active icon image
		constructor.availableIconImageURL,		// URL for the available icon image
		constructor.unavailableIconImageURL // URL for the unavailable icon image
	);
	
	/* Call eFP constructor */ 

	var efpSvgURL = 'data/experiment/efps/BioticStressErysipheorontii/' + geneticElement.species.scientificName.replace(" ", "_") + '.svg';
	var efpXmlURL = 'data/experiment/efps/BioticStressErysipheorontii/' + geneticElement.species.scientificName.replace(" ", "_") + '.xml';
	Eplant.BaseViews.EFPView.call(this, geneticElement, efpSvgURL,efpXmlURL, {
	});
};
ZUI.Util.inheritClass(Eplant.BaseViews.EFPView, Eplant.Views.BioticStressErysipheorontiiView);	// Inherit parent prototype

Eplant.Views.BioticStressErysipheorontiiView.viewName = "BioticStressErysipheorontiiView";
Eplant.Views.BioticStressErysipheorontiiView.displayName = "Biotic Stress Erysiphe orontii eFP";
Eplant.Views.BioticStressErysipheorontiiView.hierarchy = "genetic element";
Eplant.Views.BioticStressErysipheorontiiView.magnification = 35;
Eplant.Views.BioticStressErysipheorontiiView.description = "Biotic Stress Erysiphe orontii eFP";
Eplant.Views.BioticStressErysipheorontiiView.citation = "";
Eplant.Views.BioticStressErysipheorontiiView.activeIconImageURL = "";
Eplant.Views.BioticStressErysipheorontiiView.availableIconImageURL = "";
Eplant.Views.BioticStressErysipheorontiiView.unavailableIconImageURL = "";
    /**
		* Loads eFP definition and data.
	*/
    Eplant.Views.BioticStressErysipheorontiiView.prototype.loadData = function() {
		var efp = this;
		/* Get eFP definition */
		$.ajax({
			type: "GET",
			url: this.xmlURL,
			dataType: "xml",
			success: $.proxy(function(response) {
				var infoXml = $(response).find('info');
				if (infoXml.length > 0) {
					this.infoButton	= new Eplant.ViewSpecificUIButton(
					"img/info.png", // imageSource
					"Additional information about the efp view", // Description
					function(data) { // click
						DialogManager.artDialogDynamic('<p style="font-size:24px">Information for this view</p><br>'+infoXml.html(),{width:'600px'});
						}, { // data
					}
					);
					this.viewSpecificUIButtons.push(this.infoButton);
				}
				this.database = null;
				if($(response).find('view')[0]&&$(response).find('view')[0].attributes['db'])this.database = $(response).find('view')[0].attributes['db'].value;
				
				var webServiceXml = $(response).find('webservice');
				if (webServiceXml.length > 0) {
					this.webService = webServiceXml.text();
					} else {
					if(this.database){
						
						this.webService = "//bar.utoronto.ca/eplant/cgi-bin/plantefp.cgi?datasource="+this.database+"&";
					}
					else{
						
						this.webService = "//bar.utoronto.ca/eplant/cgi-bin/plantefp.cgi?datasource=atgenexp_plus&";
					}
				}
				/* Prepare array for samples loading */
				var samples = [];
				
				/* Create labels */
				//this.labels = $(response).find('labels');
				
				
				/* Create groups */
				this.groups = [];
				var groupsXml = $(response).find('tissue');
				for (var n = 0; n < groupsXml.length; n++) {
					
					/* Get group data */
					var groupData = groupsXml[n];
					
					/* Asher: My solution is to have an if statement to read all control data for each group
						if (typeof groupData.control != 'undefined') {
						alert(groupData.control.id);
						}
					*/
					
					/* Create group object */
					var group = {
						id: groupData.attributes['id'].value,
						name: groupData.attributes['name'].value,
						samples: [],
						ctrlSamples: [],
						source: groupData.source,
						color: Eplant.Color.White,
						isHighlight: false,
						tooltip: null,
						fillColor: Eplant.Color.White,
						ePlantLink: groupData.attributes['ePlantLink']?groupData.attributes['ePlantLink'].value:null,
						link: $('link', groupData).attr('url'),
						database: this.database?this.database:''
					};
					/* Prepare wrapper object for proxy */
					var wrapper = {
						group: group,
						eFPView: this
					};
					
					/* Prepare samples */
					var samplesXml = $('sample', groupData);
					for (var m = 0; m < samplesXml.length; m++) {
						var sample = {
							name: samplesXml[m].attributes['name'].value,
							value: null
						};
						
						/* Add it the samples array */
						samples.push(sample);
						
						/* Add to group samples */
						group.samples.push(sample);
					}
					
					/* Asher: Prepare samples for controls if it exists in the group */
					var controlsXml = $('sample', groupsXml);
					if (controlsXml !== undefined) {
						for (var m = 0; m < controlsXml.length; m++) {
							var sample = {
								name: controlsXml[m].attributes['name'].value,
								value: null
							};
							
							/* Add it the samples array */
							samples.push(sample);
							group.ctrlSamples.push(sample);
						}
					}
					
					/* Append group to array */
					this.groups.push(group);
					
				}
				this.InfoButtons = [];
				var InfoButtonsXml = $(response).find('InfoButton');
				for (var n = 0; n < InfoButtonsXml.length; n++) {
					var InfoButton = {
						id: InfoButtonsXml[n].attributes['id'].value,
						text: InfoButtonsXml[n].attributes['name'].value
					};
					this.InfoButtons.push(InfoButton);
				}
				
				/* Get sample values */
				/* Get sample names */
				var sampleNames = [];
				for (var n = 0; n < samples.length; n++) {
					var sampleName = samples[n].name.replace(/\+/g, "%2B").replace(/ /g,"+");
					if ($.inArray(sampleName, sampleNames) === -1) {
						sampleNames.push(sampleName);
					}
				}
				/* Prepare wrapper for proxy */
				var wrapper = {
					samples: samples,
					eFPView: this
				};
				/* Query */
				$.getJSON(this.webService + "id=" + this.geneticElement.identifier + "&samples=" + JSON.stringify(sampleNames), $.proxy(function(response) {
					/* Match results with samples and copy values to samples */
					for (var n = 0; n < this.samples.length; n++) {
						for (var m = 0; m < response.length; m++) {
							if (this.samples[n].name == response[m].name) {
								this.samples[n].value = Number(response[m].value);
								break;
							}
						}
					}
					
					/* Process values */
					this.eFPView.processValues();
					
					
					
				}, wrapper));
				
				
			}, this)
		});
	};

})();
