(function() {
	
	/**
		* Eplant.BaseViews.EFPView.MaskDialog class
		* Coded by Hans Yu
		* UI designed by Jamie Waese
		*
		* Dialog for user to choose masking settings for an eFP view.
		*
		* @constructor
		* @param {Eplant.BaseViews.EFPView} eFPView The EFPView that owns this dialog.
	*/
	Eplant.BaseViews.EFPView.MaskDialog = function(eFPView) {
		/* Attributes */
		this.eFPView = eFPView;		// Parent EFPView
		this.domContainer = null;		// DOM container element
		this.domInput = null;		// DOM element for threshold input
		
		/* Create DOM elements */
		this.createDOM();
		
		/* Create and open dialog */
		this.createDialog();
	};
	
	/**
		* Creates DOM elements.
	*/
	Eplant.BaseViews.EFPView.MaskDialog.prototype.createDOM = function() {
		/* Container */
		this.domContainer = document.createElement("div");
		this.domDesc = document.createElement("div");
		$(this.domDesc).css({'color':'#999'});
		$(this.domDesc).html("Mask samples if the expression level is within a given range of their standard deviation");
		$(this.domContainer).append(this.domDesc);
		/* Table */
		var table = document.createElement("table");
		$(table).width(300);
		$(table).css({
			'margin': '10px 0px 10px 4px',
			'vertical-align': 'middle'
		})
		$(this.domContainer).append(table);
		
		/* Threshold */
		var tr = document.createElement("tr");
		/* Label */
		/*var td = document.createElement("td");
			
			var label = document.createElement("label");
			$(label).html("Set threshold RSE (%):");
			$(td).append(label);
		$(tr).append(td);*/
		var td = document.createElement("td");
		/* Treshold input */
		this.domInput = document.createElement("input");
		$(this.domInput).css({
			'margin-left': '5px',
			'padding-left': '5px',
			width: '50px',
			'vertical-align': 'middle',
			'-webkit-border-radius': '3px',
			'-moz-border-radius': '3px',
			'border-radius': '3px',
		'height': '25px'});
		$(td).append(this.domInput);
		/*$(this.domInput).spinner({
			spin: function(event, ui) {
			if (ui.value < 0) {
			$(this).spinner("value", 0);
			}
			},
			change: $.proxy(function( event, ui ) {
			if (ui.value) {
			var value = ui.value.substring();
			$(this.domSlider).slider("value", parseInt(value));
			}
			},this)
			});
			
		$(this.domInput).spinner("value", 50);*/
				$(td).append("%");
		this.domSlider = document.createElement("div");
		$(td).append(this.domSlider);
		$(this.domSlider).css({  
			width: '200px',
			display: 'inline-block',
			'margin-left': '20px',
		'vertical-align': 'middle'})
		.slider({
			range: "min",
			value: 50,
			step: 1,
			min: 0,
			max: 100,
			slide: $.proxy(function( event, ui ) {
				jQuery( this.domInput).val(ui.value );
			},this)
		});
		$(this.domInput).val(50).change($.proxy(function (e) {
			var value = e.currentTarget.value.substring();
			if(value.match(/^\d+$/)) {
				var intvar =  parseInt(value);
				if(intvar<0){
					e.currentTarget.value = '0';
					$(this.domSlider).slider("value", 0);
				}
				else if(intvar>100){
					e.currentTarget.value = '100';
					$(this.domSlider).slider("value", 100);
				}
				else
				{
					$(this.domSlider).slider("value", parseInt(value));
				}
				
				}else{
				$(this.domSlider).slider("value", 0);
				e.currentTarget.value = '0';
			}
			
		},this));
		$(tr).append(td);
		$(table).append(tr);
		
		this.domOk = document.createElement("input");
		$(this.domOk).attr("type", "button");
		$(this.domOk).addClass("button greenButton");
		$(this.domOk).val("Mask Thresholds");
		$(this.domContainer).append(this.domOk);
		$(this.domOk).on('click',  $.proxy(function(event, ui) {
			/* Get threshold */
			var value = $(this.domInput).val();//.spinner("value");
			if (value < 0) value = 0;
			
			/* Turn on masking */
			Eplant.maskThreshold = value / 100;
			Eplant.isMaskOn = true;
			
			/* Update icon image */
			this.eFPView.maskButton.setImageSource("img/on/filter.png");
			
			/* Update eFP */
			this.eFPView.updateDisplay();
			var event = new ZUI.Event("update-colors", Eplant, null);
			ZUI.fireEvent(event);	
			/* Close dialog */
			this.dialog.close();
		}, this));
	};
	
	/**
		* Creates and opens the dialog.
	*/
	Eplant.BaseViews.EFPView.MaskDialog.prototype.createDialog = function() {
		/*$(this.domContainer).dialog({
			title: "Masking",
			width: 320,
			height: "auto",
			minHeight: 0,
			resizable: false,
			modal: true,
			open: function(event, ui) { $(".ui-dialog-titlebar-close").hide();
			$(".ui-dialog-buttonpane").css({'border-top-width':'0px'});
			},
			close: $.proxy(function(event, ui) {
			this.remove();
			}, this)
		});*/
		
		var options = {};
		options.content = this.domContainer;
		options.lock = true;
		options.background = '#000'; 
		options.opacity = 0.6;
		options.width = 320;
		options.window = 'top'; 
		options.fixed= true; 
		options.drag= false;
		options.resize= false;
		/*options.close= $.proxy(function() {
			this.dialog.close();
		}, this)*/
		this.dialog = art.dialog(options);
		//$.extend(true,this, dialog );
	};
	
	/**
		* Closes the dialog.
	*/
	Eplant.BaseViews.EFPView.MaskDialog.prototype.close = function() {
		/* Close dialog */
		//this.dialog.close();
		this.dialog.close();
	};
	
	/**
		* Removes the dialog.
	*/
	Eplant.BaseViews.EFPView.MaskDialog.prototype.remove = function() {
		/* Remove DOM elements */
		//this.dialog.remove();
		this.dialog.close();
	};
	
})();					