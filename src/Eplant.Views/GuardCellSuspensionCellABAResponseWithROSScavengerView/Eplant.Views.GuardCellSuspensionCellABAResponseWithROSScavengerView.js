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
Eplant.Views.GuardCellSuspensionCellABAResponseWithROSScavengerView = function(geneticElement) {
	// Get constructor
	var constructor = Eplant.Views.GuardCellSuspensionCellABAResponseWithROSScavengerView;

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
	var efpSvgURL = 'data/experiment/efps/GuardCellSuspensionCellABAResponseWithROSScavenger/' + geneticElement.species.scientificName.replace(" ", "_") + '.svg';
	var efpXmlURL = 'data/experiment/efps/GuardCellSuspensionCellABAResponseWithROSScavenger/' + geneticElement.species.scientificName.replace(" ", "_") + '.xml';
	Eplant.BaseViews.EFPView.call(this, geneticElement, efpSvgURL,efpXmlURL, {
	});
	
};
ZUI.Util.inheritClass(Eplant.BaseViews.EFPView, Eplant.Views.GuardCellSuspensionCellABAResponseWithROSScavengerView);	// Inherit parent prototype

Eplant.Views.GuardCellSuspensionCellABAResponseWithROSScavengerView.viewName = "GuardCellSuspensionCellABAResponseWithROSScavengerView";
Eplant.Views.GuardCellSuspensionCellABAResponseWithROSScavengerView.displayName = "Guard Cell Suspension Cell ABA Response With ROS Scavenger eFP";
Eplant.Views.GuardCellSuspensionCellABAResponseWithROSScavengerView.hierarchy = "genetic element";
Eplant.Views.GuardCellSuspensionCellABAResponseWithROSScavengerView.magnification = 35;
Eplant.Views.GuardCellSuspensionCellABAResponseWithROSScavengerView.description = "Guard Cell Suspension Cell ABA Response With ROS Scavenger eFP";
Eplant.Views.GuardCellSuspensionCellABAResponseWithROSScavengerView.citation = "";
Eplant.Views.GuardCellSuspensionCellABAResponseWithROSScavengerView.activeIconImageURL = "";
Eplant.Views.GuardCellSuspensionCellABAResponseWithROSScavengerView.availableIconImageURL = "";
Eplant.Views.GuardCellSuspensionCellABAResponseWithROSScavengerView.unavailableIconImageURL = "";


})();
