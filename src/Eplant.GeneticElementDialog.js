(function() {
	
	/**
		* Eplant.GeneticElementDialog class
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
	Eplant.GeneticElementDialog = function(geneticElement, x, y, orientation) {
		/* Attributes */
		this.geneticElement = geneticElement;		// The GeneticElement associated with this dialog
		this.x = x;						// The x-coordinate position of the dialog
		this.y = y;						// The y-coordinate position of the dialog
		this.orientation = (orientation === undefined) ? ((this.x > ZUI.width / 2) ? "left" : "right") : orientation;	// Orientaiton of the dialog
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
		
		/* Reference this GeneticElementDialog in the parent GeneticElement */
		this.geneticElement.geneticElementDialog = this;
		
		/* Create DOM elements */
		this.createDOM();
		
		/* Create dialog */
		this.createDialog();
		
		/* Bind events */
		this.bindEvents();
		
		/* Fire event for opening dialog */
		var event = new ZUI.Event("update-geneticElementDialog", this.geneticElement, {
			type: "open"
		});
		ZUI.fireEvent(event);
	};
	
	/**
		* Binds events.
	*/
	Eplant.GeneticElementDialog.prototype.bindEvents = function() {
		
	};
	
	/**
		* Creates the DOM elements of this dialog.
	*/
	Eplant.GeneticElementDialog.prototype.createDOM = function() {
		/* DOM container */
		this.domContainer = document.createElement("div");
		
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
		/* Identifier */
		var tr = document.createElement("tr");
		/* Label */
		var td = document.createElement("td");
		$(td).css({"vertical-align": "top",width:100});
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
		$(td).css({"vertical-align": "top",width:100});
		$(td).html("<label>Aliases:</label>");
		$(tr).append(td);
		
		/* Content */
		this.domAliases = document.createElement("td");
		//BEN CHANGED (added ?. to prevent an error when there are no aliases for the gene,
		//		       I only found this happening in alternate ePlants, changed here too for consistancy)
    //if (this.geneticElement.aliases?.length && this.geneticElement.aliases[0]?.length) {
		if ((this.geneticElement.aliases && this.geneticElement.aliases.length) && (this.geneticElement.aliases[0].length && this.geneticElement.aliases[0].length)) {
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
		$(td).css({"vertical-align": "top",width:100});
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
		$(td).css({"vertical-align": "top",width:100});
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
		$(container).append(table);
		$(this.domContainer).append(container);
		
		/* Button container */
		var container = document.createElement("div");
		$(container).css({"padding": "5px"});
		/* Get / Drop data */
		this.domGetDropData = document.createElement("input");
		$(this.domGetDropData).attr("type", "button");
		$(this.domGetDropData).css({"width":"100px"});
		$(this.domGetDropData).addClass("button greenButton");
		$(this.domGetDropData).val("");
		$(container).append(this.domGetDropData);
		$(this.domGetDropData).hide();
		
		this.toGetData();
		
		
		/* Tags 
			var tags = document.createElement("div");
			$(tags).css({
			"display": "inline-block",
			"padding": "5px",
			"vertical-align": "middle"
			});
			var tagsLabel = document.createElement("label");
			$(tagsLabel).css({"vertical-align": "middle"});
			$(tagsLabel).html("Tags:");
			$(tags).append(tagsLabel);
			for (var n = 0; n < this.geneticElement.annotationTags.length; n++) {
			var annotationTag = new Eplant.GeneticElementDialog.AnnotationTag(this.geneticElement.annotationTags[n], this);
			$(tags).append(annotationTag.domContainer);
			}
		$(container).append(tags);*/
		$(this.domContainer).append(container);
		
		/* Icons container */
		/*this.domViewIcons = document.createElement("div");
			$(this.domViewIcons).css({"padding": "5px", "text-align": "center"});
			this.updateViewIcons();
		$(this.domContainer).append(this.domViewIcons);*/
		//$(this.domContainer).onmouseout(this.close();)
	};
	
	/**
		* Creates and opens the dialog.
	*/
	Eplant.GeneticElementDialog.prototype.createDialog = function() {
		var options = {};
		options.content = this.domContainer;
		options.window = 'top'; 
		options.top = this.y;
		options.left = this.x;
		//options.lock = true;
		//options.background = '#000'; 
		options.opacity = 0.6;
		options.window = 'top'; 
		options.fixed= true; 
		options.drag= false;
		options.resize= true;
		options.padding= '10px';
		options.close= $.proxy(function() {
			this.remove();
		}, this)
		this.dialog = window.top.art.dialog(options);
	};
	
	/**
		* Sets the Get / Drop Data button to Get Data.
	*/
	Eplant.GeneticElementDialog.prototype.toGetData = function() {
		if($.grep( Eplant.activeSpecies.displayGeneticElements, $.proxy(function(e){ return e.identifier == this.geneticElement.identifier; },this)).length===0)
		{
			$(this.domGetDropData).show();
			$(this.domGetDropData).val("Get Data");
			$(this.domContainer.parentNode).removeClass("eplant-geneticElementDialog-loaded");
			this.domGetDropData.onclick = $.proxy(function() {
				/* Unselect previous active GeneticElementDialog */
				if (Eplant.activeSpecies && Eplant.activeSpecies.activeGeneticElement && Eplant.activeSpecies.activeGeneticElement.geneticElementDialog) {
					Eplant.activeSpecies.activeGeneticElement.geneticElementDialog.unselect();
				}
				
				Eplant.activeSpecies.loadGeneticElementByIdentifier(this.geneticElement.identifier);
				
				//BEN CHANGED (removed the drop data button as it was broken and redundant)
				/* Change to greyed out get data button  */
				this.greyGetData();
				
				/* Select this GeneticElementDialog */
				this.select();
				
				/* Set this GeneticElement to active */
				if (this.geneticElement.species != Eplant.activeSpecies) {
					Eplant.setActiveSpecies(this.geneticElement.species);
				}
				if (this.geneticElement != Eplant.activeSpecies.activeGeneticElement) {
					Eplant.activeSpecies.setActiveGeneticElement(this.geneticElement);
				}
				
				
				this.close();
			}, this);
			}else{
				//BEN CHANGED (removed the drop data button as it was broken and redundant)
				this.greyGetData();
		}
		
	};
	
	//BEN CHANGED (added)
	/**
		* Sets the Get / Drop Data button to Drop Data.
	*/
	Eplant.GeneticElementDialog.prototype.greyGetData = function() {
		this.domGetDropData.className = "greyGeneticAnnotationButton";
		this.domGetDropData.disabled = true;
		$(this.domContainer.parentNode).addClass("eplant-geneticElementDialog-loaded");
	};

	//BEN CHANGED (removed, would not properly remove gene from gene list but would remove all of it's views)
	/**
		* Sets the Get / Drop Data button to Drop Data.
	*/
	// Eplant.GeneticElementDialog.prototype.toDropData = function() {
	// 	$(this.domGetDropData).val("Drop Data");
	// 	$(this.domContainer.parentNode).addClass("eplant-geneticElementDialog-loaded");
	// 	this.domGetDropData.onclick = $.proxy(function() {
	// 		/* Drop Views for this GeneticElement */
	// 		this.geneticElement.dropViews();
	// 		this.geneticElement.remove();
	// 		/* Change to Get Data */
	// 		this.toGetData();
			
	// 		/*  Unselect this GeneticElementDialog*/
	// 		this.unselect();
			
	// 		/* Reset tags */
	// 		// TODO
	// 		/* Remove GeneticElementList if current View is ChromosomeView */
	// 		// TODO Consider replacing this code with something more maintainable
	// 		if (ZUI.activeView instanceof Eplant.Views.ChromosomeView) {
	// 			if (ZUI.activeView.geneticElementList) {
	// 				ZUI.activeView.geneticElementList.close();
	// 				ZUI.activeView.geneticElementList = null;
	// 			}
	// 		}
	// 		/* Close this GeneticElementDialog */
	// 		this.close();
	// 	}, this);
	// };
	
	/**
		* Recreates the view icons.
	*/
	
	/**
		* Selects this GeneticElementDialog.
	*/
	Eplant.GeneticElementDialog.prototype.select = function() {
		/* Update CSS style */
		$(this.domContainer.parentNode).addClass("eplant-geneticElementDialog-active");
		
		/* Fire event for selecting dialog */
		var event = new ZUI.Event("update-geneticElementDialog", this.geneticElement, {
			type: "select"
		});
		ZUI.fireEvent(event);
	};
	
	/**
		* Unselects this GeneticElementDialog.
	*/
	Eplant.GeneticElementDialog.prototype.unselect = function() {
		/* Update CSS style */
		$(this.domContainer.parentNode).removeClass("eplant-geneticElementDialog-active");
		
		/* Fire event for unselecting dialog */
		var event = new ZUI.Event("update-geneticElementDialog", this.geneticElement, {
			type: "unselect"
		});
		ZUI.fireEvent(event);
	};
	
	/**
		* Opens the GeneticElementDialog.
	*/
	Eplant.GeneticElementDialog.prototype.open = function() {
		
	};
	
	/**
		* Closes the GeneticElementDialog.
	*/
	Eplant.GeneticElementDialog.prototype.close = function() {
		if(this.dialog){
			
			this.dialog.close();
		}
	};
	
	/**
		* Cleans up the GeneticElementDialog.
	*/
	Eplant.GeneticElementDialog.prototype.remove = function() {
		/* Clean up DOM elements */
		$(this.domContainer).remove();
		
		/* Remove reference from GeneticElement */
		this.geneticElement.geneticElementDialog = null;
		
		/* Fire event for removing dialog */
		var event = new ZUI.Event("update-geneticElementDialog", this.geneticElement, {
			type: "remove"
		});
		ZUI.fireEvent(event);
	};
	
})();
