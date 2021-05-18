(function () {
	/* global Eplant */

	/**
	 * Hyperlink to the AL-1 reference
	 * @type {String}
	 */
	var AL1_HYPERLINK = 'http://interactome.dfci.harvard.edu/A_thaliana/';

	/**
	 * Eplant.InteractionView.EdgeIntoTooltip class
	 * By Hans Yu, Ian Shi
	 *
	 * @constructor
	 * @param {Object} configs Configuration wrapped in an object.
	 * @param {Object} edgeData The interaction data associated with the edge
	 */
	Eplant.Views.InteractionView.EdgeInfoTooltip = function (configs, edgeData) {
		/**
		 * The content of the tooltip
		 * @type {Object}
		 */
		this.content = configs.content || '';
		/**
		 * The interaction data associated with the represented edge
		 * @type {Object}
		 */
		this.edgeData = edgeData;
		/**
		 * The DOM container for the tooltip
		 * @type {HTMLDivElement}
		 */
		this.domContainer = document.createElement('div');
		// Set DOM container style
		$(this.domContainer).css({
			padding: '0',
			margin: '0',
			'pointer-events': 'none'
		});

		// Append content
		$(this.domContainer).append(this.content);

		// Set class
		var classes = 'eplant-tooltip';

		/* Create tooltip as jQuery UI Dialog */
		$(this.domContainer).dialog({
			minWidth: 0,
			minHeight: 0,
			width: 'auto',
			resizable: false,
			dialogClass: classes,
			show: {
				effect: 'fade',
				duration: 250
			},
			closeOnEscape: false,
			close: $.proxy(function () {
				this.remove();
			}, this)
		});

		// Check if interaction is published
		if (edgeData.reference && edgeData.reference != "None") {
			// Append hyperlinks to parent of container
			$(this.domContainer).parent().append(this.generateLinkDOM());
		}
		// Add arrow to tooltip
		this.arrow = document.createElement('div');
		$(this.arrow).addClass('arrow-bottom');
		$(this.domContainer).parent().append(this.arrow);

		// Get initial tooltip orientation
		var edgeX = configs.x;
		var edgeY = configs.y;

		// Refresh initial tooltip position
		this.changeTooltipPosition({clientX: edgeX, clientY: edgeY});

		// Bind tooltip movement to mouse move event
		$(document).on('mousemove', this.changeTooltipPosition);
	};

	/**
	 * Closes the tooltip.
	 * @return {undefined}
	 */
	Eplant.Views.InteractionView.EdgeInfoTooltip.prototype.close = function () {
		if ($(this.domContainer).hasClass('ui-dialog-content')) {
			$(this.domContainer).dialog('close');
			$(this.arrow).remove();
			$(document).off('mousemove', this.changeTooltipPosition);
		}
	};

	/**
	 * Removes the tooltip.
	 * @return {undefined}
	 */
	Eplant.Views.InteractionView.EdgeInfoTooltip.prototype.remove = function () {
		if ($(this.domContainer).hasClass('ui-dialog-content')) {
			$(this.domContainer).remove();
			$(this.arrow).remove();
			$(document).off('mousemove', this.changeTooltipPosition);
		}
	};

	/**
	 * Generates a hyperlink from a reference
	 *
	 * @param {String} reference The reference from which a hyperlink should be generated
	 * @return {Array} The string hyperlinks
	 */
	Eplant.Views.InteractionView.EdgeInfoTooltip.prototype.generateLink = function (reference) {
		// Sanitize the reference
		var sanitizedReference = reference.split('\n');
		var hyperlinks = [];

		for (var i = 0; i < sanitizedReference.length; i = i + 1) {
			// Processes links by reference type
			if (sanitizedReference[i].search('PubMed') !== -1) {
				// Append PubMed link to array
				var subReference = sanitizedReference[i].replace('PubMed', '');
				hyperlinks.push('http://www.ncbi.nlm.nih.gov/pubmed/' + subReference);
			} else if (sanitizedReference[i].search('doi:') !== -1) {
				// Append doi link to array
				var subReference = sanitizedReference[i].replace('doi:', '');
				hyperlinks.push('http://dx.doi.org/' + subReference);
			} else if (sanitizedReference[i].search('AI-1') !== -1) {
				// Append static AL1 link to array
				hyperlinks.push(AL1_HYPERLINK);
			}
		}
		return hyperlinks;
	};

	/**
	 * Generates HTMLAElements containing hyperlinks generated from interaction references
	 *
	 * @return {Array} The HTML a element array generated
	 */
	Eplant.Views.InteractionView.EdgeInfoTooltip.prototype.generateLinkDOM = function () {
		// Gets hyperlinks
		var hyperlinks = this.generateLink(this.edgeData.reference);
		// Create hyperlink DOM container
		var hyperContainer = document.createElement('div');

		// Add reference subtitle
		hyperContainer.appendChild(document.createTextNode('Reference: '));

		if (hyperlinks.length > 0) {
			for (var i = 0; i < hyperlinks.length; i = i + 1) {
				// Create DOM hyperlink
				var hyperlink = document.createElement('a');
				// Set hyperlink to open to new window
				hyperlink.setAttribute('target', '_blank');
				// Set description
				hyperlink.textContent = hyperlinks[i];
				hyperlink.href = hyperlinks[i];
				// Add to DOM container
				hyperContainer.appendChild(document.createElement('br'));
				hyperContainer.appendChild(hyperlink);
			}
		} else {
			// Add no reference text
			var noneText = document.createTextNode('Not available');
			hyperContainer.appendChild(noneText);
		}
		return hyperContainer;
	};

	/**
	 * Repositions the tooltip position
	 *
	 * @param {MouseEvent} event The event which triggers this function
	 * @return {undefined}
	 */
	Eplant.Views.InteractionView.EdgeInfoTooltip.prototype.changeTooltipPosition = function (event) {
		// Verify that the mouse has moved
		if (this.y !== event.clientY && this.x !== event.clientX) {
			/**
			 * The x coordinate of the tooltip
			 * @type {Number}
			 */
			this.x = event.clientX;
			/**
			 * The y coordinate of the tooltip
			 * @type {Number}
			 */
			this.y = event.clientY;

			var top = this.y - $(this.domContainer).parent().height();

			$(this.domContainer).parent().css({
				top: top - 35,
				left: this.x - $(this.domContainer).parent().width() / 2
			});

			// Updates position of the arrow
			$(this.arrow).css({
				top: top + $(this.domContainer).parent().height() - 5,
				left: event.clientX - 10,
				position: 'fixed',
				'pointer-events': 'none'
			});
		}
	};
}());
