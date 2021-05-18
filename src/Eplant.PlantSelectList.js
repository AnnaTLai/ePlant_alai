(function() {
	
	/**
		* Eplant.Views.PlantView.SelectList class
		* Coded by Hans Yu
		* UI designed by Jamie Waese
		*
		* Describes the SelectList UI in PlantView.
		*
		* @constructor
	*/
	Eplant.PlantSelectList = function() {
		this.activeGeneIdentifier = "";
		this.choices = [];				// Array of Choice objects
		this.selected = null;			// Selected Choice
		this.domContainer= $('#efp_plant_list');			// DOM element of the container
		
		this.choicesSortBy=1;//1 by expression value, 0 by first letter
		/* Create DOM */
	};
	
	
	Eplant.PlantSelectList.prototype.loadViewNames = function(view) {
		var dfd = $.Deferred();
		if(this.choices&&this.choices.length>0){
			dfd.resolve();
		}
		else{
			$.getJSON( "data/plant/viewNames.json", $.proxy(function( data ) {
				var eFPViews = data;
				/* Create Choice objects for the SelectList */
				for (var n = 0; n < eFPViews.length; n++) {
					/* Get Species */
					var view = eFPViews[n];
					
					/* Create Choice */
					var choice = new Eplant.PlantSelectList.Choice(view, this);
					this.choices.push(choice);
				}
				for (var n = 0; n < this.choices.length; n++) {
					var choice = this.choices[n];
					choice.updateMax();
				}
				this.choices.sort(function(a, b) { 
					return b.max - a.max;
				});
				/*for (var n = 0; n < this.choices.length; n++) {
					var choice = this.choices[n];
					choice.createDOM();
					}
					
					if (this.choices.length) {
					this.choices[0].select();
				}*/
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
		* @return {Eplant.PlantSelectList.Choice} Choice associated with the specified Species.
	*/
	Eplant.PlantSelectList.prototype.getChoiceByView = function(view) {
		/* Loop through Choices to find the Choice with a matching Species */
		for (var n = 0; n < this.choices.length; n++) {
			var choice = this.choices[n];
			if (choice.view == view) {
				return choice;
			}
		}
		
		/* Not found */
		return null;
	};
	
	Eplant.PlantSelectList.prototype.updateOrderSelected = function() {
		var divs = $(this.sortDiv).find("div");
		$(divs).removeClass("active");
		$(divs[this.choicesSortBy]).addClass("active");
	};
	
	Eplant.PlantSelectList.prototype.getSidebar = function(order) {
		//if(this.sidebardfd && this.sidebardfd.state() == 'resolved') return this.sidebardfd.promise();
		if(this.sidebardfd&& this.sidebardfd.state() ==="pending")
		return  this.sidebardfd.promise();
		this.sidebardfd = $.Deferred();
		this.loadViewNames().done($.proxy(function(){
			this.domContainer.empty();
			if(this.activeGeneIdentifier!==Eplant.activeSpecies.activeGeneticElement.identifier){
				if(typeof order == "undefined") order = this.choicesSortBy;
				this.updateSideBar(order);
				//////////////////////////////////////////////////////////////////////////////////////////
				
				////////////////////////////////////////////////////////////////////////////////////////////////////////////
				////////////////////////////////////////////////////////////////////////////////////////////////////////////
				var btnSort = document.createElement("BUTTON"); 
				$(btnSort).html('Sort Options');
				$(btnSort).addClass('plantListTopButton');
				$(btnSort).css({
				});
				$(btnSort).attr('data-dropdown',"#dropdown-plantSort");
				$(this.domContainer).append(btnSort);
				
				var sortImg = document.createElement("img");
				$(sortImg).attr("src",'img/sort-highlow-black.png');
				$(btnSort).prepend(sortImg);
				
				if(!this.sortDiv){
					// dropdown
					this.sortDiv = document.createElement("div"); 
					$(this.sortDiv).attr('id',"dropdown-plantSort");
					$(this.sortDiv).addClass("dropdown dropdown-tip dropdown-anchor-left");
					// append to the container outside, so the dropdown is positioned correctly
					$(this.sortDiv).appendTo('#dropdownContainer');
					
					var sortUl = document.createElement("ul"); 
					$(sortUl).addClass("dropdown-menu");
					$(sortUl).appendTo(this.sortDiv);
					// sort MaxToMin li
					var sortLi = document.createElement("li"); 
					$(sortLi).appendTo(sortUl);
					var btnAlphabetic = document.createElement("div");        // Create a <button> element
					$(btnAlphabetic).html('Sort Alphabetic');  
					
					$(btnAlphabetic).click($.proxy(function(){
						this.choicesSortBy=0;
						
						this.updateOrderSelected();
						var list = this.domSidebar.find('div').sort(function (a, b) {
							return $(a).attr('data-viewname').toUpperCase().localeCompare($(b).attr('data-viewname').toUpperCase());
						});
						for (var i = 0; i < list.length; i++) {
							list[i].parentNode.appendChild(list[i]);
						}
					},this));
					$(btnAlphabetic).appendTo(sortLi);
					// sort Alphabetic li
					sortLi = document.createElement("li"); 
					$(sortLi).appendTo(sortUl);
					var btnMaxToMin = document.createElement("div");        // Create a <button> element
					$(btnMaxToMin).html('Sort by Expression Level');
					$(btnMaxToMin).click($.proxy(function(){
						this.choicesSortBy=1;
						
						this.updateOrderSelected();
						var list = this.domSidebar.find('div').sort(function (a, b) {
							return $(b).attr('data-max-expression')-$(a).attr('data-max-expression');
						});
						for (var i = 0; i < list.length; i++) {
							list[i].parentNode.appendChild(list[i]);
						}
					},this));
					$(btnMaxToMin).appendTo(sortLi);
					
				}
			}
			
			////////////////////////////////////////////////////////////////////////////////////////////////////////////
			////////////////////////////////////////////////////////////////////////////////////////////////////////////
			// view selecting dropdown
			var btnSelect = document.createElement("BUTTON"); 
			$(btnSelect).html('Select View');
			$(btnSelect).addClass('plantListTopButton');
			$(btnSelect).css({
			});
			$(btnSelect).attr('data-dropdown',"#dropdown-plantSelect");
			$(this.domContainer).append(btnSelect);
			
			var selectImg = document.createElement("img");
			$(selectImg).attr("src",'img/list.png');
			$(btnSelect).prepend(selectImg);
			
			if(!this.selectDiv){
				this.selectDiv = document.createElement("div"); 
				$(this.selectDiv).attr('id',"dropdown-plantSelect");
				$(this.selectDiv).addClass("dropdown dropdown-tip dropdown-anchor-left");
				// append to the container outside, so the dropdown is positioned correctly
				$(this.selectDiv).appendTo('#dropdownContainer');
				
				var selectUl = document.createElement("ul"); 
				$(selectUl).addClass("dropdown-menu");
				$(selectUl).appendTo(this.selectDiv);
				
				var aphChoices = this.choices;
				
				aphChoices.sort(function(a, b) { 
					return a.viewName.toUpperCase().localeCompare(b.viewName.toUpperCase());
				});	
				
				for (var n = 0; n < aphChoices.length; n++) {
					var choice = aphChoices[n];
					var selectLi = document.createElement("li"); 
					$(selectLi).appendTo(selectUl);
					var selectViewDiv = document.createElement("div");        // Create a <button> element
					$(selectViewDiv).html(choice.viewFullName);
					$(selectViewDiv).attr("data-viewName",choice.viewName);
					$(selectViewDiv).click($.proxy(function(e){
						var activeView = Eplant.activeSpecies.activeGeneticElement.views[$(e.currentTarget).attr('data-viewName')];
						Eplant.changeActiveView(activeView);
					},this));
					$(selectViewDiv).appendTo(selectLi);
				}
			}
			////////////////////////////////////////////////////////////////////////////////////////////////////////////
			////////////////////////////////////////////////////////////////////////////////////////////////////////////
			this.updateOrderSelected();
			this.domContainer.append(this.domSidebar);
			this.sidebardfd.resolve(this.domSidebar);
			
		},this))
		
		return this.sidebardfd.promise();
	};
	
	
	Eplant.PlantSelectList.prototype.updateActive = function(name) {
		var activeViewSnapshot = $(this.domSidebar).find("[data-viewname='" + name + "']");
		if(activeViewSnapshot.length>0){
			activeViewSnapshot.css({'outline':'2px solid #000000'});
			var scrollTop = activeViewSnapshot.position().top-this.domSidebar.height()/2+activeViewSnapshot.outerHeight();
			if(scrollTop>0) this.domSidebar.scrollTop(scrollTop,500);
		}
		$(this.selectDiv).find(".active").removeClass("active");
		var activeSelectItem = $(this.selectDiv).find("[data-viewname='" + name + "']");
		if(activeSelectItem.length>0){
			activeSelectItem.addClass("active");
		}
	};
	
	Eplant.PlantSelectList.prototype.updateSideBar = function(order) {
		
		this.domSidebar = $('<div></div>');
		this.domSidebar.css({
			height: 'calc(100% - 50px)',
			overflow: 'auto'
		});
		if(/*this.choicesSortBy!==order||this.identifier!==Eplant.activeSpecies.activeGeneticElement.identifier*/true){
			this.choicesSortBy=order;
			this.identifier=Eplant.activeSpecies.activeGeneticElement.identifier;
			for (var n = 0; n < this.choices.length; n++) {
				var choice = this.choices[n];
				choice.updateMax();
			}
			
			if(this.choicesSortBy===1){// max to min
				
				this.choices.sort(function(a, b) { 
					return b.max - a.max;
				});	
			}
			else if(this.choicesSortBy ===0){// Alphabetic
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
				'cursor':'pointer',
				'background': 'white', //BEN CHANGED
			'position':'relative'});
			$(domSnapshot).attr('data-viewname',choice.viewName);
			//$(domSnapshot).attr('data-hint',choice.viewFullName);
			$(domSnapshot).attr('title',choice.viewFullName);
			$(domSnapshot).attr('data-max-expression',choice.max);
			//$(domSnapshot).attr('data-enabled',true);
			$(domSnapshot).addClass('hint--right hint--success hint-rounded');
			$(domSnapshot).tooltip({
				position: {
					my: 'left center', at: 'right+5 center'
				},
				tooltipClass:'right'
			});
			domSnapshot.append(choice.getSnapshot());
			// maximum expression level label
			if(choice.max){
				var domMaxLabel = document.createElement('p');
				$(domMaxLabel).addClass('maxLevelLabel');
				$(domMaxLabel).text('Max level: '+choice.max);
				$(domMaxLabel).appendTo(domSnapshot);
			}
			
			domSnapshot.appendTo(this.domSidebar);
			domSnapshot.click($.proxy(function() {
				var activeView = Eplant.activeSpecies.activeGeneticElement.views[this.viewName];
				Eplant.changeActiveView(activeView);
			}, choice));
		}
		
	};

})();
