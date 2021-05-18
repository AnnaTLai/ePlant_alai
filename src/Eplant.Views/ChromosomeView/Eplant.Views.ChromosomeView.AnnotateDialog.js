(function() {
	
	/**
		* Eplant.Views.ChromosomeView.AnnotateDialog class
		* Coded by Hans Yu
		* UI designed by Jamie Waese
		*
		* @constructor
		* @param {Eplant.Views.ChromosomeView} chromosomeView The parent ChromosomeView.
	*/
	Eplant.Views.ChromosomeView.AnnotateDialog = function(chromosomeView) {
		/* Attributes */
		this.chromosomeView = chromosomeView;	// The parent ChromosomeView
		this.color = "#000000";			// Color of the annotation, defaults to black
		this.domContainer = null;			// DOM container element
		this.domIdentifiers = null;			// DOM element for identifiers input
		this.domSize = null;				// DOM element for size input
		this.domColor = null;			// DOM element for color input
		this.annotationTags = null;			// Array of AnnotationTags
		this.identifiers = null;			// Identifiers (generated after submiting)
		this.size = null;				// Annotation size (generated after submiting)
		this.selectedAnnotationTagColors = null;	// Selected annotation tag colors (generated after submiting)
		
		/* Create DOM elements */
		this.createDOM();
		
		/* Create and open dialog */
		this.createDialog();
	};
	
	/**
		* Creates the DOM elements of this dialog.
	*/
	Eplant.Views.ChromosomeView.AnnotateDialog.prototype.createDOM = function() {
		/* Container */
		this.domContainer = document.createElement("div");
		
		/* Table */
		var domTable = document.createElement("table");
		$(domTable).css({
			'border-spacing': '0px 10px',
			'border-collapse': 'separate'
		});
		/* Identifiers */
		var tr = document.createElement("tr");
		/* Label */
		var td = document.createElement("td");
		$(td).html("Gene to annotate:");
		$(td).width(170);
		$(tr).append(td);
		
		/* Text input */
		var td = document.createElement("td");
		this.domIdentifiers = document.createElement("div");
		for (var n = 0; n < Eplant.activeSpecies.displayGeneticElements.length; n++) {
			var gene = Eplant.activeSpecies.displayGeneticElements[n];
			var holder = document.createElement("div");
			var geneRadio = document.createElement("input");
			$(geneRadio).attr("type", "radio");
			$(geneRadio).attr("name", "geneIdentifier");
			$(geneRadio).val(gene.identifier);
			$(holder).append(geneRadio);
			var label = document.createElement("label");
			$(label).text(gene.identifier);
			$(holder).append(label);
			$(this.domIdentifiers).append(holder);
			$(holder).click(function(event, ui) {
				$(geneRadio).select();
			});
		}
		$(this.domIdentifiers).width(270);
		$(td).append(this.domIdentifiers);
		$(tr).append(td);
		$(domTable).append(tr);
		
		// /* Additional note*/
		// var tr = document.createElement("tr");
		// /* Label */
		// var td = document.createElement("td");
		// $(td).html("Additional Annotation:");
		// $(tr).append(td);
		
		// var td = document.createElement("td");
		// this.domNote = document.createElement("input");
		// $(td).append(this.domNote);
		
		// $(tr).append(td);
		// $(domTable).append(tr);
		
		/* Annotation size */
		var tr = document.createElement("tr");
		/* Label */
		var td = document.createElement("td");
		$(td).html("Size:");
		$(tr).append(td);
		
		/* Spinner input */
		var td = document.createElement("td");
		this.domSize = document.createElement("input");
		$(td).append(this.domSize);
		$(this.domSize).spinner({
			spin: function(event, ui) {
				if (ui.value < 0) {
					$(this).spinner("value", 0);
				}
			}
		});
		$(this.domSize).spinner("value", 12);
		$(tr).append(td);
		$(domTable).append(tr);
		
		/* Annotation color */
		var tr = document.createElement("tr");
		/* Label */
		var td = document.createElement("td");
		$(td).html("Color:");
		$(tr).append(td);
		
		/* Color input */
		var td = document.createElement("td");
		this.domColor = document.createElement("input");
		$(this.domColor).attr("type", "text");
		$(td).append(this.domColor);
		$(this.domColor).spectrum({
			color: this.color,
			showInput: true,
			change: $.proxy(function(color) {
				this.color = color.toHexString();
			}, this)
		});
		$(tr).append(td);
		$(domTable).append(tr);
		
		/* Annotation tags */
		var tr = document.createElement("tr");
		/* Label */
		var td = document.createElement("td");
		$(td).html("Tags:");
		$(tr).append(td);
		
		/* AnnotationTags */
		var td = document.createElement("td");
		this.annotationTags = [];
		for (var n = 0; n < Eplant.GeneticElement.AnnotationTag.Colors.length; n++) {
			/* Get color */
			var color = Eplant.GeneticElement.AnnotationTag.Colors[n];
			
			/* Create AnnotationTag */
			var annotationTag = new Eplant.Views.ChromosomeView.AnnotateDialog.AnnotationTag(color, this);
			this.annotationTags.push(annotationTag);
			$(td).append(annotationTag.domContainer);
		}
		$(tr).append(td);
		$(domTable).append(tr);
		$(this.domContainer).append(domTable);
	};
	
	/**
		* Creates and opens the dialog.
	*/
	Eplant.Views.ChromosomeView.AnnotateDialog.prototype.createDialog = function() {
		var options = {};
		options.title = "Annotation Editor";
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
		}, this);
		options.ok =$.proxy(function(event, ui) {
			/* Get annotation size */
			this.size = $(this.domSize).spinner("value");
			if (isNaN(this.size) || this.size === null || this.size === undefined) {
				this.size = 0;
			}
			var note = $(this.domNote).val();
			/* Get selected annotation tag colors */
			this.selectedAnnotationTagColors = [];
			for (var n = 0; n < this.annotationTags.length; n++) {
				var annotationTag = this.annotationTags[n];
				if (annotationTag.isSelected) {
					this.selectedAnnotationTagColors.push(annotationTag.color);
				}
			}
			
			
			var radio = $('input[type="radio"]:checked',this.domContainer);
			var identifier = radio.val()
			var geneticElement = this.chromosomeView.species.getGeneticElementByIdentifier(identifier);
			if(geneticElement!=null){
				/* Try to get Annotation */
				var annotation = this.chromosomeView.getAnnotation(geneticElement);
				
				/* Check whether Annotation exists */
				if (annotation) {	// Yes
					/* Update Annotation */
					annotation.color = this.color;
					annotation.size = this.size;
					annotation.note =note;
					annotation.update();
				}
				else {		// No
					/* Create Annotation */
					annotation = new Eplant.Views.ChromosomeView.Annotation(geneticElement, this.color, this.size, this.chromosomeView,note);
					this.chromosomeView.annotations.push(annotation);
				}
				
				/* Make sure all tags are unselected */
				for (var m = 0; m < geneticElement.annotationTags.length; m++) {
					var annotationTag = geneticElement.annotationTags[m];
					if (annotationTag.isSelected) {
						annotationTag.unselect();
					}
				}
				
				/* Select tags */
				for (var m = 0; m < this.selectedAnnotationTagColors.length; m++) {
					var annotationTag = geneticElement.getAnnotationTagByColor(this.selectedAnnotationTagColors[m]);
					if (annotationTag) {
						annotationTag.select();
					}
				}
				
			}
		}, this);
		this.dialog = window.top.art.dialog(options);
		
		
	};
	
	/**
		* Closes the dialog.
	*/
	Eplant.Views.ChromosomeView.AnnotateDialog.prototype.close = function() {
		/* Close dialog */
		$(this.domContainer).dialog("close");
	};
	
	/**
		* Removes the dialog.
	*/
	Eplant.Views.ChromosomeView.AnnotateDialog.prototype.remove = function() {
		/* Remove AnnotationTags */
		for (var n = 0; n < this.annotationTags.length; n++) {
			var annotationTag = this.annotationTags[n];
			annotationTag.remove();
		}
		
		/* Remove DOM elements */
		$(this.domContainer).remove();
	};
	
})();