(function() {
    
    EFP = {};

    EFP = function(geneticElement, configs) {
	
	var EFPSvgURL = 'data/plant/AtGenExpress/Arabidopsis_thaliana.svg';
	var EFPXmlURL = 'data/plant/AtGenExpress/Arabidopsis_thaliana.xml';

	this.viewType = "EFP";

        /* Attributes */
	this.svgdom = null;
        this.svgURL = EFPSvgURL;

        this.svgImage = document.createElement('img');
        this.svgImage.src = this.svgURL;
        this.loadsvg(this.svgImage);


        this.xmlURL = EFPXmlURL;
        this.geneticElement = geneticElement;
        this.minColor = "#0000FF"; // Minimum color
        this.midColor = "#FFFF00"; // Middle color
        this.maxColor = "#FF0000"; // Maximum color
        this.maskColor = "#B4B4B4"; // Mask color
        this.errorColor = "#FFFFFF"; // Error color
        this.modeButton = null; // Mode ViewSpecificUIButton
        this.compareButton = null; // Compare ViewSpecificUIButton
        this.maskButton = null; // Mask ViewSpecificUIButton
        this.isMaskOn = false; // Whether masking is on
        this.maskThreshold = 1; // Masking threshold
        this.isRelativeEnabled = true; // Whether relative mode is enabled
        this.isCompareEnabled = true; // Whether compare mode is enabled
        this.isMaskEnabled = true; // Whether masking is enabled
        this.compareEFPView = null; // EFP view for comparing to
        this.mode = "absolute"; // EFP mode
        this.tooltipInfo = null; // Information for creating tooltip
	this.groups = null;
	/* Apply configurations */
	if (configs) {
		if (configs.isRelativeEnabled !== undefined) {
			this.isRelativeEnabled = configs.isRelativeEnabled;
		}
		if (configs.isCompareEnabled !== undefined) {
			this.isCompareEnabled = configs.isCompareEnabled;
		}
		if (configs.isMaskEnabled !== undefined) {
			this.isMaskEnabled = configs.isMaskEnabled;
		}
	}

        /* Create view-specific UI buttons */
        /*this.createViewSpecificUIButtons();*/

        /* Load data */
        this.loadData();


        /* Create legend */
        this.legend = new EFP.Legend(this);

    };

	EFP.prototype.viewType = "EFP";


    /**
     * Active callback method.
     *
     * @override
     */
    EFP.prototype.active = function() {
        /* Call parent method */
 	$('#efp_container').empty();

        $(this.svgdom).appendTo('#efp_container');
	this.bindSvgEvents();

        if (this.legend.isVisible) {
            this.legend.attach();
        }

    };


    EFP.prototype.loadsvg = function(svgimage) {
        var $img = jQuery(svgimage);
        var imgID = $img.attr('id');
        var imgClass = $img.attr('class');
        var imgURL = $img.attr('src');

        $.get(imgURL, $.proxy(function(data) {
            // Get the SVG tag, ignore the rest
            var $svg = $(data).find('svg');
            $("g", $svg).attr('stroke', "black");
	    $("text", $svg).attr('fill', "black");
            // Add replaced image's ID to the new SVG
            if (typeof imgID !== 'undefined') {
                $svg = $svg.attr('id', imgID);
            }
	    $svg = $svg.attr('id', 'efpViewObject');

            // Add replaced image's classes to the new SVG
            $svg = $svg.attr('class', 'EFP-view-svg');
            // Remove any invalid XML tags as per http://validator.w3.org
            $svg = $svg.removeAttr('xmlns:a');

            $svg = $svg.attr('width', '100%');
            $svg = $svg.attr('height', '100%');
            // Replace image with new SVG
            //$img.replaceWith($svg);
            $svg.draggable();
            this.svgdom = $svg;
        }, this), 'xml');

    };

    /**
     * Loads EFP definition and data.
     */
    EFP.prototype.loadData = function() {
	var EFP = this;
        /* Get EFP definition */
        $.ajax({
            type: "GET",
            url: this.xmlURL,
            dataType: "xml",
            success: $.proxy(function(response) {
	this.webService = "//bar.utoronto.ca/eplant/cgi-bin/plantefp.cgi?datasource=atgenexp_plus&";


                /* Prepare array for samples loading */
            var samples = [];

            /* Create labels */
            //this.labels = $(response).find('labels');


            /* Create groups */
            this.groups = [];
            var groupsXml = $(response).find('group').find('tissue');
		//groupsXml.find('tissue').each(function(index, groupData) {
	    for (var n = 0; n < groupsXml.length; n++) {

                    /* Get group data */
                    var groupData = groupsXml[n];

                    /* Asher: My solution is to have an if statement to read all control data for each group
			if (typeof groupData.control != 'undefined') {
				alert(groupData.control.id);
			}
			*/

                    /* Create group object */
                    var group = {
                        id: groupData.attributes['id'].value.replace(" ", "_").replace("_x2B_", "").replace("_x2C_", "").replace(" ", "_").replace(/^[^a-z]+|[^\w:.-]+/gi, ""),
			name: groupData.attributes['name'].value,
                        samples: [],
                        ctrlSamples: [],
                        source: groupData.source,
                        color: '#fff',
                        isHighlight: false,
                        tooltip: null,
                        fillColor: '#fff',
                        link: $('link',groupData).attr('url')
                    };
                    /* Prepare wrapper object for proxy */
                    var wrapper = {
                        group: group,
                        EFPView: this
                    };

                    /* Prepare samples */
                    var samplesXml = $('sample',groupData);
                    for (var m = 0; m < samplesXml.length; m++) {
                        var sample = {
                            name: samplesXml[m].attributes['name'].value,
                            value: null
                        };

                        /* Add it the samples array */
                        samples.push(sample);

                        /* Add to group samples */
                        group.samples.push(sample);
                    }

                    /* Asher: Prepare samples for controls if it exists in the group */
		   var controlsXml = $('sample',groupsXml);
                    if (controlsXml !== undefined) {
                        for (var m = 0; m < controlsXml.length; m++) {
                            var sample = {
                                name: controlsXml[m].attributes['name'].value,
                                value: null
                            };

                            /* Add it the samples array */
                            samples.push(sample);
                            group.ctrlSamples.push(sample);
                        }
                    }

                    /* Append group to array */
                    this.groups.push(group);
		    
                }

                /* Get sample values */
                /* Get sample names */
                var sampleNames = [];
                for (var n = 0; n < samples.length; n++) {
                    if ($.inArray(samples[n].name, sampleNames) === -1) {
                        sampleNames.push(samples[n].name);
                    }
                }
                /* Prepare wrapper for proxy */
                var wrapper = {
                    samples: samples,
                    EFPView: this
                };
                /* Query */
                $.getJSON(this.webService + "id=" + this.geneticElement.identifier + "&samples=" + JSON.stringify(sampleNames), $.proxy(function(response) {
                    /* Match results with samples and copy values to samples */
                    for (var n = 0; n < this.samples.length; n++) {
                        for (var m = 0; m < response.length; m++) {
                            if (this.samples[n].name == response[m].name) {
                                this.samples[n].value = Number(response[m].value);
                                break;
                            }
                        }
                    }

                    /* Process values */
                    this.EFPView.processValues();

                    /* Update EFP */
                    this.EFPView.updateEFP();

                    /* bind events to svg elements EFP */
                    this.EFPView.bindSvgEvents();

		    this.EFPView.active();
                }, wrapper));


            },this)
        });
	};


    /**
     * Binds events.
     */
    EFP.prototype.bindEvents = function() {
        /* update-annotationTags */
        this.updateAnnotationTagsEventListener = new ZUI.EventListener("update-annotationTags", this.geneticElement, function(event, eventData, listenerData) {
            /* Get EFPView */
            var EFPView = listenerData.EFPView;

            /* Update tags */
            EFPView.updateTags();
        }, {
            EFPView: this
        });
    };

    /**
     * Calculates useful information from raw values.
     */
    EFP.prototype.processValues = function() {
        /* Processes raw values for a group */
        function processGroupValues(group) {
            var values = [];
            for (var n = 0; n < group.samples.length; n++) {
                var sample = group.samples[n];
                if (!isNaN(sample.value)) {
                    values.push(sample.value);
                }
            }
            group.mean = mean(values);
            group.n = values.length;
            group.stdev = stdev(values);
            group.sterror = sterror(values);

            if (group.ctrlSamples === undefined) {
                return;
            }

            /* Asher: Calculate the stats for group control */
            var values = [];
            for (var n = 0; n < group.ctrlSamples.length; n++) {
                var sample = group.ctrlSamples[n];
                if (!isNaN(sample.value)) {
                    values.push(sample.value);
                }
            }
            group.ctrlMean = mean(values);
            group.ctrln = values.length;
            group.ctrlStdev = stdev(values);
            group.ctrlSterror = sterror(values);
        }

        /* Groups */
        for (var n = 0; n < this.groups.length; n++) {
            var group = this.groups[n];
            processGroupValues(group);
        }
    };

    /**
     * Updates EFP.prototype.
     */
    EFP.prototype.updateEFP = function() {
        /* Return if data are not loaded */

        /* Update EFP */
        if (this.mode == "absolute") {
            /* Find maximum value */
            var max = this.groups[0].mean;
            for (var n = 1; n < this.groups.length; n++) {
                var group = this.groups[n];
                if (group.mean > max) {
                    max = group.mean;
                }
            }

            /* Color groups */
            var minColor = getColorComponents(this.midColor);
            var maxColor = getColorComponents(this.maxColor);
            for (var n = 0; n < this.groups.length; n++) {
                /* Get group */
                var group = this.groups[n];

                /* Get value ratio relative to maximum */
                var ratio = group.mean / max;

                /* Check whether ratio is invalid */
                if (isNaN(ratio) || !isFinite(ratio)) { // Invalid
                    group.color = this.errorColor;
                } else { // Valid
                    var red = minColor.red + Math.round((maxColor.red - minColor.red) * ratio);
                    var green = minColor.green + Math.round((maxColor.green - minColor.green) * ratio);
                    var blue = minColor.blue + Math.round((maxColor.blue - minColor.blue) * ratio);
                    group.color = makeColorString(red, green, blue);
                }

                /* Set color of ViewObject */
                $("#" + group.id+" path", this.svgdom).attr('fill', group.color);
            }
        } else if (this.mode == "relative") {
            /* Find extremum log2 value */
            var extremum = Math.abs(log(this.groups[0].mean / this.groups[0].ctrlMean, 2));
            for (var n = 1; n < this.groups.length; n++) {
                var group = this.groups[n];
                var absLog2Value = Math.abs(log(group.mean / group.ctrlMean, 2));
                if (absLog2Value > extremum) {
                    if (isNaN(absLog2Value) || !isFinite(absLog2Value)) {} else {
                        extremum = absLog2Value;
                    }
                }
            }

            /* Color groups */
            var minColor = getColorComponents(this.minColor);
            var midColor = getColorComponents(this.midColor);
            var maxColor = getColorComponents(this.maxColor);
            for (var n = 0; n < this.groups.length; n++) {
                /* Get group */
                var group = this.groups[n];
                var log2Value = log(group.mean / group.ctrlMean, 2);

                /* Get log2 value ratio relative to extremum */
                var ratio = log2Value / extremum;

                /* Check whether ratio is invalid */
                if (isNaN(ratio) || !isFinite(ratio)) { // Invalid
                    group.color = this.errorColor;
                } else { // Valid
                    var color1, color2;
                    if (ratio < 0) {
                        color1 = midColor;
                        color2 = minColor;
                        ratio *= -1;
                    } else {
                        color1 = midColor;
                        color2 = maxColor;
                    }
                    var red = color1.red + Math.round((color2.red - color1.red) * ratio);
                    var green = color1.green + Math.round((color2.green - color1.green) * ratio);
                    var blue = color1.blue + Math.round((color2.blue - color1.blue) * ratio);
                    group.color = makeColorString(red, green, blue);
                }

                /* Set color of ViewObject */
                $("#" + group.id+" path", this.svgdom).attr('fill', group.color);
            }
        } else if (this.mode == "compare") {
            /* Find extremum log2 value */
            var extremum = Math.abs(log(this.groups[0].mean / this.compareEFPView.groups[0].mean, 2));
            for (var n = 1; n < this.groups.length; n++) {
                var group = this.groups[n];
                var compareGroup = this.compareEFPView.groups[n];
                var absLog2Value = Math.abs(log(group.mean / compareGroup.mean, 2));
                if (absLog2Value > extremum) {
                    extremum = absLog2Value;
                }
            }

            /* Color groups */
            var minColor = getColorComponents(this.minColor);
            var midColor = getColorComponents(this.midColor);
            var maxColor = getColorComponents(this.maxColor);
            for (var n = 0; n < this.groups.length; n++) {
                /* Get group */
                var group = this.groups[n];
                var compareGroup = this.compareEFPView.groups[n];

                /* Get log2 value relative to control */
                var log2Value = log(group.mean / compareGroup.mean, 2);

                /* Get log2 value ratio relative to extremum */
                var ratio = log2Value / extremum;

                /* Check whether ratio is invalid */
                if (isNaN(ratio) || !isFinite(ratio)) { // Invalid
                    group.color = this.errorColor;
                } else { // Valid
                    var color1, color2;
                    if (ratio < 0) {
                        color1 = midColor;
                        color2 = minColor;
                        ratio *= -1;
                    } else {
                        color1 = midColor;
                        color2 = maxColor;
                    }
                    var red = color1.red + Math.round((color2.red - color1.red) * ratio);
                    var green = color1.green + Math.round((color2.green - color1.green) * ratio);
                    var blue = color1.blue + Math.round((color2.blue - color1.blue) * ratio);
                    group.color = makeColorString(red, green, blue);
                }

                /* Set color of ViewObject */
                $("#" + group.id+" path", this.svgdom).attr('fill', group.color);
            }
        }

        /* Apply masking */
        if (this.isMaskOn) {
            for (var n = 0; n < this.groups.length; n++) {
                var group = this.groups[n];
                if (isNaN(group.sterror) || group.sterror >= group.mean * this.maskThreshold) {
                    group.color = this.maskColor;
                    $("#" + group.id+" path", this.svgdom).attr('fill', group.color);
                }
            }
        }

        /* Update legend */
        this.legend.update();
    };

    EFP.prototype.bindSvgEvents= function() {
var changeTooltipPosition = function(event) {
	  var tooltipX = event.pageX - 8;
	  var tooltipY = event.pageY + 8;
	  $('div#EFPTooltip').css({top: tooltipY, left: tooltipX});
	};
 	var hideTooltip = function() {
	   $('div#EFPTooltip').remove();
	   $("path", this).attr('stroke-width', "1");
	};

for (var n = 0; n < this.groups.length; n++) {
	var group = this.groups[n];

	
	var showTooltip = $.proxy(function(event) {
	  $("path", this).attr('stroke-width', "3");
	  $('div #EFPTooltip').remove();
	  var toolTipString = '<div id="EFPTooltip">'+this.name + '</br>Level: ' + Math.round(this.mean*100)/100 +', SD: '+ Math.round(this.stdev*100)/100+'</br>Sample Size: '+ this.samples.length+'</div>';
	  $(toolTipString ).appendTo('body');
	  changeTooltipPosition(event);
	},group);
 


	$("#" + group.id, this.svgdom).click(function(){
		window.open(group.link, '_blank');
	});
	$("#" + group.id, this.svgdom).on({
	   mousemove : changeTooltipPosition,
	   mouseenter : showTooltip,
	   mouseleave: hideTooltip,
                mouseover: function() {
                    $("path", this).attr('stroke-width', "3");
                }
	});}
    };


    EFP.prototype.zoomIn = function() {
        var relativePercentage = ($(this.svgdom).width() / $(this.svgdom).parent('div').width()) * 100;
        var leftPercentage = (parseInt($(this.svgdom).css('left').replace('auto', '0')) / $(this.svgdom).parent('div').width()) * 100;
        var topPercentage = (parseInt($(this.svgdom).css('top').replace('auto', '0')) / $(this.svgdom).parent('div').height()) * 100;
        $(this.svgdom).stop().animate({
            width: (relativePercentage + 4) + "%",
            height: (relativePercentage + 4) + "%",
            left: (leftPercentage - 2) + "%",
            top: (topPercentage - 2) + "%"
        }, 100);
        return true;
    };

    EFP.prototype.zoomOut = function() {
        var relativePercentage = ($(this.svgdom).width() / $(this.svgdom).parent('div').width()) * 100;
        var leftPercentage = (parseInt($(this.svgdom).css('left').replace('auto', '0')) / $(this.svgdom).parent('div').width()) * 100;
        var topPercentage = (parseInt($(this.svgdom).css('top').replace('auto', '0')) / $(this.svgdom).parent('div').height()) * 100;
        $(this.svgdom).stop().animate({
            width: (relativePercentage - 4) + "%",
            height: (relativePercentage - 4) + "%",
            left: (leftPercentage + 2) + "%",
            top: (topPercentage + 2) + "%"
        }, 100);
        return true;
    };



})();
