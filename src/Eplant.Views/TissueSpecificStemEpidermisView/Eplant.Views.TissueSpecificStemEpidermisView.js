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
Eplant.Views.TissueSpecificStemEpidermisView = function(geneticElement) {
	// Get constructor
	var constructor = Eplant.Views.TissueSpecificStemEpidermisView;

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

	var efpSvgURL = 'data/experiment/efps/TissueSpecificStemEpidermis/' + geneticElement.species.scientificName.replace(" ", "_") + '.svg';
	var efpXmlURL = 'data/experiment/efps/TissueSpecificStemEpidermis/' + geneticElement.species.scientificName.replace(" ", "_") + '.xml';
	Eplant.BaseViews.EFPView.call(this, geneticElement, efpSvgURL,efpXmlURL, {
	});

};
ZUI.Util.inheritClass(Eplant.BaseViews.EFPView, Eplant.Views.TissueSpecificStemEpidermisView);	// Inherit parent prototype

Eplant.Views.TissueSpecificStemEpidermisView.viewName = "TissueSpecificStemEpidermisView";
Eplant.Views.TissueSpecificStemEpidermisView.displayName = "Tissue Specific Stem Epidermis eFP";
Eplant.Views.TissueSpecificStemEpidermisView.hierarchy = "genetic element";
Eplant.Views.TissueSpecificStemEpidermisView.magnification = 35;
Eplant.Views.TissueSpecificStemEpidermisView.description = "Tissue Specific Stem Epidermis eFP";
Eplant.Views.TissueSpecificStemEpidermisView.citation = "";
Eplant.Views.TissueSpecificStemEpidermisView.activeIconImageURL = "";
Eplant.Views.TissueSpecificStemEpidermisView.availableIconImageURL = "";
Eplant.Views.TissueSpecificStemEpidermisView.unavailableIconImageURL = "";


})();
