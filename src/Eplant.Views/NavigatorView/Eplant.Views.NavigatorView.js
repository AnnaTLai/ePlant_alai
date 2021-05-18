// Note the function wrap to prevent clashed with global variables. Also, IIFE.
(function () {
	// Constructor for our view
	/** Note: We're assigning NavigatorView as a method of Eplant.Views, which is a property of Eplant.
	    When "Eplant.js" calls for all properties in Eplant.Views as part of its
	    initialization (line 99), your NavigatorView will be one of them */
	var query = "";
	var species = "";
	Eplant.Views.NavigatorView = function (geneticElement) {
		// First, we need to create reference of this constructor
		var constructor = Eplant.Views.NavigatorView;

		// Now, we pass this constructor to the Eplant.View constructor
		// Remember, call will rebind 'this' and immediately call the Eplant.View function

		Eplant.View.call(this,
			constructor.displayName,
			// Name of the View visible to the user
			constructor.viewName,
			// Hierarchy of the View
			constructor.hierarchy,
			// Magnification level of the View
			constructor.magnification,
			// Description of the View visible to the user
			constructor.description,
			// Citation template of the View
			constructor.citation,
			// URL for the active icon image
			constructor.activeIconImageURL,
			// URL for the available icon image
			constructor.availableIconImageURL,
			// URL for the unavailable icon image
			constructor.unavailableIconImageURL
		);

		/*ATTRIBUTES*/
		this.geneticElement = geneticElement;
		this.createViewSpecificUIButtons();

		if(this.name)
		{
			$(this.labelDom).empty();
			this.viewNameDom = document.createElement("span");
			query = this.geneticElement.identifier;
			species = "Arabidopsis"; // change for other species
			labelText = this.geneticElement.identifier;
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

		/*initialize dom*/
		this.domHolder = document.createElement('div');
		this.domHolder.id = "domHolder";
		$(this.domHolder).css({
			width: '100%',
			height: '100%',
			'background-color':"#ffffff"
		});
		this.domContainer = document.createElement('div');
		$(this.domContainer).attr('id', 'NavView' + this.geneticElement.identifier);
		$(this.domContainer).css({
			width: '100%',
			height: '100%'
		});

		$(this.domHolder).append(this.domContainer);
		$(document.body).append(this.domHolder);


		/*call loading functions*/

		this.loadNavigatorData();

		//BEN CHANGED (removed as this is not the right way to do this)
		//setTimeout($.proxy(function() {this.loadFinish();}, this), 10000);
	};

	this.newick = null;
	this.newickNodes = [];
	this.eFPLinks = null;
	this.seq = null;
	this.scc = null;
	this.genomes = null;
	this.query = "";

	/** We set these static values after the constructor */
	ZUI.Util.inheritClass(Eplant.View, Eplant.Views.NavigatorView);
	Eplant.Views.NavigatorView.displayName = 'Navigator viewer';
	Eplant.Views.NavigatorView.viewName = 'NavigatorView'; //BEN CHANGED (consistency with other views)
	Eplant.Views.NavigatorView.hierarchy = 'genetic element';
	Eplant.Views.NavigatorView.magnification = 3;
	Eplant.Views.NavigatorView.description = 'Navigator viewer';
	Eplant.Views.NavigatorView.citation = '';
	Eplant.Views.NavigatorView.activeIconImageURL = 'img/active/navigator.png';
	Eplant.Views.NavigatorView.availableIconImageURL = 'img/available/navigator.png';
	Eplant.Views.NavigatorView.unavailableIconImageURL = 'img/unavailable/navigator.png';

	/*Constants*/
	Eplant.Views.NavigatorView.domContainer = null;

	/**
		* Initializes the view's pre-requisites.
		* @returns {void}
	*/
	Eplant.Views.NavigatorView.initialize = function () {
		// Get DOM container and cache
		var navContainer = document.getElementById('Navigator_container');
		var navCache = document.getElementById('Navigator_cache');
		// Assignment to navigatorView attributes
		Eplant.Views.NavigatorView.domContainer = navContainer;
		Eplant.Views.NavigatorView.domCacheContainer = navCache;
		$(Eplant.Views.NavigatorView.domContainer).css({
			"visibility": "hidden"
		});
	};


	/** Include things like initialize, active, inactive, etc. below here */
	// Eplant.Views.NavigatorView.initialize() = function () { ... };
	// Eplant.Views.NavigatorView.prototype.active() = function () { ... };
	Eplant.Views.NavigatorView.prototype.loadNavigatorData = function() {
		var treeContainer = $(this.domContainer).find('#NavView' + this.geneticElement.identifier).selector;
		//var that = this;
		$.ajax({
				type: "GET",
				url: '//bar.utoronto.ca/webservices/eplant_navigator/cgi-bin/eplant_navigator_service.cgi?primaryGene=' + query + '&species=' + species + '&dataset=Developmental&checkedspecies=arabidopsis_poplar_medicago_soybean_rice_barley_maize_potato_tomato_grape',
				dataType: "json",
				success: function (data) {
						console.log(data);
						this.newick = Newick.parse(data.tree);
						this.newickNodes = [];
						this.eFPLinks = data["efp_links"];
						this.seq = data["sequence_similarity"];
						this.scc = data["SCC_values"];
						this.genomes = data["genomes"];


						function buildNewickNodes(node, callback) {
							this.newickNodes.push(node);
							if (node.branchset) {
								for (var i=0; i < node.branchset.length; i++) {
									buildNewickNodes(node.branchset[i]);
								}
							}
						}
						buildNewickNodes(this.newick);
						//build
						//'#Navigator_container'

					 	//BEN CHANGED
						const lineHeight = 30;
						// this.genomes has the genome for all except the active gene.
						//instead of recursively going through the tree object we can just add one to its length
						const numLines = Object.keys(this.genomes).length + 1;
						
						d3.phylogram.build(treeContainer, this.newick, query, this.eFPLinks, this.genomes, this.scc, this.seq, {
							width: 160, // to change width/height of actual tree, not container
							height: lineHeight * numLines, //BEN CHANGED
						});
					}
		},this).then(() => {
			//BEN CHANGED	
			setTimeout(() => {
				this.loadFinish();
			},5000)
		});

	}

	/**
		* This method should be called when the View finishes loading.
		* If no loading is required, call this method in the constructor.
	*/
 	//BEN CHANGED
	Eplant.Views.NavigatorView.loadFinish = function() {
		/* Set load status */
		//this.isLoadedData = true;
        Eplant.View.prototype.loadFinish.call(this)
	}

	/**
		* Active callback method.
		*
		* @override
	*/
	Eplant.Views.NavigatorView.prototype.active = function() {
		// Call parent method
		Eplant.View.prototype.active.call(this);

		if (this.isLoadedData) {
			$(this.domContainer).appendTo(Eplant.Views.NavigatorView.domContainer);

		}

		// Data loaded, make it visible
		$(Eplant.Views.NavigatorView.domContainer).css({
	   		'visibility': 'visible',
		});

		// Make tree view visible
		var treeContainer = $(this.domContainer).find('#NavView' + this.geneticElement.identifier).selector;
		$("#NavView" + this.geneticElement.identifier).css({'overflow':'auto'});
		$(treeContainer).css({
			'visibility': 'visible',
		});
	};
	Eplant.Views.NavigatorView.prototype.afterActive = function() {
		Eplant.View.prototype.afterActive.call(this);
		$("#NavView" + this.geneticElement.identifier).css({'overflow':'auto'});
		//BEN CHANGED (make the tree not overlap with the title)
		$(this.domContainer).css({
			top: "30px",
			position: 'relative'
		});

	};

	Eplant.Views.NavigatorView.prototype.remove = function () {
		// Call parent method
		Eplant.View.prototype.remove.call(this);

	};


	/**
		* Inactive callback method.
		*
		* @override
	*/
	Eplant.Views.NavigatorView.prototype.inactive = function() {
		// Call parent method
		Eplant.View.prototype.inactive.call(this);
		$(this.domContainer).detach();

		// Hide 
		$(Eplant.Views.NavigatorView.domContainer).css({
			"visibility": "hidden"
		});
	};

	/**
		* Creates view-specific UI buttons.
		* @returns {void}
	*/
	Eplant.Views.NavigatorView.prototype.createViewSpecificUIButtons = function () {
		// // Filter
		// var showButton = new Eplant.ViewSpecificUIButton(
		// // imageSource
		// 'img/navigator-show-button.png',
		// // description
		// 'Show icons.',
		// function (data) {
		// 	//TODO
		// }, {navigatorView: this});
		// this.viewSpecificUIButtons.push(showButton);
		//
		// // Legend
		// var clearButton = new Eplant.ViewSpecificUIButton(
		// // imageSource
		// 'img/navigator-clear-button.png',
		// // description
		// 'Clear icons.',
		// function (data) {
		// 	//TODO
		// }, {navigatorView: this});
		// this.viewSpecificUIButtons.push(clearButton);
	};


	/*ANIMATIONS*/
	/**
		* Returns The exit-out animation configuration.
		*
		* @override
		* @return {Object} The exit-out animation configuration.
	*/
	Eplant.Views.NavigatorView.prototype.getExitOutAnimationConfig = function() {
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
	Eplant.Views.NavigatorView.prototype.getEnterOutAnimationConfig = function() {
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
	Eplant.Views.NavigatorView.prototype.getExitInAnimationConfig = function() {
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
	Eplant.Views.NavigatorView.prototype.getEnterInAnimationConfig = function() {
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



}()); // Note: IIFE, so this function is immediately added as a method of Eplant.Views when loading
