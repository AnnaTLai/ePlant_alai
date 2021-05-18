(function() {
	
	/**
		* Eplant.BaseViews.EFPView.PaletteDialog class
		* Coded by Hans Yu
		* UI designed by Jamie Waese
		*
		* Dialog for user to choose colors for an eFP view.
		*
		* @constructor
		* @param {Eplant.BaseViews.EFPView} eFPView The EFPView that owns this dialog.
	*/
	Eplant.BaseViews.EFPViewJson.PaletteDialog = function(eFPView) {
		/* Attributes */
		this.eFPView = eFPView;		// Parent EFPView
		this.domContainer = null;		// DOM container element
		this.domMinColorInput = null;		// DOM element for min color input
		this.domMidColorInput = null;		// DOM element for max color input
		this.domMaxColorInput = null;		// DOM element for max color input
		
		this.minColor = this.eFPView.minColor;
		this.midColor = this.eFPView.midColor;
		this.maxColor = this.eFPView.maxColor;
		/* Create DOM elements */
		this.createDOM();
		
		/* Create and open dialog */
		this.createDialog();
	};
	
	Eplant.BaseViews.EFPViewJson.PaletteDialog.prototype.setColors = function(min,mid,max) {
		$("#minColorInputText").val(min);
		$("#midColorInputText").val(mid);
		$("#maxColorInputText").val(max);
		$("#minColorInput").spectrum("set", min);
		$("#midColorInput").spectrum("set", mid);
		$("#maxColorInput").spectrum("set", max);
		this.minColor = min; // Minimum color
		this.midColor = mid; // Middle color
		this.maxColor = max; // Maximum color
	};
	
	Eplant.BaseViews.EFPViewJson.PaletteDialog.prototype.createPresetButton = function(min,mid,max) {
		var presetButton = $(document.createElement("div")).addClass('efp-color-preset');
		if(this.eFPView.mode!=='absolute'){
			var presetButtonColor1 = $(document.createElement("div")).addClass('efp-color-preset-color').css({'background':min});
			$(presetButton).append(presetButtonColor1);
		}
		
		var presetButtonColor2 = $(document.createElement("div")).addClass('efp-color-preset-color').css({'background':mid});
		var presetButtonColor3 = $(document.createElement("div")).addClass('efp-color-preset-color').css({'background':max});
		$(presetButton).on('click',$.proxy(function(){
			this.setColors(min,mid, max);
		},this));
		$(presetButton).append(presetButtonColor2).append(presetButtonColor3)
		return $(presetButton);
		
	};
	
	/**
		* Creates DOM elements.
	*/
	Eplant.BaseViews.EFPViewJson.PaletteDialog.prototype.createDOM = function() {
		/* Container */
		this.domContainer = document.createElement("div");
		
		/* Table */
		var table = document.createElement("table");
		$(table).width(300).css({'border-spacing': '0 5px',
		'border-collapse': 'separate'});
		
		$(this.domContainer).append(table);
		
		if(this.eFPView.mode !== "absolute"){
			var tr = document.createElement("tr");
			var td = document.createElement("td");
			/* Label */
			var label = document.createElement("label");
			$(label).html("Min Color");
			$(td).append(label);
			$(tr).append(td);
			td = document.createElement("td");
			/* Treshold input */
			this.domMinColorInput = document.createElement("input");
			$(this.domMinColorInput).width(60);
			$(this.domMinColorInput).addClass('colorPicker');
			$(this.domMinColorInput).attr('id','minColorInput');
			$(this.domMinColorInput).val(this.eFPView.minColor);
			$(td).append(this.domMinColorInput);
			this.domMinColorInputText = document.createElement("input");
			$(this.domMinColorInputText).addClass('paletteInput');
			$(this.domMinColorInputText).attr('id','minColorInputText');
			$(this.domMinColorInputText).val(this.eFPView.minColor);
			$(this.domMinColorInputText).change($.proxy(function(evt) {
				var input = $( evt.target ).val();
				var isOk  = /(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(input);
				if(isOk){
					$("#minColorInput").spectrum("set", input);
					this.minColor=input;
					}else{
					alert('Not a valid color.');
				}
			},this));
			
			$(td).append(this.domMinColorInputText);
			$(tr).append(td);
			$(table).append(tr);
		}
		
		tr = document.createElement("tr");
		td = document.createElement("td");
		/* Label */
		label = document.createElement("label");
		$(label).html("Zero Color");
		$(td).append(label);
		$(tr).append(td);
		td = document.createElement("td");
		/* Treshold input */
		this.domMidColorInput = document.createElement("input");
		$(this.domMidColorInput).addClass('colorPicker');
		$(this.domMidColorInput).attr('id','midColorInput');
		$(this.domMidColorInput).val(this.eFPView.midColor);
		$(td).append(this.domMidColorInput);
		this.domMidColorInputText = document.createElement("input");
		$(this.domMidColorInputText).addClass('paletteInput');
		$(this.domMidColorInputText).attr('id','midColorInputText');
		$(this.domMidColorInputText).val(this.eFPView.midColor);
		$(this.domMidColorInputText).change($.proxy(function(evt) {
			var input = $( evt.target ).val();
			var isOk  = /(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(input);
			if(isOk){
				$("#midColorInput").spectrum("set", input);
				this.midColor=input;
				}else{
				alert('Not a valid color.');
			}
		},this));
		$(td).append(this.domMidColorInputText);
		$(tr).append(td);
		$(table).append(tr);
		
		tr = document.createElement("tr");
		td = document.createElement("td");
		/* Label */
		label = document.createElement("label");
		$(label).html("Max Color");
		$(td).append(label);
		$(tr).append(td);
		td = document.createElement("td");
		/* Treshold input */
		this.domMaxColorInput = document.createElement("input");
		$(this.domMaxColorInput).width(60);
		$(this.domMaxColorInput).addClass('colorPicker');
		$(this.domMaxColorInput).attr('id','maxColorInput');
		$(this.domMaxColorInput).val(this.eFPView.maxColor);
		$(td).append(this.domMaxColorInput);
		this.domMaxColorInputText = document.createElement("input");
		$(this.domMaxColorInputText).addClass('paletteInput');
		$(this.domMaxColorInputText).attr('id','maxColorInputText');
		$(this.domMaxColorInputText).val(this.eFPView.maxColor);
		$(this.domMaxColorInputText).change($.proxy(function(evt) {
			var input = $( evt.target ).val();
			var isOk  = /(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(input);
			if(isOk){
				$("#maxColorInput").spectrum("set", input);
				this.maxColor=input;
				}else{
				alert('Not a valid color.');
			}
		},this));
		$(td).append(this.domMaxColorInputText);
		$(tr).append(td);
		$(table).append(tr);
		
		
		tr = document.createElement("tr");
		td = document.createElement("td");
		/* Label */
		label = document.createElement("label");
		$(label).html("Preset Colors");
		$(td).append(label);
		$(tr).append(td);
		td = document.createElement("td");
		$(td).css({width:120});
		/* Treshold input */
		$.getJSON( "data/presetColors.json", $.proxy(function( data ) {
			var presetColors = data;
			/* Create Choice objects for the SelectList */
			for (var n = 0; n < presetColors.length; n++) {
				/* Get Species */
				var presetColor = presetColors[n];
				
				this.createPresetButton(presetColor.minColor,presetColor.midColor, presetColor.maxColor).appendTo(td);
			}
		},this));
		
		$(tr).append(td);
		$(table).append(tr);
		this.domOk = document.createElement("input");
		$(this.domOk).attr("type", "button");
		$(this.domOk).css({"width":"100px"});
		$(this.domOk).addClass("button greenButton");
		$(this.domOk).val("OK");
		$(this.domContainer).append(this.domOk);
		$(this.domOk).on('click',$.proxy(function(event, ui) {
			
			this.eFPView.minColor= this.minColor;
			this.eFPView.midColor= this.midColor;
			this.eFPView.maxColor= this.maxColor;
			
			/* Update icon image */
			this.eFPView.paletteButton.setImageSource("img/on/palette.png");
			
			/* Update eFP */
			this.eFPView.updateEFP();
			
			/* Close dialog */
			this.close();
		}, this));
		this.domCancel = document.createElement("input");
		$(this.domCancel).attr("type", "button");
		$(this.domCancel).css({"width":"100px",'background-color':'#C4C4C4'});
		$(this.domCancel).addClass("button greenButton");
		$(this.domCancel).val("Cancel");
		$(this.domContainer).append(this.domCancel);
		$(this.domCancel).on('click',$.proxy(function(event, ui) {
			this.close()
		}, this));
	};
	
	
	
	/**
		* Creates and opens the dialog.
	*/
	Eplant.BaseViews.EFPViewJson.PaletteDialog.prototype.createDialog = function() {
		$(this.domContainer).dialog({
			title: "Customize Color Palette",
			width: 320,
			height: "auto",
			minHeight: 0,
			resizable: false,
			modal: true,
			open: $.proxy(function(event, ui) {
				$(".ui-dialog-titlebar-close").hide();
				$(".ui-dialog-buttonpane").css({'border-top-width':'0px'});
				if(this.eFPView.mode !== "absolute"){
					$("#minColorInput").spectrum({
						clickoutFiresChange: true,
						color: this.minColor,
						change: $.proxy(function(color) {
							this.minColor =	color.toHexString(); // #ff0000
						},this)
					});
				}
				$("#midColorInput").spectrum({
					clickoutFiresChange: true,
					color: this.midColor,
					change: $.proxy(function(color) {
						this.midColor =	color.toHexString(); // #ff0000
					},this)
				});
				$("#maxColorInput").spectrum({
					clickoutFiresChange: true,
					color: this.maxColor,
					change: $.proxy(function(color) {
						this.maxColor =	color.toHexString(); // #ff0000
					},this)
				});
			}, this),	
			close: $.proxy(function(event, ui) {
				this.remove();
			}, this)
		});
	};
	
	/**
		* Closes the dialog.
	*/
	Eplant.BaseViews.EFPViewJson.PaletteDialog.prototype.close = function() {
		/* Close dialog */
		$(this.domContainer).dialog("close");
	};
	
	/**
		* Removes the dialog.
	*/
	Eplant.BaseViews.EFPViewJson.PaletteDialog.prototype.remove = function() {
		/* Remove DOM elements */
		$(this.domContainer).remove();
	};
	
})();
