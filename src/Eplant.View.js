(function() {
	
	/**
		* Eplant.View class
		* By Hans Yu
		*
		* Base class for all ePlant views.
		*
		* @constructor
		* @augments ZUI.View
		* @param {String} name Name of the View visible to the user.
		* @param {String} hierarchy Description of the level of hierarchy.
		* 	Can be "ePlant", "species", or "genetic element".
		* @param {Number} magnification Arbitrary magnification value of the View.
		* 	This is evaluated relative to the magnification value of other Views.
		* 	Whole number value is used to determine the magnification level of the View.
		* 	Decimal number value is used to determine the position of the View relative
		* 	to another with the same Magnification level.
		* @param {String} description Description of the View visible to the user.
		* @param {String} citation Citation template of the View.
		* @param {String} activeIconImageURL URL of the active icon image.
		* @param {String} availableIconImageURL URL of the available icon image.
		* @param {String} unavailableIconImageURL URL of the unavailable icon image.
	*/
	Eplant.View = function(name, viewName, hierarchy, magnification, description, citation, activeIconImageURL, availableIconImageURL, unavailableIconImageURL) {
		/* Call parent constructor */
		ZUI.View.call(this);
		
		/* Store properties */
		this.name = name;				// Name of the View visible to the user
		this.viewName = viewName;
		this.hierarchy = hierarchy;			// Description of the level of hierarchy
		this.magnification = magnification;	// Arbitrary magnification value of the View
		this.description = description;		// Description of the View visible to the user
		this.citation = citation;			// Citation template of the View
		this.activeIconImageURL = activeIconImageURL;			// Image URL of the active icon
		this.availableIconImageURL = availableIconImageURL;		// Image URL of the available icon
		this.unavailableIconImageURL = unavailableIconImageURL;		// Image URL of the unavailable icon
		this.isLoadedData = false;			// Whether data is loaded
		this.viewSpecificUIButtons = [];		// Array of ViewSpecificUIButtons
		this.species = null;				// Associated Species, must define if appropriate
		this.geneticElement = null;			// Associated GeneticElement, must define if appropriate
		this.relatedTabId = null;				// Associated Tab, must define if appropriate
		this.errorLoadingMessageDom = null;
    this.noGene = false; //BEN CHANGED: used for dynamic links

		this.viewGlobalConfigs = {
			
		};			// Configs needed to be stored globally
		
		this.Xhrs = {};
		/* Title of the view
			this.viewTitle = new ZUI.ViewObject({
			shape: "text",
			positionScale: "screen",
			sizeScale: "screen",
			x: 20,
			y: 7,
			size: 15,
			fillColor: Eplant.Color.DarkGrey,
			content: this.name,
			centerAt: "left top"
		});*/
		this.labelDom = document.createElement("h2");
		$(this.labelDom).addClass('selectable viewTitleLabel');
		if(this.name)
		{
			$(this.labelDom).empty();
			this.viewNameDom = document.createElement("span");
			var text = this.name;
			
			if (this.hierarchy==="genetic element"&&this.geneticElement){
				var labelText = this.geneticElement.identifier;
				if(this.geneticElement&&this.geneticElement.aliases && this.geneticElement.aliases.length && this.geneticElement.aliases[0].length) {
					
					labelText += " / " + this.geneticElement.aliases.join(", ");
				}
				text+=': '+labelText;
			}
			
			/*if(this.geneticElement.isRelated){
				text += ", "+this.geneticElement.identifier+" correlates to "+this.geneticElement.relatedGene.identifier+" with an r-value of "+this.geneticElement.rValueToRelatedGene;
			}*/
			this.viewNameDom.appendChild(document.createTextNode(text));
			$(this.viewNameDom).appendTo(this.labelDom);
		}
		this.viewInstruction = Eplant.ViewInstructions[this.name];
	};
	ZUI.Util.inheritClass(ZUI.View, Eplant.View);	// Inherit parent prototype
	
	/**
		* Default active callback method.
		*
		* @override
	*/
	Eplant.View.prototype.active = function() {
		
		/* Append View to History */
		if (!Eplant.history.activeItem || Eplant.history.activeItem.view != this) {
			var historyItem = new Eplant.History.Item(this);
			Eplant.history.addItem(historyItem);
		}
		
		if(this.downloadRawData)
		{
			$("#downloadIcon").show();
		}
		else{
			$("#downloadIcon").hide();
		}
		
		if(Eplant.activeSpecies&&Eplant.citations[Eplant.activeSpecies.scientificName]&&Eplant.citations[Eplant.activeSpecies.scientificName][this.name])
		{
			$("#citationIcon").show();
		}
		else{
			$("#citationIcon").hide();
		}
		
		
		if(this.zoomIn){
			$("#zoomIn").show();
			}else{
			
			$("#zoomIn").hide();
		}
		
		if(this.zoomOut){
			$("#zoomOut").show();
			}else{
			
			$("#zoomOut").hide();
		}
		
		/* Restore cursor */
		ZUI.container.style.cursor = "default";
		
		/* Restore camera */
		ZUI.camera.setPosition(0, 0);
		ZUI.camera.setDistance(500);
		
		/* Attach ViewSpecificUIButtons */
		for (var n = 0; n < this.viewSpecificUIButtons.length; n++) {
			var viewSpecificUIButton = this.viewSpecificUIButtons[n];
			viewSpecificUIButton.attach();
		}
		
		if(this.viewMode)
		{
			Eplant.switchViewMode(this.viewMode);
			$(Eplant.ViewModes[this.viewMode]).append(this.labelDom);
			if(this.errorLoadingMessage){
				$(Eplant.ViewModes[this.viewMode]).append(this.getErrorLoaddingMessageDom());
			}
		}
		else
		{
			Eplant.switchViewMode('zui');
			$('#ZUI_container').append(this.labelDom);
			if(this.errorLoadingMessage){
				$($('#ZUI_container')).append(this.getErrorLoaddingMessageDom());
			}
		}
		
	};
	
	Eplant.View.prototype.getLabelSvg = function() {
		return '<text display="inline" fill="black" stroke="" stroke-width="0.5" stroke-miterlimit="10" font-family="\'Helvetica\'" font-size="20" y="20" x="0">'+$(this.labelDom).text()+'</text>';
	};
	
	Eplant.View.prototype.getErrorLoaddingMessageDom = function() {
		if(!this.errorLoadingMessageDom){
			if(this.reloadingMessageDom){
				$(this.reloadingMessageDom).detach();
				this.reloadingMessageDom=null;
			}
			
			
			this.errorLoadingMessageDom = document.createElement("div");
			$(this.errorLoadingMessageDom).css({
				"position": "absolute",
				"width":"100%",
				"height":"100%",
				"background":"#ffffff",
				"left":0,
				"top":"0",
				"font-size":'1.5em',
				"line-height":'1.5em',
				"z-index":'10',
				"text-align":"center"
			});
			var holder = document.createElement("div");
			$(holder).css({
				top: '50%',
				position: 'absolute',
				width: '100%'
			});
			$(holder).text(this.errorLoadingMessage);
			$(this.errorLoadingMessageDom).append(holder);
			
			var tryAgainButton = document.createElement("div");
			$(tryAgainButton).css({
				top: '60%',
				position: 'absolute',
				left: '50%',
				'margin-left': '-50px'
			});
			$(tryAgainButton).text("Try Again");
			$(tryAgainButton).addClass("greenButton");
			$(tryAgainButton).click($.proxy(function(event){
				var currentTarget = event.currentTarget;
				$(currentTarget).detach();
				this.isLoadedData=false;
				this.loadData();
				Eplant.updateIconDock();
				this.errorLoadingMessage=null;
				$(this.errorLoadingMessageDom).replaceWith(this.getReloadingMessageDom());
				this.errorLoadingMessageDom=null;
				
				/*$(this.errorLoadingMessageDom).detach();
					var errorInfo=this.name +" is reloading, please come back after it is done.";
					
					var dialog = window.top.art.dialog({
					content: errorInfo,
					width: 600,
					minHeight: 0,
					resizable: false,
					draggable: false,
					lock: true
					});
				Eplant.changeActiveView(Eplant.views['HomeView']);*/
			},this));
			$(this.errorLoadingMessageDom).append(tryAgainButton);
		}
		
		return this.errorLoadingMessageDom;
	};
	
	Eplant.View.prototype.loadFail = function() {
		/* Set load status */
		this.errorLoadingMessage="The sample database is not responding. Try again later.";
		this.loadFinish();

	};
	
	
	Eplant.View.prototype.getReloadingMessageDom = function() {
		if(!this.reloadingMessageDom){
			
			this.reloadingMessageDom = document.createElement("div");
			$(this.reloadingMessageDom).css({
				"position": "absolute",
				"width":"100%",
				"height":"100%",
				"background":"#ffffff",
				"left":0,
				"top":"0",
				"font-size":'1.5em',
				"line-height":'1.5em',
				"z-index":'10',
				"text-align":"center"
			});
			var holder = document.createElement("div");
			$(holder).css({
				top: '50%',
				position: 'absolute',
				width: '100%'
			});
			$(holder).html("Reloading<br><img src='img/loading.gif'></img>");
			$(this.reloadingMessageDom).append(holder);
		}
		
		return this.reloadingMessageDom;
	};
	/**
		* Default inactive callback method.
		*
		* @override
	*/
	Eplant.View.prototype.inactive = function() {
		
		$(".qtip").qtip("hide");
		/* Detach ViewSpecificUIButtons */
		for (var n = 0; n < this.viewSpecificUIButtons.length; n++) {
			var viewSpecificUIButton = this.viewSpecificUIButtons[n];
			viewSpecificUIButton.detach();
		}
		
		if(this.labelDom){
			$(this.labelDom).detach();
		}
		if(Eplant.instructionDialog){
			Eplant.instructionDialog.close();
			Eplant.instructionDialog=null;
		}
		
		if(this.errorLoadingMessageDom){
			$(this.errorLoadingMessageDom).detach();
		}
		
	};
	
	/**
		* Default beforeInactive callback method.
		*
		* @override
	*/
	Eplant.View.prototype.beforeInactive = function() {
		if(this.instructionDialog){
			this.instructionDialog.close();
			this.instructionDialog=null;
		}
		this.saveGlobalConfigs();
	};
	
	/**
		* Default afterActive callback method.
		*
		* @override
	*/
	Eplant.View.prototype.afterActive = function() {
		this.applyGlobalConfigs();
		if(Eplant.showViewIntruction&&!Eplant.RSVPOn){//&&!Eplant.viewInstructions[this.magnification]){
			var viewInstructionHolder = $('<div>');
			
			var content = null;
			if(this.viewInstruction){
				content = $('<div>').addClass('viewInstruction').html(this.viewInstruction).appendTo(viewInstructionHolder);;
				//Eplant.viewInstructions[this.magnification] = true;
			}else if(this.magnification==35)
			{
				content = $('<div>').addClass('viewInstruction').html(Eplant.ViewInstructions['Experimental viewer']).appendTo(viewInstructionHolder);
				//Eplant.viewInstructions[35] = true;
				
			}
			if(content){
				var viewInstructionControlLink = $('<a>').html('<img src="img/on/fyi.png" style="margin-right: 10px;">Click here to turn off new user info popups. They can be turned on again from the options menu.');
				$(viewInstructionControlLink).click($.proxy(function(){
					Eplant.showViewIntruction = false;
					$("#viewIntructionIcon img").attr("src", "img/off/fyi.png");
					$("#viewIntructionIcon span").html("New user popups off");
					if(this.instructionDialog){
						this.instructionDialog.close();
					}
					
				},this));
				var viewInstructionControl = $('<div>').addClass('viewInstructionControl').append(viewInstructionControlLink).appendTo(viewInstructionHolder);
				this.instructionDialog = DialogManager.artDialogBottom(viewInstructionHolder[0]);
			}
			
		}
		
	};
	
	
	/**
		* Default initializeGlobalConfigs callback method.
		*
		* @override
	*/
	Eplant.View.prototype.initializeGlobalConfigs = function() {
		if(this.name&& !Eplant.globalViewConfigs[this.name])
		{
			Eplant.globalViewConfigs[this.name]={};
			for (var config in this.viewGlobalConfigs) {
				if (!Eplant.globalViewConfigs[this.name].hasOwnProperty(config)) {
					Eplant.globalViewConfigs[this.name][config] = this.viewGlobalConfigs[config];
				}
			}
		}
	};
	
	/**
		* Default applyGlobalConfigs callback method.
		*
		* @override
	*/
	Eplant.View.prototype.applyGlobalConfigs = function() {
		if(!Eplant.globalViewConfigs[this.name])
		{
			this.initializeGlobalConfigs();
		}
		if(this.name&&Eplant.globalViewConfigs[this.name])
		{
			for (var config in Eplant.globalViewConfigs[this.name]) {
				if (Eplant.globalViewConfigs[this.name].hasOwnProperty(config)) {
					this[config] = Eplant.globalViewConfigs[this.name][config];
					this.viewGlobalConfigs[config] = Eplant.globalViewConfigs[this.name][config];
				}
			}
			if (Eplant.globalViewConfigs[this.name].viewSpecificUIButtonImages) {
				for(var i =0;i<this.viewSpecificUIButtons.length;i++){
					var viewSpecificUIButton = this.viewSpecificUIButtons[i];
					viewSpecificUIButton.setImageSource(Eplant.globalViewConfigs[this.name].viewSpecificUIButtonImages[i]);
				}
			}
		}
		
		
		
	};
	
	/**
		* Default saveGlobalConfigs callback method.
		*
		* @override
	*/
	Eplant.View.prototype.saveGlobalConfigs = function() {
		if(!Eplant.globalViewConfigs[this.name])
		{
			this.initializeGlobalConfigs();
		}
		if(this.name&&Eplant.globalViewConfigs[this.name])
		{
			for (var config in Eplant.globalViewConfigs[this.name]) {
				if (Eplant.globalViewConfigs[this.name].hasOwnProperty(config)) {
					//Eplant.globalViewConfigs[this.name][config] = this[config];
					Eplant.globalViewConfigs[this.name][config] = this.viewGlobalConfigs[config];
				}
			}
			if (this.viewSpecificUIButtons) {
				Eplant.globalViewConfigs[this.name].viewSpecificUIButtonImages = [];
				for(var i =0;i<this.viewSpecificUIButtons.length;i++){
					var viewSpecificUIButton = this.viewSpecificUIButtons[i];
					Eplant.globalViewConfigs[this.name].viewSpecificUIButtonImages.push(viewSpecificUIButton.imageSource);
				}
			}
		}
		
		
	};
	
	/**
		* Default method for drawing the View's frame.
		*
		* @override
	*/
	Eplant.View.prototype.draw = function() {
		//this.viewTitle.draw();
		
		/* Update camera */
		ZUI.camera.update();
	};
	
	/**
		* Default method for removing the View.
		*
		* @override
	*/
	Eplant.View.prototype.remove = function() {
		/* Clear ViewObjects array */
		//this.viewTitle.remove();
		this.viewObjects = [];
		
		if(this.Xhrs){
			for (var xhrName in this.Xhrs) {
				var xhr = this.Xhrs[xhrName];
				if(xhr){
					xhr.abort();
					xhr = null;
				}
			}
		}
		/* Remove ViewSpecificUIButtons */
		for (var n = 0; n < this.viewSpecificUIButtons.length; n++) {
			var viewSpecificUIButton = this.viewSpecificUIButtons[n];
			viewSpecificUIButton.remove();
		}
		if(this.viewNameDom){
			$(this.viewNameDom).remove();
			delete this.viewNameDom;
		}
		if(this.labelDom){
			$(this.labelDom).remove();
			delete this.labelDom;
		}
		if(this.domContainer){
			$(this.domContainer).remove();
			delete this.domContainer;
		}
	};
	
	/**
		* Saves the current session.
		* Should be overrided if needed.
	*/
	Eplant.View.prototype.saveSession = function() {
	};
	
	/**
		* Loads saved session.
		* Should be overrided if needed.
	*/
	Eplant.View.prototype.loadSession = function(sessionData) {
	};
	
	/**
		* This method should be called when the View finishes loading.
		* If no loading is required, call this method in the constructor.
	*/
	Eplant.View.prototype.loadFinish = function() {
		/* Set load status */
		this.isLoadedData = true;
		
		if(this.reloadingMessageDom){
			if(this.errorLoadingMessage){
				$(Eplant.ViewModes[this.viewMode]).append(this.getErrorLoaddingMessageDom());
			}
			$(this.reloadingMessageDom).remove();
		}
		
		/* Fire event to signal loading is finished */
		var event = new ZUI.Event("view-loaded", this, null);
		ZUI.fireEvent(event);
	};
	
	/**
		* Default method for grabbing the View's screen.
		*
		* @return {DOMString}
	*/
	Eplant.View.prototype.getViewScreen = function() {
		return ZUI.canvas.toDataURL();
	};
	
	/**
		* Returns the default exit-out animation configuration.
		*
		* @return {Object} The default exit-out animation configuration.
	*/
	Eplant.View.prototype.getExitOutAnimationConfig = function() {
		return {
			type: "zoom",
			view: this,
			duration: 1000,
			bezier: [0.75, 0, 0.75, 0.9],
			targetX: 0,
			targetY: 0,
			targetDistance: 10000,
			draw: function(elapsedTime, remainingTime, view, data) {
				view.draw();
			}
		};
	};
	
	/**
		* Returns the default enter-out animation configuration.
		*
		* @return {Object} The default enter-out animation configuration.
	*/
	Eplant.View.prototype.getEnterOutAnimationConfig = function() {
		return {
			type: "zoom",
			view: this,
			duration: 1000,
			bezier: [0.25, 0.1, 0.25, 1],
			sourceX: 0,
			sourceY: 0,
			sourceDistance: 0,
			targetX: 0,
			targetY: 0,
			targetDistance: 500,
			draw: function(elapsedTime, remainingTime, view, data) {
				view.draw();
			}
		};
	};
	
	/**
		* Returns the default exit-in animation configuration.
		*
		* @return {Object} The default exit-in animation configuration.
	*/
	Eplant.View.prototype.getExitInAnimationConfig = function() {
		return {
			type: "zoom",
			view: this,
			duration: 1000,
			bezier: [0.75, 0, 0.75, 0.9],
			targetX: 0,
			targetY: 0,
			targetDistance: 0,
			draw: function(elapsedTime, remainingTime, view, data) {
				view.draw();
			}
		};
	};
	
	/**
		* Returns the default enter-in animation configuration.
		*
		* @return {Object} The default enter-in animation configuration.
	*/
	Eplant.View.prototype.getEnterInAnimationConfig = function() {
		return {
			type: "zoom",
			view: this,
			duration: 1000,
			bezier: [0.25, 0.1, 0.25, 1],
			sourceX: 0,
			sourceY: 0,
			sourceDistance: 10000,
			targetX: 0,
			targetY: 0,
			targetDistance: 500,
			draw: function(elapsedTime, remainingTime, view, data) {
				view.draw();
			}
		};
	};
	
	/**
		* Returns the default exit-right animation configuration.
		*
		* @return {Object} The default exit-right animation configuration.
	*/
	Eplant.View.prototype.getExitRightAnimationConfig = function() {
		return {
			type: "zoom",
			view: this,
			duration: 1000,
			bezier: [0.75, 0, 0.75, 0.9],
			targetX: ZUI.camera._x + 900,
			draw: function(elapsedTime, remainingTime, view, data) {
				view.draw();
			}
		};
	};
	
	/**
		* Returns the default enter-right animation configuration.
		*
		* @return {Object} The default enter-right animation configuration.
	*/
	Eplant.View.prototype.getEnterRightAnimationConfig = function() {
		return {
			type: "zoom",
			view: this,
			duration: 1000,
			bezier: [0.75, 0, 0.75, 0.9],
			sourceX: -900,
			sourceY: 0,
			sourceDistance: 500,
			targetX: 0,
			draw: function(elapsedTime, remainingTime, view, data) {
				view.draw();
			}
		};
	};
	
	/**
		* Returns the default exit-left animation configuration.
		*
		* @return {Object} The default exit-left animation configuration.
	*/
	Eplant.View.prototype.getExitLeftAnimationConfig = function() {
		return {
			type: "zoom",
			view: this,
			duration: 1000,
			bezier: [0.75, 0, 0.75, 0.9],
			targetX: ZUI.camera._x - 900,
			draw: function(elapsedTime, remainingTime, view, data) {
				view.draw();
			}
		};
	};
	
	/**
		* Returns the default enter-left animation configuration.
		*
		* @return {Object} The default enter-left animation configuration.
	*/
	Eplant.View.prototype.getEnterLeftAnimationConfig = function() {
		return {
			type: "zoom",
			view: this,
			duration: 1000,
			bezier: [0.75, 0, 0.75, 0.9],
			sourceX: 900,
			sourceY: 0,
			sourceDistance: 500,
			targetX: 0,
			draw: function(elapsedTime, remainingTime, view, data) {
				view.draw();
			}
		};
	};
	
	/**
		* Returns the default exit-right animation configuration.
		*
		* @return {Object} The default exit-right animation configuration.
	*/
	Eplant.View.prototype.getExitUpAnimationConfig = function() {
		return {
			type: "zoom",
			view: this,
			duration: 1000
		};
	};
	
	/**
		* Returns the default enter-right animation configuration.
		*
		* @return {Object} The default enter-right animation configuration.
	*/
	Eplant.View.prototype.getEnterUpAnimationConfig = function() {
		return {
			type: "zoom",
			view: this,
			duration: 1000
		};
	};
	
	/**
		* Returns the default exit-left animation configuration.
		*
		* @return {Object} The default exit-left animation configuration.
	*/
	Eplant.View.prototype.getExitDownAnimationConfig = function() {
		return {
			type: "zoom",
			view: this,
			duration: 1000
		};
	};
	
	/**
		* Returns the default enter-left animation configuration.
		*
		* @return {Object} The default enter-left animation configuration.
	*/
	Eplant.View.prototype.getEnterDownAnimationConfig = function() {
		return {
			type: "zoom",
			view: this,
			duration: 1000
		};
	};
	
	
})();
