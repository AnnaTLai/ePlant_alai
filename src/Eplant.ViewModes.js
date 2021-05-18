
/**
	* Eplant.ViewMode namespace
	*
	* This namespace contains view modes used in ePlant.
	*
	* @namespace
*/
Eplant.ViewModes= {};
Eplant.ViewModes.zui = $('#ZUI_container');
Eplant.ViewModes.home = $('#home_container');
Eplant.ViewModes.svg = $('#efp_holder');
Eplant.ViewModes.heatmap = $('#heatmap_container');
Eplant.ViewModes.sequence = $('#Sequence_cache');
Eplant.ViewModes.cytoscape = $('#Cytoscape_container');
Eplant.ViewModes.geneinfo = $('#GeneInfo_container');
Eplant.ViewModes.geneslider = $('#GeneSlider_container');
Eplant.currentViewModes = 'home';
Eplant.currentScreenshotContainer = $('#home_container');
/* Switch view mode */
Eplant.switchViewMode = function(mode) {
	if(Eplant.ViewModes[mode])
	{
		for (var viewMode in Eplant.ViewModes) {
			if (Eplant.ViewModes.hasOwnProperty(viewMode)&&viewMode!=="sequence") {
				$(Eplant.ViewModes[viewMode]).hide();
			}
		}
		
		$(Eplant.ViewModes[mode]).show();
		Eplant.currentViewModes = mode;
		if(Eplant.activeView){
			Eplant.screenShotBeforeRender = function() {};
			Eplant.screenShotOnRendered = function() {};
			
			switch(Eplant.activeView.viewName){
				case "WorldView":
					Eplant.currentScreenshotContainer = $('#World_container');
					break;
				case "HeatMapView":
					Eplant.screenShotBeforeRender = Eplant.activeSpecies.views.HeatMapView.removeActiveGeneRow;
					Eplant.screenShotOnRendered = Eplant.activeSpecies.views.HeatMapView.changeActiveGeneRow;
					Eplant.currentScreenshotContainer =  $(Eplant.ViewModes[Eplant.currentViewModes]);
					break;
				default:
					if(Eplant.currentViewModes ==='svg'){
						Eplant.currentScreenshotContainer = $('#efp_container');
					}
					else{
						Eplant.currentScreenshotContainer =  $(Eplant.ViewModes[Eplant.currentViewModes]);
						console.log(Eplant.currentScreenshotContainer);
					}
					break;
			}
			
		}
	}
};

//BEN CHANGED (added, used in screenshot process)
Eplant.getLicenseDiv = function() {
	var licenseDiv = document.createElement("div");
	$(licenseDiv).css({
		'position': 'relative',
		bottom:'2%',
		width:'80%',
		//padding: '0 10%',
		color:'grey',
		opacity:0.8,
		zIndex: 1000
	});
	
	$(licenseDiv).enableSelection();
	licenseDiv.style.textAlign = "center";
	licenseDiv.style.fontSize = "12px";
	licenseDiv.innerHTML = "Loading citation...";
	var content = '';
	
	content += "This image was generated with the " + Eplant.activeView.name + " at bar.utoronto.ca/eplant by "+Eplant.AuthoursW+" "+Eplant.Year+"";
	content += '<a target="_blank" rel="license" href="http://creativecommons.org/licenses/by/4.0/"><img alt="Creative Commons License" style="border-width:0" src="https://i.creativecommons.org/l/by/4.0/80x15.png" title="The ePlant output for your gene of interest is available under a Creative Commons Attribution 4.0 International License and may be freely used in publications etc." /></a>';
	
	licenseDiv.innerHTML = content;
	return licenseDiv;
}

