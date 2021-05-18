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
Eplant.Views.GuardCellMutantAndWildTypeGuardCellABAResponseView = function(geneticElement) {
	// Get constructor
	var constructor = Eplant.Views.GuardCellMutantAndWildTypeGuardCellABAResponseView;

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
	var efpSvgURL = 'data/experiment/efps/GuardCellMutantAndWildTypeGuardCellABAResponse/' + geneticElement.species.scientificName.replace(" ", "_") + '.svg';
	var efpXmlURL = 'data/experiment/efps/GuardCellMutantAndWildTypeGuardCellABAResponse/' + geneticElement.species.scientificName.replace(" ", "_") + '.xml';
	Eplant.BaseViews.EFPView.call(this, geneticElement, efpSvgURL,efpXmlURL, {
	});
	
};
ZUI.Util.inheritClass(Eplant.BaseViews.EFPView, Eplant.Views.GuardCellMutantAndWildTypeGuardCellABAResponseView);	// Inherit parent prototype

Eplant.Views.GuardCellMutantAndWildTypeGuardCellABAResponseView.viewName = "GuardCellMutantAndWildTypeGuardCellABAResponseView";
Eplant.Views.GuardCellMutantAndWildTypeGuardCellABAResponseView.displayName = "Guard Cell Mutant And Wild Type Guard Cell ABA Response eFP";
Eplant.Views.GuardCellMutantAndWildTypeGuardCellABAResponseView.hierarchy = "genetic element";
Eplant.Views.GuardCellMutantAndWildTypeGuardCellABAResponseView.magnification = 35;
Eplant.Views.GuardCellMutantAndWildTypeGuardCellABAResponseView.description = "Guard Cell Mutant And Wild Type Guard Cell ABA Response eFP";
Eplant.Views.GuardCellMutantAndWildTypeGuardCellABAResponseView.citation = "";
Eplant.Views.GuardCellMutantAndWildTypeGuardCellABAResponseView.activeIconImageURL = "";
Eplant.Views.GuardCellMutantAndWildTypeGuardCellABAResponseView.availableIconImageURL = "";
Eplant.Views.GuardCellMutantAndWildTypeGuardCellABAResponseView.unavailableIconImageURL = "";


})();
