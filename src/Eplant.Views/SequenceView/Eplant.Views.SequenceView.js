(function() {

	/**
		* Eplant.Views.SequenceView class
		* Coded by Hans Yu
		* UI designed by Jamie Waese
		*
		* ePlant view for browsing sequence data.
		* Uses the Dalliance genome browser.
		*
		* @constructor
		* @param {Eplant.GeneticElement} The GeneticElement associated with this view.
	*/
	Eplant.Views.SequenceView = function(geneticElement) {
		// Get constructor
		var constructor = Eplant.Views.SequenceView;

		// Call parent constructor
		Eplant.View.call(this,
		constructor.displayName,				// Name of the View visible to the user
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
		this.viewMode = 'sequence';
		/* Asher: Create DOM container */
		this.domContainer = document.createElement("iframe");
		// Dead Araport URL
		//this.domContainer.src = "https://apps.araport.org/jbrowse/?data=arabidopsis&loc=" + this.geneticElement.chromosome.identifier + ":" + this.geneticElement.start + ".. " + this.geneticElement.end + "&tracks=Araport11_Loci,light_tophat,TAIR9_tDNAs,SALK_tDNAs,TAIR10_genome,Araport11_gene_models&highlight=";
		this.domContainer.src = "https://jbrowse.arabidopsis.org/index.html?data=Araport11&loc=" + this.geneticElement.chromosome.identifier + ":" + this.geneticElement.start + ".. " + this.geneticElement.end + "&tracks=TAIR10_genome%2CAraport11_Loci%2CAraport11_gene_models%2CSALK_tDNAs&highlight=";
		$(this.domContainer).css({
			"position": "absolute",
			"left": 0,
			"top": -1,
			"width": '100%',
			"height": '1px',
			"border": 0
		});
		$(this.domContainer).appendTo(Eplant.Views.SequenceView.domCacheContainer);
		this.labelDom = null;
		// Finish loading
		$(this.domContainer).load($.proxy(function(){
			//this.update();
			this.loadFinish();
		},this));

	};
	ZUI.Util.inheritClass(Eplant.View, Eplant.Views.SequenceView);	// Inherit parent prototype

	Eplant.Views.SequenceView.viewName = "SequenceView";
	Eplant.Views.SequenceView.displayName = "Sequence viewer";
	Eplant.Views.SequenceView.hierarchy = "genetic element";
	Eplant.Views.SequenceView.magnification = 80;
	Eplant.Views.SequenceView.description = "Sequence viewer";
	Eplant.Views.SequenceView.citation = "";
	Eplant.Views.SequenceView.activeIconImageURL = "img/active/sequence.png";
	Eplant.Views.SequenceView.availableIconImageURL = "img/available/sequence.png";
	Eplant.Views.SequenceView.unavailableIconImageURL = "img/unavailable/sequence.png";
	/* Constants */
	Eplant.Views.SequenceView.domContainer = null;		// DOM container for Dalliance

	Eplant.Views.SequenceView.initialize = function() {
		// Get JSmol DOM container
		Eplant.Views.SequenceView.domContainer = ZUI.container;
		Eplant.Views.SequenceView.domCacheContainer = document.getElementById("Sequence_cache");


	};

	/**
		* Active callback method.
		*
		* @override
	*/
	Eplant.Views.SequenceView.prototype.active = function() {
		// Call parent method
		Eplant.View.prototype.active.call(this);

		$('#getImageIcon').hide();
		$('#Sequence_cache').css({
			"visibility": 'visible'
		});
		$(this.domContainer).css({
			"height": '100%'
		});
		// Disable ZUI pointer events
		ZUI.disablePointerEvents();

		// Update AIP JBrowse
		//this.update();
	};

	/**
		* Inactive callback method.
		*
		* @override
	*/
	Eplant.Views.SequenceView.prototype.inactive = function() {
		// Call parent method
		Eplant.View.prototype.inactive.call(this);

		$('#getImageIcon').show();
		$('#Sequence_cache').css({
			"visibility": 'hidden'
		});
		$(this.domContainer).css({
			"height": '0%'
		});

		/* Restore ZUI pointer events */
		ZUI.restorePointerEvents();
	};

	Eplant.Views.SequenceView.prototype.remove = function() {
		// Call parent method
		Eplant.View.prototype.remove.call(this);
		
	};

	/**
		* Updates Dalliance with data from this view.
	*/
	Eplant.Views.SequenceView.prototype.update = function() {
		// Dead Araport URL
		//this.domContainer.src = "https://apps.araport.org/jbrowse/?data=arabidopsis&loc=" + this.geneticElement.chromosome.identifier + ":" + this.geneticElement.start + ".. " + this.geneticElement.end + "&tracks=Araport11_Loci,light_tophat,TAIR9_tDNAs,SALK_tDNAs,TAIR10_genome,Araport11_gene_models&highlight=";
		this.domContainer.src = "https://jbrowse.arabidopsis.org/index.html?data=Araport11&loc=" + this.geneticElement.chromosome.identifier + ":" + this.geneticElement.start + ".. " + this.geneticElement.end + "&tracks=TAIR10_genome%2CAraport11_Loci%2CAraport11_gene_models%2CSALK_tDNAs&highlight=";
	};

})();
