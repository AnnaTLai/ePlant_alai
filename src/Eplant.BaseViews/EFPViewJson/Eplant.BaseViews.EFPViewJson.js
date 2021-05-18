(function() {
	
	/**
		* Eplant.BaseViews.EFPViewJson class
		* Coded by Hans Yu
		* UI designed by Jamie Waese
		*
		* @constructor
		* @augments Eplant.View
		* @param {Eplant.GeneticElement} geneticElement The GeneticElement that this EFPView is associated with.
		* @param {String} efpURL The URL of the EFP definition file.
		* @param {Object} configs Configurations.
		* @param {Boolean} configs.isRelativeEnabled Whether relative mode is enabled.
		* @param {Boolean} configs.isCompareEnabled Whether compare mode is enabled.
		* @param {Boolean} configs.isMaskEnabled Whether masking is enabled.
	*/
	Eplant.BaseViews.EFPViewJson = function(geneticElement, efpURL, configs) {
		/* Attributes */
		this.geneticElement = geneticElement;	// The GeneticElement that this EFPView is associated with
		this.efpURL = efpURL;			// The URL of the EFP definition file
		this.width = null;				// Width of the eFP
		this.height = null;				// Height of the eFP
		this.webService = null;			// URL of the web service for retrieving sample data
		this.outlineVO = null;			// ViewObject for eFP outline
		this.groups = [];				// Array of groups
		this.labels = [];				// Array of labels
		this.paletteButton = null;
		this.modeButton = null;			// Mode ViewSpecificUIButton
		this.compareButton = null;			// Compare ViewSpecificUIButton
		this.maskButton = null;			// Mask ViewSpecificUIButton
		this.isMaskOn = false;			// Whether masking is on
		this.maskThreshold = 1;			// Masking threshold
		this.tagVOs = [];				// Array of tag ViewObjects
		this.updateAnnotationTagsEventListener	// EventListener for update-annotationTags, for updating tags in this view
		this.legend = null;				// Legend object
		this.maskColor = "#B4B4B4";			// Mask color
		this.errorColor = "#FFFFFF";		// Error color
		this.isRelativeEnabled = true;		// Whether relative mode is enabled
		this.isCompareEnabled = true;		// Whether compare mode is enabled
		this.isMaskEnabled = true;			// Whether masking is enabled
		this.isLegendVisible = true;
		this.compareEFPView = null;			// EFP view for comparing to
		this.mode = "absolute";			// EFP mode
		this.tooltipInfo = null;			// Information for creating tooltip
		this.viewGlobalConfigs = {
        	isMaskOn:false, // Whether masking is on
        	maskThreshold:1, // Masking threshold
        	compareEFPView : null, // EFP view for comparing to
			maskColor :  "#B4B4B4", // Mask color
			errorColor : "#FFFFFF", // Error color
        	mode : "absolute", // EFP mode
			left: 0,
			top:0,
			width:'auto',
			height:'auto'
			
		};
		/* Apply configurations */
		if (configs) {
			if (configs.isRelativeEnabled !== undefined) {
				this.isRelativeEnabled = configs.isRelativeEnabled;
			}
			if (configs.isCompareEnabled !== undefined) {
				this.isCompareEnabled = configs.isCompareEnabled;
			}
			if (configs.isMaskEnabled !== undefined) {
				this.isMaskEnabled = configs.isMaskEnabled;
				}
		}
		
		/* Create view-specific UI buttons */
		this.createViewSpecificUIButtons();
		
		/* Load data */
		this.loadData();
		
		/* Create legend */
		this.legend = new Eplant.BaseViews.EFPView.Legend(this);
		this.geneDistributionChart = new Eplant.BaseViews.EFPView.GeneDistributionChart(this);
		
		/* Bind events */
		this.bindEvents();
	};
	ZUI.Util.inheritClass(Eplant.View, Eplant.BaseViews.EFPViewJson);	// Inherit parent prototype
	
	/**
		* Active callback method.
		*
		* @override
	*/
	Eplant.BaseViews.EFPViewJson.prototype.active = function() {
		/* Call parent method */
		Eplant.View.prototype.active.call(this);
		
		/* Attach legend */
        if (this.isLegendVisible) {
            this.legend.attach();
			this.geneDistributionChart.attach();
		}
		/* Update eFP */
		this.updateDisplay();
	};
	
	/**
		* Inactive callback method.
		*
		* @override
	*/
	Eplant.BaseViews.EFPViewJson.prototype.inactive = function() {
		/* Call parent method */
		Eplant.View.prototype.inactive.call(this);
		
		/* Detach legend */
		if (this.legend.isVisible) {
			this.legend.detach();
			
			this.geneDistributionChart.detach();
		}
		
		/* Remove tooltip info */
		if (this.tooltipInfo) {
			this.tooltipInfo = null;
		}
		
		/* Remove tooltips */
		for (var n = 0; n < this.groups.length; n++) {
			var group = this.groups[n];
			if (group.tooltip) {
				group.tooltip.remove();
				group.tooltip = null;
			}
		}
	};
	
	/**
		* Draw callback method.
		*
		* @override
	*/
	Eplant.BaseViews.EFPViewJson.prototype.draw = function() {
		/* Call parent method */
		Eplant.View.prototype.draw.call(this);
		
		/* Draw groups */
		for (var n = 0; n < this.groups.length; n++) {
			var group = this.groups[n];
			group.vo.draw();
		}
		
		/* Draw outline */
		if (this.outlineVO) {
			this.outlineVO.draw();
		}
		
		/* Draw group outlines */
		for (var n = 0; n < this.groups.length; n++) {
			var group = this.groups[n];
			if (group.isHighlight) {
				group.outlineVO.draw();
			}
		}
		
		/* Draw labels */
		for (var n = 0; n < this.labels.length; n++) {
			var label = this.labels[n];
			label.vo.draw();
		}
		
		/* Draw tags */
		for (var n = 0; n < this.tagVOs.length; n++) {
			var tagVO = this.tagVOs[n];
			tagVO.draw();
		}
		
		/* Create tooltip, if applicable */
		if (this.tooltipInfo && this.tooltipInfo.finish <= ZUI.appStatus.progress) {
			/* Get target group */
			var group = this.tooltipInfo.group;
			
			/* Generate content */
			var content;
			if (this.mode == "absolute") {
				content = group.id + 
				"<br>Mean: " + (+parseFloat(group.mean).toFixed(2)) + 
				"<br>Standard error: " + (+parseFloat(group.stdev).toFixed(2)) + 
				"<br>Sample size: " + group.n;
			}
			else if (this.mode == "relative") {
				content = group.id + 
				"<br>Log2 value: " + (+parseFloat(ZUI.Math.log(group.mean / group.ctrlMean, 2)).toFixed(2)) + 
				"<br>Fold difference: " + (+parseFloat(group.mean / group.ctrlMean).toFixed(2));
			}
			else if (this.mode == "compare") {
				var index = this.groups.indexOf(group);
				var compareGroup = this.compareEFPView.groups[index];
				content = group.id + 
				"<br>Log2 value: " + (+parseFloat(ZUI.Math.log(group.mean / compareGroup.mean, 2)).toFixed(2)) + 
				"<br>Fold difference: " + (+parseFloat(group.mean / compareGroup.mean).toFixed(2));
			}
			
			/* Create tooltip */
			group.tooltip = new Eplant.Tooltip({
				content: content
			});
			
			/* Remove tooltip info */
			this.tooltipInfo = null;
		}
	};
	
	/**
		* Clean up view.
		*
		* @override
	*/
	Eplant.BaseViews.EFPViewJson.prototype.remove = function() {
		/* Call parent method */
		Eplant.View.prototype.remove.call(this);
		
		/* Remove ViewObjects */
		for (var n = 0; n < this.tagVOs.length; n++) {
			var tagVO = this.tagVOs[n];
			tagVO.remove();
		}
		this.outlineVO.remove();
		for (var n = 0; n < this.labels.length; n++) {
			var label = this.labels[n];
			label.vo.remove();
		}
		for (var n = 0; n < this.groups.length; n++) {
			var group = this.groups[n];
			group.vo.remove();
			group.outlineVO.remove();
		}
		
		/* Remove legend */
		this.legend.remove();
		
		/* Remove EventListeners */
		ZUI.removeEventListener(this.updateAnnotationTagsEventListener);
	};
	
	/**
		* MouseMove callback method.
		*
		* @override
	*/
	Eplant.BaseViews.EFPViewJson.prototype.mouseMove = function() {
		/* Check whether mouse is pressed down to determine behaviour */
		if (ZUI.mouseStatus.leftDown) {		// Down
			/* Pan camera */
			ZUI.camera.x -= ZUI.camera.unprojectDistance(ZUI.mouseStatus.x - ZUI.mouseStatus.xLast);
			ZUI.camera.y -= ZUI.camera.unprojectDistance(ZUI.mouseStatus.y - ZUI.mouseStatus.yLast);
		}
	};
	
	/**
		* MouseWheel callback method.
		*
		* @override
	*/
	Eplant.BaseViews.EFPViewJson.prototype.mouseWheel = function(scroll) {
		/* Zoom at mouse position */
		var point = ZUI.camera.unprojectPoint(ZUI.mouseStatus.x, ZUI.mouseStatus.y);
		ZUI.camera.x += (point.x - ZUI.camera.x) * scroll * 0.1;
		ZUI.camera.y += (point.y - ZUI.camera.y) * scroll * 0.1;
		ZUI.camera.distance *= 1 - scroll * 0.1;
	};
	
	/**
		* Creates view-specific UI buttons.
	*/
	Eplant.BaseViews.EFPViewJson.prototype.createViewSpecificUIButtons = function() {
		/* Mode */
		if (this.isRelativeEnabled) {
			this.modeButton = new Eplant.ViewSpecificUIButton(
			"img/efpmode-absolute.png",		// imageSource
			"Toggle data mode: absolute.",	// Description
			function(data) {			// click
				/* Update button */
				if (Eplant.viewColorMode == "absolute") {
					Eplant.viewColorMode = "relative";
					this.setImageSource("img/efpmode-relative.png");
					this.setDescription("Toggle data mode: relative.");
				}
				else if (Eplant.viewColorMode == "relative") {
					Eplant.viewColorMode = "absolute";
					this.setImageSource("img/efpmode-absolute.png");
					this.setDescription("Toggle data mode: absolute.");
				}
				
				/* Update eFP */
				data.eFPView.updateDisplay();
				var event = new ZUI.Event("update-colors", Eplant, null);
				ZUI.fireEvent(event);	
			},
			{
				eFPView: this
			}
			);
			this.viewSpecificUIButtons.push(this.modeButton);
			
		}
		
		/* Compare */
		if (this.isRelativeEnabled && this.isCompareEnabled) {
						this.compareButton = new Eplant.ViewSpecificUIButton(
			"img/unavailable/efpmode-compare.png",		// imageSource
			"Compare to another gene. Please load another gene first.",			// Description
			function(data) {				// click
				/* Check whether compare mode is already activated */
				
				if (Eplant.viewColorMode == "compare") {	// Yes
					/* Change mode to relative */
					Eplant.viewColorMode = "absolute";
					
					/* Update mode button */
					data.eFPView.modeButton.setImageSource("img/efpmode-absolute.png");
					data.eFPView.modeButton.setDescription("Toggle data mode: absolute.");
					
					/* Update compare button */
					this.setImageSource("img/available/efpmode-compare.png");
					this.setDescription("Compare to another gene.");
					
					/* Update eFP */
					data.eFPView.updateDisplay();
					var event = new ZUI.Event("update-colors", Eplant, null);
					ZUI.fireEvent(event);
				}
				else {		// No
					/* Create compare dialog */
					if(data.eFPView.geneticElement.species.displayGeneticElements.length > 1){
						var compareDialog = new Eplant.BaseViews.EFPView.CompareDialog(data.eFPView);
					}
				}
			},
			{
				eFPView: this
			}
			);
			this.viewSpecificUIButtons.push(this.compareButton);
			var eventListener = new ZUI.EventListener("remove-geneticElement", null, function(event, eventData, listenerData) {
				if(listenerData.view.geneticElement.species.displayGeneticElements.length > 1){
					listenerData.compareButton.setImageSource("img/available/efpmode-compare.png");
					listenerData.compareButton.setDescription("Compare to another gene.");
					listenerData.compareButton.domContainer.setAttribute("data-enabled",true);
				}
				else{
					listenerData.compareButton.setImageSource("img/unavailable/efpmode-compare.png");
					listenerData.compareButton.setDescription("Compare to another gene. Please load another gene first.");
					listenerData.compareButton.domContainer.setAttribute("data-enabled",false);
				}
				
				}, {
				compareButton: this.compareButton,
				view:this
			});
			ZUI.addEventListener(eventListener);
			
			/* Update GeneticElement panel when the activeGeneticElement of activeSpecies changes */
			var eventListener = new ZUI.EventListener("add-geneticElement", null, function(event, eventData, listenerData) {
				if(listenerData.view.geneticElement.species.displayGeneticElements.length > 1){
					listenerData.compareButton.setImageSource("img/available/efpmode-compare.png");
					listenerData.compareButton.setDescription("Compare to another gene.");
					listenerData.compareButton.domContainer.setAttribute("data-enabled",true);
				}
				else{
					listenerData.compareButton.setImageSource("img/unavailable/efpmode-compare.png");
					listenerData.compareButton.setDescription("Compare to another gene. Please load another gene first.");
					listenerData.compareButton.domContainer.setAttribute("data-enabled",false);
				}
				
				}, {
				compareButton: this.compareButton,
				view:this
			});
			ZUI.addEventListener(eventListener);
			
			
		}
		
		/* Mask */
		if (this.isMaskEnabled) {
			this.maskButton = new Eplant.ViewSpecificUIButton(
			"img/off/filter.png",		// imageSource
			"Mask data with below threshold confidence.",		// description
			function(data) {				// click
				/* Check whether masking is already on */
				if (Eplant.isMaskOn) {		// Yes
					/* Update button */
					this.setImageSource("img/off/filter.png");
					
					/* Turn off masking */
					Eplant.isMaskOn = false;
					
					/* Update eFP */
					data.eFPView.updateDisplay();
				}
				else {		// No
					/* Create mask dialog */
					var maskDialog = new Eplant.BaseViews.EFPView.MaskDialog(data.eFPView);
				}
			},
			{
				eFPView: this
			}
			);
			this.viewSpecificUIButtons.push(this.maskButton);
		}
		
		/* Legend */
		var viewSpecificUIButton = new Eplant.ViewSpecificUIButton(
		"img/legend.png",		// imageSource
		"Toggle legend.",		// description
		function(data) {		// click
			/* Check whether legend is showing */
			if (data.eFPView.legend.isVisible) {		// Yes
				this.setImageSource("img/off/legend.png");
				/* Hide legend */
				data.eFPView.legend.hide();
				data.eFPView.geneDistributionChart.hide();
				data.eFPView.isLegendVisible=false;
			}
			else {		// No
				this.setImageSource("img/on/legend.png");
				/* Show legend */
				data.eFPView.legend.show();
				data.eFPView.geneDistributionChart.show();
				data.eFPView.isLegendVisible=true;
			}
		},
		{
			eFPView: this
		}
		);
		this.viewSpecificUIButtons.push(viewSpecificUIButton);
		
		/*
				this.downloadButton = new Eplant.ViewSpecificUIButton(
		"img/download.png",		// imageSource
		"Download raw data of this view",		// description
		function(data) {		// click
			if(data.eFPView.rawSampleData){
				var downloadString = "";
				var currentdate = new Date(); 
				var datetime = "This file contains raw data downloaded from ePlant on " + currentdate.getDate() + "/"
                + (currentdate.getMonth()+1)  + "/" 
                + currentdate.getFullYear() + " @ "  
                + currentdate.getHours() + ":"  
                + currentdate.getMinutes() + ":" 
                + currentdate.getSeconds();
				downloadString+=datetime+"\n";
				downloadString+=data.eFPView.name+": "+data.eFPView.geneticElement.identifier+"\n";
				downloadString+="URL: "+Eplant.urlForCurrentState()+"\n";
				downloadString+="JSON data: \n";
				downloadString+=data.eFPView.rawSampleData;
				var blob = new Blob([downloadString], {type: "text/plain;charset=utf-8"});
				saveAs(blob, data.eFPView.name+"-"+data.eFPView.geneticElement.identifier+".txt");
			}
			else{
				alert("No loaded information available.")
			}
		},
		{
			eFPView: this
		}
		);
		this.viewSpecificUIButtons.push(this.downloadButton);
		*/
		
		var viewSpecificUIButton = new Eplant.ViewSpecificUIButton(
		"img/palette.png",		// imageSource
		"Set eFP colors",		// description
		function(data) {		// click
			var paletteDialog = new Eplant.PaletteDialog();
		},
		{
			eFPView: this
		}
		);
		this.viewSpecificUIButtons.push(viewSpecificUIButton);
		
		
		
		var viewSpecificUIButton = new Eplant.ViewSpecificUIButton(
		"img/setting.png",		// imageSource
		"Change the Color Gradient Settings",		// description
		function(data) {		// click
			var globalColorModeDialog = new Eplant.GlobalColorModeDialog();
			
		},
		{
			eFPView: this
		}
		);
		this.viewSpecificUIButtons.push(viewSpecificUIButton);
		
	};
	
	/**
		* Loads eFP definition and data.
	*/
	Eplant.BaseViews.EFPViewJson.prototype.loadData = function() {
		/* Get eFP definition */
		$.getJSON(this.efpURL, $.proxy(function(response) {
			/* Get eFP size */
			this.width = response.width;
			this.height = response.height;
			
			/* Get web service URL */
			this.webService = response.webService;
			
			/* Prepare array for samples loading */
			var samples = [];
			
			/* Create outline ViewObject */
			this.outlineVO = new ZUI.ViewObject({
				shape: "advshape",
				x: -this.width / 2,
				y: -this.height / 2,
				paths: response.outline.paths,
				fill: false,
				strokeColor: response.outline.color || Eplant.Color.Black
			});
			
			/* Create labels */
			this.labels = response.labels;
			for (var n = 0; n < this.labels.length; n++) {
				/* Get label */
				var label = this.labels[n];
				
				/* Create ViewObject */
				label.vo = new ZUI.ViewObject({
					shape: "multilinetext",
					positionScale: "world",
					sizeScale: "world",
					x: label.x - this.width / 2,
					y: label.y - this.height / 2,
					centerAt: label.centerAt || "center center",
					content: label.content,
					size: label.size,
					font: label.font,
					bold: label.bold,
					italic: label.italic,
					underline: label.underline,
					strokeColor: label.color,
					fillColor: label.color,
					leftClick: $.proxy(function() {
						if (this.link) window.open(this.link);
					}, label),
					mouseOver: $.proxy(function() {
						if (this.link) ZUI.container.style.cursor = "pointer";
					}, label),
					mouseOut: $.proxy(function() {
						if (this.link) ZUI.container.style.cursor = "default";
					}, label)
				});
				this.viewObjects.push(label.vo);		// Append to ViewObjects array for user input detection
			}
			
			/* Create groups */
			this.groups = [];
			for (var n = 0; n < response.groups.length; n++) {
				/* Get group data */
				var groupData = response.groups[n];
				
				/* Asher: My solution is to have an if statement to read all control data for each group
					if (typeof groupData.control != 'undefined') {
					alert(groupData.control.id);
					}
				*/
				
				/* Create group object */
				var group = {
					id: groupData.id,
					samples: [],
					ctrlSamples: [],
					source: groupData.source,
					color: Eplant.Color.White,
					isHighlight: false,
					tooltip: null
				};
				
				/* Prepare wrapper object for proxy */
				var wrapper = {
					group: group,
					eFPView: this
				};
				
				/* Create ViewObject for group */
				group.vo = new ZUI.ViewObject({
					shape: "advshape",
					x: -this.width / 2,
					y: -this.height / 2,
					paths: groupData.paths,
					strokeWidth: 1,
					strokeColor: this.outlineVO.strokeColor,
					fillColor: Eplant.Color.White,
					mouseOver: $.proxy(function() {
						/* Set highlight to true */
						this.group.isHighlight = true;
						
						/* Change cursor style */
						ZUI.container.style.cursor = "pointer";
						
						/* Set tooltip info */
						if (!this.group.tooltip) {
							this.eFPView.tooltipInfo = {
								finish: ZUI.appStatus.progress + 500,
								group: this.group
							};
						}
					}, wrapper),
					mouseOut: $.proxy(function() {
						/* Set highlight to false */
						this.group.isHighlight = false;
						
						/* Restore cursor style */
						ZUI.container.style.cursor = "default";
						
						/* Close tooltip or remove tooltip info */
						if (this.group.tooltip) {
							this.group.tooltip.close();
							this.group.tooltip = null;
						}
						else {
							this.eFPView.tooltipInfo = null;
						}
					}, wrapper)
				});
				this.viewObjects.push(group.vo);	// Append to ViewObjects array for user input detection
				
				/* Create ViewObject for group outline */
				group.outlineVO = new ZUI.ViewObject({
					shape: "advshape",
					x: -this.width / 2,
					y: -this.height / 2,
					paths: groupData.paths,
					strokeWidth: 3,
					strokeColor: Eplant.Color.Black,
					fill: false
				});
				
				/* Prepare samples */
				for (var m = 0; m < groupData.samples.length; m++) {
					var sample = {
						name: groupData.samples[m],
						value: null
					};
					
					/* Add it the samples array */
					samples.push(sample);
					
					/* Add to group samples */
					group.samples.push(sample);
				}
				
				/* Asher: Prepare samples for controls if it exists in the group */
				if (groupData.ctrlSamples !== undefined) {
					for (var m = 0; m < groupData.ctrlSamples.length; m++) {
						var sample = {
							name: groupData.ctrlSamples[m],
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
			
			/* Get sample values */
			/* Get sample names */
			var sampleNames = [];
			for (var n = 0; n < samples.length; n++) {
				if ( $.inArray(samples[n].name, sampleNames) === -1 ) {
					sampleNames.push(samples[n].name);
				}
			}
			/* Prepare wrapper for proxy */
			var wrapper = {
				samples: samples,
				eFPView: this
			};
			/* Query */
			$.getJSON(this.webService + "id=" + this.geneticElement.identifier + "&samples=" + JSON.stringify(sampleNames), $.proxy(function(response) {
			
					this.eFPView.rawSampleData= JSON.stringify(response);
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
				
				/* Finish loading */
				this.eFPView.loadFinish();
				
				/* Update eFP */
				this.eFPView.updateDisplay();
			}, wrapper));
		}, this));
	};
	
	/**
		* Binds events.
	*/
	Eplant.BaseViews.EFPViewJson.prototype.bindEvents = function() {
		/* update-annotationTags */
		this.updateAnnotationTagsEventListener = new ZUI.EventListener("update-annotationTags", this.geneticElement, function(event, eventData, listenerData) {
			/* Get EFPView */
			var eFPView = listenerData.eFPView;
			
			/* Update tags */
			eFPView.updateTags();
			}, {
			eFPView: this
		});
		ZUI.addEventListener(this.updateAnnotationTagsEventListener);
	};
	
	
	/**
		* Calculates useful information from raw values.
	*/
	Eplant.BaseViews.EFPViewJson.prototype.processValues = function() {
		/* Processes raw values for a group */
		function processGroupValues() {
			var values = [];
			for (var n = 0; n < this.samples.length; n++) {
				var sample = this.samples[n];
				if (!isNaN(sample.value)) {
					values.push(sample.value);
				}
			}
			this.mean = Math.round(ZUI.Statistics.mean(values)* 100) / 100;
			this.n = values.length;
			this.stdev = Math.round(ZUI.Statistics.stdev(values)* 100) / 100;
			this.sterror = Math.round(ZUI.Statistics.sterror(values)* 100) / 100;
			
			if (this.ctrlSamples === undefined) {
				return;
			}
			
			/* Asher: Calculate the stats for group control */
			var values = [];
			for (var n = 0; n < this.ctrlSamples.length; n++) {
				var sample = this.ctrlSamples[n];
				if (!isNaN(sample.value)) {
					values.push(sample.value);
				}
			}
			this.ctrlMean = Math.round(ZUI.Statistics.mean(values)* 100) / 100;
			this.ctrln = values.length;
			this.ctrlStdev = Math.round(ZUI.Statistics.stdev(values)* 100) / 100;
			this.ctrlSterror = Math.round(ZUI.Statistics.sterror(values)* 100) / 100;
		}
		
		/* Groups */
		for (var n = 0; n < this.groups.length; n++) {
			var group = this.groups[n];
			Eplant.queue.add(processGroupValues, group);
		}
		Eplant.queue.add(function(){
			this.max = this.groups[0].mean;
			for (var n = 1; n < this.groups.length; n++) {
				var group = this.groups[n];
				if (group.mean > this.max) {
					this.max = group.mean;
				}
			}
			this.geneDistributionChart.update(this.max);
			this.extremum = Math.abs(ZUI.Math.log(this.groups[0].mean / this.groups[0].ctrlMean, 2));
			for (var n = 1; n < this.groups.length; n++) {
				var group = this.groups[n];
				if (group.absLog2Value > this.extremum) {
					if (isNaN(group.absLog2Value) || !isFinite(group.absLog2Value)) {} else {
						this.extremum = group.absLog2Value;
					}
				}
			}
		}, this);
	};
	
	/**
		* Recreate tag ViewObjects
	*/
	Eplant.BaseViews.EFPViewJson.prototype.updateTags = function() {
		/* Remove old tags */
		for (var n = 0; n < this.tagVOs.length; n++) {
			var tagVO = this.tagVOs[n];
			tagVO.remove();
		}
		this.tagVOs = [];
		
		/* Create new tags */
		var selectedAnnotationTags = [];
		for (var n = 0; n < this.geneticElement.annotationTags.length; n++) {
			var annotationTag = this.geneticElement.annotationTags[n];
			if (annotationTag.isSelected) {
				selectedAnnotationTags.push(annotationTag);
			}
		}
		for (var n = 0; n < selectedAnnotationTags.length; n++) {
			var annotationTag = selectedAnnotationTags[n];
			this.tagVOs.push(new ZUI.ViewObject({
				shape: "circle",
				positionScale: "screen",
				sizeScale: "screen",
				x: ZUI.width - 20 - (selectedAnnotationTags.length - 1) * 8 + n * 8,
				y: ZUI.height - 13,
				radius: 3,
				centerAt: "center center",
				strokeColor: annotationTag.color,
				fillColor: annotationTag.color
			}));
		}
	};
	
	/**
		* Activates compare mode and compares data of this GeneticElement to the specified GeneticElement.
	*/
	Eplant.BaseViews.EFPViewJson.prototype.compare = function(geneticElement) {
		/* Confirm GeneticElement that is compared to has views loaded */
		if (!geneticElement.isLoadedEFPViewsData) {
			alert("Please load data for " + geneticElement.identifier + " first.");
			return;
		}
		
		/* Get name of the eFP view */
		var viewName = Eplant.getViewName(this);
		
		/* Switch to compare mode */
		this.compareEFPView = geneticElement.views[viewName];
		Eplant.viewColorMode = "compare";
		if(this.modeButton){
			/* Update mode button */
			this.modeButton.setImageSource("img/efpmode-relative.png");
			this.modeButton.setDescription("Data mode: compare. Click on Compare button to turn off.");
			
		}
		if(this.compareButton){
			/* Update compare button */
			this.compareButton.setImageSource("img/active/efpmode-compare.png");
			this.compareButton.setDescription("Turn off compare mode.");
		}
		/* Update eFP */
		//this.updateDisplay();
	};
	
})();
