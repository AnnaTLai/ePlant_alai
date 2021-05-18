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
Eplant.Views.BioticStressPhytophthorainfestansView = function(geneticElement) {
	// Get constructor
	var constructor = Eplant.Views.BioticStressPhytophthorainfestansView;

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
		constructor.unavailableIconImageURL  // URL for the unavailable icon image
		
	);
	
	/* Call eFP constructor */ 

	var efpSvgURL = 'data/experiment/efps/BioticStressPhytophthorainfestans/' + geneticElement.species.scientificName.replace(" ", "_") + '.svg';
	var efpXmlURL = 'data/experiment/efps/BioticStressPhytophthorainfestans/' + geneticElement.species.scientificName.replace(" ", "_") + '.xml';
	Eplant.BaseViews.EFPView.call(this, geneticElement, efpSvgURL,efpXmlURL, {
	});
};
ZUI.Util.inheritClass(Eplant.BaseViews.EFPView, Eplant.Views.BioticStressPhytophthorainfestansView);	// Inherit parent prototype

Eplant.Views.BioticStressPhytophthorainfestansView.viewName = "BioticStressPhytophthorainfestansView";
Eplant.Views.BioticStressPhytophthorainfestansView.displayName = "Biotic Stress Phytophthora infestans eFP";
Eplant.Views.BioticStressPhytophthorainfestansView.hierarchy = "genetic element";
Eplant.Views.BioticStressPhytophthorainfestansView.magnification = 35;
Eplant.Views.BioticStressPhytophthorainfestansView.description = "Biotic Stress Phytophthora infestans eFP";
Eplant.Views.BioticStressPhytophthorainfestansView.citation = "";
Eplant.Views.BioticStressPhytophthorainfestansView.activeIconImageURL = "";
Eplant.Views.BioticStressPhytophthorainfestansView.availableIconImageURL = "";
Eplant.Views.BioticStressPhytophthorainfestansView.unavailableIconImageURL = "";


})();
