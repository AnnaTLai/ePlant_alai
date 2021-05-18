(function() {
	

	
    /**
		* Dialog Manager namespace
		* By Jim Fan
		*
		* This namespace is for the ePlant core.
		*
		* @namespace
	*/
    DialogManager = {};
    /* Attributes */
	
	
    DialogManager.artDialogUrl = function(url, opts) {
        var options = {};
        options.lock = true;
        options.background = '#000';
        options.opacity = 0.6;
        options.window = 'top';
        options.width = '80%';
        options.height = '80%';
        options.fixed = true;
        options.drag = true;
        options.resize = true;
		if(opts){
			$.extend(options, opts);
		}
        return art.dialog.open(url, options);
	};
	
    DialogManager.artDialog = function(content, opts) {
        var options = {};
        options.content = content;
        options.lock = true;
        options.background = '#000';
        options.opacity = 0.6;
        options.window = 'top';
        options.width = '80%';
        options.height = '80%';
        options.fixed = true;
        options.drag = true;
        options.resize = true;
		if(opts){
			$.extend(options, opts);
		}
        return art.dialog(options);
	};
    
    DialogManager.artDialogDynamic = function(content, opts) {
        var options = {};
        options.content = content;
        options.lock = true;
        options.background = '#000';
        options.opacity = 0.6;
        options.window = 'top';
        options.fixed = true;
        options.drag = true;
        options.resize = true;
		if(opts){
			$.extend(options, opts);
		}
        return art.dialog(options);
	};
	
    DialogManager.artDialogBottom = function(content, opts) {
        var options = {};
        options.content = content;
        options.window = 'top';
        options.fixed = true;
        options.drag = false;
        options.resize = false;
        options.left = '100%';
        options.top = '100%';
		if(opts){
			$.extend(options, opts);
		}
		
        return DialogManager.notice(options);
		
	};
	
    DialogManager.notice = function(options, opts) {
        var opt = options || {},
		api, aConfig, hide, wrap, top,
		duration = 500;
		
        var config = {
            id: options.id || 'notice',
			content:options.content,
            left: '98%',
            top: '100%',
            fixed: true,
            drag: false,
            resize: false,
            follow: null,
            lock: false,
			width:600,
            init: function(here) {
                api = this;
                aConfig = api.config;
                wrap = api.DOM.wrap;
                top = parseInt(wrap[0].style.top)-50;
                hide = top + wrap[0].offsetHeight;
				
                wrap.css({
					'top': hide + 'px',
					opacity:0
				})
				.animate({
					top: top + 'px',
					opacity:1
                    }, duration, function() {
					opt.init && opt.init.call(api, here);
				});
			},
            close: function(here) {
                wrap.animate({
                    top: hide + 'px',
					opacity:0
					}, duration, function() {
                    opt.close && opt.close.call(this, here);
                    aConfig.close = $.noop;
                    api.close();
				});
				
                return false;
			}
		};
		
        for (var i in opt) {
            if (config[i] === undefined) config[i] = opt[i];
		};
		
        return artDialog(config);
	};
	
})();		

