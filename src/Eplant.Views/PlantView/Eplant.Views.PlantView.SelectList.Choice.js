(function() {
	
	/**
		* Eplant.Views.PlantView.SelectList.Choice class
		* Coded by Hans Yu
		* UI designed by Jamie Waese
		*
		* Describes a Choice of the Select UI in PlantView
		*
		* @constructor
	*/
	Eplant.Views.PlantView.SelectList.Choice = function(view, viewList) {
		/* Attributes */
		this.view = view;		// View associated with this Choice object
		this.selectList = viewList;	// SelectList object that owns this Choice object
		this.dom = null;			// DOM element of this Choice
		this.vo = null;			// ViewObject associated with this Choice object
		this.svgImage = null;
		this.viewName = this.view.replace(/ /g, "") + "View";
		this.viewFullName = Eplant.Views[this.viewName].viewName;
		/* Create DOM */
		//this.updateMax();
		//this.createDOM();
		this.max= 0;
		
		
		
		
	};
	
	Eplant.Views.PlantView.SelectList.Choice.prototype.updateMax = function() {
		if(this.max===0){
			if(Eplant.activeSpecies.activeGeneticElement && Eplant.activeSpecies.activeGeneticElement.views[this.viewName].isLoadedData)
			{
				if(Eplant.activeSpecies.activeGeneticElement.views[this.viewName].max){
					this.max=Eplant.activeSpecies.activeGeneticElement.views[this.viewName].max;
				}
			}
		}
	}
	
	/**
		* Creates the DOM element
	*/
	Eplant.Views.PlantView.SelectList.Choice.prototype.createDOM = function() {
		if(this.dom)
		{
			$(this.dom).remove();
			this.dom = null;
		}
		/* Create DOM element */
		this.dom = document.createElement("span");
		
		/* Set CSS class for styling */
		$(this.dom).addClass("efp-selectList-choice");
		$(this.dom).attr("id", this.view.replace(/ /g, "") + "ViewLabel");
		
		if(Eplant.activeSpecies.activeGeneticElement && Eplant.activeSpecies.activeGeneticElement.views[this.viewName].isLoadedData)
		{
			$(this.dom).addClass('choice-view-loaded-data');
		}
		/* Add italic CSS styling */
		$(this.dom).css("font-style", "italic");
		
		/* Set content */
		$(this.dom).html(this.view);
		
		/* Bind event handler to the "mouseover" event */
		$(this.dom).mouseover($.proxy(function() {
			/* Return if species view is animating */
			if (this.selectList.speciesView.isAnimating) {
				return;
			}
			
			/* Unselect previous selected choice */
			if (this.selectList.selected) {
				this.selectList.selected.unselect();
			}
			
			/* Select this choice */
			this.select();
			
		}, this));
		
		/* Bind event handler to the "click" event */
		$(this.dom).click($.proxy(function() {
			/* Select this choice, if not already selected */
			if (this.selectList.selected != this) {
				/* Unselect previous selected choice */
				if (this.selectList.selected) {
					this.selectList.selected.unselect();
				}
				
				/* Select this choice */
				this.select();
			}
			
			
			if($(this.dom).hasClass("choice-view-loaded-data"))
			{
				this.selectList.remove();
				Eplant.changeActiveView(Eplant.activeSpecies.activeGeneticElement.views[this.viewName]);
				
			}
		//}
	}, this));
	
	/* Append DOM to the SelectList container */
	$(this.selectList.domSelectList).append(this.dom);
};

/**
	* Creates the ViewObject.
	
	Eplant.Views.PlantView.SelectList.Choice.prototype.createVO = function() {
	this.vo = new ZUI.ViewObject({
	shape: "svg",
	positionScale: "world",
	sizeScale: "world",
	centerAt: "center center",
	x: ZUI.width / 6,
	y: 0,
	url: 'data/species/' + this.species.scientificName.replace(' ', '_') + '.svg'
	});
	};
*/

/**
	* Selects this Choice.
*/
Eplant.Views.PlantView.SelectList.Choice.prototype.select = function() {
	/* Add CSS class for selected Choice */
	$(this.dom).addClass("eplant-selectList-choice-selected");
	
	/* Select this Choice */
	this.selectList.selected = this;
	if(!this.svgImage){
		this.svgImage = this.getSnapshot();
	}
	$(this.selectList.domPreviewHolder).append(this.svgImage);
	
};

Eplant.Views.PlantView.SelectList.Choice.prototype.getSnapshot = function() {
	var view = Eplant.activeSpecies.activeGeneticElement.views[this.viewName];
	if(view.isLoadedData&&view.snapshot){
		this.svgImage = view.snapshot;
	}
	else{
		var svgUrl = 'data/plant/'+ this.viewName.substring(0, this.viewName.length - 4)  +"/"+ Eplant.activeSpecies.scientificName.replace(' ', '_') + '.svg';
		this.svgImage = document.createElement('img');
		this.svgImage.src = svgUrl;
		$(this.svgImage).css({width:'100%',height:'80%',left:0,top:0});
	}
	$('text',this.svgImage).remove();
	return this.svgImage;
};

/**
	* Unselects this Choice.
*/
Eplant.Views.PlantView.SelectList.Choice.prototype.unselect = function() {
	/* Remove CSS class for selected Choice */
	$(this.dom).removeClass("eplant-selectList-choice-selected");
	
	/* Unselect this Choice */
	if (this.selectList.selected == this) this.selectList.selected = null;
	$(this.svgImage).detach();
};

/**
	* Draws the Choice.
*/
Eplant.Views.PlantView.SelectList.Choice.prototype.draw = function() {
	/* Draw ViewObject */
	//this.vo.draw();
};

/**
	* Refreshes the Choice.
*/
Eplant.Views.PlantView.SelectList.Choice.prototype.refreshDOM = function() {
	/* Draw ViewObject */
	//this.vo.draw();
};

/**
	* Cleans up this Choice object for disposal.
*/
Eplant.Views.PlantView.SelectList.Choice.prototype.remove = function() {
	/* Remove ViewObject */
	//this.vo.remove();
	
	/* Remove DOM element */
	$(this.dom).remove();
	$(this.svgImage).remove();
};


})();
