
var Molviewer = function(customConfig, customInfo) {
	/**
		* http://www.w3.org/wiki/JavaScript_best_practices
		* configuration options
	*/
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
				divSeqTitle : 'divSeqTitle',
				divSeqContainner : 'divSeqContainner',
				btnCDDtryAgain : 'btnCDDtryAgain',
				btnPfamTryAgain : 'btnPfamTryAgain',
				divMenu : 'divMenu',
				divMain : 'divMain',
				divBottomWrapper: 'divBottomWrapper',
				jsMolviewer : 'oMolviewer'
			},
			names : {
				rdFeature : 'feature'		
			}
		},
		/*
			* Application settings
		*/
		application : {
			//the name to use to create the jmol object
			jMolObject : 'myJmol',
			//
			pfamUrlBar : '//bar.utoronto.ca/~gfucile/cdd3d/cgi-bin/PfamAnnot.cgi',
			//
			pfamUrlDev : 'ProxyServlet',
			//
			pfamParams : 'FASTAseq',
			//
			cddUrlBar : '//bar.utoronto.ca/~gfucile/cdd3d/cgi-bin/CDDannot.cgi',
			//
			cddUrlDev : 'ProxyServlet',
			//
			cddParams : 'FASTAseq',
			//
			defaultLoadScript :	"isDssp = false;set defaultVDW babel;"+
			"select protein or nucleic;cartoons Only;color \"#C9C9C9\";frank OFF;set disablePopupMenu true;"+
			"select *;zoom 70;translate x 5;translate y -5;display !water;",
			pickCallback : "pickCallback",
			//
			resetColorsScript : 'select not (protein or nucleic); color cpk; select protein or nucleic; color \'#C9C9C9\';',
			//'load "//bar.utoronto.ca/eplant_legacy/java/Phyre2-Models/Phyre2_AT1G01200.1.pdb"'
			load: 'load =2HHB'
		}
		
	}
	
	/**
		* initial JSmol setup 
	*/
	var Info = {
		height : '100%', 		
		width : '100%',
		use : "HTML5",
		//to use the php from my server http://104.197.50.15/myphptest/php/jsmol.php
		serverURL : "http://chemapps.stolaf.edu/jmol/jsmol/php/jsmol.php",
		src : null,
		LoadStructCallback : config.CSS.IDs.jsMolviewer+".setControls",
		script: "set defaultLoadScript '" + config.application.defaultLoadScript + "';"+config.application.load,
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
	
	var res;
	var myJmolOb;
	var xhrPool = []; //holds ajax request functions (to abort if necessary). http://jsfiddle.net/s4pbn/3/
	var mySequence = {}; //holds info from each residue
	var codeArray = {'ALA':'A','ARG':'R','ASN':'N','ASP':'D','CYS':'C','GLU':'E',
		'GLN':'Q','GLY':'G','HIS':'H','ILE':'I','LEU':'L','LYS':'K','MET':'M',
	'PHE':'F','PRO':'P','SER':'S','THR':'T','TRP':'W','TYR':'Y','VAL':'V'};
	var pDiv;
	/**
		* Load jsmol viewer with supplied params
	*/
	function init() {
		
		pDiv = jq(config.CSS.IDs.parentDivId)+" "; //just to make the var name shorter
		
		console.log('initializing Molviewer');
		
	    //abort all running ajax requests
	    xhrPool.abortAll = function() {
	    	console.log('aborting all ajax requests');
	        $(this).each(function(idx, jqXHR) {
	            jqXHR.abort();
			});
	        $.xhrPool = [];
		};
	    
	    //default values for all ajax requests
	    $.ajaxSetup({
	        beforeSend: function(jqXHR) {
	            xhrPool.push(jqXHR);
			},
	        complete: function(jqXHR) {
	            var index = xhrPool.indexOf(jqXHR);
	            if (index > -1) {
	                xhrPool.splice(index, 1);
				}
			}
		});
	    
	    //create and put the jsmol on screen
	    //http://wiki.jmol.org/index.php/Jmol_JavaScript_Object/Functions
	    Jmol.setDocument(0);
	    Jmol.getApplet(config.application.jMolObject, Info);// creates the object but does not insert it
	    myJmolOb = window[config.application.jMolObject];//used to have a reference to jMol object created above
	    
	    
	    
	    //-------to work at jsmol from an iframe. Pass as param the structure you want to load. Jim from BAR requested it
	    //example: http://localhost:8080/testjsmol/index29.html?loadpdb=4QCD
	    var structure = getQueryStringByName('loadpdb');
	    if(structure){
	    	Jmol.script(myJmolOb, "load ="+structure);
		}
	    //example: 
	    //http://localhost:8080/testjsmol/index29.html?loadfile=//bar.utoronto.ca/eplant_legacy/java/Phyre2-Models/Phyre2_AT1G01200.1.pdb
	    var structure = getQueryStringByName('loadfile');
	    if(structure){
	    	Jmol.script(myJmolOb, "load \""+structure+"\"");
		}
	    //-------hack end
	    
	    
	    $(pDiv+jq(config.CSS.IDs.jmolcontent)).html(Jmol.getAppletHtml(myJmolOb));//insert the object in the page
		
	    //then add controls for Options
		$(pDiv+"input:radio[name="+config.CSS.names.rdFeature+"]").change(function(event) {
		    resetJsmolColors();
		    switch($(this).val()) {
				case 'hydro':
		    	Jmol.script(myJmolOb, 'select hydrophobic; color mediumblue; '+
				'select polar; color red;wireframe 0.0; spacefill 0.0; select charged; color "#FFFF00";');
		        break;
				case 'temp':
		    	Jmol.script(myJmolOb, 'select all; color relativeTemperature; ');
		        break;
				default:
		    	break;
			}
		});
		
		$(pDiv+jq(config.CSS.IDs.btnReset)).click(function(e) {
			reloadModel();
		});
		
		//set PickCallback function to run when user clicks on the model
		Jmol.script(myJmolOb, "set PickCallback '"+config.CSS.IDs.jsMolviewer+"."+config.application.pickCallback+"';");
		return myJmolOb;
	}
	
	/**
		* callback method - set all controls related with jsmol protein structure
	*/
	function setControls(a,b,c,d,e,f,g,h){
		var aa = '' + a;	var bb = '' + b;	var cc = '' + c;
		var dd = '' + d;	var ee = '' + ee;	var ff = '' + ff;
		var gg = '' + gg;	var hh = '' + hh;
	    //console.log('aa: '+aa+'\n'+'bb: '+bb+'\n'+'cc: '+cc+'\n'+'dd: '+dd+'\n'+'ee: '+ee+'\n'+'ff: '+ff+'\n'+'gg: '+gg+'\n'+'hh: '+hh);
		
	    if(cc != 'zapped'){//avoid call twice, happens when load a new file using the input field
			
			var theSeq = Jmol.evaluateVar( myJmolOb, "show('residues')" );
			res = theSeq.split("\n");//global var
			mySequence.sequenceArray = res; //holds array sequence one letter code
			console.log('res: '+res);
			var seqToShow ='';
			
			//transform 3 letter in 1 letter to call ajax
			var fullseq = '';
			for (var i=0; i<res.length; i++) {
				
				var matches = res[i].match(/\[(.*?)\]/);
				
				if (matches) {
				    if(codeArray[matches[1]])
					fullseq += codeArray[matches[1]];
				}			
			}
			console.log("1letterseq: "+fullseq);
			mySequence.fullseq = fullseq;
			//ajax call get Pfam domains
			ajaxGetPfamDomains(fullseq);
			//ajax call get CDD domains
			ajaxGetCDDfeatures(fullseq);
			
			for (var i=0; i<res.length; i++) {
				var res1letter ='';		
				for (var x in codeArray){		
					if(res[i].indexOf(x) > -1){
						res1letter = codeArray[x];
						mySequence[res[i]]={oneLetterCode:codeArray[x],threeLetterCode:x,selected:false};
						
						break;
					}
				}
				if(res1letter.length){//only aminoacids, skip anything else (hem, h2o, etc)
					seqToShow += "<span class='sequence deselected icon hint--top hint--success hint-rounded' id=\'"+res[i]+"\' data-hint=\'"+res[i]+"\'  onclick=\'"+config.CSS.IDs.jsMolviewer+".setResidue(this);\'>"+res1letter+"</span>";
				}
			}
			
			//add space on both sides to show both sequence ends
			var fadeWidth = $('#fadeLeft, #fadeRight').width();
			var spanExtraSpace = "<span class='alignment' style='width: "+(fadeWidth/2)+"px;' ></span>";
			seqToShow = spanExtraSpace + seqToShow + spanExtraSpace;
			
			$(jq(config.CSS.IDs.divSeqTitle)).empty().append('Sequence');
			
			$(pDiv+jq(config.CSS.IDs.protSeq)).empty().append(seqToShow);
			
			//avoid left menu overlaps the bottom div
			setMenuMaxHeight();
			
			
			}else{//load a new structure takes time so remove all options from the older structure to avoid use old controls to interact with the new loaded structure
	    	$(pDiv+jq(config.CSS.IDs.PfamDomains)).empty();
	    	$(pDiv+jq(config.CSS.IDs.CDDdomains)).empty();
	    	$(pDiv+jq(config.CSS.IDs.viewOptions)).empty();
	    	$(pDiv+jq(config.CSS.IDs.protSeq)).empty();
		}
		Eplant.Views.MoleculeView.loadedFunctions[this.config.callback]();
		//if(Eplant.Views.MoleculeView.fisrtLoad && Eplant.Views.MoleculeView.fisrtLoadDfd) Eplant.Views.MoleculeView.fisrtLoadDfd.resolve();
	}
	
	/**
		* pickCallback method
	*/
	function pickCallback(a,b,c,d,e,f,g,h){
		var aa = '' + a;	var bb = '' + b;	var cc = '' + c;
		var dd = '' + d;	var ee = '' + ee;	var ff = '' + ff;
		var gg = '' + gg;	var hh = '' + hh;
	    console.log('aa: '+aa+'\n'+'bb: '+bb+'\n'+'cc: '+cc+'\n'+'dd: '+dd+'\n'+'ee: '+ee+'\n'+'ff: '+ff+'\n'+'gg: '+gg+'\n'+'hh: '+hh);
	    
	    var clicked = bb.split('.')[0];//get everything until first "." 
	    
	    if(mySequence[clicked]){
	    	setResidue(clicked);
			}else{
	    	console.log('ERROR: molviewer didnt find the clicked element: '+ clicked);
		}
	    
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
		* update max-height property from left options menu to avoid overlap the
		* fixed div (divBottomWrapper) at the bottom
	*/
	function setMenuMaxHeight() {
    	var outerHeight = $(pDiv+jq(config.CSS.IDs.divBottomWrapper)).outerHeight(true);
    	var docHeight = $(pDiv+ jq("divMainJsmol")).height();//TODO fix
    	$(pDiv+ jq(config.CSS.IDs.divMenu)).css('max-height',docHeight - outerHeight );
	}
	
	/**
		* 
	*/
	function ajaxGetCDDfeatures(fullseq){
		
		console.log('calling CDD ajax');
	    $(pDiv+jq(config.CSS.IDs.CDDdomains)).empty().append("<span class='loading'>Loading CDD features</span>");
		
		$.ajax({
		    type: 'POST',
		    dataType: 'json',
		    url: config.application.cddUrlBar,
		    timeout: 25000,
		    data: { "url" : config.application.cddUrlBar,"FASTAseq": fullseq },
		    cache: false,
		    success: function(data, textStatus, jqXHR){
		    	console.log('fullseq '+fullseq+ " url " + config.application.cddUrlBar);
	    		$(pDiv+jq(config.CSS.IDs.CDDdomains)).empty();
	    		console.log('cdd result from json:\n'+JSON.stringify(data));
	    		
	    		if(Object.keys(data).length==0){//empty
	    			$(pDiv+jq(config.CSS.IDs.CDDdomains)).append("<span> No features found</span> <br/>");
	    			
					}else{
					
	    			$.each(data, function(key, value) {
	    				var numberPattern = /\d+/g;//only numbers
						
	    				var arIndex = value.match( numberPattern );//hold the indexes
	    				console.log('arIndex '+arIndex);
	    				for(x in arIndex){
	    					console.log('x '+x+' arIndex '+arIndex[x]);
						}
	    				
	    				//change spaces to _ and removes non letters or non numbers to use as ids
	    				var keyId = key.replace(/ /g, "_").replace(/[^a-zA-Z0-9-_]/g, '');
						
		    			$(pDiv+jq(config.CSS.IDs.CDDdomains)).append("<span id='"+config.CSS.IDs.parentDivId+keyId +"span' class='radioMenu'><input type='radio' id='"+config.CSS.IDs.parentDivId+keyId+"' name='"+config.CSS.names.rdFeature+"' value='TODO' style='' ><label for='"+config.CSS.IDs.parentDivId+keyId+"'>"+ key+" (" +value+")</label></span>");
						
	    				$(jq(config.CSS.IDs.parentDivId+keyId)).click(function(e) {
	    					setResiduesByIndexes(e, arIndex);
						});
					});
				}
			},
		    error: function(xhr, textStatus, errorThrown){
				console.log('cdd request failed: '+xhr.responseText+'. textStatus: '+textStatus);
				if(textStatus==="abort") {
					$(pDiv+jq(config.CSS.IDs.CDDdomains)).empty();
					}else if(textStatus==="timeout") {
					$(pDiv+jq(config.CSS.IDs.CDDdomains)).empty().append("<span style='white-space: normal;'>CDD features loading error. Try again?</span><br> <button class='greenbutton' id='"+config.CSS.IDs.btnCDDtryAgain+"' style='margin: 10px;'>Try again</button>");  	    	    
					$(pDiv+jq(config.CSS.IDs.btnCDDtryAgain)).click(function(e) {
						ajaxGetCDDfeatures(mySequence.fullseq);
					});
					}else{
					$(pDiv+jq(config.CSS.IDs.CDDdomains)).empty().append("<span style='white-space: normal;'>CDD features loading error. Try again?</span><br> <button class='greenbutton' id='"+config.CSS.IDs.btnCDDtryAgain+"' style='margin: 10px;'>Try again</button>");   	    	    
					$(pDiv+jq(config.CSS.IDs.btnCDDtryAgain)).click(function(e) {
						ajaxGetCDDfeatures(mySequence.fullseq);
					});
				}
			}
		});
		
	}
	
	/**
		* 
	*/
	function ajaxGetPfamDomains(fullseq){
		console.log('calling pfam at bar.utoronto.ca');
		
		$(pDiv+jq(config.CSS.IDs.PfamDomains)).empty().append("<span class='loading' >Loading Pfam domains</span>");
		
		$.ajax({
		    type: 'POST',
		    dataType: 'json',
		    url: config.application.pfamUrlBar,
		    timeout: 25000,
		    data: {"FASTAseq" : fullseq, "url" : config.application.pfamUrlBar},
		    cache: false,
		    success: function(data, textStatus, jqXHR ){
		    	$(pDiv+jq(config.CSS.IDs.PfamDomains)).empty();
				
	    		console.log('pfam result from json:');
	    		console.log(JSON.stringify(data));
	    		
	    		if(Object.keys(data).length==0){//empty
	    			$(pDiv+jq(config.CSS.IDs.PfamDomains)).append("<span> Error loading domains</span> <br/>");
					}else{
		    		$.each(data, function(key, value) {
		    			console.log( 'key: '+key + " value:" + value +' PfamAnnot: '+value.PfamAnnot+' startIndex: '+value.startIndex+
						' endIndex: '+value.endIndex+' Expect: '+value.Expect+' domainName: '+value.domainName );
		    			
		    			key = key.replace(/\./g,"");//removes dot from the key
						
		    			$(pDiv+jq(config.CSS.IDs.PfamDomains)).append("<span id='"+config.CSS.IDs.parentDivId+key+"span' class='radioMenu'><input type='radio' id='"+config.CSS.IDs.parentDivId+key +"' name='"+config.CSS.names.rdFeature+"' value='TODO' style=''><label for='"+config.CSS.IDs.parentDivId+key +"'>" + value.PfamAnnot+": " + value.startIndex+" - " + value.endIndex+" ("+value.domainName+")</label></span>");
		    			
		    			$(jq(config.CSS.IDs.parentDivId+key)).on("click", function(){
		    				setColorByRange(value.startIndex, value.endIndex);
						});
					});
				}
			},
		    error: function(xhr, textStatus, errorThrown){
		    	console.log('Pfam request failed: '+xhr.responseText+'. textStatus: '+textStatus);
		    	if(textStatus==="abort") {
		    		$(pDiv+jq(config.CSS.IDs.PfamDomains)).empty();
					}else if(textStatus==="timeout") {
		    		$(pDiv+jq(config.CSS.IDs.PfamDomains)).empty().append("<span style='white-space: normal;'>Pfam domain loading error. Try again?</span><br> <button class='greenbutton' id='"+config.CSS.IDs.btnPfamTryAgain+"'>Try again</button>");   	            
		    		$(pDiv+jq(config.CSS.IDs.btnPfamTryAgain)).click(function(e) {
		    			ajaxGetPfamDomains(mySequence.fullseq);
					});
					}else{
					$(pDiv+jq(config.CSS.IDs.PfamDomains)).empty().append("<span style='white-space: normal;'>Pfam domain loading error. Try again?</span><br> <button class='greenbutton' id='"+config.CSS.IDs.btnPfamTryAgain+"'>Try again</button>");
					$(pDiv+jq(config.CSS.IDs.btnPfamTryAgain)).click(function(e) {
		    			ajaxGetPfamDomains(mySequence.fullseq);
					});
				}
			}
		});
		
	}
	
	/**
		* 
	*/
	function scrollLoggerToBottom(){
		// http://www.w3schools.com/jsref/prop_element_scrollheight.asp
		//scroll to bottom
		$(pDiv+"#logger").scrollTop($(pDiv+'#logger').prop('scrollHeight'));
	}
	
	/**
		* select/unselect residue
	*/
	function setResidue(residueSpan) {
		
		var strResidue;
		
		if (jQuery.type(residueSpan) === "string") {//string
			strResidue = residueSpan;
			}else{
			strResidue = $(residueSpan).attr("id")
		}
		
		//I'm getting the color from the first atom from the residue, I think that's enough
		var resColor = Jmol.evaluateVar( myJmolOb, "{"+strResidue+"}[0].color " );
		
		if(mySequence[strResidue].selected){
			$(jq(strResidue)).removeClass('selected');
			$(jq(strResidue)).addClass('deselected');
			Jmol.script(myJmolOb, 'select '+ strResidue +' ; color {'+mySequence[strResidue].previousColor+'};wireframe 0.0; spacefill off;');
			mySequence[strResidue].selected=false;
			}else{
			mySequence[strResidue].previousColor=resColor;
			$(jq(strResidue)).removeClass('deselected');
			$(jq(strResidue)).addClass('selected');
			Jmol.script(myJmolOb, 'select '+ strResidue +' and (sidechain or alpha); color "#99cc00";wireframe 0.3; spacefill off;');
			mySequence[strResidue].selected=true;
		}
	}
	
	/**
		* set color of residues by index
	*/
	function setResiduesByIndexes(domainSpan, arrayOfIndexes) {
		
		var jsmolCommand = ''; //holds string command to send to jsmol	
		resetJsmolColors();
		
		console.log('arrayOfIndexes: '+arrayOfIndexes.constructor.name );
		for (var i = 0; i < arrayOfIndexes.length; i++) {
			
			var y = arrayOfIndexes[i];
			var residueSpan = res[arrayOfIndexes[i]];
			
			jsmolCommand += 'select '+ residueSpan +' ; color "#CCE77B";';
		}
		
		console.log("command to send to jsmol: "+ jsmolCommand);
		Jmol.script(myJmolOb, jsmolCommand);
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
		resetJsmolColors();
		
		for(var i = startIndex-1; i<=endIndex-1; i++){
			var residueSpan = res[i];
			//I'm getting the color from the first atom from the residue, I think that's enough
			//Jmol.evaluateVar( myJmol, "{"+res[i]+" and *.CA}.color " );//get carbon alpha http://chemapps.stolaf.edu/jmol/docs/misc/atomInfo.txt
			var resColor = Jmol.evaluateVar( myJmolOb, "{"+residueSpan+"}[0].color " );		
			
			jsmolCommand += 'select '+ residueSpan +' ; color "#CCE77B";';
			
		}
		console.log("command to send to jsmol: "+ jsmolCommand);
		Jmol.script(myJmolOb, jsmolCommand);
	}
	
	/**
		* takes care of escaping non valid ID characters and places a "#" at the beginning of the ID string: $( jq( "some.id" ) )
		* http://learn.jquery.com/using-jquery-core/faq/how-do-i-select-an-element-by-an-id-that-has-characters-used-in-css-notation/
	*/
	function jq( myid ) {	
		if(myid)
		return "#" + myid.replace( /(:|\.|\[|\]|,)/g, "\\$1" );
		else
		return "";
	}
	
	/**
		* Reloads current file, will trigger LoadStructCallback callback function
		* @param
		* @return
	*/
	function reloadModel(){
		xhrPool.abortAll();//stop all ajax calls
		$(pDiv+"input:radio").attr("checked", false);//remove checked radios buttons
		Jmol.script(myJmolOb, 'load;');//load again the same structure
		
	}
	
	/**
		* put here functions and variables you want to be public
	*/
	return {
		showMessage : function() {
			// TODO
		},
		Info : Info,
		config : config,
		init : init,
		scrollLoggerToBottom : scrollLoggerToBottom,
		ajaxGetPfamDomains : ajaxGetPfamDomains,
		ajaxGetCDDfeatures : ajaxGetCDDfeatures,
		setResidue : setResidue,
		setResiduesByIndexes : setResiduesByIndexes,
		resetJsmolColors : resetJsmolColors,
		setColorByRange : setColorByRange,
		jq : jq,
		reloadModel : reloadModel,
		setControls : setControls,
		xhrPool : xhrPool,
		mySequence : mySequence,
		myJmolOb : myJmolOb,
		pickCallback : pickCallback
	};
};

// -----------------------------------------

var oMolviewer;	
$(document).ready(function() {
});
