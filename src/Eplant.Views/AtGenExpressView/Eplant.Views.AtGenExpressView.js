(function() {

/**
 * Eplant.Views.AtGenExpressView class
 * Coded by Hans Yu
 * UI designed by Jamie Waese
 *
 * eAtGenExpress View for browsing gene expression data of plant tissues during development as eFP.
 *
 * @constructor
 * @augments Eplant.BaseViews.EFPView
 * @param {Eplant.GeneticElement} geneticElement The GeneticElement associated with this view.
 */
Eplant.Views.AtGenExpressView = function(geneticElement) {
	// Get constructor
	var constructor = Eplant.Views.AtGenExpressView;

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
	var efpSvgURL = 'data/plant/AtGenExpress/' + geneticElement.species.scientificName.replace(" ", "_") + '.svg';
	var efpXmlURL = 'data/plant/AtGenExpress/' + geneticElement.species.scientificName.replace(" ", "_") + '.xml';
	Eplant.BaseViews.EFPView.call(this, geneticElement, efpSvgURL,efpXmlURL, {
	});
};
ZUI.Util.inheritClass(Eplant.BaseViews.EFPView, Eplant.Views.AtGenExpressView);	// Inherit parent prototype

Eplant.Views.AtGenExpressView.viewName = "AtGenExpressView";
Eplant.Views.AtGenExpressView.displayName = "AtGenExpress eFP";
Eplant.Views.AtGenExpressView.hierarchy = "genetic element";
Eplant.Views.AtGenExpressView.magnification = 25;
Eplant.Views.AtGenExpressView.description = "AtGenExpress eFP";
Eplant.Views.AtGenExpressView.citation = "";
Eplant.Views.AtGenExpressView.activeIconImageURL = "";
Eplant.Views.AtGenExpressView.availableIconImageURL = "";
Eplant.Views.AtGenExpressView.unavailableIconImageURL = "";

})();
