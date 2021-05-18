function respondCanvas(){ 
	var c = $('#ZUI_canvas');
    container = $(c).parent();
	c.attr('width', $(container).width() ); //max width
	c.attr('height', $(container).height() ); //max height
	var $left = $('#left');
	var leftMargin =$left.width()+$left.outerWidth(true)-$left.innerWidth();
	var height = $(window).height() - 75;
	var width = $(window).width()-leftMargin ;
	$('div#left').height(height);
	$('div.tab').height(height);
	if(height>600)
	{
		$('div#sequence-theme').height(height);
		$('div#sequence').height(height);
	}
	$('div#genePanel_container').height(height-280);
	$('div.tab').width(width);
	$('div#ZUI_container').width(width);
	$('div.tab').css('margin-left',leftMargin );
	var settings = $('div#settings_container'); 
	settings.width( $(window).width()- parseInt(settings.css('marginLeft'),10) );
	$('div#tabUl').width( $(window).width()- parseInt(settings.css('marginLeft'),10) );
	Eplant.resizeIconDock(height);
}

$(document).ready(function() {
	//Get the canvas &
    var c = $('#ZUI_canvas');
	
    var container = $(c).parent();
	
    //Run function when browser resizes

	
    
	
    //Initial call 
    //respondCanvas();
	//sidebarStatus = true;

	
});
