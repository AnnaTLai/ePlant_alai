
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
	var x = configs.x;
	var y = configs.y;
	var my = (x > ZUI.width / 2) ? "right-25" : "left+25";
	
	var classes = "eplant-tooltip";//"+configs.classes;
	/* Create tooltip as jQuery UI Dialog */
	$(this.domContainer).dialog({
		minWidth: 0,
		minHeight: 0,
		width: "auto",
		resizable: false,
		dialogClass: classes,
		position: {
			//my: my + " center",
			at: "left+" + x + " top+" + (y-45)
		},
		closeOnEscape: false,
		close: $.proxy(function(event, ui) {
			this.remove();
		}, this)
	});
	
	//Add arrow to tooltip
	var arrow = document.createElement("div");
	$(arrow).addClass("arrow-bottom");
	/*var innerArrow = document.createElement("div");
	$(innerArrow).addClass("eplant-tooltip-" + orientation + "Arrow-inner");
	$(arrow).append(innerArrow);*/
	$(this.domContainer).parent().append(arrow);
	$(arrow).css({
		"left":x-10,
		"top":y+($(this.domContainer).innerHeight()/2)-7,
		"position":"fixed"
	});
};

/**
 * Closes the tooltip.
 */
Eplant.Tooltip.prototype.close = function() {
	if($(this.domContainer).hasClass('ui-dialog-content'))
	$(this.domContainer).dialog("close");
};

/**
 * Removes the tooltip.
 */
Eplant.Tooltip.prototype.remove = function() {
	if($(this.domContainer).hasClass('ui-dialog-content'))
	$(this.domContainer).remove();
};

/**
 * Removes the tooltip.
 */
Eplant.Tooltip.prototype.changeTooltipPosition = function(event) {
	$(this.domContainer).dialog('option', 'position', [event.clientX, event.clientY]);
};

})();