Eplant.screenShotBeforeRender= function() {
};
Eplant.screenShotOnRendered = function() {
};
//BEN CHANGED
Eplant.screenShotForCurrent = function() {
	var $toPrint, originalHeight;

	var hiddenEles = [];
	var addedEles = [];

	if(Eplant.smallMultipleOn){
		$toPrint =$("#SmallMultipleContainer");
		$("#SmallMultipleContainer .smallMultiplesSvgImage").css({'border': '1px solid #aaaaaa'});
		$("#SmallMultipleContainer .smallMultiplesGeneTitle").css({"color":"#aaaaaa"});
	}
	else{
		$toPrint =  Eplant.currentScreenshotContainer;/*'#viewPort'*/;
		//add pathway view support since the pathway view is stored in a different div
		if(Eplant.activeView.viewName==="PathwayView"){
			$toPrint =  $("#Pathway_container");
		}
		if(Eplant.activeView.viewName==="NavigatorView"){
			$toPrint =  $("#Navigator_container");//.find(`#NavView${Eplant.activeSpecies.activeGeneticElement.identifier}`);
			const title = document.querySelector("#ZUI_container > h2").cloneNode(true);
			title.style.marginBottom = '100px';
			title.style.zIndex = 100;
			// Add the title to the top of the navigator container
			$toPrint.prepend(title);
			addedEles.push(title);
		}
	}


	if(Eplant.activeView.viewName==="SequenceView"){
		alert('SequenceView is linked to an outside service, the screenshot cannot be taken inside ePlant.')
		return;
	}
	
	$(Eplant.activeView.labelDom).css({"max-width":"100%"});
	
	// License
	var licenseDiv = Eplant.getLicenseDiv();

	$toPrint.append(licenseDiv);
	addedEles.push(licenseDiv);
	
	if(Eplant.activeView.viewName==="NavigatorView"){
		originalHeight = $toPrint[0].style.height;
		// Set toPrint to its automatically calculated offset height so html2canvas knows how large to make the canvas
		$toPrint[0].style.height = 'auto';
		$toPrint[0].style.height = $toPrint[0].offsetHeight;
		$toPrint[0].style.backgroundColor = 'white';
	}
	if(Eplant.activeView.viewName==="MoleculeView"){
		var menu = $toPrint.find("#divMain");
		var menuRight = $toPrint.find("*[id*='divMenuRight']:visible");
		$(menu).hide();
		$(menuRight).hide();
		hiddenEles.push(menu);
		hiddenEles.push(menuRight);
		
		$('svg',$toPrint).each(function() {
			$(this).hide();
			hiddenEles.push(this);
		});
		$(licenseDiv).css({
			bottom:'auto',
			top:'50px'
		});
	}
	
	if(Eplant.activeView.viewName==="WorldView"){
		var transform=$(".gm-style>div:first>div").css("transform")
		var comp=transform.split(",") //split up the transform matrix
		var mapleft=parseFloat(comp[4]) //get left value
		var maptop=parseFloat(comp[5])  //get top value
		$(".gm-style>div:first>div").css({ //get the map container. not sure if stable
			"transform":"none",
			"left":mapleft,
			"top":maptop,
		})
	}

	if ($('svg',$toPrint).length>0&&Eplant.activeView.viewName!=="MoleculeView") {
		$('svg',$toPrint).each(function() {
			var c = document.createElement('canvas');
			$(c).css({
				left:0,//$(this).position().left,
				top:0,//$(this).position().top,
				width:'100%',//$(this).width(),
				height:'100%',//$(this).height(),
				position:'absolute'
			});
			var svgStr=(new XMLSerializer()).serializeToString(this);//$(this).html().replace(/>\s+/g, ">").replace(/\s+</g, "<").replace(/<canvas.+/g,"");
			$(this).parent().append(c);


			canvg(c,svgStr);
			addedEles.push(c);
			$(this).hide();
			hiddenEles.push(this);
		});
	}
	
	
	Eplant.screenShotBeforeRender();

	html2canvas($toPrint, {
		useCors: true,
		allowTaint:true,
		//proxy: 'cgi-bin/html2canvas.php',
		onrendered: function(canvas) {
			if (canvas) {
				/* Create container DOM element */
				var domContainer= document.createElement("div");
				
				$(domContainer).css({
					'text-align': 'center'
				});
				
				Eplant.screenShotOnRendered();
	
				var imgUrl = canvas.toDataURL();
				var filename = $('#tabUl').find('.ui-tabs-active .fullTab').text();
				filename = filename.replace(':','');
				
				console.log({filename})
				
				
				
				var img = $('<img />', {
					src: imgUrl,
					alt: 'Screenshot'
					}).css({
					'max-width': '100%',
					//'max-height': '100%',
					width: 'auto',
					height: 'auto'
				});
	
				console.log(img)
	
				var link = $('<a />', {
					'download':filename,
					'href':imgUrl
				}).append(img);
				console.log(link)
				var domImageContainer= document.createElement("div");
				$(domImageContainer).css({
					'overflow': 'hidden',
					border: '1px solid #aaaaaa',
					margin: "0 10%"
				});
	
				$(domImageContainer).append(link);
				
				
				/* Create image container DOM element */
				
				
				/* Create title DOM element
					var domTitle = $('<p>Screen Capture</p>');
					$(domTitle).css({
					'font-size': '30px',
					'line-height': '56px',
					color:'#000'
					});
				$(domContainer).append(domTitle)*/
				
				//$(domTitle).html("Right click on the image to download");
				
				
				/* Add title DOM element to the container */
				;
				$(domContainer).append(domImageContainer);
				
				var domOtherFormat = $('<div>');
				/* Set CSS class of title for styling */
				$(domOtherFormat).css({
					'font-size': '30px',
					'line-height': '56px',
					color:'#000'
				});
				
				/*var pdfLink = $('<a>PDF</a>').css({color:"#99cc00",margin:"0 5px"});
					$(pdfLink).click($.proxy(function(){
					//a4 size [ 595.28,  841.89]
					var imgWidth  = this.img.outerWidth();
					var imgHeight = this.img.outerHeight();
					var ratio = imgHeight/imgWidth;
					if(ratio>1.4){
					imgHeight = 841.89;
					imgWidth = 841.89/ratio;
					}else{
					imgHeight = 440*ratio;
					imgWidth = 440;
					}
					doc = new jsPDF({
					unit:'px',
					format:'a4'
					});
					doc.addImage(imgUrl, 'JPEG', 0, 0,imgWidth,imgHeight);
					doc.save(filename+'.pdf');
					},{img:img}));
				$(domOtherFormat).append(pdfLink);*/
				
				
				
				var pngLink = $('<a href="'+imgUrl+'" download="'+filename+'">Save PNG Image</a>').addClass("greenDownloadButton");
				/*$(pngLink).click(function(){
					canvas.toBlob(function(blob) {
					saveAs(blob, filename+".png");
					});
				});*/
				$(domOtherFormat).append(pngLink);
				
				if(Eplant.activeView&&Eplant.activeView.generateScreenshotSvgStr&&!Eplant.smallMultipleOn){
					var svgLink = $('<div>Save SVG Image</div>').addClass("greenDownloadButton");
					var svgStr = Eplant.activeView.generateScreenshotSvgStr(licenseDiv.innerHTML);
					$(svgLink).click(function(){
						var blob = new Blob([svgStr], {type: "text/plain;charset=utf-8"});
						saveAs(blob, filename+".svg");
					});
					$(domOtherFormat).append(svgLink);
				}
				
				// License
				$(domOtherFormat).append('<a target="_blank" rel="license" href="http://creativecommons.org/licenses/by/4.0/"><img alt="Creative Commons License" style="vertical-align: bottom; height:45px;" src="https://i.creativecommons.org/l/by/4.0/88x31.png" title="The ePlant output for your gene of interest is available under a Creative Commons Attribution 4.0 International License and may be freely used in publications etc." /></a>');
				
				$(domContainer).append(domOtherFormat);
				
				DialogManager.artDialog(domContainer,{"title":"Screen Capture"});
				
				
				} else {
				alert("Sorry! Screen capture is not available for this view.");
			}
			//$toPrint.appendTo(parent);
			if(addedEles.length>0)
			{
				while(addedEles.length>0)
				{
					var c = addedEles.pop();
					$(c).remove();
				}
			}
			if(hiddenEles.length>0)
			{
				while(hiddenEles.length>0)
				{
					var c = hiddenEles.pop();
					$(c).show();
				}
			}
			
			$(Eplant.activeView.labelDom).css({"max-width":""});
			if(Eplant.smallMultipleOn){
				Eplant.UpdateSmallMultiplesActiveGene();
			}
			
			/*$('svg',$toPrint).each(function() {
				$(this).show();
			});*/

			// Change the height of $toPrint back to what it was originally
			if (originalHeight) $toPrint[0].style.height = originalHeight;
			
		}
	});
	
};
