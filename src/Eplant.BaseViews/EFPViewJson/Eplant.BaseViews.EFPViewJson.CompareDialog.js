(function() {
	
	/**
		* Eplant.BaseViews.EFPViewJson.CompareDialog class
		* Coded by Hans Yu
		* UI designed by Jamie Waese
		*
		* Dialog for user to choose which GeneticElement to compare to in an eFP view.
		*
		* @constructor
		* @param {Eplant.BaseViews.EFPViewJson} eFPView The EFPView that owns this dialog.
	*/
	Eplant.BaseViews.EFPViewJson.CompareDialog = function(eFPView) {
		/* Attributes */
		this.EFPViewJson = eFPView;		// Parent EFPView
		this.domContainer = null;		// DOM container element
		
		/* Create DOM elements */
		this.createDOM();
		
		/* Create and open dialog */
		this.createDialog();
	};
	
	/**
		* Creates DOM elements.
	*/
	Eplant.BaseViews.EFPViewJson.CompareDialog.prototype.createDOM = function() {
		/* Container */
		this.domContainer = document.createElement("div");
				this.domDesc = document.createElement("div");
		$(this.domDesc).css({'color':'#999',"margin-bottom": "20px"});
		$(this.domDesc).html("Mask interactions with confidence and/or correlation values beneath a certain threshold.");
		$(this.domContainer).append(this.domDesc);
		/* Get GeneticElements of the parent Species */
		var geneticElements = this.EFPViewJson.geneticElement.species.geneticElements;
		
		/* Select */
		this.domSelect = document.createElement("select");
		$(this.domSelect).width(220);
		$(this.domSelect).attr("size", 6);
		for (var n = 0; n < geneticElements.length; n++) {
			/* Get GeneticElement */
			var geneticElement = geneticElements[n];
			
			/* Skip if views of this GeneticElement are not loaded or this is the GeneticElement that is to be compared */
			if (!geneticElement.isLoadedViews || geneticElement == this.EFPViewJson.geneticElement) {
				continue;
			}
			
			/* Create option */
			var option = document.createElement("option");
			$(option).val(geneticElement.identifier);
			var text = geneticElement.identifier;
			if (geneticElement.aliases && geneticElement.aliases.length && geneticElement.aliases[0].length) {
				text += " / " + geneticElement.aliases.join(", ");
			}
			$(option).html(text);
			$(this.domSelect).append(option);
		}
		
		/* Select first option by default */
		var options = $(this.domSelect).children("option");
		if (options.length) {
			$(this.domSelect).prop("selectedIndex", 0);
		}
		$(this.domContainer).append(this.domSelect);
		/*this.domOk = document.createElement("input");
		$(this.domOk).attr("type", "button");
		$(this.domOk).css({"width":"100px"});
		$(this.domOk).addClass("button greenButton");
		$(this.domOk).val("Compare");
		$(this.domContainer).append(this.domOk);
		$(this.domOk).on('click', $.proxy(function(event, ui) {
			// Check whether something is selected 
			if ($(this.domSelect).prop("selectedIndex") < 0) {	// No
				alert("Please select a gene! If you don't see the gene you want, please load the data for the gene and try again.");
			}
			else {		// Yes
				var identifier = $(this.domSelect).children("option:selected").val();
				var geneticElement = this.EFPViewJson.geneticElement.species.getGeneticElementByIdentifier(identifier);
				this.EFPViewJson.compare(geneticElement);
			}
			this.close();
		}, this));*/
	};
	
	/**
		* Creates and opens the dialog.
	*/
	Eplant.BaseViews.EFPViewJson.CompareDialog.prototype.createDialog = function() {
		/*$(this.domContainer).dialog({
			title: "Compare " + this.EFPViewJson.geneticElement.identifier + " to...",
			width: 250,
			height: "auto",
			minHeight: 0,
			resizable: false,
			modal: true,
			open: function(event, ui) { $(".ui-dialog-titlebar-close").hide();
				$(".ui-dialog-buttonpane").css({'border-top-width':'0px'});
			},
			close: $.proxy(function(event, ui) {
				this.remove();
			}, this)
		});
		*/
		var options = {};
		options.content = this.domContainer;
		options.title = "Compare " + this.EFPViewJson.geneticElement.identifier + " to...";
		options.lock = true;
		options.background = '#000'; 
		options.opacity = 0.6;
		options.width = 250;
		options.window = 'top'; 
		options.fixed= true; 
		options.drag= false;
		options.resize= false;
		options.init= $.proxy(function() {
			
		}, this);
		options.close= $.proxy(function() {
			//this.remove();
		}, this);
		options.ok =$.proxy(function(event, ui) {
		if ($(this.domSelect).prop("selectedIndex") < 0) {	// No
				alert("Please select a gene! If you don't see the gene you want, please load the data for the gene and try again.");
			}
			else {		// Yes
				var identifier = $(this.domSelect).children("option:selected").val();
				var geneticElement = this.EFPViewJson.geneticElement.species.getGeneticElementByIdentifier(identifier);
				this.EFPViewJson.compare(geneticElement);
			}
			this.close();
		}, this);
		/*options.cancel = $.proxy(function(event, ui) {
			this.remove();
		}, this);*/
		this.dialog = window.top.art.dialog(options);
	};
	
	/**
		* Closes the dialog.
	*/
	Eplant.BaseViews.EFPViewJson.CompareDialog.prototype.close = function() {
		/* Close dialog */
		//$(this.domContainer).dialog("close");
		this.dialog.close();
	};
	
	/**
		* Removes the dialog.
	*/
	Eplant.BaseViews.EFPViewJson.CompareDialog.prototype.remove = function() {
		/* Remove DOM elements */
		//$(this.domContainer).remove();
		this.dialog.close();
	};
	
})();	