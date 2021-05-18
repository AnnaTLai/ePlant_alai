(function() {
	/**
		* Eplant.PlantSelectList.Choice class
		* Coded by Hans Yu
		* UI designed by Jamie Waese
		*
		* Describes a Choice of the Select UI in PlantView
		*
		* @constructor
	*/
	Eplant.PlantSelectList.Choice = function(view, viewList) {
		/* Attributes */
		this.view = view;
		this.selectList = viewList;	// SelectList object that owns this Choice object
		this.dom = null;			// DOM element of this Choice
		this.vo = null;			// ViewObject associated with this Choice object
		this.svgImage = null;
		this.viewName = this.view.replace(/ /g, "") + "View";
		this.viewFullName = Eplant.Views[this.viewName].displayName;
		/* Create DOM */
		//this.updateMax();
		//this.createDOM();
		this.max= 0;
	};
	
	Eplant.PlantSelectList.Choice.prototype.updateMax = function() {
		//if(this.max===0){
			if(Eplant.activeSpecies.activeGeneticElement && Eplant.activeSpecies.activeGeneticElement.views[this.viewName].isLoadedData)
			{
				if(Eplant.activeSpecies.activeGeneticElement.views[this.viewName].max){
					this.max=Math.round(Eplant.activeSpecies.activeGeneticElement.views[this.viewName].max);
				}
			}
		//}
	}

	Eplant.PlantSelectList.Choice.prototype.getSnapshot = function() {
		var view = Eplant.activeSpecies.activeGeneticElement.views[this.viewName];
		this.svgImage = view.svgImage;
		return this.svgImage;
	};
})();
