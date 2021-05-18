(function() {
	
	/**
		* Eplant.GlobalColorModeDialog class
		* Coded by Hans Yu
		* UI designed by Jamie Waese
		*
		* Dialog for user to choose colors for an eFP view.
		*
		* @constructor
		* @param {Eplant.BaseViews.EFPView} eFPView The EFPView that owns this dialog.
	*/
	Eplant.GlobalColorModeDialog = function() {
		/* Attributes */
		this.domContainer = null;		// DOM container element
		
		/* Create DOM elements */
		this.createDOM();
		
		/* Create and open dialog */
		this.createDialog();
	};
	
	
	/**
		* Creates DOM elements.
	*/
	Eplant.GlobalColorModeDialog.prototype.createDOM = function() {
		/* Container */
		this.domContainer = document.createElement("div");
		$(this.domContainer).attr('id','dropdown-color-mode')
		var content =$('<div class="iconTiny hint--right hint--success hint--rounded" data-hint="Use the same color gradient for all genes" data-enabled="true" style="width:auto;display: block;">'
		+'<input type="radio" name="" value="globalAbsolute"><span>Use Global Max</span>'
		+'</div>'
		+'<div class="iconTiny hint--right hint--success hint--rounded" data-hint="Each gene is drawn with its own color gradient" data-enabled="true" style="width:auto;display: block;">'
		+'<input type="radio" name=""  value="absolute"><span>Use Local Max</span>'
		+'</div>'
		+'<div class="iconTiny hint--right hint--success hint--rounded" data-hint="Use a global color gradient, with the max determined by a number you define" data-enabled="true" style="width:auto;display: block;">'
		+'<input type="radio" name="" value="customAbsolute"><span>Use Custom Max</span><input value="1000" class="customAbsoluteValue" type="text" style="float: right;width: 50px;margin-left: 15px;height: 20px;line-height: 20px;">'
		+'</div>');
		
		$(this.domContainer).append(content);
		
		$('input[value="'+Eplant.globalColorMode+'"]',this.domContainer).attr("checked","checked");
		
		$("div", this.domContainer).click(function() {
			var radio = $('input[type="radio"]',this);
			
			$(this).closest('#dropdown-color-mode').find('input[type="radio"]').removeProp('checked');
			radio.prop('checked','checked');
			
			/*var mode = radio.val()
			Eplant.globalColorMode = mode;
			if(Eplant.globalColorMode ==="customAbsolute"){
				if (Eplant.viewColorMode === "absolute") {
					Eplant.customGlobalMax = $("#adjustColorMode .btn .customAbsoluteValue").val();
				}
				else if (Eplant.viewColorMode === "relative") {
					Eplant.customGlobalExtremum = $("#adjustColorMode .btn .customAbsoluteValue").val();
				}
			}
			var event = new ZUI.Event("update-colors", Eplant, null);
			ZUI.fireEvent(event);	*/
		});
		
		$(".customAbsoluteValue", this.domContainer).click(function(e) {
			e.stopPropagation();
		});
	};
	
	
	
	/**
		* Creates and opens the dialog.
	*/
	Eplant.GlobalColorModeDialog.prototype.createDialog = function() {
		/*$(this.domContainer).dialog({
			title: "Color Settings",
			width: 320,
			height: "auto",
			minHeight: 0,
			resizable: false,
			modal: true,
			open: $.proxy(function(event, ui) {
			$(".ui-dialog-titlebar-close").hide();
			$(".ui-dialog-buttonpane").css({'border-top-width':'0px'});
			if(!Eplant.activeView.mode||Eplant.activeView.mode!=='absolute'){
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
		});*/
		var options = {};
		options.content = this.domContainer;
		options.title = "Color Gradient Settings";
		options.lock = true;
		options.background = '#000'; 
		options.opacity = 0.6;
		options.width = 320;
		options.window = 'top'; 
		options.fixed= true; 
		options.drag= false;
		options.resize= false;
		options.init= function() {
			this.DOM.content.css({"overflow":"visible"})
		};
		options.close= $.proxy(function() {
			//this.remove();
		}, this);
		options.ok =$.proxy(function(event, ui) {
			var radio = $('input[type="radio"]:checked',this.domContainer);
			var mode = radio.val()
			Eplant.globalColorMode = mode;
			if(Eplant.globalColorMode ==="customAbsolute"){
				if (Eplant.viewColorMode === "absolute") {
					Eplant.customGlobalMax = $(".customAbsoluteValue",this.domContainer).val();
				}
				else if (Eplant.viewColorMode === "relative") {
					Eplant.customGlobalExtremum = $(".customAbsoluteValue",this.domContainer).val();
				}
			}
			var event = new ZUI.Event("update-colors", Eplant, null);
			ZUI.fireEvent(event);	
			
		}, this);
		/*options.cancel = $.proxy(function(event, ui) {
			this.close();
		}, this);*/
		this.dialog = window.top.art.dialog(options);
	};
	
	/**
		* Closes the dialog.
	*/
	Eplant.GlobalColorModeDialog.prototype.close = function() {
		/* Close dialog */
		this.dialog.close();
	};
	
	/**
		* Removes the dialog.
	*/
	Eplant.GlobalColorModeDialog.prototype.remove = function() {
		/* Remove DOM elements */
		this.dialog.close();
	};
	
})();
