(function() {

	/**
		* Eplant.Views.PlantView class
		* Coded by Hans Yu
		* UI designed by Jamie Waese
		*
		* ePlant View for browsing gene expression data of plant tissues during development as eFP.
		*
		* @constructor
		* @augments Eplant.BaseViews.EFPView
		* @param {Eplant.GeneticElement} geneticElement The GeneticElement associated with this view.
	*/
	Eplant.Views.ChemicalView = function(geneticElement) {
		// Get constructor
		var constructor = Eplant.Views.ChemicalView;

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

		/* Call eFP constructor */
		var efpSvgURL = 'data/experiment/efps/Chemical/' + geneticElement.species.scientificName.replace(" ", "_") + '.svg';
		var efpXmlURL = 'data/experiment/efps/Chemical/' + geneticElement.species.scientificName.replace(" ", "_") + '.xml';
		Eplant.BaseViews.EFPView.call(this, geneticElement, efpSvgURL,efpXmlURL, {
		});

	};
	ZUI.Util.inheritClass(Eplant.BaseViews.EFPView, Eplant.Views.ChemicalView);	// Inherit parent prototype

Eplant.Views.ChemicalView.viewName = "ChemicalView";
	Eplant.Views.ChemicalView.displayName = "Chemical eFP";
	Eplant.Views.ChemicalView.hierarchy = "genetic element";
	Eplant.Views.ChemicalView.magnification = 35;
	Eplant.Views.ChemicalView.description = "Chemical eFP";
	Eplant.Views.ChemicalView.citation = "";
	Eplant.Views.ChemicalView.activeIconImageURL = "img/active/plant.png";
	Eplant.Views.ChemicalView.availableIconImageURL = "img/available/plant.png";
	Eplant.Views.ChemicalView.unavailableIconImageURL = "img/unavailable/plant.png";

	Eplant.Views.ChemicalView.prototype.loadsvg = function() {


		this.Xhrs.loadsvgXhr=$.get(this.svgURL, $.proxy(function(data) {
			this.Xhrs.loadsvgXhr=null;
			// Get the SVG tag, ignore the rest
			var $svg = $(data).find('svg');
			$("g", $svg).not('[id*=label],[id*=Label]').attr('stroke', "black");
			$('[id*=outline],[id*=Outline]', $svg).remove();
			$("text", $svg).attr('stroke','');
			$("text", $svg).attr('fill','black');
			// Add replaced image's ID to the new SVG

			// Add replaced image's classes to the new SVG
			$svg = $svg.attr('class', 'efp-view-svg');
			// Remove any invalid XML tags as per http://validator.w3.org
			$svg = $svg.removeAttr('xmlns:a');

			// Replace image with new SVG
			//$img.replaceWith($svg);
			$svg.draggable();
			this.svgdom = $svg;
			this.isSvgLoaded=true;
		}, this), 'xml');

	};

})();
