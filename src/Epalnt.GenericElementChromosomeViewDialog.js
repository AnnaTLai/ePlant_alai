(function() {
	
	/**
		* Epalnt.GenericElementChromosomeViewDialog class
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
	Epalnt.GenericElementChromosomeViewDialog = function(geneticElement) {
		/* Attributes */
		this.geneticElement = geneticElement;		// The GeneticElement associated with this dialog
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
		
		/* Reference this GeneticElementInfoDialog in the parent GeneticElement */
		this.geneticElement.geneticElementInfoDialog = this;
		
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
	Epalnt.GenericElementChromosomeViewDialog.prototype.bindEvents = function() {
		
	};
	
	/**
		* Creates the DOM elements of this dialog.
	*/
	Epalnt.GenericElementChromosomeViewDialog.prototype.createDOM = function() {
		/* DOM container */
		this.domContainer = document.createElement("div");
		
		this.title = document.createElement("p");
		
		$(this.title).css({
			'font-size':'24px',
			'margin': '10px',
			'margin-left': '18px'
			
		}).html("Annotation Information").appendTo(this.domContainer);
		
		/* DOM data container */
		var container = document.createElement("div");
		$(container).width(350);
		$(container).css({
			"padding": "5px",
			"max-height": 130,
			"overflow": "auto"
		});
		
		/* Table */
		var table = document.createElement("table");
		$(table).css({
			'border-collapse': 'separate',
			'border-spacing': '10px 5px',
			'font-size': '15px'
		});
		/* Identifier */
		var tr = document.createElement("tr");
		/* Label */
		var td = document.createElement("td");
		$(td).css({"vertical-align": "top"});
		$(td).html("<label>Identifier:</label>");
		$(tr).append(td);
		
		/* Content */
		this.domIdentifier = document.createElement("td");
		$(this.domIdentifier).html(this.geneticElement.identifier);
		$(tr).append(this.domIdentifier);
		$(table).append(tr);
		
		/* Aliases */
		var tr = document.createElement("tr");
		/* Label */
		var td = document.createElement("td");
		$(td).css({"vertical-align": "top"});
		$(td).html("<label>Aliases:</label>");
		$(tr).append(td);
		
		/* Content */
		this.domAliases = document.createElement("td");
		if (this.geneticElement.aliases.length && this.geneticElement.aliases[0].length) {
			$(this.domAliases).html(this.geneticElement.aliases.join(", "));
		}
		else {
			$(this.domAliases).html("Not available");
		}
		$(tr).append(this.domAliases);
		$(table).append(tr);
		
		/* Strand */
		var tr = document.createElement("tr");
		/* Label */
		var td = document.createElement("td");
		$(td).css({"vertical-align": "top"});
		$(td).html("<label>Strand:</label>");
		$(tr).append(td);
		
		/* Content */
		this.domStrand = document.createElement("td");
		$(this.domStrand).html(this.geneticElement.strand);
		$(tr).append(this.domStrand);
		$(table).append(tr);
		
		/* Annotation */
		var tr = document.createElement("tr");
		/* Label */
		var td = document.createElement("td");
		$(td).css({"vertical-align": "top"});
		$(td).html("<label>Annotation:</label>");
		$(tr).append(td);
		
		/* Content */
		this.domAnnotation = document.createElement("td");
		if (this.geneticElement.annotation && this.geneticElement.annotation.length) {
			$(this.domAnnotation).html(this.geneticElement.annotation);
		}
		else {
			$(this.domAnnotation).html("Not available");
		}
		$(tr).append(this.domAnnotation);
		$(table).append(tr);
		/* Strand */
		$(container).append(table);
		if(this.geneticElement.isRelated){
			$(container).append($('<label>',{
				text:"This gene is found by Expression Angler, "+this.geneticElement.identifier+" correlates to "+this.geneticElement.relatedGene.identifier+" with an r-value of "+this.geneticElement.rValueToRelatedGene
			}));
		}
		$(this.domContainer).append(container);
		
	};
	
	/**
		* Creates and opens the dialog.
	*/
	Epalnt.GenericElementChromosomeViewDialog.prototype.createDialog = function() {
		
		var options = {};
		options.content = this.domContainer;
		options.lock = true;
		options.background = '#000'; 
		options.opacity = 0.6;
		options.window = 'top'; 
		options.fixed= true; 
		options.drag= false;
		options.resize= true;
		options.close= $.proxy(function() {
			this.remove();
		}, this)
		var dialog = window.top.art.dialog(options);
		$.extend(true,this, dialog );
		
	};
	/**
		* Selects this GeneticElementInfoDialog.
	*/
	Epalnt.GenericElementChromosomeViewDialog.prototype.select = function() {
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
	Epalnt.GenericElementChromosomeViewDialog.prototype.unselect = function() {
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
	Epalnt.GenericElementChromosomeViewDialog.prototype.open = function() {
		$(this.domContainer).dialog("open");
	};
	
	/**
		* Closes the GeneticElementInfoDialog.
	*/
	Epalnt.GenericElementChromosomeViewDialog.prototype.close = function() {
		$(this.domContainer).dialog("close");
	};
	
	/**
		* Cleans up the GeneticElementInfoDialog.
	*/
	Epalnt.GenericElementChromosomeViewDialog.prototype.remove = function() {
		/* Clean up DOM elements */
		$(this.domContainer).remove();
		
		/* Remove reference from GeneticElement */
		this.geneticElement.geneticElementInfoDialog = null;
		
		/* Fire event for removing dialog */
		var event = new ZUI.Event("update-geneticElementInfoDialog", this.geneticElement, {
			type: "remove"
		});
		ZUI.fireEvent(event);
	};
	
})();
