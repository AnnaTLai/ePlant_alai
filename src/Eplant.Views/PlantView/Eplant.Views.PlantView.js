(function() {

/**
 * Eplant.Views.PlantView class
 * Coded by Hans Yu
 * UI designed by Jamie Waese
 *
 * ePlant View for browsing and choosing eFP Plant Views
 *
 * @constructor
 * @augments Eplant.View
 */
Eplant.Views.PlantView = function() {
	// Get constructor
	var constructor = Eplant.Views.PlantView;

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

	/* Attributes */
	this.isEntryView = true;		// Identifies this View as the entry View for ePlant
	this.selectList = null;		// SelectList that handles the selection UI
	this.isAnimating = false;		// Whether an animation is taking place

	/* Create SelectList */
	this.selectList = new Eplant.Views.PlantView.SelectList(this);

		//this.loadFinish();

};
ZUI.Util.inheritClass(Eplant.View, Eplant.Views.PlantView);		// Inherit parent prototype

Eplant.Views.PlantView.viewName = "PlantView";
Eplant.Views.PlantView.displayName = "Plant eFP viewers";
Eplant.Views.PlantView.hierarchy = "species";
Eplant.Views.PlantView.magnification = 20;
Eplant.Views.PlantView.description = "Plant eFP viewers";
Eplant.Views.PlantView.citation = "";
Eplant.Views.PlantView.activeIconImageURL = "img/active/plant.png";
Eplant.Views.PlantView.availableIconImageURL = "img/available/plant.png";
Eplant.Views.PlantView.unavailableIconImageURL = "img/unavailable/plant.png";
Eplant.BaseViews.EFPView.viewType = "none";

/**
 * Active callback method.
 *
 * @override
 */
Eplant.Views.PlantView.prototype.active = function() {
	/* Call parent method */
	Eplant.View.prototype.active.call(this);

	/* Update SelectList's selected Choice 
	if (this.selectList.selected) {
		this.selectList.selected.unselect();
	}


	this.selectList.choices[0].select();


	/* Show SelectList 
	this.selectList.show();*/
};

/**
 * Inactive callback method.
 *
 * @override
 */
Eplant.Views.PlantView.prototype.inactive = function() {
	/* Call parent method */
	Eplant.View.prototype.inactive.call(this);

	/* Hide SelectList */
	this.selectList.hide();
};

/**
 * Draws the View's frame.
 *
 * @Override
 */
Eplant.Views.PlantView.prototype.draw = function() {
	/* Call parent method */
	Eplant.View.prototype.draw.call(this);

	/* Draw SelectList */
	this.selectList.draw();
};

/**
 * Cleans up the View for disposal
 *
 * @override
 */
Eplant.Views.PlantView.prototype.remove = function() {
	/* Call parent method */
	Eplant.View.prototype.remove.call(this);

	/* Clean up SelectList */
	this.selectList.remove();
};

/**
 * Returns the enter-out animation configuration.
 *
 * @override
 * @return {Object} The enter-out animation configuration.
 */
Eplant.Views.PlantView.prototype.getEnterOutAnimationConfig = function() {
	var config = Eplant.View.prototype.getEnterOutAnimationConfig.call(this);
	config.sourceX = ZUI.width / 6;
	config.data = {
		speciesView: this
	};
	config.begin = function(data) {
		data.speciesView.isAnimating = true;
	};
	config.end = function(data) {
		data.speciesView.isAnimating = false;
	};
	return config;
};

/**
 * Returns the exit-in animation configuration.
 *
 * @override
 * @return {Object} The exit-in animation configuration.
 */
Eplant.Views.PlantView.prototype.getExitInAnimationConfig = function() {
	var config = Eplant.View.prototype.getExitInAnimationConfig.call(this);
	config.targetX = ZUI.width / 6;
	config.data = {
		speciesView: this
	};
	config.begin = function(data) {
		data.speciesView.isAnimating = true;
	};
	config.end = function(data) {
		data.speciesView.isAnimating = false;
	};
	return config;
};

/**
 * Returns the enter-in animation configuration.
 *
 * @override
 * @return {Object} The enter-in animation configuration.
 */
Eplant.Views.PlantView.prototype.getEnterInAnimationConfig = function() {
	var config = Eplant.View.prototype.getEnterInAnimationConfig.call(this);
	config.sourceX = -ZUI.width / 6 / 500 * (10000 - 500);
	config.data = {
		speciesView: this
	};
	config.begin = function(data) {
		data.speciesView.isAnimating = true;
	};
	config.end = function(data) {
		data.speciesView.isAnimating = false;
	};
	return config;
};



})();
