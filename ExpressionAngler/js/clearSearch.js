// from: http://www.awmcreative.com/jquery/jquery-search-field-with-clear-icon/

$(document).ready(function(){
    $(".search-input").keyup(function() {
        if ($(this).val().length !=0) {
            $(".search-reset").show();
			} else {
            $(".search-reset").hide();
		}
	});
	$('.search-input').keydown(function(e){
		if (e.keyCode == 27) {
			$(this).val("");
			$(".search-reset").hide();
		}
	});
	$(".search-reset").click(function(event) {
		$(".search-reset").hide();
		$(".search-input").val("");
		jQuery("#user_agi_valid").text('No AGI ID Query');
		jQuery("#user_agi_valid_icon").attr('src','images/incorrect.png');
		resetAllTissues();
		toggleButtonAvailability();
		
	});
});