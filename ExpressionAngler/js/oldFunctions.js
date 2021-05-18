/* --- OLD FUNCTIONS */
 <input type="checkbox" id="excludeSamplesCheckbox" style="float: left;" onclick="excludeSamplesCheckbox();">
<div class="instructions-heading">Check this box if you wish to exclude samples from the analysis.</div>
  <div id="ExcludeSamplesControl" class="hidden">

 <!-- Limit search samples to these tissues --> 
                  <div class="panel panel-success">
                    <div class="panel-heading">
                        <h4 class="panel-title">
                            Limit your search samples to the selected tissues
                        </h4>
                    </div>
                    <div class="panel-body">                       
                              <div class="col-md-12 text-center">
                                   <button type="button" class="btn btn-default" id="ExcludeSamplesTableButton" style="margin-top:10px;">Select Samples to Include or Exclude from Search</button>
                              </div>
                              <div class="instructions" style="margin-top:10px;">Click the button to open a selection table or click on the samples below to exclude them from the search.</div>
                          </div>
                    </div>
                  </div>


/* -------------------------------------------------- */
// Exclude Samples From Search functions
var excludeSamplesMode = false;
// click the checkbox to enable the Exclusion mode
function excludeSamplesCheckbox() {
    excludeSamplesMode = $("#excludeSamplesCheckbox").prop('checked') 
        // make buttons available
        $('#ExcludeSamplesControl').toggleClass("hidden");
        $('#excludeTissueFromSearchButton').toggleClass("hidden");
}


/* -------------------------------------------------- */
/*  Replace all SVG images with inline SVG so we can work with it
from: http://jsfiddle.net/3jbumc07/12/ */
jQuery(document).ready(function() {
    jQuery('img.svg').each(function(){
        var $img = jQuery(this);
        var imgID = $img.attr('id');
        var imgClass = $img.attr('class');
        var imgURL = $img.attr('src');

        jQuery.get(imgURL, function(data) {
            // Get the SVG tag, ignore the rest
            var $svg = jQuery(data).find('svg');

            // Add replaced image's ID to the new SVG
            if(typeof imgID !== 'undefined') {
                $svg = $svg.attr('id', imgID);
            }
            // Add replaced image's classes to the new SVG
            if(typeof imgClass !== 'undefined') {
                $svg = $svg.attr('class', imgClass+' replaced-svg');
            }

            // Remove any invalid XML tags as per http://validator.w3.org
            $svg = $svg.removeAttr('xmlns:a');

            // Replace image with new SVG
            $img.replaceWith($svg);

            // Add a handler
            jQuery('g').each(function() {
                jQuery(this).click(function() {alert(jQuery(this).attr('id'));});
            });

        });

    });
});




/* -------------------------------------------------- */
// Reset all tissues button - sets value of all tissue to undefined and makes background white
function resetAllButton() {
    // first, set all shapes that have been clicked on as white
    for (var i=0; i<allShapes.length; i++) {
        activeTissue = allShapes[i];
        $('#textboxAbsolute').css("background-color", "rgb(255,255,255");
        updateSVGfill();
    }

    // then, reset allShapes and allValues
    allShapes = [];
    allValues = [];
}

/* -------------------------------------------------- */
// Absolute textbox
function updateTextboxAbsolute(value){
    //console.log(value);
    // adjust the color of the text box according to the text box value
    var sum = Math.round( 255 - ((value/1000)*255) );
    var color = "rgb(255,"+sum+",0)";
    $('#textboxAbsolute').css("background-color", color);

    // move the slider to the current value
    $('#sliderAbsolute').val(value);

    // now adjust the fill color of the SVG shape
    updateSVGfill();
}

/* -------------------------------------------------- */
// update SVG fill colors
function updateSVGfill() {
    // console.log(activeTissue);
    // get the color from the text box
    var color = $('#textboxAbsolute').css("background-color");
    // and put it in the active svg shape
    $('#'+activeTissue).css({ fill: color });

}
