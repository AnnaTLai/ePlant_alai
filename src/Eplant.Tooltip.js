
(function() {
	
	/**
		* Eplant.Tooltip class
		* By Hans Yu
		*
		* Tooltip that overlays on top of the ePlant canvas without needing to attach to a DOM element.
		*
		* @constructor
		* @param {Object} configs Configuration wrapped in an object.
		* @param {String|Element} configs.content Content of the tooltip.
	*/
	Eplant.Tooltip = function(configs) {
		/* Attributes */
		this.content = (configs.content === undefined) ? "" : configs.content;	// Content of the tooltip
		this.domContainer = null;		// DOM container
		this.ele=(configs.ele instanceof jQuery)?configs.ele[0]:configs.ele;
		/* Create DOM container */
		this.domContainer = document.createElement("div");
		$(this.domContainer).css({
			"padding": "0",
			"margin": "0",
			"pointer-events": "none"
		});
		
		/* Append content */
		$(this.domContainer).append(this.content);
		
		/* Get tooltip orientation */
		var x;
		var y ;
		if(configs.x&&configs.y){
			x = configs.x;
			y = configs.y;
			}
		else{
			x = cursorX;
			y = cursorY;
		}
		
		var my = (x > ZUI.width / 2) ? "right-25" : "left+25";
		
		var classes = "eplant-tooltip";//"+configs.classes;
		/* Create tooltip as jQuery UI Dialog */
		$(this.domContainer).dialog({
			minWidth: 0,
			minHeight: 0,
			width: "auto",
			resizable: false,
			dialogClass: classes,
			closeOnEscape: false,
			close: $.proxy(function(event, ui) {
				this.remove();
			}, this)
		});
		
		
		$(document).on('mousemove',this.changeTooltipPosition);
		
		//Add arrow to tooltip
		this.arrow = document.createElement("div");
		$(this.arrow).addClass("arrow-bottom");
		$(this.domContainer).parent().append(this.arrow);
		
		this.changeTooltipPosition({clientX:x,clientY:y});
	};
	
	/**
		* Closes the tooltip.
	*/
	Eplant.Tooltip.prototype.close = function() {
		if($(this.domContainer).hasClass('ui-dialog-content'))
		$(this.domContainer).dialog("close");
		$(this.arrow).remove();
		$(document).off('mousemove',this.changeTooltipPosition);
	};
	
	/**
		* Removes the tooltip.
	*/
	Eplant.Tooltip.prototype.remove = function() {
		if($(this.domContainer).hasClass('ui-dialog-content'))
		$(this.domContainer).remove();
		$(this.arrow).remove();
		$(document).off('mousemove',this.changeTooltipPosition);
	};
	
	/**
		* Removes the tooltip.
	*/
	Eplant.Tooltip.prototype.changeTooltipPosition = function(event) {
		if(this.y!==event.clientY&&this.x!==event.clientX){
			this.x = event.clientX;
			this.y = event.clientY;
			$(this.domContainer).dialog('option', 'position', {
				//my: my + " center",
				at: "left+" + this.x + " top+" + (this.y-$(this.domContainer).innerHeight())
			});//[event.clientX, event.clientY-($(this.domContainer).innerHeight()-15)]);
			$(this.arrow).css({
				"left":event.clientX-10,
				"top":event.clientY-($(this.domContainer).innerHeight()/2-1)+7,
				"position":"fixed",
				"pointer-events":"none"
			});
		}
		
	};
	
	
	
})();