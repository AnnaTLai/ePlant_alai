(function() {
	
	/**
		* Eplant.ExperimentSelectList.Choice class
		* Coded by Hans Yu
		* UI designed by Jamie Waese
		*
		* Describes a Choice of the Select UI in ExperimentView
		*
		* @constructor
	*/
	Eplant.ExperimentSelectList.Choice = function(view, viewList) {
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
	
	Eplant.ExperimentSelectList.Choice.prototype.updateMax = function() {
		//if(this.max===0){
			if(Eplant.activeSpecies.activeGeneticElement && Eplant.activeSpecies.activeGeneticElement.views[this.viewName].isLoadedData)
			{
				if(Eplant.activeSpecies.activeGeneticElement.views[this.viewName].max){
					this.max=Math.round(Eplant.activeSpecies.activeGeneticElement.views[this.viewName].max);
				}
			}
		//}
	}
	



Eplant.ExperimentSelectList.Choice.prototype.getSnapshot = function() {
	var view = Eplant.activeSpecies.activeGeneticElement.views[this.viewName];
	//if(view.isLoadedData&&view.snapshot){
		this.svgImage = view.svgImage;
	/*}
	else{
		var svgUrl = 'data/experiment/efps/'+ this.viewName.substring(0, this.viewName.length - 4)  +"/"+ Eplant.activeSpecies.scientificName.replace(' ', '_') + '.svg';
		this.svgImage = document.createElement('img');
		this.svgImage.src = svgUrl;
		$(this.svgImage).css({width:'100%',height:'80%',left:0,top:0});
	}*/
	
	return this.svgImage;
};







})();
