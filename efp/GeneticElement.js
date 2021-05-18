(function() {

/**
 * Eplant.GeneticElement class
 * By Hans Yu
 *
 * Describes an ePlant genetic element.
 *
 * @constructor
 * @param {Object} info Information for this genetic element wrapped in an Object.
 * @param {Eplant.Chromosome} info.chromosome Chromosome that contains this genetic element.
 * @param {String} info.identifier Identifier of this genetic element.
 * @param {Array<String>} info.aliases Array of aliases of this genetic element.
 * @param {String} info.annotation Annotation of this genetic element.
 * @param {String} info.type Type of this genetic element.
 * @param {String} info.strand Strand of this genetic element ("+" or "-").
 * @param {Number} info.start Start base-pair position of this genetic element.
 * @param {Number} info.end End base-pair position of this genetic element.
 */
GeneticElement = function(info) {
  /* Store information */
  this.chromosome = (info.chromosome === undefined) ? null : info.chromosome;
  this.identifier = (info.identifier === undefined) ? null : info.identifier;
  this.aliases = (info.aliases === undefined) ? null : info.aliases;
  this.annotation = (info.annotation === undefined) ? null : info.annotation;
  this.type = (info.type === undefined) ? null : info.type;
  this.strand = (info.strand === undefined) ? null : info.strand;
  this.start = (info.start === undefined) ? null : info.start;
  this.end = (info.end === undefined) ? null : info.end;
  this.species = (info.chromosome === undefined || info.chromosome.species === undefined) ? null : info.chromosome.species;

  /* Check whether necessary information are provided */
  if (this.chromosome === null) console.log("Warning: No Chromosome is specified for the GeneticElement.");
  if (this.identifier === null) console.log("Warning: No identifier is specified for the GeneticElement.");
  if (this.type === null) console.log("Warning: No type is specified for the GeneticElement.");
  if (this.start === null) console.log("Warning: No start position is specified for the GeneticElement.");
  if (this.end === null) console.log("Warning: No end position is specified for the GeneticElement.");

  /* Other attributes */
  this.views = null;      // Object container for Views
  this.isLoadedViews = false;    // Whether Views are loaded
  this.geneticElementDialog = null;  // GeneticElementDialog associated with this GeneticElement
  this.geneticElementListDialog = null;  // GeneticElementListDialog associated with this GeneticElement
  this.geneticElementInfoDialog = null;  // GeneticElementInfoDialog associated with this GeneticElement
  this.annotationTags = [];    // Annotation tags
  

};

})();
