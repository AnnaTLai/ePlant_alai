(function() {
	
	/**
		* Eplant.GeneticElementListDialog class
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
	Eplant.GeneticElementListDialog = function(geneticElement, x, y, orientation) {
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
		this.domGetSimiliarGenes = null;		// DOM element that shows get similiar genes link
		this.domExpressionAngler = null;		// DOM element that shows get similiar genes link
		this.domMinimize = null;				// DOM element for the minimize button
		this.domFocus = null;				// DOM element for the focus button
		
		/* Reference this GeneticElementListDialog in the parent GeneticElement */
		this.geneticElement.geneticElementListDialog = this;
		
		/* Create DOM elements */
		this.createDOM();
		
		/* Create dialog */
		//this.createDialog();
		
		/* Bind events */
		this.bindEvents();
		
		/* Fire event for opening dialog */
		var event = new ZUI.Event("update-geneticElementListDialog", this.geneticElement, {
			type: "open"
		});
		ZUI.fireEvent(event);
	};
	
	/**
		* Binds events.
	*/
	Eplant.GeneticElementListDialog.prototype.bindEvents = function() {
		/* Update view icons when a view under this GeneticElement is loaded */
		var eventListener = new ZUI.EventListener("view-loaded", null, function(event, eventData, listenerData) {
			var view = event.target;
			if (view.hierarchy == "genetic element" && view.geneticElement == listenerData.geneticElementListDialog.geneticElement) {
				listenerData.geneticElementListDialog.updateViewIcons();
			}
			}, {
			geneticElementListDialog: this
		});
		ZUI.addEventListener(eventListener);
		
		/* Update view icons when a view under this GeneticElement becomes active */
		var eventListener = new ZUI.EventListener("update-activeView", Eplant, function(event, eventData, listenerData) {
			var view = ZUI.activeView;
			listenerData.geneticElementListDialog.updateViewIcons();
			}, {
			geneticElementListDialog: this
		});
		ZUI.addEventListener(eventListener);
	};
	
	/**
		* Creates the DOM elements of this dialog.
	*/
	Eplant.GeneticElementListDialog.prototype.createDOM = function() {
		/* DOM container */
		this.domContainer = document.createElement("div");
		this.domContainer.id="dropdown-"+this.geneticElement.identifier;
		this.domContainer.className = "dropdown dropdown-tip";
		/* DOM data container */
		var container = document.createElement("div");
		/*$(container).width(350);
			$(container).css({
			"padding": "5px",
			"max-height": 130,
			"overflow": "auto"
		});*/
		
		
		/* Button container */
		var container = document.createElement("div");
		$(container).css({"padding": "5px"});
		/* Get / Drop data */
		var ul = document.createElement("ul");
		ul.className = "dropdown-menu";
		$(ul).css({"list-style-type": "none"});
		var li  = document.createElement("li");
        /*$(li).css({"border-bottom": "1px #333333 solid"});*/
		this.domGetDropData = $('<a>',{text:'Remove gene from list'});
		$(this.domGetDropData).val("");
		
		$(this.domContainer.parentNode).addClass("eplant-geneticElementListDialog-loaded");
		$(this.domGetDropData).on('click',$.proxy(function() {
			/* Drop Views for this GeneticElement */
			//this.geneticElement.dropViews();
			
			/*  Unselect this GeneticElementListDialog*/
			this.unselect();
			
			/* Reset tags */
			// TODO
			
			/* Close this GeneticElementListDialog */
			this.close();
			this.geneticElement.remove();
		}, this));
		
		
		$(li).append(this.domGetDropData);
		$(ul).append(li);
		
		li  = document.createElement("li");
		this.domGetSimiliarGenes = $('<a>',{text:'Get similiar genes'});
		$(this.domGetSimiliarGenes).val("");
		$(this.domGetSimiliarGenes).addClass("hint--right hint--success hint-rounded");
		$(this.domGetSimiliarGenes).attr('data-hint',"Find 10 genes with similar expression patterns.");
		$(this.domGetSimiliarGenes).attr('data-enabled',"true");
		$(this.domGetSimiliarGenes).on('click',$.proxy(function() {
			this.geneticElement.expressionAngler();
		}, this));
		
		$(li).append(this.domGetSimiliarGenes);
		$(ul).append(li);
		/*if(!this.geneticElement.isRelated){
			li  = document.createElement("li");
			this.domExpressionAngler = $('<a>',{text:'Get similiar genes'});
			$(this.domExpressionAngler).val("");
			$(this.domExpressionAngler).on('click',$.proxy(function() {
			this.geneticElement.expressionAngler();
			}, this));
			
			$(li).append(this.domExpressionAngler);
			$(ul).append(li);
			}else{
			li  = document.createElement("li");
			this.domExpressionAngler = $('<a>',{text:'Make gene unrelated'});
			$(this.domExpressionAngler).val("");
			$(this.domExpressionAngler).on('click',$.proxy(function() {
			this.geneticElement.unrelate();
			Eplant.updateGeneticElementPanel();
			}, this));
			
			$(li).append(this.domExpressionAngler);
			$(ul).append(li);
		}*/
		/*li  = document.createElement("li");
			$(li).css({"border-bottom": "1px #333333 solid"});
			//Tags 
			var tags = document.createElement("div");
			$(tags).css({
			"display": "inline-block",
			"width": "100%",
			"vertical-align": "middle",
			"padding": "0",
			"text-align": "center"
			});
			var tagsLabel = document.createElement("label");
			$(tagsLabel).css({"vertical-align": "middle",
			"padding": "0"});
			$(tagsLabel).html("Tags:");
			$(tags).append(tagsLabel);
			for (var n = 0; n < this.geneticElement.annotationTags.length; n++) {
			var annotationTag = new Eplant.GeneticElementDialog.AnnotationTag(this.geneticElement.annotationTags[n], this);
			$(tags).append(annotationTag.domContainer);
			}
			$(li).append(tags);
		$(ul).append(li);*/
		$(this.domContainer).append(ul);
		//$(this.domContainer).append(container);
		
		/* Icons container */
		this.domViewIcons = document.createElement("div");
		$(this.domViewIcons).css({"padding": "5px", "text-align": "center"});
		this.updateViewIcons();
		$(this.domContainer).append(this.domViewIcons);
		$(this.domContainer).appendTo('body');
		$(this.domContainer).dropdown('show');
	};
	
	/**
		* Creates and opens the dialog.
	*/
	Eplant.GeneticElementListDialog.prototype.createDialog = function() {
		/* Determine dialog position */
		var hPosition = (this.orientation == "left") ? "right" : "left";
		var xOffset = (this.orientation == "left") ? -this.xOffset : this.xOffset;
		
		/* Create dialog */
		$(this.domContainer).dialog({
			dialogClass: "eplant-geneticElementListDialog",
			position: {
				my: hPosition + " top",
				at: "left+" + (this.x + xOffset) + " top+" + (this.y + this.yOffset),
				of: ZUI.canvas
			},
			show: {
				effect: "blind",
				duration: 500
			},
			hide: {
				effect: "blind",
				duration: 500
			},
			width: "auto",
			height: "auto",
			minHeight: 0,
			resizable: false,
			modal: false,
			close: $.proxy(function() {
				this.remove();
			}, this)
		});
		
		if (this.geneticElement.isLoadedViews) {
			$(this.domContainer.parentNode).addClass("eplant-geneticElementListDialog-loaded");
		}
		if (this.geneticElement == Eplant.activeSpecies.activeGeneticElement) {
			$(this.domContainer.parentNode).addClass("eplant-geneticElementListDialog-active");
		}
		
		/* Get title bar */
		var titleBar = $(this.domContainer).parent().children(".ui-dialog-titlebar").get(0);
		
	};
	/**
		* Sets the Get / Drop Data button to Drop Data.
	*/
	Eplant.GeneticElementListDialog.prototype.toDropData = function() {
		
	};
	
	/**
		* Recreates the view icons.
	*/
	Eplant.GeneticElementListDialog.prototype.updateViewIcons = function() {
	};
	
	/**
		* Selects this GeneticElementListDialog.
	*/
	Eplant.GeneticElementListDialog.prototype.select = function() {
		/* Update CSS style */
		$(this.domContainer.parentNode).addClass("eplant-geneticElementListDialog-active");
		
		/* Fire event for selecting dialog */
		var event = new ZUI.Event("update-geneticElementListDialog", this.geneticElement, {
			type: "select"
		});
		ZUI.fireEvent(event);
	};
	
	/**
		* Unselects this GeneticElementListDialog.
	*/
	Eplant.GeneticElementListDialog.prototype.unselect = function() {
		/* Update CSS style */
		$(this.domContainer.parentNode).removeClass("eplant-geneticElementListDialog-active");
		
		/* Fire event for unselecting dialog */
		var event = new ZUI.Event("update-geneticElementListDialog", this.geneticElement, {
			type: "unselect"
		});
		ZUI.fireEvent(event);
	};
	
	/**
		* Opens the GeneticElementListDialog.
	*/
	Eplant.GeneticElementListDialog.prototype.open = function() {
		//$(this.domContainer).dialog("open");
	};
	
	/**
		* Closes the GeneticElementListDialog.
	*/
	Eplant.GeneticElementListDialog.prototype.close = function() {
		//$(this.domContainer).dialog("close");
	};
	
	/**
		* Cleans up the GeneticElementListDialog.
	*/
	Eplant.GeneticElementListDialog.prototype.remove = function() {
		/* Clean up DOM elements */
		$(this.domContainer).remove();
		
		/* Remove reference from GeneticElement */
		this.geneticElement.geneticElementListDialog = null;
		
		/* Fire event for removing dialog */
		var event = new ZUI.Event("update-geneticElementListDialog", this.geneticElement, {
			type: "remove"
		});
		ZUI.fireEvent(event);
	};
	
})();
