(function() {
	
	/**
		* Eplant.Views.ChromosomeView.GeneticElementDialog class
		* Coded by Hans Yu
		* UI designed by Jamie Waese
		*
		* Describes a GeneticElement information dialog.
		*
		* @constructor
		* @param {Eplant.GeneticElement} geneticElement The GeneticElement associated with this dialog.
		* @param {Number} x The x-coordinate position of the dialog.
		* @param {Number} y The y-coordinate position of the dialog.
	*/
	Eplant.Views.ChromosomeView.GeneticElementDialog = function(geneticElement,chromosomeView) {
		/* Attributes */
		this.geneticElement = geneticElement;		// The GeneticElement associated with this dialog
		this.chromosomeView = chromosomeView;
		this.xOffset = 35;
		this.yOffset = -40;
		this.minimized = false;				// Whether this dialog is minimized
		this.domContainer = null;				// DOM container element for the dialog
		this.domIdentifier = null;				// DOM element that shows the identifier
		this.domAliases = null;				// DOM element that shows aliases
		this.domStrand = null;				// DOM element that shows the strand
		this.domAnnotation = null;				// DOM element that shows the annotation
		this.domGetDropData = null;				// DOM element for retrieving or dropping data (toggles)
		this.domViewIcons = null;				// DOM element for view icons
		this.domMinimize = null;				// DOM element for the minimize button
		this.domFocus = null;				// DOM element for the focus button
		

		
		/* Create DOM elements */
		this.createDOM();
		
		/* Create dialog */
		this.createDialog();
		
		/* Bind events */
		this.bindEvents();
		
		
	};
	
	/**
		* Binds events.
	*/
	Eplant.Views.ChromosomeView.GeneticElementDialog.prototype.bindEvents = function() {
		
	};
	
	/**
		* Creates the DOM elements of this dialog.
	*/
	Eplant.Views.ChromosomeView.GeneticElementDialog.prototype.createDOM = function() {
		/* DOM container */
		this.domContainer = document.createElement("div");
		
		/* DOM data container */
		var container = document.createElement("div");
		$(container).width(350);
		$(container).css({
			"padding": "5px",
			"max-height": 150,
			"overflow": "auto"
		});
		
		/* Table */
		var table = document.createElement("table");
		$(table).css({
			'border-collapse': 'separate',
			'border-spacing': '10px 5px',
			'font-size': '15px',
			'text-align': 'center',
			'width': '100%'
		});
		
		var tr = document.createElement("tr");
		
		var td = document.createElement("td");
		var button = document.createElement("div");
		$(button).text("Get information for this gene");
		$(button).addClass("greenButton");
		$(button).css({'width':190});
		button.onclick= $.proxy(function() {
			Eplant.changeActiveView(this.geneticElement.views["GeneInfoView"]);
			this.close();
		}, this);
		$(td).append(button);
		$(tr).append(td);
		$(table).append(tr);
		
		tr = document.createElement("tr");
		
		td = document.createElement("td");
		button = document.createElement("div");
		$(button).text("Zoom to Sequence Browser");
		$(button).addClass("greenButton");
		$(button).css({'width':190});
		button.onclick= $.proxy(function() {
			Eplant.changeActiveView(this.geneticElement.views["SequenceView"]);
			this.close();
		}, this);
		$(td).append(button);
		$(tr).append(td);
		$(table).append(tr);
		
		tr = document.createElement("tr");
		
		td = document.createElement("td");
		button = document.createElement("div");
		$(button).text("Customize this chart");
		$(button).addClass("greenButton");
		$(button).css({'width':190});
		button.onclick= $.proxy(function() {
			var annotateDialog = new Eplant.Views.ChromosomeView.AnnotateDialog(this.chromosomeView);
			this.close();
		}, this);
		$(td).append(button);
		$(tr).append(td);
		$(table).append(tr);
		
		/* Strand */
		$(container).append(table);
		
		$(this.domContainer).append(container);
		
	};
	
	/**
		* Creates and opens the dialog.
	*/
	Eplant.Views.ChromosomeView.GeneticElementDialog.prototype.createDialog = function() {
		
		var options = {};
		options.content = this.domContainer;
		options.lock = true;
		options.background = '#000'; 
		options.opacity = 0.6;
		options.window = 'top'; 
		options.fixed= true; 
		options.drag= false;
		options.resize= true;
		
		this.dialog = window.top.art.dialog(options);
		
	};
	/**
		* Selects this GeneticElementInfoDialog.
	*/
	Eplant.Views.ChromosomeView.GeneticElementDialog.prototype.select = function() {
		/* Update CSS style */
		$(this.domContainer.parentNode).addClass("eplant-geneticElementInfoDialog-active");
		
		/* Fire event for selecting dialog */
		var event = new ZUI.Event("update-geneticElementInfoDialog", this.geneticElement, {
			type: "select"
		});
		ZUI.fireEvent(event);
	};
	
	/**
		* Unselects this GeneticElementInfoDialog.
	*/
	Eplant.Views.ChromosomeView.GeneticElementDialog.prototype.unselect = function() {
		/* Update CSS style */
		$(this.domContainer.parentNode).removeClass("eplant-geneticElementInfoDialog-active");
		
		/* Fire event for unselecting dialog */
		var event = new ZUI.Event("update-geneticElementInfoDialog", this.geneticElement, {
			type: "unselect"
		});
		ZUI.fireEvent(event);
	};
	
	/**
		* Opens the GeneticElementInfoDialog.
	*/
	Eplant.Views.ChromosomeView.GeneticElementDialog.prototype.open = function() {
		$(this.domContainer).dialog("open");
	};
	
	/**
		* Closes the GeneticElementInfoDialog.
	*/
	Eplant.Views.ChromosomeView.GeneticElementDialog.prototype.close = function() {
		this.dialog.close();
	};
	
	/**
		* Cleans up the GeneticElementInfoDialog.
	*/
	Eplant.Views.ChromosomeView.GeneticElementDialog.prototype.remove = function() {
		this.dialog.close();
	};
	
})();
