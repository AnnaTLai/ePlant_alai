$(document).ready(function(){
    var options = {
        nextButton: true,
        prevButton: true,
        pagination: true,
        animateStartingFrameIn: true,
        autoPlay: false,
        autoPlayDelay: 3000,
        preloader: true,
		pauseButton:false,
        preloadTheseFrames: [1],
        preloadTheseImages: [
        ]
    };
    
    var sequence = $("#sequence").sequence(options).data("sequence");

	

});