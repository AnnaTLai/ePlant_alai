(function () {
	/* global Eplant, ZUI*/

	/**
	 * Eplant.Views.InteractionView.Legend class
	 * Coded by Hans Yu
	 * UI designed by Jamie Waese
	 *
	 * @constructor
	 * @param {Eplant.Views.InteractionView} interactionView The InteractionView that owns legend.
	 */
	Eplant.Views.InteractionView.Legend = function (interactionView) {
		/* Attributes */
		/**
		 * The interaction view which owns this legend
		 * @type {Eplant.Views.InteractionView}
		 */
		this.interactionView = interactionView;
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
		this.height = '80%';
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
		this.domImg.src = 'img/legendAIV.png';
		this.domImg.style.height = '100%';
		$(this.domContainer).css({
			position: 'absolute',
			left: this.x,
			top: this.y,
			width: this.width,
			height: this.height,
			opacity: '0.95'
		});
		$(this.domContainer).append(this.domImg);

		this.domClose = document.createElement('div');
		$(this.domClose).on('click', $.proxy(function () {
			this.hide();
		}, this));
		$(this.domClose).text('X');
		this.domImg.src = 'img/legendAIV.png';
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
	Eplant.Views.InteractionView.Legend.prototype.attach = function () {
		$(this.interactionView.domHolder).append(this.domContainer);
	};

	/**
	 * Detaches the legend to the view.
	 * @returns {void}
	 */
	Eplant.Views.InteractionView.Legend.prototype.detach = function () {
		$(this.domContainer).detach();
	};

	/**
	 * Makes the legend visible.
	 * @returns {void}
	 */
	Eplant.Views.InteractionView.Legend.prototype.show = function () {
		this.isVisible = true;
		if (ZUI.activeView === this.interactionView) {
			this.attach();
		}
	};

	/**
	 * Hides the legend.
	 * @returns {void}
	 */
	Eplant.Views.InteractionView.Legend.prototype.hide = function () {
		this.isVisible = false;
		if (ZUI.activeView === this.interactionView) {
			this.detach();
		}
	};

	/**
	 * Removes the legend.
	 * @returns {void}
	 */
	Eplant.Views.InteractionView.Legend.prototype.remove = function () {
		/* Remove DOM elements */
		$(this.domContainer).remove();
	};
}());

