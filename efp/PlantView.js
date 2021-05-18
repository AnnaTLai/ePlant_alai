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
PlantView = function(geneticElement) {
  // Get constructor
  var constructor = PlantView;

  // Call parent constructor
  Eplant.View.call(this,
    constructor.viewName,      // Name of the View visible to the user
    constructor.hierarchy,      // Hierarchy of the View
    constructor.magnification,      // Magnification level of the View
    constructor.description,      // Description of the View visible to the user
    constructor.citation,      // Citation template of the View
    constructor.activeIconImageURL,    // URL for the active icon image
    constructor.availableIconImageURL,    // URL for the available icon image
    constructor.unavailableIconImageURL  // URL for the unavailable icon image
  );

  /* Call eFP constructor */
  var efpSvgURL = 'data/plant/AtGenExpress/' + geneticElement.species.scientificName.replace(" ", "_") + '.svg';
  var efpXmlURL = 'data/plant/AtGenExpress/' + geneticElement.species.scientificName.replace(" ", "_") + '.xml';
  EFP.call(this, geneticElement, efpSvgURL,efpXmlURL, {
  });

  /* Title of the view */
  this.viewGeneID = new ZUI.ViewObject({
    shape: "text",
    positionScale: "screen",
    sizeScale: "screen",
    x: 400,
    y: 7,
    size: 15,
    fillColor: Eplant.Color.DarkGrey,
    content: geneticElement.identifier,
    centerAt: "left top"
  });
};
ZUI.Util.inheritClass(EFP, PlantView);  // Inherit parent prototype

PlantView.viewName = "Plant viewer";
PlantView.hierarchy = "genetic element";
PlantView.magnification = 30;
PlantView.description = "Plant viewer";
PlantView.citation = "";
PlantView.activeIconImageURL = "img/active/plant.png";
PlantView.availableIconImageURL = "img/available/plant.png";
PlantView.unavailableIconImageURL = "img/unavailable/plant.png";

/* Draw method for Cell View */
PlantView.prototype.draw = function() {
  this.viewGeneID.draw();
  Eplant.BaseViews.EFPView.prototype.draw.call(this);
};

/* Clear up the view */
PlantView.prototype.remove = function() {
  this.viewGeneID.remove();
  Eplant.BaseViews.EFPView.EFPView.prototype.remove.call(this);
}; 

})();
