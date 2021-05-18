(function() {
	
	/**
		* Eplant.Views.GeneSliderView class
		*
		* @constructor
		* @param {Eplant.GeneticElement} The GeneticElement associated with this view.
	*/
	Eplant.Views.GeneSliderView = function(geneticElement) {
		// Get constructor
		var constructor = Eplant.Views.GeneSliderView;
		
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
		constructor.unavailableIconImageURL	// URL for the unavailable icon image
		);
		
		// Attributes
		this.geneticElement = geneticElement;
		this.viewMode ="geneslider";
		this.bound = false;
		if(this.name)
		{
			$(this.labelDom).empty();
			this.viewNameDom = document.createElement("span");
			var labelText = this.geneticElement.identifier;
			if (this.geneticElement.aliases && this.geneticElement.aliases.length && this.geneticElement.aliases[0].length) {
				labelText += " / " + this.geneticElement.aliases.join(", ");
			}
			var text = this.name+': '+labelText;
			/*if(this.geneticElement.isRelated){
				text += ", "+this.geneticElement.identifier+" correlates to "+this.geneticElement.relatedGene.identifier+" with an r-value of "+this.geneticElement.rValueToRelatedGene;
			}*/
			this.viewNameDom.appendChild(document.createTextNode(text)); 
			$(this.viewNameDom).appendTo(this.labelDom);
		}
		
		
		this.domContainer = document.createElement("div");
		
		$(this.domContainer).attr('id','geneSliderHolder'+this.geneticElement.identifier);
		$(this.domContainer).css({
			position: 'relative',
			width: '100%',
			height: '100%',
			'z-index': '-1',
		});
		
		this.canvas = document.createElement('canvas');
		$(this.canvas).attr('data-processing-sources',"data/geneSlider/GeneSlider.pde");
		$(this.canvas).attr('id','geneSlider'+this.geneticElement.identifier);
		$(this.domContainer).append(this.canvas);
		$(Eplant.Views.GeneSliderView.domContainer).append(this.domContainer);
		
		Processing.loadSketchFromSources(this.canvas, ['data/geneSlider/GeneSlider.pde']);
		
		
		this.loadData();
		
		
		
	};
	ZUI.Util.inheritClass(Eplant.View, Eplant.Views.GeneSliderView);	// Inherit parent prototype
	Eplant.Views.GeneSliderView.viewName = "GeneSliderView";
	Eplant.Views.GeneSliderView.displayName = "Gene Slider viewer";
	Eplant.Views.GeneSliderView.hierarchy = "genetic element";
	Eplant.Views.GeneSliderView.magnification = 300;
	Eplant.Views.GeneSliderView.description = "Gene Slider viewer";
	Eplant.Views.GeneSliderView.citation = "";
	Eplant.Views.GeneSliderView.activeIconImageURL = "img/active/info.png";
	Eplant.Views.GeneSliderView.availableIconImageURL = "img/available/info.png";
	Eplant.Views.GeneSliderView.unavailableIconImageURL = "img/unavailable/info.png";
	Eplant.Views.GeneSliderView.viewType = "geneslider";
	
	/* Static methods */
	/**
		* Initializes JSmol
	*/
	Eplant.Views.GeneSliderView.initialize = function() {
		// Get JSmol DOM container
		Eplant.Views.GeneSliderView.domContainer = document.getElementById("GeneSlider_container");
		// Define JSmol initialization info
		
	};
	
	Eplant.Views.GeneSliderView.prototype.loadData = function()  {
		var pjs = Processing.getInstanceById('geneSlider'+this.geneticElement.identifier);
		if (pjs != null) {
			this.loadFinish();
			pjs.bindJavascript(window);
			this.bound = true;
			pjs.setWelcome();
			// Runs the webservice that fetches data using AGI
			var url = "//bar.utoronto.ca/geneslider/cgi-bin/alignmentByAgi.cgi?agi=" + this.geneticElement.identifier + "&before=" + 0 + "&after=" + 0;
			$.getJSON(url, $.proxy(function(data) {
				jsonClone = JSON.parse(JSON.stringify(data));
				if (data.fileData != "") {
					pjs.setWelcome();
					pjs.resetData();
					pjs.setAlnStart(data.start);
					pjs.setSessionData("CNSData", this.geneticElement.identifier, 0, 0, 'true', 'true', 'false');
					
					
					pjs.setStartDigit(99);
					
					
					pjs.setEndDigit(164);
					
					
					
					pjs.setgffPanelOpen(true);
					pjs.setFastaData(data.fileData);
					
					// This is for downloading alignment feature
					alignment = data.fileData;
					
					
					setTimeout(pjs.updateURLSearchResults, 100);
					
				}
			},this));
		}
		if (!this.bound) {
			setTimeout($.proxy(this.loadData,this), 250);
		} 
	}
	
	Eplant.Views.GeneSliderView.prototype.loadFinish = function() {
		/* Set load status */
		this.isLoadedData = true;
		
		
	};
		
	Eplant.Views.GeneSliderView.prototype.resize = function() {
		/* Set load status */
		Processing.getInstanceById('geneSlider'+this.geneticElement.identifier).size(window.innerWidth, window.innerHeight);
		
		
	};
	
	
	/**
		* Active callback method.
		*
		* @override
	*/
	Eplant.Views.GeneSliderView.prototype.active = function() {
		// Call parent method
		Eplant.View.prototype.active.call(this);
		
		//this.resize();
		$(this.domContainer).show();
		// Make JSmol visible
		$(Eplant.Views.GeneSliderView.domContainer).css({"visibility": "visible"});
		// Get JSmol canvas
		
		
	};
	
	Eplant.Views.GeneSliderView.prototype.afterActive = function() {
		Eplant.View.prototype.afterActive.call(this);
		$(this.domContainer).css({
			top: "0%"
		});
		
	};
	
	/**
		* Inactive callback method.
		*
		* @override
	*/
	Eplant.Views.GeneSliderView.prototype.inactive = function() {
		// Call parent method
		Eplant.View.prototype.inactive.call(this);
		
		$(this.domContainer).hide();
		// Hide JSmol
		$(Eplant.Views.GeneSliderView.domContainer).css({"visibility": "hidden"});
		
	};
	
	Eplant.Views.GeneSliderView.prototype.downloadRawData = function() {
		
		var downloadString = "";
		var currentdate = new Date(); 
		var datetime = "This file contains raw data downloaded from ePlant on " + currentdate.getDate() + "/"
		+ (currentdate.getMonth()+1)  + "/" 
		+ currentdate.getFullYear() + " @ "  
		+ currentdate.getHours() + ":"  
		+ currentdate.getMinutes() + ":" 
		+ currentdate.getSeconds();
		downloadString+=datetime+"\n";
		var labelText = this.geneticElement.identifier;
		if (this.geneticElement.aliases && this.geneticElement.aliases.length && this.geneticElement.aliases[0].length) {
			labelText += " / " + this.geneticElement.aliases.join(", ");
		}
		downloadString+=this.name+": "+labelText+"\n";
		
		downloadString+="URL: "+Eplant.urlForCurrentState()+"\n";
		downloadString+="JSON data: \n";
		if(this.geneSummaryRawData){
			downloadString+="\n\nGene Summary Raw Data:\n";
			downloadString+=this.geneSummaryRawData;
		}
		
		if(this.modelRawData){
			downloadString+="\n\nFull Sequence Raw Data:\n";
			downloadString+=this.modelRawData;
		}
		
		if(this.DNARawData){
			downloadString+="\n\nDNA Squence Raw Data:\n";
			downloadString+=this.DNARawData;
		}
		
		if(this.geneModelRawData){
			downloadString+="\n\nGene Model Raw Data:\n";
			downloadString+=this.geneModelRawData;
		}
		
		var blob = new Blob([downloadString], {type: "text/plain;charset=utf-8"});
		saveAs(blob, this.name+"-"+this.geneticElement.identifier+".txt");
		
	};
	
	/**
		* Returns The exit-out animation configuration.
		*
		* @override
		* @return {Object} The exit-out animation configuration.
	*/
	Eplant.Views.GeneSliderView.prototype.getExitOutAnimationConfig = function() {
		var config = Eplant.View.prototype.getExitOutAnimationConfig.call(this);
		config.begin = $.proxy(function() {
			$(this.domContainer).stop().animate({
				top: "250%"
			}, 1000);
		}, this);
		return config;
	};
	
	/**
		* Returns The enter-out animation configuration.
		*
		* @override
		* @return {Object} The enter-out animation configuration.
	*/
	Eplant.Views.GeneSliderView.prototype.getEnterOutAnimationConfig = function() {
		var config = Eplant.View.prototype.getEnterOutAnimationConfig.call(this);
		config.begin = $.proxy(function() {
			
			$(this.domContainer).css({
				top: "-250%"
			});
			$(this.domContainer).stop().animate({
				top: "0%"
			}, 1000);
		}, this);
		return config;
	};
	
	/**
		* Returns The exit-in animation configuration.
		*
		* @override
		* @return {Object} The exit-in animation configuration.
	*/
	Eplant.Views.GeneSliderView.prototype.getExitInAnimationConfig = function() {
		var config = Eplant.View.prototype.getExitInAnimationConfig.call(this);
		config.begin = $.proxy(function() {
			$(this.domContainer).stop().animate({
				top: "-250%"
			}, 1000);
		}, this);
		return config;
	};
	
	/**
		* Returns The enter-in animation configuration.
		*
		* @override
		* @return {Object} The enter-in animation configuration.
	*/
	Eplant.Views.GeneSliderView.prototype.getEnterInAnimationConfig = function() {
		var config = Eplant.View.prototype.getEnterInAnimationConfig.call(this);
		config.begin = $.proxy(function() {
			$(this.domContainer).css({
				top: "250%"
			});
			$(this.domContainer).stop().animate({
				top: "0%"
			}, 1000);
		}, this);
		return config;
	};
	
	
	
	
	
})();
