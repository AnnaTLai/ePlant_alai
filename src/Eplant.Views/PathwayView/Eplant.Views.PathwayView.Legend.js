//BEN CHANGED (entire file is new, mostly a copy of the interactions view legend)
(function () {
	/* global Eplant, ZUI*/

	/**
	 * Eplant.Views.PathwayView.Legend class
	 * Coded by Hans Yu
	 * UI designed by Jamie Waese
	 *
	 * @constructor
	 * @param {Eplant.Views.PathwayView} PathwayView The PathwayView that owns legend.
	 */
	Eplant.Views.PathwayView.Legend = function (PathwayView) {
		/* Attributes */
		/**
		 * The Pathway view which owns this legend
		 * @type {Eplant.Views.PathwayView}
		 */
		this.PathwayView = PathwayView;
		/**
		 * DOM container for the legend
		 * @type {HTMLElement}
		 */
		this.domContainer = null;
		/**
		 * Tracks whether this legend is visible
		 * @type {Boolean}
		 */
		this.isVisible = false;
		/**
		 * Height of the legend
		 * @type {Number}
		 */
    // number found by taking the 80% and 713 px height of the interaction view legend and 
    //calculating the proportional height of this one with a height of 760 px
		this.height = '85.273%'; 
		/**
		 * Width of the legend
		 * @type {Number}
		 */
		this.width = 171;
		/**
		 * The default x coordinate of the legend
		 * @type {Number}
		 */
		this.x = 20;
		/**
		 * The default y coordinate of the legend
		 * @type {Number}
		 */
		this.y = '15%';

		/* Asher: Create DOM container */
		this.domContainer = document.createElement('div');

		this.domImg = document.createElement('img');
		this.domImg.src = 'img/legendPathway.svg';
		this.domImg.style.height = '100%';
		$(this.domContainer).css({
			position: 'absolute',
			left: this.x,
			top: this.y,
			width: this.width,
			height: this.height,
			opacity: '0.95',
			"z-index": 10,
		});
		$(this.domContainer).append(this.domImg);

		this.domClose = document.createElement('div');
		$(this.domClose).on('click', $.proxy(function () {
			this.hide();
		}, this));
		$(this.domClose).text('X');
		this.domImg.src = 'img/legendPathway.svg';
		$(this.domClose).css({
			position: 'absolute',
			right: 0
		}).addClass('aui_close');
		$(this.domContainer).append(this.domClose);
		this.domContainer.ondragstaart = function () {
			return false;
		};
		$(this.domContainer).draggable();
	};

	/**
	 * Attaches the legend to the view.
	 * @returns {void}
	 */
	Eplant.Views.PathwayView.Legend.prototype.attach = function () {
		$("#Pathway_container").append(this.domContainer);
	};

	/**
	 * Detaches the legend to the view.
	 * @returns {void}
	 */
	Eplant.Views.PathwayView.Legend.prototype.detach = function () {
		$(this.domContainer).detach();
	};

	/**
	 * Makes the legend visible.
	 * @returns {void}
	 */
	Eplant.Views.PathwayView.Legend.prototype.show = function () {
		this.isVisible = true;
		if (ZUI.activeView === this.PathwayView) {
			this.attach();
		}
	};

	/**
	 * Hides the legend.
	 * @returns {void}
	 */
	Eplant.Views.PathwayView.Legend.prototype.hide = function () {
		this.isVisible = false;
		if (ZUI.activeView === this.PathwayView) {
			this.detach();
		}
	};

	/**
	 * Removes the legend.
	 * @returns {void}
	 */
	Eplant.Views.PathwayView.Legend.prototype.remove = function () {
		/* Remove DOM elements */
		$(this.domContainer).remove();
	};
}());

