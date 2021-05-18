	var Molviewer = function(customConfig, customInfo) {
		/**
			* http://www.w3.org/wiki/JavaScript_best_practices
			* configuration options
		*/
		var canvasHoverBound = false;
		var config = {
			CSS : {
				IDs : {
					parentDivId : '',
					jmolcontent : 'divJmolcontent',
					btnReset : 'btnReset',
					viewOptions : 'viewOptions',
					PfamDomains : 'PfamDomains',
					CDDdomains : 'CDDdomains',
					protSeq : 'protSeq',
					divSeqContainer : 'divSeqContainer',
					btnCDDtryAgain : 'btnCDDtryAgain',
					btnPfamTryAgain : 'btnPfamTryAgain',
					divMenu : 'divMenu',
					divMain : 'divMain',
					divBottomWrapper: 'divBottomWrapper',	
					divSeqContainer: 'divSeqContainer',	
					seqSlider:"SeqSlider",
					jsMolviewer : 'oMolviewer',
					btnDefaultColor:'btnDefaultColor'
				},
				names : {
					rdFeature : 'feature',
					color : 'color',
					pSpeed : 'pSpeed',
					quality : 'quality',
					spin : 'spin',
					slab : 'slab'
				}
			},
			/*
				* Application settings
			*/
			application : {
				//the name to use to create the jmol object
				jMolObject : 'myJmol',
				//custom pfam webservice url if not using dev or eplant
				pfamUrl : null,
				//custom cdd webservice url if not using dev or eplant
				cddUrl : null,
				//
				pfamUrlBar : '//bar.utoronto.ca/~gfucile/cdd3d/cgi-bin/PfamAnnot.cgi',
				//
				pfamUrlDev : 'ProxyServlet',
				//
				cddUrlBar : '//bar.utoronto.ca/~gfucile/cdd3d/cgi-bin/CDDannot.cgi',
				//
				cddUrlDev : 'ProxyServlet',
				/*
					* background HOVER - background color for the hover label when letting mouse over atom
					* color HOVER - text color for the hover label when letting mouse over atom
					* set hoverDelay - time to show the hover label when letting mouse over atom
				* */
				defaultLoadScript :	"isDssp = false;set defaultVDW babel;"+
				"select protein or nucleic;cartoons Only;color \"#C9C9C9\";frank OFF;set disablePopupMenu false;"+
				"select *;zoom 70;translate x 5;translate y -5;display !water;"+
				"set platformSpeed 8; set cartoonFancy OFF; set highResolution OFF; set antialiasDisplay OFF;spin OFF;"+
				"select none; background HOVER \"#FFFFFF\"; color HOVER \"#000000\";set hoverDelay 0.1;HOVER off",
				//
				resetColorsScript : 'select not (protein or nucleic); color cpk; select protein or nucleic; color \'#C9C9C9\';',
				//'load "//bar.utoronto.ca/eplant_legacy/java/Phyre2-Models/Phyre2_AT1G01200.1.pdb"'
				load: 'load =2MP2' //2HHB 1crn 1cbs 4UA1 2N44 4QLP 4RKX 2N19 4N1M 2I04 1KRL 2MP2 
			},
			balloons:[],
			overviewMarkers:[]
			
		}
		
		/**
			* initial JSmol setup 
		*/
		var Info = {
			height : '100%', 		
			width : '100%',
			use : "HTML5",
			//to use the php from my server http://104.197.50.15/myphptest/php/jsmol.php
			//serverURL : "http://chemapps.stolaf.edu/jmol/jsmol/php/jsmol.php",
			serverURL : "//bar.utoronto.ca/eplant/cgi-bin/jsmol.php",
			src : null,
			LoadStructCallback : config.CSS.IDs.jsMolviewer+".setControls",
			script: "set defaultLoadScript '" + config.application.defaultLoadScript + "';",
			debug : false,
			disableJ2SLoadMonitor : true,
			disableInitialConsole : true,//If set true, avoids the display of messages ('console') in the Jmol panel while the Jmol object is being built initially.
			addSelectionOptions : false	//if you want to display, below the Jmol object, a menu with options for loading structures from public databases
		}
		
		// Merge object2 into object1, recursively
		if(customConfig)
		$.extend(true, config, customConfig);
		if(customInfo)
		$.extend(true, Info, customInfo);
		
		var pDiv;
		var myJmolOb;
		var mySequence = {}; //holds info from each residue
		var updown = -5;//check the default script for the starting point
		var leftright = 5;//check the default script for the starting point
		
		/**
			* Load jsmol viewer with supplied params
		*/
		function init() {
			
			//console.log('initializing Molviewer');
			
			pDiv = jq(config.CSS.IDs.parentDivId)+" "; //just to make the var name shorter
			
			//------- check if load model from pdb or from url or use the default model
			var load = '';
			//example: http://localhost:8080/testjsmol/index29.html?loadpdb=4QCD
			var loadpdb = getQueryStringByName('loadpdb');
			//example to load model from a file (online) like eplant (bar): 
			//http://localhost:8080/testjsmol/index29.html?loadfile=//bar.utoronto.ca/eplant_legacy/java/Phyre2-Models/Phyre2_AT1G01200.1.pdb
			var loadfile = getQueryStringByName('loadfile');
			
			if(loadpdb)
			load = "load ="+loadpdb;
			else if(loadfile)
			load = "load \""+loadfile+"\"";
			else
			load = config.application.load;
			//-------end
			
			//try to get the agi (gene id) from its file name, will happen when running at eplant (bar.utoronto.ca)
			var agi = load.substring( load.lastIndexOf('_')+1, load.lastIndexOf('.'));//format Phyre2_AT1G01200.1.pdb
			if(agi)
			mySequence.agi = agi;
			
			
			//create and put the jsmol on screen
			//http://wiki.jmol.org/index.php/Jmol_JavaScript_Object/Functions
			Jmol.setDocument(0);
			Jmol.getApplet(config.application.jMolObject, Info);// creates the object but does not insert it
			myJmolOb = window[config.application.jMolObject];//used to have a reference to jMol object created above
			//load model
			Jmol.script(myJmolOb, load);    
			//insert the jsmol object in the page
			$(pDiv+jq(config.CSS.IDs.jmolcontent)).html(Jmol.getAppletHtml(myJmolOb));
			if(!canvasHoverBound&&$(pDiv+jq(config.CSS.IDs.jmolcontent)).find("canvas").length>0){
				$("canvas",pDiv+jq(config.CSS.IDs.jmolcontent)).mousemove(function(e){
					cursorX = e.clientX;
					cursorY = e.clientY-15;
				});
				canvasHoverBound=true;
			}
			
			//set the zoom slider  
			$(pDiv+"#zoom-slider").slider({
				
				orientation: "vertical",
				range: "min",
				min: 5,
				max: 200,
				value: 70,
				slide: function(event, ui) {
					$(pDiv+"#zoomvalue").html(ui.value);
					$(pDiv+"#zoom-slider .ui-slider-handle.ui-state-default.ui-corner-all");
					//.html( ui.value ).css('color','#f6931f').css('vertical-align','middle').css('text-align','center');
					
					Jmol.script(myJmolOb, 'zoom '+ui.value);
				}
			});
			/*for the zoom slider*/
			$(pDiv+'#zoom-slider').css('background','lightgray');
			$(pDiv+'#zoom-slider .ui-widget-header').css('border','0px solid #aaaaaa').css('background','lightgray');
			$(pDiv+"#zoomvalue").html($("#zoom-slider").slider("value"));
			var timeoutId;
			$('.zoomButton').on("mousedown",function(){
				var i = $(this).attr("data-zoom");
				//move and then keep moving while mousedown
				
				var current = $(pDiv+"#zoom-slider").slider('value');
				var to = current;
				if(i==="zoomin"){
					to = current+5;
					}else{
					to = current-5;
				}
				$(pDiv+"#zoom-slider").slider('value', to);
				Jmol.script(myJmolOb, 'zoom '+to);
				
				
				
				timeoutId = setInterval(function() { 
					var current = $(pDiv+"#zoom-slider").slider('value');
					var to = current;
					if(i==="zoomin"){
						to = current+5;
					}
					else{
						to = current-5;
					}
					
					$(pDiv+"#zoom-slider").slider('value', to);
					Jmol.script(myJmolOb, 'zoom '+to);
					
				}, 100);
				}).bind('mouseup mouseleave', function() {
				clearInterval(timeoutId);
			});
			
			//add controls for Options
			$(pDiv+"input:radio[name="+config.CSS.names.rdFeature+"]").change(function(event) {
				
				resetJsmolColors();    
				var val = $("#"+config.CSS.IDs.divMoleculeSetting + " input[name="+config.CSS.names.color+"]:checked").val();
				
				switch($(this).val()) {
					case 'hydro':
					Jmol.script(myJmolOb, 'select hydrophobic; color mediumblue; '+
					'select polar; color red;wireframe 0.0; spacefill 0.0; select charged; color "#FFFF00"; select protein or nucleic; color '+val+'; select none;');
					break;
					case 'temp':
					Jmol.script(myJmolOb, 'select all; color relativeTemperature; select protein or nucleic; color '+val+'; select none;');
					break;
					case 'cchain':
					Jmol.script(myJmolOb, 'select protein or nucleic; color '+val+' chain; select none;');
					break;
					case 'cstruc':
					Jmol.script(myJmolOb, 'select protein or nucleic; color '+val+' structure; select none;');
					break;
					case 'cgroup':
					Jmol.script(myJmolOb, 'select protein or nucleic; color '+val+' group; select none;');
					break;
					default:
					break;
				}
			});
			
			$(pDiv+"#"+config.CSS.IDs.btnDefaultColor).on("click", function(){
				resetJsmolColors();//remove color from previous selected cdd or pfam
				recolorSelected();		
			});
			
			//add controls for platform speed
			$(pDiv+"input:radio[name="+config.CSS.names.pSpeed+"]").change(function(event) {   
				var speed = $(this).val()
				Jmol.script(myJmolOb, 'set platformSpeed '+speed+";");
			});
			
			//add controls for model quality
			$(pDiv+"input:radio[name="+config.CSS.names.quality+"]").change(function(event) {
				
				var quality = $(this).val()
				switch($(this).val()) {
					case 'medium':
					Jmol.script(myJmolOb, "set cartoonFancy OFF; set highResolution OFF; set antialiasDisplay OFF;");
					break;
					case 'high':
					Jmol.script(myJmolOb, "set cartoonFancy ON; set highResolution ON; set antialiasDisplay ON;");
					break;
					default:
					break;
				}
			});
			
			//add controls for slab
			$(pDiv+"input:radio[name="+config.CSS.names.slab+"]").change(function(event) {
				
				switch($(this).val()) {
					case 'std':
					Jmol.script(myJmolOb, "slab RESET;");
					break;
					case 'bhalf':
					Jmol.script(myJmolOb, "slab 50; depth 0;slab ON;");
					break;
					case 'fhalf':
					Jmol.script(myJmolOb, "slab 100;depth 50; slab ON;");
					break;
					case 'middle50':
					Jmol.script(myJmolOb, "slab 75; depth 25;slab ON;");
					break;
					case 'middle20':
					Jmol.script(myJmolOb, "slab 60; depth 40;slab ON;");
					break;
					default:
					break;
				}
			});
			
			//add controls for spin
			$(pDiv+"input:radio[name="+config.CSS.names.spin+"]").change(function(event) {
				
				var spin = $(this).val()
				Jmol.script(myJmolOb, "spin "+spin+";");
			});
			
			//add controls for color
			$(pDiv+"input:radio[name='"+config.CSS.names.color+"']").change(function(event) {
				
				var color = $(this).val()
				Jmol.script(myJmolOb, "select protein or nucleic; color "+color+"; select none;");
			});
			
			//add control reload button
			$(pDiv+jq(config.CSS.IDs.btnReset)).click(function(e) {
				reloadModel();
			});
			
			//add autocomplete to select residue input field
			var availableTags = [];
			$(pDiv+jq('selResidues')).autocomplete({source: availableTags, autoFocus: false});
			
			/*examples:
				chain=a
				*:a
				lys
				gly, lys
				1:a -> for proteins from bar where you dont have chain, use just 1:
				1:a, 3:a, 1:b
				1-10:a, 3-5:b
			*:a and not gly */
			$(pDiv+jq('btnSelect')).click(function(e) {
				if ($(pDiv+'#selResidues').val()) {
					//var txt = $(pDiv+'#selResidues').val().replace(';','');
					var items =$(pDiv+'#selResidues').val().split(',');
					for (var i=0, len=items.length; i<len; i++) {
						var mapped = Eplant.Views.MoleculeView.Params.acidLetterMap[items[i].trim().toUpperCase()];
						if(mapped) items[i]=mapped;
					}
					var txt = items.join();
					//var txt = $(pDiv+'#selResidues').val().replace(';','');
					$(pDiv+'#selResidues').val('');
					if($.inArray(txt, availableTags)<0)
					availableTags.push(txt);
					var selected = Jmol.evaluateVar( myJmolOb, "script('select "+txt+"; show residues')" );//remember to use quote marks inside script
					selected = selected.split("\n");
					for (var i=0, len=selected.length; i<len; i++) {
						if(selected[i].trim().length>0)
						setResidue(selected[i]);
					}
				}
			});
			
			//add control select residue input field
			$(pDiv+jq('selResidues')).keypress(function (event) {
				if (event.which == 13) {
					$(pDiv+jq('btnSelect')).click();
				}
			});
			
			setSeqSlider();
			
			//set PickCallback function to run when user clicks on the model
			Jmol.script(myJmolOb, "set PickCallback '"+config.CSS.IDs.jsMolviewer+".pickCallback';");
			
			//set HoverCallback  function to run when user clicks on the model
			Jmol.script(myJmolOb, "set HoverCallback  '"+config.CSS.IDs.jsMolviewer+".hoverCallback';");
			
			//add controls for move
			var timeoutId;
			$(pDiv+' .viewArrow').on('mousedown',function() {
				var i = $(this).attr("data-direction");
				//move and then keep moving while mousedown
				moveModel(i);
				timeoutId = setInterval(function() { moveModel(i); }, 100);
				}).bind('mouseup mouseleave', function() {
				clearInterval(timeoutId);
			});		
			
			/*
				* Will fire events for spans descendents of #protSeq.
				* This adds the events mouseenter, mouseleave and click to the aminoacid sequence
				* at the bottom. This uses delegate events so the events will be called even for the
				* elements (this case span) added after this method (that's the case, at this point the sequence still
				* doesn't exist). The sequence will be added to screen later by setControls function.
			*/
			$(pDiv+jq(config.CSS.IDs.protSeq)).on({
				mouseenter: function () {
					//console.log('entering '+ $(this).text() +' '+ $(this).attr('id'));
					if(mySequence[$(this).attr('id')] ||mySequence[$(this).attr('data-target')] ){
						var elementId = mySequence[$(this).attr('id')]?$(this).attr('id'):$(this).attr('data-target');
						Jmol.script(myJmolOb, 'select '+ elementId+' ; halo 0.3;color halo "#99cc00";halo on;');
						$(jq(elementId)).addClass('hoveron');
					}//else
					//console.log('not a residue ');
					
				},
				mouseleave: function () {
					//console.log('leaving ' + $(this).text() );
					if(mySequence[$(this).attr('id')]||mySequence[$(this).attr('data-target')] ){
						var elementId = mySequence[$(this).attr('id')]?$(this).attr('id'):$(this).attr('data-target');
						Jmol.script(myJmolOb, 'select '+ elementId +' ; halo off;');
						$(jq(elementId)).removeClass('hoveron');
					}//else
					//console.log('not a residue ');
				},
				click: function (event) {
					event.stopPropagation();
					if(mySequence[$(this).attr('id')]||mySequence[$(this).attr('data-target')] ){
						var elementId = mySequence[$(this).attr('id')]?$(this).attr('id'):$(this).attr('data-target');
						setResidue(elementId);
					}//else
					//console.log('not a residue ');
				}
			}, "span, svg");
			$(document).on('resize',function(){
				setMenuMaxHeight();
				setSliderHandleWidth();
			});
			window.onresize = function() {
				setMenuMaxHeight();
				setSliderHandleWidth();
			};
			$(pDiv).find( '.hint--left' ).qtip({
				position: {
					my: 'right center', at: 'left+5 center'
				},
				content: function() {
					return $(this).attr('title');
				},
				style: {
					classes: 'a_qtip-green qtip-shadow'
				}
			});
			return myJmolOb;
		}
		
		/**
			* move protein on screen
		*/
		function moveModel(i){
			switch(i) {
				case 'up':
				updown -= 2;
				break;
				case 'down':
				updown += 2;
				break;
				case 'left':
				leftright -= 2;
				break;
				case 'right':
				leftright += 2;
				break;
				default:
				break;
			}
			Jmol.script(myJmolOb, "translate "+ (  (i==='up' || i==='down')?("y "+updown):("x "+leftright) )+";");
		}
		
		/**
			* callback method - set all controls related with jsmol protein structure
		*/
		function setControls(a,b,c,d,e,f,g,h){
			//console.log('a: '+a+'\n'+'b: '+b+'\n'+'c: '+c+'\n'+'d: '+d+'\n'+'e: '+e+'\n'+'f: '+f+'\n'+'g: '+g+'\n'+'h: '+h);
			
			if(c != 'zapped'){//avoid call twice, happens when load a new file using the input field
				
				var codeArray = {'ALA':'A','ARG':'R','ASN':'N','ASP':'D','CYS':'C','GLU':'E','GLN':'Q','GLY':'G','HIS':'H','ILE':'I',
				'LEU':'L','LYS':'K','MET':'M','PHE':'F','PRO':'P','SER':'S','THR':'T','TRP':'W','TYR':'Y','VAL':'V'};
				
				var reverseCodeArray = {'A':'ALA','R':'ARG','N':'ASN','D':'ASP','C':'CYS','E':'GLU','Q':'GLN','G':'GLY','H':'HIS','I':'ILE',
				'L':'LEU','K':'LYS','M':'MET','F':'PHE','P':'PRO','S':'SER','T':'THR','W':'TRP','Y':'TYR','V':'VAL'};
				
				var theSeq = Jmol.evaluateVar( myJmolOb, "show('residues')" );
				var res = theSeq.split("\n").filter(function(n){return n; });
				this.res = res;
				//console.log('res: '+res);
				var $spanSeq = $();
				mySequence.sequenceArr = res;
				mySequence.seq1letterArr = [];		//one letter
				mySequence.seq3letterArr = [];		//three letter
				mySequence.fullseq3letterArr = [];	//three letter with index and chain letter
				mySequence.chains = {};				//by chain letter
				
				/*
					* extract residues and hold
				* */
				var modelStart = Number(res[0].split("]")[1].split(":")[0])-1;
				
				
				
				if(false){//this.config&&this.config.sequenceArr){
					for (var i=0, len=modelStart; i<len; i+=2) {
						Eplant.queue.add(function(){
							for (var i=this.i, innerlen=i+2; i<innerlen&&i<modelStart; i++) {
								
								var index= i+1;
								var tletters = reverseCodeArray[this.viewer.config.sequenceArr[i]];
								var full = "["+tletters+"]"+index+": ";
								
								mySequence.seq1letterArr.push(this.viewer.config.sequenceArr[i]);
								mySequence.seq3letterArr.push(tletters);
								mySequence.fullseq3letterArr.push(full);
								mySequence[full]={oneLetterCode:this.viewer.config.sequenceArr[i],threeLetterCode:tletters,selected:false};
								var displayText = index+": ["+tletters+"]";
								
								var span = document.createElement("span");
								span.innerHTML=this.viewer.config.sequenceArr[i];
								span.className += 'sequence deselected hintWhite--top hintWhite--success hintWhite-rounded';
								span.setAttribute("data-hintWhite", displayText);
								span.setAttribute("id", full);
								$spanSeq = $spanSeq.add(span);
								/*$spanSeq = $spanSeq.add($( "<span/>", {
									"class" : "sequence deselected hintWhite--top hintWhite--success hintWhite-rounded",
									"id" : full,
									"data-hintWhite" : displayText,
									text : this.viewer.config.sequenceArr[i]
								}));*/
							}
						},{viewer:this, i:i});
					}
				}
				Eplant.queue.add(function(){
					$spanSeq = $spanSeq.add($( "<span/>", {
						"class" : "alignment",
						"id" : "",
						text : "["
					}));
				},this);
				
				var lastMatchNumber;
				for (var i=0, len=res.length; i<len; i+=2) {
					Eplant.queue.add(function(){
						for (var i=this.i, innerlen=i+2; i<innerlen&&i<res.length; i++) {
							
							var matches = res[i].match(/\[(.*?)\]/);
							var matchNumber = Number(res[i].match(/\](.*?)\:/)[1]);
							if(lastMatchNumber&&matchNumber!=lastMatchNumber+1){
								$spanSeq = $spanSeq.add($( "<span/>", {
									"class" : "alignment",
									"id" : "",
									text : "]"
								}));
								for (var j=lastMatchNumber, jlen=matchNumber-1; j<jlen; j++) {
									var index= j+1;
									var letter ;
									var tletters;
									if(this.viewer.config.sequenceArr){
										var letter = this.viewer.config.sequenceArr[j];
										var tletters = reverseCodeArray[letter];
										
									}
									else{
										var tletters = res[i];
										var letter = codeArray[tletters];
										
									}
									
									var full = "["+tletters+"]"+index+": ";
									
									mySequence.seq1letterArr.push(letter);
									mySequence.seq3letterArr.push(tletters);
									mySequence.fullseq3letterArr.push(full);
									mySequence[full]={oneLetterCode:letter,threeLetterCode:tletters,selected:false};
									var displayText = index+": ["+tletters+"]";
									var span = document.createElement("span");
									span.innerHTML=letter;
									span.className += 'sequence deselected hintWhite--top hintWhite--success hintWhite-rounded';
									span.setAttribute("data-hintWhite", displayText);
									span.setAttribute("id", full);
									$spanSeq = $spanSeq.add(span);
									/*$spanSeq = $spanSeq.add($( "<span/>", {
										"class" : "sequence deselected hintWhite--top hintWhite--success hintWhite-rounded",
										"id" : full,
										"data-hintWhite" : displayText,
										text : this.viewer.config.sequenceArr[j]
									}));*/
								}
								$spanSeq = $spanSeq.add($( "<span/>", {
									"class" : "alignment",
									"id" : "",
									text : "["
								}));
							}
							//keep only aminoacids dropping everything else, like HOH
							if (matches && codeArray[matches[1]]) {
								mySequence.seq1letterArr.push(codeArray[matches[1]]);
								mySequence.seq3letterArr.push(matches[1]);
								mySequence.fullseq3letterArr.push(res[i]);
								mySequence[res[i]]={oneLetterCode:codeArray[matches[1]],threeLetterCode:matches[1],selected:false};
								
								var matches2 = res[i].match(/\:(.?)/); //get chain letter
								if (matches2){
									var chainLetter = matches2[1];
									if(mySequence.chains[chainLetter]){
										mySequence.chains[chainLetter].push(res[i]);
										}else{
										mySequence.chains[chainLetter] = [res[i]];
									}
								}
								var displayText = res[i].replace(matches[0],"")+matches[0];
								
								$spanSeq = $spanSeq.add($( "<span/>", {
									"class" : "sequenceModel deselected hintWhite--top hintWhite--success hintWhite-rounded",
									"id" : res[i],
									"data-hintWhite" : displayText,
									text : codeArray[matches[1]]
								}));
								if(this.viewer.config&&this.viewer.config.gaps&&this.viewer.config.gaps.indexOf(res[i])>-1){
									$spanSeq = $spanSeq.add($( "<span/>", {
										"class" : "alignment",
										"id" : "",
										text : "] ["
									}));
								}
							}
							lastMatchNumber=matchNumber;
						}
					},{viewer:this, i:i});
				}
				Eplant.queue.add(function(){
					$spanSeq = $spanSeq.add($( "<span/>", {
						"class" : "alignment",
						"id" : "",
						text : "]"
					}));
				},this);
				
				if(false){//this.config&&this.config.sequenceArr){
					var newStartIndex = Number(res[res.length-1].split("]")[1].split(":")[0]);
					for (var i=newStartIndex, len=this.config.sequenceArr.length; i<len;  i+=2) {
						Eplant.queue.add(function(){
							for (var i=this.i, innerlen=i+2; i<innerlen&&i<this.viewer.config.sequenceArr.length; i++) {
								
								var index= i+1;
								var tletters = reverseCodeArray[this.viewer.config.sequenceArr[i]];
								var full = "["+tletters+"]"+index+": ";
								
								var displayText = index+": ["+tletters+"]";
								
								mySequence.seq1letterArr.push(this.viewer.config.sequenceArr[i]);
								mySequence.seq3letterArr.push(tletters);
								mySequence.fullseq3letterArr.push(full);
								mySequence[full]={oneLetterCode:this.viewer.config.sequenceArr[i],threeLetterCode:tletters,selected:false};
								var span = document.createElement("span");
								span.innerHTML=this.viewer.config.sequenceArr[i];
								span.className += 'sequence deselected hintWhite--top hintWhite--success hintWhite-rounded';
								span.setAttribute("data-hintWhite", displayText);
								span.setAttribute("id", full);
								$spanSeq = $spanSeq.add(span);
								/*$spanSeq = $spanSeq.add($( "<span/>", {
									"class" : "sequence deselected hintWhite--top hintWhite--success hintWhite-rounded",
									"id" : full,
									"data-hintWhite" : displayText,
									text : this.viewer.config.sequenceArr[i]
								}));*/
							}
						},{viewer:this, i:i});
					}
				}
				
				
				Eplant.queue.add(function(){
					this.moleculeOverview = $(pDiv+" .sequenceOverview");
					this.fullSquenceOverview = this.moleculeOverview.clone();
					
					var inc ;
					var currentInc;
					inc = Math.round(res.length/20);
					currentInc = modelStart;
					
					var currentLeft;
					for(var i =0;i<this.config.moleculeSequenceStringArr.length;i++){
						var seqStr = this.config.moleculeSequenceStringArr[i];
						if(seqStr.indexOf('-')>-1){
							if(!currentLeft) currentLeft=1;
							
							currentLeft += Math.round(seqStr.length/this.config.moleculeSequenceLen*100);
							
						}
						else{
							
							
							var moleculeIndicator = document.createElement("div");
							var moleculeIndicatorLength; 
							var moleculeIndicatorLeft;
							
							moleculeIndicatorLength= Math.round(seqStr.length/this.config.moleculeSequenceLen*100);
							moleculeIndicatorLeft="1%";
							if(currentLeft){
								moleculeIndicatorLeft = currentLeft;
							}
							else{
								moleculeIndicatorLeft = 1;
								currentLeft=1+moleculeIndicatorLength;
							}
							
							
							$(moleculeIndicator).addClass("moleculeIndicator").css({	
								width:moleculeIndicatorLength+"%",
								left:moleculeIndicatorLeft+"%"
							});
							this.moleculeOverview.append(moleculeIndicator);
						}
					}
					for (var i=0; i<20; i++) {
						var $labelNumber = $("<div style=''>"+currentInc+"</div>").addClass("labelnumber").css({"left":i*5+"%"});
						this.moleculeOverview.append($labelNumber);
						
						currentInc+=inc;
					}
					
					if(this.config.sequenceArr&&this.config.sequenceArr.length>0){
						
						var inc ;
						var currentInc;
						
						inc = Math.round(this.config.sequenceArr.length/20);
						currentInc = 0;
						
						var currentLeft=0;
						for(var i =0;i<this.config.moleculeSequenceStringArr.length;i++){
							var seqStr = this.config.moleculeSequenceStringArr[i];
							if(seqStr.indexOf('-')>-1){
								if(!currentLeft) currentLeft=1;
								currentLeft+=Math.round(seqStr.length/this.config.sequenceArr.length*100);
								
							}
							else{
								
								
								var moleculeIndicator = document.createElement("div");
								var moleculeIndicatorLength; 
								var moleculeIndicatorLeft;
								
								moleculeIndicatorLength= Math.round(seqStr.length/this.config.sequenceArr.length*100);
								if(currentLeft){
									moleculeIndicatorLeft = currentLeft;
								}
								else{
									moleculeIndicatorLeft = Math.round(modelStart/this.config.sequenceArr.length*100);
									currentLeft=moleculeIndicatorLeft+moleculeIndicatorLength;
								}
								
								
								$(moleculeIndicator).addClass("moleculeIndicator").css({	
									width:moleculeIndicatorLength+"%",
									left:moleculeIndicatorLeft+"%"
								});
								this.fullSquenceOverview.append(moleculeIndicator);
							}
						}
						for (var i=0; i<20; i++) {
							var $labelNumber = $("<div style=''>"+currentInc+"</div>").addClass("labelnumber").css({"left":i*5+"%"});
							this.fullSquenceOverview.append($labelNumber);
							
							currentInc+=inc;
						}
					}
					/*var inc ;
						var currentInc;
						if(this.config.sequenceArr&&this.config.sequenceArr.length>0){
						
						inc = Math.round(this.config.sequenceArr.length/20);
						currentInc = 0;
						}
						else{
						
						inc = Math.round(res.length/20);
						currentInc = modelStart;
						}
						var currentLeft;
						for(var i =0;i<this.config.moleculeSequenceStringArr.length;i++){
						var seqStr = this.config.moleculeSequenceStringArr[i];
						if(seqStr.indexOf('-')>-1){
						if(!currentLeft) currentLeft=1;
						if(this.config.sequenceArr&&this.config.sequenceArr.length>0){
						currentLeft+=Math.round(seqStr.length/this.config.sequenceArr.length*100);
						}
						else{
						currentLeft += Math.round(seqStr.length/this.config.moleculeSequenceLen*100);
						}
						}
						else{
						
						
						var moleculeIndicator = document.createElement("div");
						var moleculeIndicatorLength; 
						var moleculeIndicatorLeft;
						if(this.config.sequenceArr&&this.config.sequenceArr.length>0){
						moleculeIndicatorLength= Math.round(seqStr.length/this.config.sequenceArr.length*100);
						if(currentLeft){
						moleculeIndicatorLeft = currentLeft;
						}
						else{
						moleculeIndicatorLeft = Math.round(modelStart/this.config.sequenceArr.length*100);
						currentLeft=moleculeIndicatorLeft+moleculeIndicatorLength;
						}
						}
						else{
						moleculeIndicatorLength= Math.round(seqStr.length/this.config.moleculeSequenceLen*100);
						moleculeIndicatorLeft="1%";
						if(currentLeft){
						moleculeIndicatorLeft = currentLeft;
						}
						else{
						moleculeIndicatorLeft = 1;
						currentLeft=1+moleculeIndicatorLength;
						}
						}
						
						$(moleculeIndicator).addClass("moleculeIndicator").css({	
						width:moleculeIndicatorLength+"%",
						left:moleculeIndicatorLeft+"%"
						});
						$(pDiv+" .sequenceOverview").append(moleculeIndicator);
						}
						for (var i=0; i<20; i++) {
						var $labelNumber = $("<div style=''>"+currentInc+"</div>").addClass("labelnumber").css({"left":i*5+"%"});
						$(pDiv+" .sequenceOverview").append($labelNumber);
						
						currentInc+=inc;
						}
					}*/
					
					
					
					
					
					
				},this);
				
				
				Eplant.queue.add(function(){
					//console.log("seq1letterArr(length="+mySequence.seq1letterArr.length+"): "+mySequence.seq1letterArr.join(''));
					//console.log("seq3letterArr(length="+mySequence.seq3letterArr.length+"): "+mySequence.seq3letterArr.join(','));
					//console.log("fullseq3letterArr(length="+mySequence.fullseq3letterArr.length+"): "+mySequence.fullseq3letterArr.join(','));
					//console.log("chains: "+JSON.stringify(mySequence.chains));
					
					//ajax call get Pfam domains
					ajaxGetPfamDomains(mySequence.seq1letterArr.join(''));
					//ajax call get CDD domains
					ajaxGetCDDfeatures(mySequence.seq1letterArr.join(''));			
					
					this.modelSequence = $spanSeq;
					
					//add space on both sides to show both sequence ends
					var fadeWidth = $('#fadeLeft, #fadeRight').width();
					var $spanExtraSpace = $("<span class='alignment' style='width: 300px;text-align:right' >&#x25cf;</span>");
					var $spanExtraSpacecopy = $("<span class='alignment' style='width: 300px;text-align:left' >&#x25cf;</span>");
					$spanSeq = $spanExtraSpace.add(this.modelSequence).add($spanExtraSpacecopy);//jquery bug, cant use $spanExtraSpace at beginning and ending
					
					$(pDiv+jq(config.CSS.IDs.protSeq)).empty().append($spanSeq);
					
				},this);
				Eplant.queue.add(function(){
					//adds chain letter and labels with numbers over the sequence
					var currentChainLetter;
					for (var i = 0, len = mySequence.fullseq3letterArr.length; i < len; i++) {
						
						var resIndex;
						//get chars between "]" and ":". It's the index position
						var matches = mySequence.fullseq3letterArr[i].match(/\](.*?)\:/);
						if (matches)
						resIndex = matches[1];
						
						var chainLetter;
						//get first char after ":". It's the chain letter
						var matches = mySequence.fullseq3letterArr[i].match(/\:(.?)/);
						if (matches) 
						chainLetter = matches[1];
						
						/*
							* A chain can start with any index even negative so I keep track of the
							* letter and when it changes I know I'm starting a new chain.
							* PS: Chains not always follow alphabetic order
						* */
						if(!currentChainLetter || currentChainLetter != chainLetter){
							
							var $labelChain = $("<div style='/*z-index:3;*/'> Protein Sequence "+chainLetter+"</div>");//z-index makes the chain keeps over the snp balloon
							$(pDiv+jq(config.CSS.IDs.protSeq)).append($labelChain).addClass("labelnumber");
							$labelChain.position({
								my: "center bottom-20",
								at: "center top",
								of: $(pDiv+jq(mySequence.fullseq3letterArr[i])),
								collision: "none"
							});
							}else if(Number(resIndex) % 10 == 0 ){//add label each 10 residues
							
							var $labelNumber = $("<div style='/*z-index:3;*/'>"+resIndex+"</div>");//z-index makes the number keeps over the snp balloon
							$(pDiv+jq(config.CSS.IDs.protSeq)).append($labelNumber).addClass("labelnumber");
							$labelNumber.position({
								my: "center bottom",
								at: "center top",
								of: $(pDiv+jq(mySequence.fullseq3letterArr[i])),
								collision: "none"
							});
						}
						currentChainLetter = chainLetter;
					}
					
					//load SNPs if arabidopsis
					if(mySequence.agi){
						ajaxGetSNPfeatures(mySequence.agi);
					}
					
					//avoid left menu overlaps the bottom div
					setMenuMaxHeight();
					setSliderHandleWidth();
					if(this.config.moleculeView&&this.config.moleculeView.loadFinish){
						this.config.moleculeView.loadFinish();
					}
					
				},this);
				Eplant.queue.add(getFullSequence,this);
			}
			else{//load a new structure takes time so remove all options from the older structure to avoid use old controls to interact with the new loaded structure
				$(pDiv+jq(config.CSS.IDs.PfamDomains)).empty();
				$(pDiv+jq(config.CSS.IDs.CDDdomains)).empty();
				$(pDiv+jq(config.CSS.IDs.viewOptions)).empty();
				$(pDiv+jq(config.CSS.IDs.protSeq)).empty();
			}
			if(this.config&&this.config.callback){
				Eplant.Views.MoleculeView.loadedFunctions[this.config.callback]();
			}
			
		}
		
		/**
			* pickCallback method
		*/
		function pickCallback(a,b,c,d){
			
			var clicked = b.split('.')[0];//get everything until first "."
			
			if(mySequence[clicked]){
				moveToResidue(clicked, setResidue);
				}else if($.inArray(clicked+": ", mySequence.fullseq3letterArr) > -1){//hack - some models from eplant don't have chain letter
				moveToResidue(clicked+": ", setResidue);
				}else{
				//console.log('Warn: molviewer didnt find the clicked element: '+ clicked);
			}
		}
		
		/**
			* hoverCallback method
			* 
			* This callback from jsmol works differently. Usually you have hover on and hover out functions as callbacks but not in jsmol.
			* Jsmol has only the hovercallback and while the mouse is over the element this functions keeps being called. The speed of call
			* is based on hoverDelay param. If you set hoverDelay=0.1 the function will be calleed hundreds of times per second. This can make
			* the screen unresponsive. Also the only way to simulate the hover out function is to use setTimeout, then when you move the mouse out
			* the hovercallback will stop to be called and your setTimeout will be fired.
		*/
		var checkHover;
		var lastHoverResidue;
		function hoverCallback(a,b,c,d){
			if(!canvasHoverBound&&$(pDiv+jq(config.CSS.IDs.jmolcontent)).find("canvas").length>0){
				$("canvas",pDiv+jq(config.CSS.IDs.jmolcontent)).mousemove(function(e){
					cursorX = e.clientX;
					cursorY = e.clientY-15;
				});
				canvasHoverBound=true;
			}
			var split =b.split(' ');
			//var display = split[0]+" "+split[1];
			var res = b.split('.')[0];//get everything until first "."
			var match = res.match(/\[(.*?)\]/);
			var display = res.replace(match[0],"") +": "+ match[0];
			if(!Eplant.MoleculeViewTooltip){
				
				Eplant.MoleculeViewTooltip = new Eplant.Tooltip({content:display});
			}
			//hack - some models from eplant don't have chain letter
			if(!mySequence[res] && $.inArray(res+": ", mySequence.fullseq3letterArr) > -1)
			res = res+": ";
			
			if(mySequence[res]){
				//moveToResidue(res,function(){});
				if(checkHover && lastHoverResidue === res){
					clearTimeout(checkHover);
				}
				else{
					moveToResidue(res,function(){});
				}
				
				
				lastHoverResidue = res;
				Jmol.script(myJmolOb, 'select '+ res +' ; halo 0.3;color halo "#99cc00";halo on;');
				$(jq(res)).addClass('hoveron');
				//console.log('hovering '+res);
				checkHover = setTimeout(function() {//what to do when hover out the element
					Jmol.script(myJmolOb, 'select '+ res +' ; halo off;');
					$(jq(res)).removeClass('hoveron');
					if(Eplant.MoleculeViewTooltip){
						Eplant.MoleculeViewTooltip.remove();
						Eplant.MoleculeViewTooltip=null;
					}
					//console.log('stopping '+res);
				}, 300);
			}
		}
		
		/**
			* Move scroll to selected residue and call function 
		*/
		function moveToResidue(residue, func) {
			var movedelay = 1000;
			var funcdelay = 100;
			var divWidth = $(/*jq(config.CSS.IDs.divBottomWrapper)*/window).width();
			var scrollPosition = $(jq(config.CSS.IDs.divSeqContainer)).scrollLeft();
			var left = $(jq(residue)).offset().left;
			var movement;
			
			movement = scrollPosition+left -(divWidth/2)-100;
			
			if(Math.abs(movement-scrollPosition) < 100){//if elements are VERY near each other, use VERY small delay
				movedelay = 300;
				funcdelay = 50;
			}else if(Math.abs(movement-scrollPosition) < divWidth)//if elements are near each other, use small delay
			movedelay = 500;
			
			$(pDiv+jq(config.CSS.IDs.divSeqContainer)).animate({
				scrollLeft: movement,
				//there is a bug and 'complete' is being called when animation starts, then I need to do use setTimeout with movedelay
				//to start at the end of animation. To wait a bit more I use movedelay+funcdelay
				complete : setTimeout(function(){func(residue)},movedelay+funcdelay)
			}, movedelay);
		}
		
		/**
			* Get param from browser url
		*/
		function getQueryStringByName(name) {
			name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
			var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
			results = regex.exec(location.search);
			return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
		}
		
		/**
			* update max-height property from left and right options menu to avoid overlap the
			* fixed div (divBottomWrapper) at the bottom
		*/
		function setMenuMaxHeight() {
			var outerHeight = $(pDiv+jq(config.CSS.IDs.divBottomWrapper)).outerHeight(true);
			var docHeight = $(pDiv+ jq("divMainJsmol")).height();//TODO fix
			$(pDiv+ jq(config.CSS.IDs.divMenu)).css('max-height',docHeight - outerHeight-15 );
			$(pDiv+ jq("divMenuRight")).css('max-height',docHeight - outerHeight );	
		}
		
		function setSliderHandleWidth() {
			var seqContainer = $(pDiv+ jq(config.CSS.IDs.divSeqContainer));
			var handleWidth = seqContainer.width()/seqContainer[0].scrollWidth*seqContainer.width();
			var halfHandleWidth = handleWidth/2;
			$("#"+config.CSS.IDs.seqSlider+' .ui-slider-handle').css({
				width:handleWidth+"px",
				"margin-left":-halfHandleWidth+"px"
			});
			$("#"+config.CSS.IDs.seqSlider).css({
				"margin-left":halfHandleWidth+10+"px",
				"margin-right":halfHandleWidth+10+"px",
			});
		}
		
		function setSeqSlider() {
			$(pDiv+jq(config.CSS.IDs.seqSlider)).slider({
				range: "min",
				min: 0,
				max: 100,
				value: 0,
				slide: function( event, ui ) {
					var container = document.getElementById(config.CSS.IDs.divSeqContainer);
					var scrollPercentage =  (container.scrollWidth-container.clientWidth)/100; 
					$( container ).scrollLeft( ui.value* scrollPercentage);
				}
			});
			$("#"+config.CSS.IDs.seqSlider).css('background','lightgray');
			$("#"+config.CSS.IDs.seqSlider+' .ui-widget-header').css('border','0px solid #aaaaaa').css('background','lightgray');
			
		}
	
		
		
		function getFullSequence(){
			
			if(this.config&&this.config.sequenceArr){
				var codeArray = {'ALA':'A','ARG':'R','ASN':'N','ASP':'D','CYS':'C','GLU':'E','GLN':'Q','GLY':'G','HIS':'H','ILE':'I',
				'LEU':'L','LYS':'K','MET':'M','PHE':'F','PRO':'P','SER':'S','THR':'T','TRP':'W','TYR':'Y','VAL':'V'};
				
				var reverseCodeArray = {'A':'ALA','R':'ARG','N':'ASN','D':'ASP','C':'CYS','E':'GLU','Q':'GLN','G':'GLY','H':'HIS','I':'ILE',
				'L':'LEU','K':'LYS','M':'MET','F':'PHE','P':'PRO','S':'SER','T':'THR','W':'TRP','Y':'TYR','V':'VAL'};
				
				var res = this.res;
				//console.log('res: '+res);
				var $spanSeq = $();
				mySequence.sequenceArr = res;
				mySequence.seq1letterArr = [];		//one letter
				mySequence.seq3letterArr = [];		//three letter
				mySequence.fullseq3letterArr = [];	//three letter with index and chain letter
				mySequence.chains = {};				//by chain letter
				
				/*
					* extract residues and hold
				* */
				var modelStart = Number(res[0].split("]")[1].split(":")[0])-1;
				
				
				
				for (var i=0, len=modelStart; i<len; i+=2) {
					Eplant.queue.add(function(){
					for (var i=this.i, innerlen=i+2; i<innerlen&&i<modelStart; i++) {
						
						var index= i+1;
						var tletters = reverseCodeArray[this.viewer.config.sequenceArr[i]];
						var full = "["+tletters+"]"+index+": ";
						
						mySequence.seq1letterArr.push(this.viewer.config.sequenceArr[i]);
						mySequence.seq3letterArr.push(tletters);
						mySequence.fullseq3letterArr.push(full);
						mySequence[full]={oneLetterCode:this.viewer.config.sequenceArr[i],threeLetterCode:tletters,selected:false};
						var displayText = index+": ["+tletters+"]";
						
						var span = document.createElement("span");
						span.innerHTML=this.viewer.config.sequenceArr[i];
						span.className += 'sequence deselected hintWhite--top hintWhite--success hintWhite-rounded';
						span.setAttribute("data-hintWhite", displayText);
						span.setAttribute("id", full);
						$spanSeq = $spanSeq.add(span);
						/*$spanSeq = $spanSeq.add($( "<span/>", {
							"class" : "sequence deselected hintWhite--top hintWhite--success hintWhite-rounded",
							"id" : full,
							"data-hintWhite" : displayText,
							text : this.viewer.config.sequenceArr[i]
						}));*/
					}
					},{viewer:this, i:i},null,null,0);
				}
				
				Eplant.queue.add(function(){
					$spanSeq = $spanSeq.add($( "<span/>", {
						"class" : "alignment",
						"id" : "",
						text : "["
					}));
				},this,null,null,0);
				
				var lastMatchNumber;
				for (var i=0, len=res.length; i<len; i+=2) {
					Eplant.queue.add(function(){
						for (var i=this.i, innerlen=i+2; i<innerlen&&i<res.length; i++) {
							
							var matches = res[i].match(/\[(.*?)\]/);
							var matchNumber = Number(res[i].match(/\](.*?)\:/)[1]);
							if(lastMatchNumber&&matchNumber!=lastMatchNumber+1){
								$spanSeq = $spanSeq.add($( "<span/>", {
									"class" : "alignment",
									"id" : "",
									text : "]"
								}));
								for (var j=lastMatchNumber, jlen=matchNumber-1; j<jlen; j++) {
									var index= j+1;
									var letter ;
									var tletters;
									if(this.viewer.config.sequenceArr){
										var letter = this.viewer.config.sequenceArr[j];
										var tletters = reverseCodeArray[letter];
										
									}
									else{
										var tletters = res[i];
										var letter = codeArray[tletters];
										
									}
									
									var full = "["+tletters+"]"+index+": ";
									
									mySequence.seq1letterArr.push(letter);
									mySequence.seq3letterArr.push(tletters);
									mySequence.fullseq3letterArr.push(full);
									mySequence[full]={oneLetterCode:letter,threeLetterCode:tletters,selected:false};
									var displayText = index+": ["+tletters+"]";
									var span = document.createElement("span");
									span.innerHTML=letter;
									span.className += 'sequence deselected hintWhite--top hintWhite--success hintWhite-rounded';
									span.setAttribute("data-hintWhite", displayText);
									span.setAttribute("id", full);
									$spanSeq = $spanSeq.add(span);
									/*$spanSeq = $spanSeq.add($( "<span/>", {
										"class" : "sequence deselected hintWhite--top hintWhite--success hintWhite-rounded",
										"id" : full,
										"data-hintWhite" : displayText,
										text : this.viewer.config.sequenceArr[j]
									}));*/
								}
								$spanSeq = $spanSeq.add($( "<span/>", {
									"class" : "alignment",
									"id" : "",
									text : "["
								}));
							}
							//keep only aminoacids dropping everything else, like HOH
							if (matches && codeArray[matches[1]]) {
								mySequence.seq1letterArr.push(codeArray[matches[1]]);
								mySequence.seq3letterArr.push(matches[1]);
								mySequence.fullseq3letterArr.push(res[i]);
								mySequence[res[i]]={oneLetterCode:codeArray[matches[1]],threeLetterCode:matches[1],selected:false};
								
								var matches2 = res[i].match(/\:(.?)/); //get chain letter
								if (matches2){
									var chainLetter = matches2[1];
									if(mySequence.chains[chainLetter]){
										mySequence.chains[chainLetter].push(res[i]);
										}else{
										mySequence.chains[chainLetter] = [res[i]];
									}
								}
								var displayText = res[i].replace(matches[0],"")+matches[0];
								
								$spanSeq = $spanSeq.add($( "<span/>", {
									"class" : "sequenceModel deselected hintWhite--top hintWhite--success hintWhite-rounded",
									"id" : res[i],
									"data-hintWhite" : displayText,
									text : codeArray[matches[1]]
								}));
								if(this.viewer.config&&this.viewer.config.gaps&&this.viewer.config.gaps.indexOf(res[i])>-1){
									$spanSeq = $spanSeq.add($( "<span/>", {
										"class" : "alignment",
										"id" : "",
										text : "] ["
									}));
								}
							}
							lastMatchNumber=matchNumber;
						}
					},{viewer:this, i:i},null,null,0);
				}
				Eplant.queue.add(function(){
					$spanSeq = $spanSeq.add($( "<span/>", {
						"class" : "alignment",
						"id" : "",
						text : "]"
					}));
				},this,null,null,0);
				
				var newStartIndex = Number(res[res.length-1].split("]")[1].split(":")[0]);
				for (var i=newStartIndex, len=this.config.sequenceArr.length; i<len;  i+=2) {
					Eplant.queue.add(function(){
						for (var i=this.i, innerlen=i+2; i<innerlen&&i<this.viewer.config.sequenceArr.length; i++) {
							
							var index= i+1;
							var tletters = reverseCodeArray[this.viewer.config.sequenceArr[i]];
							var full = "["+tletters+"]"+index+": ";
							
							var displayText = index+": ["+tletters+"]";
							
							mySequence.seq1letterArr.push(this.viewer.config.sequenceArr[i]);
							mySequence.seq3letterArr.push(tletters);
							mySequence.fullseq3letterArr.push(full);
							mySequence[full]={oneLetterCode:this.viewer.config.sequenceArr[i],threeLetterCode:tletters,selected:false};
							var span = document.createElement("span");
							span.innerHTML=this.viewer.config.sequenceArr[i];
							span.className += 'sequence deselected hintWhite--top hintWhite--success hintWhite-rounded';
							span.setAttribute("data-hintWhite", displayText);
							span.setAttribute("id", full);
							$spanSeq = $spanSeq.add(span);
							/*$spanSeq = $spanSeq.add($( "<span/>", {
								"class" : "sequence deselected hintWhite--top hintWhite--success hintWhite-rounded",
								"id" : full,
								"data-hintWhite" : displayText,
								text : this.viewer.config.sequenceArr[i]
							}));*/
						}
					},{viewer:this, i:i},null,null,0);
				}
				
				Eplant.queue.add(function(){
					
					//add space on both sides to show both sequence ends
					var fadeWidth = $('#fadeLeft, #fadeRight').width();
					var $spanExtraSpace = $("<span class='alignment' style='width: 300px;text-align:right' >&#x25cf;</span>");
					var $spanExtraSpacecopy = $("<span class='alignment' style='width: 300px;text-align:left' >&#x25cf;</span>");
					$spanSeq = $spanExtraSpace.add($spanSeq).add($spanExtraSpacecopy);//jquery bug, cant use $spanExtraSpace at beginning and ending
					
					$(pDiv+jq(config.CSS.IDs.protSeq)).empty().append($spanSeq);
					
				},this,null,null,0);
				Eplant.queue.add(function(){
					//adds chain letter and labels with numbers over the sequence
					var currentChainLetter;
					for (var i = 0, len = mySequence.fullseq3letterArr.length; i < len; i++) {
						
						var resIndex;
						//get chars between "]" and ":". It's the index position
						var matches = mySequence.fullseq3letterArr[i].match(/\](.*?)\:/);
						if (matches)
						resIndex = matches[1];
						
						var chainLetter;
						//get first char after ":". It's the chain letter
						var matches = mySequence.fullseq3letterArr[i].match(/\:(.?)/);
						if (matches) 
						chainLetter = matches[1];
						
						/*
							* A chain can start with any index even negative so I keep track of the
							* letter and when it changes I know I'm starting a new chain.
							* PS: Chains not always follow alphabetic order
						* */
						if(!currentChainLetter || currentChainLetter != chainLetter){
							
							var $labelChain = $("<div style='/*z-index:3;*/'> Protein Sequence "+chainLetter+"</div>");//z-index makes the chain keeps over the snp balloon
							$(pDiv+jq(config.CSS.IDs.protSeq)).append($labelChain).addClass("labelnumber");
							$labelChain.position({
								my: "center bottom-20",
								at: "center top",
								of: $(pDiv+jq(mySequence.fullseq3letterArr[i])),
								collision: "none"
							});
							}else if(Number(resIndex) % 10 == 0 ){//add label each 10 residues
							
							var $labelNumber = $("<div style='/*z-index:3;*/'>"+resIndex+"</div>");//z-index makes the number keeps over the snp balloon
							$(pDiv+jq(config.CSS.IDs.protSeq)).append($labelNumber).addClass("labelnumber");
							$labelNumber.position({
								my: "center bottom",
								at: "center top",
								of: $(pDiv+jq(mySequence.fullseq3letterArr[i])),
								collision: "none"
							});
						}
						currentChainLetter = chainLetter;
					}
					
					//load SNPs if arabidopsis
					if(mySequence.agi){
						ajaxGetSNPfeatures(mySequence.agi);
					}
					
					//avoid left menu overlaps the bottom div
					setMenuMaxHeight();
					setSliderHandleWidth();
					if(this.config.moleculeView&&this.config.moleculeView.loadFinish){
						this.config.moleculeView.loadFinish();
					}
					this.moleculeOverview.replaceWith(this.fullSquenceOverview);
				},this,null,null,0);
			}
		}
		
		function getPointerCopy(color,id,text){
			if(!color) color="#99cc00";
			var pointer = $('<svg id="'+id+'" width="30" height="45" viewBox="0 0 100 150" style="cursor: pointer;">'+
			'<polygon points="30,100 50,150 70,100" style="fill:#99cc00;stroke-width: 0;"></polygon>'+
			'<circle cx="50" cy="75" r="40" fill="#99cc00" stroke-width="0"></circle>'+
			'<text x="50" y="95" font-size="50" font-weight="bolder" fill="#000000" '+
			'style="font-family: Helvetica; " text-anchor="middle">'+text+'</text>'+
			'</svg>');
			$("polygon",pointer).css({"fill":color});
			$("circle",pointer).css({"fill":color});
			return pointer;
			
		}
			
		/**
			* 
		*/
		function ajaxGetCDDfeatures(fullseq){
			
			//console.log('calling CDD ajax');
			$(pDiv+jq(config.CSS.IDs.CDDdomains)).empty().append("<span class='loading'>Loading CDD features</span>");
			
			var u;
			if(config.application.cddUrl)//custom url
			u = config.application.cddUrl;
			else if(window.location.hostname.indexOf('bar.utoronto.ca') > -1)//running at bar.utoronto.ca server
			u = config.application.cddUrlBar;
			else//dev environment
			u = config.application.cddUrlDev;
			
			$.ajax({
				type: 'POST',
				dataType: 'json',
				url: u,
				timeout: 25000,
				data: { "url" : config.application.cddUrlBar,"FASTAseq": fullseq },
				cache: false,
				success: function(data, textStatus, jqXHR){
					//console.log('CDD fullseq '+fullseq+ "\nurl " + u +'\ncdd result from json:\n'+JSON.stringify(data));
					
					if(config.moleculeView){
						config.moleculeView.CDDRawText = JSON.stringify(data);
					}
					
					$(pDiv+jq(config.CSS.IDs.CDDdomains)).empty();
					
					if(Object.keys(data).length==0){//empty
						$(pDiv+jq(config.CSS.IDs.CDDdomains)).append("<span> No features found</span> <br/>");
						
						}else{
						var numberPattern = /\d+/g;//only numbers
						$.each(data, function(key, value) {
							
							var arIndex = value.match( numberPattern );//hold the indexes
							//console.log('residues indexes for '+key+': '+arIndex);
							
							//change spaces to _ and removes non letters or non numbers to use as ids
							var keyId = key.replace(/ /g, "_").replace(/[^a-zA-Z0-9-_]/g, '');
							
							$(pDiv+jq(config.CSS.IDs.CDDdomains)).append("<span id='"+config.CSS.IDs.parentDivId+keyId +"span' class='radioMenu'><input type='radio' id='"+config.CSS.IDs.parentDivId+keyId+"' name='"+config.CSS.names.rdFeature+"' value='TODO' style='' ><label for='"+config.CSS.IDs.parentDivId+keyId+"'>"+ key+/*" (" +value+")*/"</label></span>");
							
							$(jq(config.CSS.IDs.parentDivId+keyId)).click(function(e) {
								resetJsmolColors();//remove color from previous selected cdd or pfam
								recolorSelected();	    					
								setResiduesByIndexes(e, arIndex);
							});
						});
					}
				},
				error: function(xhr, textStatus, errorThrown){
					//console.log('cdd request failed: '+xhr.responseText+'. textStatus: '+textStatus);
					if(textStatus==="abort") {
						$(pDiv+jq(config.CSS.IDs.CDDdomains)).empty();
						}else if(textStatus==="timeout") {
						$(pDiv+jq(config.CSS.IDs.CDDdomains)).empty().append("<span style='white-space: normal;'>CDD features loading error. Try again?</span><br> <button class='greyButton' id='"+config.CSS.IDs.btnCDDtryAgain+"' style='height: 30px;padding: 0 15px;width: auto;'>Try again</button>");  	    	    
						$(pDiv+jq(config.CSS.IDs.btnCDDtryAgain)).click(function(e) {
							ajaxGetCDDfeatures(mySequence.seq1letterArr.join(''));
						});
						}else{
						$(pDiv+jq(config.CSS.IDs.CDDdomains)).empty().append("<span style='white-space: normal;'>CDD features loading error. Try again?</span><br> <button class='greyButton' id='"+config.CSS.IDs.btnCDDtryAgain+"' style='height: 30px;padding: 0 15px;width: auto;'>Try again</button>");   	    	    
						$(pDiv+jq(config.CSS.IDs.btnCDDtryAgain)).click(function(e) {
							ajaxGetCDDfeatures(mySequence.seq1letterArr.join(''));
						});
					}
				}
			});
			
		}
		/**
			* 
		*/
		function ajaxGetPfamDomains(fullseq){
			
			//console.log('calling pfam ajax');	
			$(pDiv+jq(config.CSS.IDs.PfamDomains)).empty().append("<span class='loading'>Loading Pfam domains</span>");
			
			var u;
			if(config.application.pfamUrl)//custom url
			u = config.application.pfamUrl;
			else if(window.location.hostname.indexOf('bar.utoronto.ca') > -1)//running at bar.utoronto.ca server
			u = config.application.pfamUrlBar;
			else//dev environment
			u = config.application.pfamUrlDev;
			
			$.ajax({
				type: 'POST',
				dataType: 'json',
				url: u,
				timeout: 25000,
				data: {"FASTAseq" : fullseq, "url" : config.application.pfamUrlBar},
				cache: false,
				success: function(data, textStatus, jqXHR ){
					//console.log('pfam fullseq '+fullseq+ "\nurl " + u +'\npfam result from json:\n'+JSON.stringify(data));
					
					if(config.moleculeView){
						config.moleculeView.PfamRawText = JSON.stringify(data);
					}
					$(pDiv+jq(config.CSS.IDs.PfamDomains)).empty();			
					
					if(Object.keys(data).length==0){//empty
						$(pDiv+jq(config.CSS.IDs.PfamDomains)).append("<span> No domains found</span> <br/>");
						}else{
						$.each(data, function(key, value) {
							//console.log( 'key: '+key + ", value:" + JSON.stringify(value) +', PfamAnnot: '+value.PfamAnnot+', startIndex: '+value.startIndex+
							//', endIndex: '+value.endIndex+', Expect: '+value.Expect+', domainName: '+value.domainName );
							
							key = key.replace(/\./g,"");//removes dot from the key
							
							$(pDiv+jq(config.CSS.IDs.PfamDomains)).append("<span id='"+config.CSS.IDs.parentDivId+key+"span' class='radioMenu'><input type='radio' id='"+config.CSS.IDs.parentDivId+key +"' name='"+config.CSS.names.rdFeature+"' value='TODO' style=''><label for='"+config.CSS.IDs.parentDivId+key +"'>" + value.PfamAnnot+": " + value.startIndex+" - " + value.endIndex+" ("+value.domainName+")</label></span>");
							
							$(jq(config.CSS.IDs.parentDivId+key)).on("click", function(){
								resetJsmolColors();//remove color from previous selected cdd or pfam
								recolorSelected();			
								setColorByRange(value.startIndex, value.endIndex);
							});
						});
					}
				},
				error: function(xhr, textStatus, errorThrown){
					//console.log('Pfam request failed: '+xhr.responseText+'. textStatus: '+textStatus);
					if(textStatus==="abort") {
						$(pDiv+jq(config.CSS.IDs.PfamDomains)).empty();
						}else if(textStatus==="timeout") {
						$(pDiv+jq(config.CSS.IDs.PfamDomains)).empty().append("<span style='white-space: normal;'>Pfam domain loading error. Try again?</span><br> <button class='greyButton' id='"+config.CSS.IDs.btnPfamTryAgain+"' style='height: 30px;padding: 0 15px;width: auto;'>Try again</button>");   	            
						$(pDiv+jq(config.CSS.IDs.btnPfamTryAgain)).click(function(e) {
							ajaxGetPfamDomains(mySequence.seq1letterArr.join(''));
						});
						}else{
						$(pDiv+jq(config.CSS.IDs.PfamDomains)).empty().append("<span style='white-space: normal;'>Pfam domain loading error. Try again?</span><br> <button class='greyButton' id='"+config.CSS.IDs.btnPfamTryAgain+"' style='height: 30px;padding: 0 15px;width: auto;'>Try again</button>");
						$(pDiv+jq(config.CSS.IDs.btnPfamTryAgain)).click(function(e) {
							ajaxGetPfamDomains(mySequence.seq1letterArr.join(''));
						});
					}
				}
			});
			
		}
		
		function getPointerCopy(color,id,text){
			if(!color) color="#99cc00";
			var pointer = $('<svg id="'+id+'" width="30" height="45" viewBox="0 0 100 150" style="cursor: pointer;">'+
			'<polygon points="30,100 50,150 70,100" style="fill:#99cc00;stroke-width: 0;"></polygon>'+
			'<circle cx="50" cy="75" r="40" fill="#99cc00" stroke-width="0"></circle>'+
			'<text x="50" y="95" font-size="50" font-weight="bolder" fill="#000000" '+
			'style="font-family: Helvetica; " text-anchor="middle">'+text+'</text>'+
			'</svg>');
			$("polygon",pointer).css({"fill":color});
			$("circle",pointer).css({"fill":color});
			return pointer;
			
		}
		/**
			* agi - Arabidopsis Gene ID
			* Load SNPs
			* 
			* This method is only for Arabidopsis from BAR project. Here I'm considering all proteins have just one chain.
			* The protein sequence is not complete most of the time but its sequence index should be corret. For example,
			* if the protein starts at aminoacid 10, then the first aminoacid needs to have index 10. This will be used to locate the correct
			* SNP, which is also based in its index, the only diference is snps are 0 index based. Example:
			* 
			* "208":"AV" 
			* Means at protein position 207 (not 208 because to protein sequence isn't 0 index based) there is a SNP  changing the wild type A to V.
			* Then position 207 at the protein SHOULD have an A aminoacid, otherwise there is something wrong.
		*/
		function ajaxGetSNPfeatures(agi){
			
			//console.log('calling SNP ajax');
			
			var snpsMap = {}; // act as a hasmap
			var snpsDetailMap = {}; // act as a hasmap
			
			var reverseCodeArray = {'A':'ALA','R':'ARG','N':'ASN','D':'ASP','C':'CYS','E':'GLU','Q':'GLN','G':'GLY','H':'HIS','I':'ILE',
			'L':'LEU','K':'LYS','M':'MET','F':'PHE','P':'PRO','S':'SER','T':'THR','W':'TRP','Y':'TYR','V':'VAL'};
			//var that = this;
			$.ajax({
				type: 'GET',
				dataType: 'json',
				url: 'http://gator.masc-proteomics.org/data/latest/gator',
				timeout: 25000,
				data: {"agi": agi, "service": 'nssnps'},
				cache: false,
				success: function(data, textStatus, jqXHR){
					//console.log('ajaxGetSNPfeatures result:\n'+JSON.stringify(data));
					
					if(data.data){
						
						if(config.moleculeView){
							config.moleculeView.SNPRawText = JSON.stringify(data);
						}
						
						var result = data.data;
						
						//adding results to snpsMap
						$.each(result, function(key, value) {
							//console.log('key '+key+ ' - value '+JSON.stringify(value));
							
							/*
								* remember, the protein sequence most of the times are not complete having many gaps.
								* Also the returned snps are 0 index based considering the full aminoacid sequence (starts with 0).
							* */
							$.each(value, function(index, residues) {
								var chars = residues.split("");
								if(snpsDetailMap[index+":"+residues]){
									snpsDetailMap[index+":"+residues].push(key+" "+(Number(index)+1)+ ":"+chars[0]+"&#8594;"+chars[1]);
								}
								else{
									snpsDetailMap[index+":"+residues] = [];
									snpsDetailMap[index+":"+residues].push(key+" "+(Number(index)+1)+ ":"+chars[0]+"&#8594;"+chars[1]);
								}
								
								if(snpsMap[index+":"+residues]){
									snpsMap[index+":"+residues] = snpsMap[index+":"+residues] + 1;
									}else{
									snpsMap[index+":"+residues] = 1;
								}
								
								if(residues.length == 2){
									//console.log("size = 2 ");
									}else{
									//console.log("TODO size not equals 2, something wrong");
								}
								
							});
						});
						
						//console.log('snps '+JSON.stringify(snpsMap));
						
						var scrollWidth;
						for (var key in snpsMap) {
							//console.log(key, snpsMap[key]);
							
							var total = snpsMap[key];
							//key example: "110:ED"
							var value = key.split(":");
							var index = Number(value[0])+1; //+1 because its 0 index based
							var original_aa = value[1].charAt(0);
							var snp_aa = value[1].charAt(1);
							
							var aa = reverseCodeArray[original_aa];
							if(aa){
								//$('[id^=foo]')  -> return everything that starts with foo
								//$('[id^=\\[VAL\\]7]')
								//$('[id^=\\[VAL\\]7\\:\\ ]')
								//try to select element by id like 'id=[GLY35: ]'
								var $element = $(pDiv+'[id^=\\['+aa+'\\]'+index + '\\:\\ ]');
								var elementId = '['+aa+']'+index + ': '; 
								if($element.length){
									var SNPcolor = getRelativeColor(total);
									var relativeSize = getRelativeSize(total);
									//if a second (or more) snp exists in the same index don't add. Its content goes only inside tooltip
									var $balloon;
									if( ! $(pDiv+jq("pin_tooltip_"+index)).length ){
										$balloon = $(getPointerCopy(SNPcolor,"pin_tooltip_"+index,snp_aa));//makes a copy
										//that.config.balloons.push($balloon);
										$(pDiv+jq(config.CSS.IDs.protSeq)).append($balloon);
										$balloon.position({
											my: "center bottom+10",
											at: "center top",
											of: $element,
											collision: "none"
											}).css({
											transform:"scale("+relativeSize+") translateY(-"+(11*(relativeSize-1))+"px)"
										})
										.attr("data-frequency",total)
										.attr("data-target",elementId);
										if(!scrollWidth)scrollWidth = $element.parent()[0].scrollWidth;
										var overviewLeft = $balloon.position().left/scrollWidth*100+"%";
										var overviewMarker = $( "<span/>", {
											"class" : "SNPIndicator",
											"id" : "",
											text : ""
										})
										.css({
											"left":overviewLeft,
											"background":SNPcolor,
											"height":relativeSize*8+"px"
										})
										.appendTo($(pDiv+" .sequenceOverview"));
										
										//that.config.overviewMarkers.push(overviewMarker);
									}
									else{
										$balloon = $(pDiv+jq("pin_tooltip_"+index));
									}
									
									
									var frequencySpan = $('<div style="font-size:18;white-space: nowrap;">Residue '+original_aa+" to "+snp_aa+" - Frequency: "+total+'</div>');
									var ecotypesSpan = getEcotypesSpan(snpsDetailMap,key);
									//add tooltip
									var snp3letters = reverseCodeArray[snp_aa];
									
									if($(pDiv+jq("pin_tooltip_"+index)).qtip('api')){//add snp to existing tooltip
										var txt = $(pDiv+jq("pin_tooltip_"+index)).qtip('option', 'content.text');
										/*if (typeof txt === "function") {
											txt=txt();
											txt.append("<br>");
											frequencySpan.css({"margin-top":"10px"}).appendTo(txt);
											ecotypesSpan.appendTo(txt);
											$(pDiv+jq("pin_tooltip_"+index)).qtip('api').set('content.text', $.proxy(function(){
											return this;
											},txt));
											
											}
											else{
											$(pDiv+jq("pin_tooltip_"+index)).qtip('api').set('content.text', txt+'<br><span style="font-size:18;white-space: nowrap;">Residue '+original_aa+" to "+snp_aa+" - Frequency: "+total+'</span>' );
											
										}*/
										txt.append("<br>");
										frequencySpan.css({"margin-top":"10px"}).appendTo(txt);
										ecotypesSpan.appendTo(txt);
										$(pDiv+jq("pin_tooltip_"+index)).qtip('api').set('content.text', txt );
									}
									else{//new tooltip
										var SNPInfoHolder = $(document.createElement("div"));
										SNPInfoHolder.append(frequencySpan).append(ecotypesSpan);
										var tooltip = $balloon.qtip({
											
											content: {
												//text: '<span style="font-size:18;white-space: nowrap;">Residue '+original_aa+" to "+snp_aa+" - Frequency: "+index+'</span>',
												text:SNPInfoHolder,
												//attr: 'data-tooltip'
												button: true
											},
											show: {
												event: 'click',
												solo: false //show or hide all others
											},
											hide: {
												//event: 'click',
												event: false,
												//distance: 100,
												fixed: true
											},
											position: {
												my: 'bottom center',  // Position my top left...
												at: 'top center', // at the bottom right of...
												//target: $balloon // my target
												//container: $(pDiv+jq(config.CSS.IDs.divSeqContainer)),
												adjust: {
													scroll: true // Can be ommited (e.g. default behaviour)
												},
												effect: false
											},
											style: {
												classes: 'a_qtip-green qtip-shadow lower-z-index'
												//def : false
											},
											events: {
												render: function(event,api){
													//console.log(api.elements.content.find('span'));
													var target = $('.ecotypesSpan', this);
													target.qtip({
														
														content: {
															text: function(api){
																var tooltipContent = target.data('tooltip-content');
																return $(tooltipContent);                        
															},
															//attr: 'data-tooltip'
															button: false
														},
														show: {
															//event: 'click',
															solo: false //show or hide all others
														},
														hide: {
															//event: 'click',
															//hide:false,
															delay:200,
															fixed: true, // <--- add this
															//distance: 100,
															//fixed: true
														},
														position: {
															my: 'center right',  // Position my top left...
															at: 'center left', // at the bottom right of...
															//target: $balloon // my target
															//container: $(pDiv+jq(config.CSS.IDs.divSeqContainer)),
															adjust: {
																scroll: true // Can be ommited (e.g. default behaviour)
															},
															effect: false
														},
														style: {
															classes: 'a_qtip-green qtip-shadow lower-z-index'
															//def : false
														}
													})
													
												}
											}
										});
										
										//need to use this to update tooltip position when moving the scroll.
										//http://craigsworks.com/projects/forums/showthread.php?tid=1529
										$(pDiv+jq(config.CSS.IDs.divSeqContainer)).on('scroll', function (event) {	
											
											
											var container = document.getElementById(config.CSS.IDs.divSeqContainer);
											var scrollPercentage =  (container.scrollWidth-container.clientWidth)/100; 
											var scrollLeftSlide = $(container).scrollLeft()/scrollPercentage;
											$('.qtip:visible').qtip('reposition');
											$(pDiv+jq(config.CSS.IDs.seqSlider)).slider('value', scrollLeftSlide);
											//console.log('moving divSeqContainer');
										});
									}	    					
								}
							}	    			
						}
						
						
					}
					else if(data.error){
						var msg = data.error; //No data
						//console.log('No SNP information, returned was: '+ msg);
					}		    	
				},
				error: function(xhr, textStatus, errorThrown){
					//console.log('error: '+xhr.responseText+'. textStatus: '+textStatus);
				}
			});
			
		}
		
		function getRelativeSize(frequency){
			
			var ratio =  (Math.abs((Math.round(ZUI.Math.log(frequency/ Eplant.Views.MoleculeView.Params.maxFrequency, 2)+Eplant.Views.MoleculeView.Params.logOffset) * 100) / 100)/Eplant.Views.MoleculeView.Params.logOffset)+1;
			
			return ratio>2?2:ratio;
		}
		
		function getRelativeColor(frequency){
			var midColor = ZUI.Util.getColorComponents(Eplant.midColor);
			var maxColor = ZUI.Util.getColorComponents(Eplant.maxColor);
			/* Get value ratio relative to maximum */
			var ratio =  Math.abs((Math.round(ZUI.Math.log(frequency/ Eplant.Views.MoleculeView.Params.maxFrequency, 2)+Eplant.Views.MoleculeView.Params.logOffset) * 100) / 100)/Eplant.Views.MoleculeView.Params.logOffset;
			var color;
			/* Check whether ratio is invalid */
			if (isNaN(ratio) || !isFinite(ratio)) { // Invalid
				color = '';
			} 
			else 
			{ // Valid
				if(ratio>1) {
					ratio=1;
					Eplant.Views.MoleculeView.Params.maxFrequency = frequency;
				}
				var red = midColor.red + Math.round((maxColor.red - midColor.red) * ratio);
				var green = midColor.green + Math.round((maxColor.green - midColor.green) * ratio);
				var blue = midColor.blue + Math.round((maxColor.blue - midColor.blue) * ratio);
				color = ZUI.Util.makeColorString(red, green, blue);
			}
			
			return color;
		}
		
		function getEcotypesSpan(snpsDetailMap,key) {
			
			var ecotypesSpan = $('<span style="font-size:14px;white-space: nowrap;" class="ecotypesSpan"><img src="img/available/world.png" style="width:20px;vertical-align: middle;margin: -2px 5px 0px 2px;"/>View ecotypes with this SNP</span>');
			
			var ecotypesText = '<div class="selectable" style="max-height:200px;overflow: auto;font-size: 14px;"><table>';
			
			for (var i=0, len=snpsDetailMap[key].length; i<len; i++) {
				var text= snpsDetailMap[key][i];
				var serviceProvider = text.split("_")[0];
				var link = null;
				if(serviceProvider.startsWith("SALK")){
					link="http://1001genomes.org/accessions-salk.html";
				}
				else if(serviceProvider.startsWith("MPI")){
					link="http://1001genomes.org/accessions-mpi.html";
				}
				else if(serviceProvider.startsWith("JGI")){
					link="http://1001genomes.org/accessions-legacy.html";
				}
				else if(serviceProvider.startsWith("GMI")){
					link="http://1001genomes.org/accessions-gmi.html";
				}
				
				if(link){
					ecotypesText+="<tr><td><a href="+link+" target='_blank'>"+snpsDetailMap[key][i]+"</a></td></tr>";
					
					}else{
					ecotypesText+="<tr><td>"+snpsDetailMap[key][i]+"</td></tr>";
					
				}
				
			}
			
			ecotypesText+='</table></div>';
			$(ecotypesSpan).attr("data-tooltip-content",ecotypesText);
			
			
			return ecotypesSpan;
		}
		
		/**
			* select/unselect residue
		*/
		function setResidue(residueSpan) {
			
			//I'm getting the color from the first atom from the residue, I think that's enough
			var resColor = Jmol.evaluateVar( myJmolOb, "{"+residueSpan+"}[0].color " );
			
			if(mySequence[residueSpan].selected){
				//$(jq(strResidue)).switchClass( "selected", "deselected", 2000, "easeInOutQuad" );
				$(jq(residueSpan)).removeClass('selected').addClass('deselected');
				Jmol.script(myJmolOb, 'select '+ residueSpan +' ; color {'+mySequence[residueSpan].previousColor+'};wireframe 0.0; spacefill off;');
				mySequence[residueSpan].selected=false;
				}else{
				mySequence[residueSpan].previousColor=resColor;
				$(jq(residueSpan)).removeClass('deselected').addClass('selected');
				Jmol.script(myJmolOb, 'select '+ residueSpan +' and (sidechain or alpha); color "#99cc00";wireframe 0.3; spacefill off;');
				mySequence[residueSpan].selected=true;
			}
		}
		
		/**
			* put back the colors of selected residues after select cdd or pfam domain.
			* TODO fix this avoiding remove the colors instead coloring again.
		*/
		function recolorSelected() {
			
			var seq = mySequence.fullseq3letterArr;
			
			for(var i=0, len=seq.length; i<len; i++) {
				if(mySequence[seq[i]].selected){
					Jmol.script(myJmolOb, 'select '+ seq[i] +' and (sidechain or alpha); color "#99cc00";');
				}
			}
			
		}
		
		/**
			* set color of residues by index
		*/
		function setResiduesByIndexes(domainSpan, arrayOfIndexes) {
			
			var commandArr = [];	
			
			for (var i = 0; i < arrayOfIndexes.length; i++) {
				commandArr.push(mySequence.fullseq3letterArr[arrayOfIndexes[i]]);		
			}
			
			var command = 'select ' + commandArr.join(', ') + ' ; color "#0000FF";'
			
			//upadte opaque translucent
			var val = $(pDiv + "input[name="+config.CSS.names.color+"]:checked").val();
			command +='select protein or nucleic; color '+val+'; select none;'
			
			Jmol.script(myJmolOb, command);		
		}
		
		/**
			* 
		*/
		function resetJsmolColors(){
			Jmol.script(myJmolOb, config.application.resetColorsScript);//
		}
		
		/**
			* set color by range
		*/
		function setColorByRange(startIndex, endIndex) {
			
			var jsmolCommand = ''; //holds string command to send to jsmol
			var commandArr = [];
			
			for(var i = startIndex-1; i<=endIndex-1; i++){
				//I'm getting the color from the first atom from the residue, I think that's enough
				//Jmol.evaluateVar( myJmol, "{"+res[i]+" and *.CA}.color " );//get carbon alpha http://chemapps.stolaf.edu/jmol/docs/misc/atomInfo.txt
				//var resColor = Jmol.evaluateVar( myJmolOb, "{"+residueSpan+"}[0].color " );		
				
				commandArr.push(mySequence.fullseq3letterArr[i]);
			}
			
			jsmolCommand = 'select '+ commandArr.join(', ') + ' ; color "#0000FF"; ';
			
			//update opaque translucent
			var val = $(pDiv + "input[name="+config.CSS.names.color+"]:checked").val();
			jsmolCommand +='select protein or nucleic; color '+val+'; select none;'
			
			Jmol.script(myJmolOb, jsmolCommand);
		}
		
		/**
			* takes care of escaping non valid ID characters and places a "#" at the beginning of the ID string: $( jq( "some.id" ) )
			* http://learn.jquery.com/using-jquery-core/faq/how-do-i-select-an-element-by-an-id-that-has-characters-used-in-css-notation/
		*/
		function jq( myid ) {	
			if(myid)
			return "#" + myid.replace( /(:|\.|\[|\]|,|\s)/g, "\\$1" );
			else
			return "";
		}
		
		/**
			* Reloads current file, will trigger LoadStructCallback callback function
			* @param
			* @return
		*/
		function reloadModel(){
			$(pDiv+"input:radio").prop("checked", false);//remove checked radios buttons
			
			//to reset to original checked attributes on html (they have hardcoded checked="checked" at html)
			$(pDiv+'input[type=radio]').prop('checked', function () {
				return this.getAttribute('checked') == 'checked';
			});
			
			//reset zoom values
			$(pDiv+"#zoom-slider").slider("value", 70);
			$(pDiv+"#zoomvalue").html($(pDiv+"#zoom-slider").slider("value"));
			
			//reset move controls
			updown = -5;//check the default script for the starting point
			leftright = 5;//check the default script for the starting point
			
			Jmol.script(myJmolOb, 'load;');//load again the same structure
			
		}
		
		/**
			* put here functions and variables you want to be public
		*/
		return {
			Info : Info,
			config : config,
			init : init,
			ajaxGetPfamDomains : ajaxGetPfamDomains,
			ajaxGetCDDfeatures : ajaxGetCDDfeatures,
			setResidue : setResidue,
			setResiduesByIndexes : setResiduesByIndexes,
			resetJsmolColors : resetJsmolColors,
			setColorByRange : setColorByRange,
			jq : jq,
			reloadModel : reloadModel,
			setControls : setControls,
			mySequence : mySequence,
			myJmolOb : myJmolOb,
			pickCallback : pickCallback,
			hoverCallback : hoverCallback
		};
	};
	
	// -----------------------------------------
	
	//var oMolviewer;	
	
	
