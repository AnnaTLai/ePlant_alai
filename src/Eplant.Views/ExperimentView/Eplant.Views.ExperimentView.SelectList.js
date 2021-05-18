(function() {
	
	/**
		* Eplant.Views.ExperimentView.SelectList class
		* Coded by Hans Yu
		* UI designed by Jamie Waese
		*
		* Describes the SelectList UI in ExperimentView.
		*
		* @constructor
	*/
	Eplant.Views.ExperimentView.SelectList = function(speciesView) {
		/* Attributes */
		this.speciesView = speciesView;		// ExperimentView that owns this SelectList object
		this.choices = [];				// Array of Choice objects
		this.selected = null;			// Selected Choice
		this.domContainer= null;			// DOM element of the container
		this.domTitle = null;			// DOM element of the title
		this.domSelectList =null;		// DOM element of the list
		this.domPreviewHolder =null;		// DOM element of the Preview Holder
		this.dialog = null;
		this.choicesSortBy=1;//1 by expression value, 0 by first letter
		/* Create DOM */
		this.createDOM();
	};
	
	/**
		* Creates the DOM elements.
	*/
	Eplant.Views.ExperimentView.SelectList.prototype.createDOM = function() {
		/* Create container DOM element */
		this.domContainer= document.createElement("div");
		
		/* Create title DOM element */
		this.domTitle = document.createElement("span");
		
		/* Set CSS class of title for styling */
		$(this.domTitle).addClass("eplant-selectList-title");
		
		/* Set title content */
		if(Eplant.activeSpecies&&Eplant.activeSpecies.activeGeneticElement){
			$(this.domTitle).html("Select View Available for "+Eplant.activeSpecies.activeGeneticElement.identifier);
		}
		else{
			$(this.domTitle).html("Select View");
		}
		
		
		/* Add title DOM element to the container */
		$(this.domContainer).append(this.domTitle);
		
		var table = document.createElement('TABLE');
		$(table).css({width:'100%',height:'100%','table-layout': 'fixed'});
		
    	var tableBody = document.createElement('TBODY');
    	table.appendChild(tableBody);
		
		var tr = document.createElement('TR');
		tableBody.appendChild(tr);
		
		var td = document.createElement('TD');
		
		
		this.domSelectList = document.createElement("div");
		/* Set CSS class of container for styling */
		$(this.domSelectList).addClass("efp-selectList");
		
		/* Disable context menu */
		this.domSelectList.oncontextmenu = function() {
			return false;
		};
		
		
		
		$(td).append(this.domSelectList);
		tr.appendChild(td);
		
		td = document.createElement('TD');
		
		this.domPreviewHolder= document.createElement("div");
		$(this.domPreviewHolder).addClass('efp-previewHolder');
		/* Set CSS class of container for styling */
		/* Disable context menu */
		this.domPreviewHolder.oncontextmenu = function() {
			return false;
		};
		$(td).append(this.domPreviewHolder);
		tr.appendChild(td);
		
		$(table).appendTo(this.domContainer);
		
		
		/* Set up event listener for load-species */
		var eventListener = new ZUI.EventListener("load-experiments", Eplant, function(event, eventData, listenerData) {
			/* Remove this EventListener */
			ZUI.removeEventListener(this);
			
			listenerData.selectList.loadViewNames();
			
			/* Finish loading */
			//listenerData.selectList.ExperimentView.loadFinish();
			}, {
			selectList: this
		});
		ZUI.addEventListener(eventListener);
		
	};
	
	Eplant.Views.ExperimentView.SelectList.prototype.loadViewNames = function(view) {
		var dfd = $.Deferred();
		if(this.choices&&this.choices.length>0){
			dfd.resolve();
		}
		else{
			$.getJSON( "data/experiment/viewNames.json", $.proxy(function( data ) {
				var eFPViews = data;
				/* Create Choice objects for the SelectList */
				for (var n = 0; n < eFPViews.length; n++) {
					/* Get Species */
					var view = eFPViews[n];
					
					/* Create Choice */
					var choice = new Eplant.Views.ExperimentView.SelectList.Choice(view, this);
					this.choices.push(choice);
				}
				for (var n = 0; n < this.choices.length; n++) {
					var choice = this.choices[n];
					choice.updateMax();
				}
				this.choices.sort(function(a, b) { 
					return b.max - a.max;
				});
				for (var n = 0; n < this.choices.length; n++) {
					var choice = this.choices[n];
					choice.createDOM();
				}
				/* Select first choice */
				if (this.choices.length) {
					this.choices[0].select();
				}
				dfd.resolve();
			},this));
		}
		
		
		/* Not found */
		return dfd.promise();
	};
	
	/**
		* Gets the Choice object associated with the specified Species.
		*
		* @param {Eplant.Species} species Species associated with the Choice object.
		* @return {Eplant.Views.ExperimentView.SelectList.Choice} Choice associated with the specified Species.
	*/
	Eplant.Views.ExperimentView.SelectList.prototype.getChoiceByView = function(view) {
		/* Loop through Choices to find the Choice with a matching Species */
		for (var n = 0; n < this.choices; n++) {
			var choice = this.choices[n];
			if (choice.view == view) {
				return choice;
			}
		}
		
		/* Not found */
		return null;
	};
	
	/**
		* Draws the SelectList.
	*/
	Eplant.Views.ExperimentView.SelectList.prototype.draw = function() {
		/* Draw selected Choice */
		if (this.selected) {
			this.selected.draw();
		}
	};
	
	/**
		* Shows the SelectList.
	*/
	Eplant.Views.ExperimentView.SelectList.prototype.show = function() {
		/* Append to ZUI container */
		//$(ZUI.container).append(this.domPreviewHolder);
		/* Set title content */
		if(Eplant.activeSpecies&&Eplant.activeSpecies.activeGeneticElement){
			$(this.domTitle).html("Select View Available for "+Eplant.activeSpecies.activeGeneticElement.identifier);
		}
		else{
			$(this.domTitle).html("Select View");
		}
		/* fire event */
		if(this.choices.length===0){
			var expEvent = new ZUI.Event("load-experiments", Eplant, null);
			ZUI.fireEvent(expEvent);
			}else{
			for (var n = 0; n < this.choices.length; n++) {
				var choice = this.choices[n];
				choice.updateMax();
			}
			this.choices.sort(function(a, b) { 
				return b.max - a.max;
			});
			for (var n = 0; n < this.choices.length; n++) {
				var choice = this.choices[n];
				choice.createDOM();
			}
		}
		
		this.dialog = DialogManager.artDialog(this.domContainer);
	};
	
	Eplant.Views.ExperimentView.SelectList.prototype.getSidebar = function(order) {
		//if(this.sidebardfd && this.sidebardfd.state() == 'resolved') return this.sidebardfd.promise();
		this.sidebardfd = $.Deferred();
		this.loadViewNames().done($.proxy(function(){
			this.updateSideBar(order);
			//////////////////////////////////////////////////////////////////////////////////////////
			var btnMaxToMin = document.createElement("BUTTON");        // Create a <button> element
			$(btnMaxToMin).html('Sort by Expression Level');
			$(btnMaxToMin).addClass('gene-cancel-button');
			$(btnMaxToMin).css({
				position:"absolute",
				top:0
			});
			$(btnMaxToMin).click($.proxy(function(){
				this.updateSideBar(1);
			},this))
			$(this.domSidebar).append(btnMaxToMin);
			var btnAlphabetic = document.createElement("BUTTON");        // Create a <button> element
			$(btnAlphabetic).html('Sort Alphabetic');  
			$(btnAlphabetic).addClass('gene-cancel-button');
			$(btnAlphabetic).css({
				position:"absolute",
				top:20
			});
			$(btnAlphabetic).click($.proxy(function(){
				this.updateSideBar(0);
			},this))
			$(this.domSidebar).append(btnAlphabetic);
			
			
			this.sidebardfd.resolve(this.domSidebar);
			
		},this))
		
		return this.sidebardfd.promise();
	};
	
	Eplant.Views.ExperimentView.SelectList.prototype.updateSideBar = function(order) {
		this.domSidebar = $('<div></div>');
		
		if(this.choicesSortBy!==order){
			this.choicesSortBy=order;
			for (var n = 0; n < this.choices.length; n++) {
				var choice = this.choices[n];
				choice.updateMax();
			}
			if(order===1){// max to min
				
				this.choices.sort(function(a, b) { 
					return b.max - a.max;
				});	
			}
			else if(order ===0){//min to max
				this.choices.sort(function(a, b) { 
					return a.viewName.toUpperCase().localeCompare(b.viewName.toUpperCase());
				});	
			}
		}
		
		
		for (var n = 0; n < this.choices.length; n++) {
			var choice = this.choices[n];
			var domSnapshot = $('<div></div>');
			$(domSnapshot).css({'width':'108px',
				'height':'75px',
				'margin':'13px',
				'outline':'1px solid #000000',
			'cursor':'pointer'});
			$(domSnapshot).attr('data-viewname',choice.viewFullName);
			//$(domSnapshot).attr('data-hint',choice.viewFullName);
			$(domSnapshot).attr('title',choice.viewFullName);
			//$(domSnapshot).attr('data-enabled',true);
			$(domSnapshot).addClass('hint--right hint--success hint-rounded');
			$(domSnapshot).tooltip({
				position: {
					my: 'left center', at: 'right+5 center'
				},
				tooltipClass:'right'
			});
			domSnapshot.append(choice.getSnapshot()).appendTo(this.domSidebar);
			domSnapshot.click($.proxy(function() {
				var activeView = Eplant.activeSpecies.activeGeneticElement.views[this.viewName];
				Eplant.changeActiveView(activeView);
			}, choice));
		}
	};
	
	/**
		* Hides the SelectList.
	*/
	Eplant.Views.ExperimentView.SelectList.prototype.hide = function() {
		/* Remove from ZUI container */
		if(this.dialog)
		{
			this.dialog.close();
		}
	};
	
	/**
		* Cleans up the Select object for disposal.
	*/
	Eplant.Views.ExperimentView.SelectList.prototype.remove = function() {
		/* Clean up Choice objects */
		
		if(this.dialog)
		{
			this.dialog.close();
		}
	};
	
})();
