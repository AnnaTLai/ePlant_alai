(function() {

/**
 * Eplant.Views.ExperimentalView class
 * Coded by Hans Yu
 * UI designed by Jamie Waese
 *
 * ePlant View for browsing gene expression data of plant tissues during development as eFP.
 *
 * @constructor
 * @augments Eplant.Experimental.EFPView
 * @param {Eplant.GeneticElement} geneticElement The GeneticElement associated with this view.
 */
Eplant.Views.ShootApexView = function(geneticElement) {
	// Get constructor
	var constructor = Eplant.Views.ShootApexView;

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

	var efpSvgURL = 'data/experiment/efps/ShootApex/' + geneticElement.species.scientificName.replace(" ", "_") + '.svg';
	var efpXmlURL = 'data/experiment/efps/ShootApex/' + geneticElement.species.scientificName.replace(" ", "_") + '.xml';
	Eplant.BaseViews.EFPView.call(this, geneticElement, efpSvgURL,efpXmlURL, {
	});
};
ZUI.Util.inheritClass(Eplant.BaseViews.EFPView, Eplant.Views.ShootApexView);	// Inherit parent prototype

Eplant.Views.ShootApexView.viewName = "ShootApexView";
Eplant.Views.ShootApexView.displayName = "Shoot Apex eFP (RNA-Seq data)";
Eplant.Views.ShootApexView.hierarchy = "genetic element";
Eplant.Views.ShootApexView.magnification = 35;
Eplant.Views.ShootApexView.description = "Shoot Apex eFP";
Eplant.Views.ShootApexView.citation = "";
Eplant.Views.ShootApexView.activeIconImageURL = "";
Eplant.Views.ShootApexView.availableIconImageURL = "";
Eplant.Views.ShootApexView.unavailableIconImageURL = "";


})();
