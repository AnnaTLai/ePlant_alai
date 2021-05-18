(function() {

	/**
		* Eplant.Views.ExperimentalView class
		* Coded by Hans Yu
		* UI designed by Jamie Waese
		*
		* ePlant View for browsing gene expression data of plant tissues during development as eFP.
		*
		* @constructor
		* @augments Eplant.Experimental.EFPView
		* @param {Eplant.GeneticElement} geneticElement The GeneticElement associated with this view.
	*/
	Eplant.Views.AbioticStressView = function(geneticElement) {
		// Get constructor
		var constructor = Eplant.Views.AbioticStressView;

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

		/* Call eFP constructor */
		var efpSvgURL = 'data/experiment/efps/AbioticStress/' + geneticElement.species.scientificName.replace(" ", "_") + '.svg';
		var efpXmlURL = 'data/experiment/efps/AbioticStress/' + geneticElement.species.scientificName.replace(" ", "_") + '.xml';
		Eplant.BaseViews.EFPView.call(this, geneticElement, efpSvgURL,efpXmlURL, {
		});
	};
	ZUI.Util.inheritClass(Eplant.BaseViews.EFPView, Eplant.Views.AbioticStressView);	// Inherit parent prototype

Eplant.Views.AbioticStressView.viewName = "AbioticStressView";
	Eplant.Views.AbioticStressView.displayName = "Abiotic Stress eFP";
	Eplant.Views.AbioticStressView.hierarchy = "genetic element";
	Eplant.Views.AbioticStressView.magnification = 35;
	Eplant.Views.AbioticStressView.description = "Abiotic Stress eFP";
	Eplant.Views.AbioticStressView.citation = "";
	Eplant.Views.AbioticStressView.activeIconImageURL = "";
	Eplant.Views.AbioticStressView.availableIconImageURL = "";
	Eplant.Views.AbioticStressView.unavailableIconImageURL = "";

	Eplant.Views.AbioticStressView.prototype.loadsvg = function() {

		this.Xhrs.loadsvgXhr=$.get(this.svgURL, $.proxy(function(data) {
			this.Xhrs.loadsvgXhr=null;
			// Get the SVG tag, ignore the rest
			var $svg = $(data).find('svg');
			$("g", $svg).not('[id*=label],[id*=Label]').attr('stroke', "black");
			$("text", $svg).attr('stroke','');
			$("#Info_Buttons *", $svg).attr('stroke','none');
			$("text", $svg).attr('fill','black');

			// Add replaced image's classes to the new SVG
			$svg = $svg.attr('class', 'efp-view-svg');
			// Remove any invalid XML tags as per http://validator.w3.org
			$svg = $svg.removeAttr('xmlns:a');

			$svg = $svg.attr('width', '100%');
			$svg = $svg.attr('height', '100%');
			// Replace image with new SVG
			//$img.replaceWith($svg);
			$svg.draggable();
			this.svgdom = $svg;
			this.isSvgLoaded=true;
		}, this), 'xml');

	};

	Eplant.Views.AbioticStressView.prototype.bindSvgEvents = function() {
		Eplant.BaseViews.EFPView.prototype.bindSvgEvents.call(this);
		this.infoButtons = [
		{
			ele:$('#condition_Cold',this.svgdom),
			info:'continuous 4ºC on crushed ice in cold chamber'
		},
		{
			ele:$('#condition_Osmotic',this.svgdom),
			info:'300 mM Mannitol'
		},
		{
			ele:$('#condition_Salt',this.svgdom),
			info:'150mM NaCl'
		},
		{
			ele:$('#condition_Drought',this.svgdom),
			info:'rafts were exposed to the air stream for 15 min with loss of app.10% fresh weight'
		},
		{
			ele:$('#condition_Genotoxic',this.svgdom),
			info:'bleomycin 1.5 ug/ml plus mitomycin C 22 ug/ml final concentration dissolved in water'
		},
		{
			ele:$('#condition_Oxidative',this.svgdom),
			info:'10 uM Methyl viologen'
		},
		{
			ele:$('#condition_UV-B',this.svgdom),
			info:'15 minutes UV-B light field consisting of six fluorescent tubes filtered through transmission cutoff filters'
		},
		{
			ele:$('#condition_Wounding',this.svgdom),
			info:'punctuation of the leaves by 3 consecutive applications of a custom made pin-tool consisting of 16 needles'
		},
		{
			ele:$('#condition_Heat',this.svgdom),
			info:'3 hours at 38ºC followed by recovery at 25ºC'
		},

		];
		var changeTooltipPosition = function(event) {
			var tooltipX = event.pageX;
			tooltipX = (tooltipX+200>window.innerWidth)? window.innerWidth-200:tooltipX;
			var tooltipY = event.pageY;
			tooltipY = (tooltipY+100>window.innerHeight)? window.innerHeight-100:tooltipY;
			$('div#efpTooltip').css({
				top: tooltipY,
				left: tooltipX
			});
		};
		var hideTooltip = $.proxy(function(event) {
			//$('div#efpTooltip').remove();
			if (this.tooltip) {
				this.tooltip.close();
				this.tooltip = null;
			}
			if($(event.currentTarget).attr('fill')){
				$("*", event.currentTarget).attr('stroke-width', "0");
			}

		},this);

		for (var n = 0; n < this.infoButtons.length; n++) {
			var infoButton = this.infoButtons[n];
			var obj = {
				infoButton:infoButton,
				view:this
			};

			var showTooltip = $.proxy(function(event) {
				$("*", this.view).attr('stroke', "1");
				//$('div #efpTooltip').remove();
				if (this.view.tooltip) {
					this.view.tooltip.close();
					this.view.tooltip = null;
				}
				this.view.tooltip = new Eplant.Tooltip({
					content: '<div style="max-width:200px">'+this.infoButton.info+'</div>',
					x:event.clientX,
					y:event.clientY-20
				});
				//$(toolTipString).appendTo('body');
				//changeTooltipPosition(event);
			}, obj);

			$(infoButton.ele).on({
				//mousemove: changeTooltipPosition,
				mouseenter: showTooltip,
				mouseleave: hideTooltip,
				mouseover: function() {
					$("*", this).attr('stroke-width', "1");
				}
			});
		}

	};


})();
