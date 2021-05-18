

(function($){  
    $.fn.carousel = function(options) {  
         
        var settings = {
            ulid: 'navigationContainer',
            topId:'carouselTop',
            bottomId:'carouselBottom',
            visibleTab:0, 
            totalTab:0
        };  
         
        return this.each(function(){
            var options = $.extend(settings, options); 
            options.tabWidth = 0;
            options.maxTop = 0;
            options.totalTab = 0;
            options.top=0;
            $tabs = $(this),
            $tabUL = $('#'+options.ulid);
            $top = $('#'+options.topId);
            $bottom = $('#'+options.bottomId);
            
            $tabUL.css('height',$tabs.height());
            
            /*tab slider*/
            $top.click(function() {
                if($tabUL.position().top > (options.maxTop)){
                    $top.hide();
                    $tabUL.animate({
                        top: '-='+options.tabHeight
                        },300, function(){
                        $tabs.trigger('showArrow'); 
                    });
                }
            });
                    
            $bottom.click(function() {
                if($tabUL.position().top < 0){
                    $bottom.hide();
                    $tabUL.animate({
                        top: '+='+options.tabHeight
                        } ,300, function(){
                        $tabs.trigger('showArrow'); 
                    });
                }
            });
            
                        $tabs.bind('tabMaxTop', function(){
                var extraTabs = options.totalTab - options.visibleTab;
                options.maxTop = -(extraTabs * options.tabHeight);
            });

	$(window).on('resize', function () {
                //update totalTab
                options.totalTab = $('div', $tabUL).length;
                
                $tabs.trigger('tabMaxTop');
                
		var settings = $(".tabIframe").contents().find('div#settings_container'); 
		var marginTop =parseInt(settings.css('marginTop'),10);
                if($tabUL.height() < $(window).height() ){
		    
		    $tabUL.css('height', $(window).height()- marginTop);
		    $tabUL.css('top', 0 );
		    options.maxTop=0;
		    options.visibleTab=options.totalTab;
                }
		else
		{
	            options.visibleTab= Math.floor(($tabs.height()-marginTop)/options.tabHeight);
		    $tabs.trigger('tabMaxTop');
		}
		$tabs.trigger('showArrow'); 

        });
    
            $tabs.bind('selectTab', function(event, index){
                $tabs.tabs('select', index);
                index++;
                var currenttopPos = $tabUL.position().top;
                var tabHiddenTop = Math.round(Math.abs(currenttopPos)/options.tabHeight);
                if(tabHiddenTop >= index){
                    var rigtAnimate = (tabHiddenTop - index +1 ) * options.tabHeight;
                    $tabUL.animate({
                        top: '+='+rigtAnimate
                        },300, function() {
                        $tabs.trigger('showArrow'); 
                    });
                }else{
                    var tabontop = tabHiddenTop + options.visibleTab;
                    var tabHiddenBottom = options.totalTab - tabHiddenTop - options.visibleTab;

                    if(tabHiddenBottom > 0 && index > tabontop){
                        var bottomIndex = (index - tabontop);
                        var topAnimate = bottomIndex * options.tabHeight;
                        $tabUL.animate({
                            top: '-='+topAnimate
                            },300, function(){
                            $tabs.trigger('showArrow'); 
                        });
                        
                    }
                }
                       
            });
            
            $tabs.bind('showArrow', function(){
                var currenttopPos = $tabUL.position().top;
                var tabHiddenTop = Math.round(Math.abs(currenttopPos)/options.tabHeight);
                var tabontop = tabHiddenTop + options.visibleTab;
                var tabHiddenBottom = options.totalTab - tabHiddenTop - options.visibleTab;
                
                if(tabHiddenTop > 0){
                    $bottom.show();
                }else{
                    $bottom.hide();
                }
                
                if(tabHiddenBottom > 0){
                    $top.show();
                }else{
                    $top.hide();
                }
            });
            
        });// return part
    };  //function body end
})(jQuery);  


