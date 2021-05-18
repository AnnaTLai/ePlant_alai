(function() {

	/**
		* Eplant.Views.ExperimentalView class
		* Coded by Hans Yu
		* UI designed by Jamie Waese
		*
		* ePlant View for browsing gene expression data of plant tissues during development as eFP.
		*
		* @constructor
		* @augments Eplant.Experimental.EFPView
		@param {Eplant.GeneticElement} geneticElement The GeneticElement associated with this view.
	*/
	Eplant.Views.LinkoutView = function(geneticElement) {
		// Get constructor
		var constructor = Eplant.Views.LinkoutView;

		// Call parent constructor
		Eplant.View.call(this,
		constructor.displayName,			// Name of the View visible to the user
		constructor.viewName,
		constructor.hierarchy,			// Hierarchy of the View
		constructor.magnification,			// Magnification level of the View
		constructor.description,			// Description of the View visible to the user
		constructor.citation,			// Citation template of the View
		constructor.activeIconImageURL,		// URL for the active icon image
		constructor.availableIconImageURL,		// URL for the available icon image
		constructor.unavailableIconImageURL	// URL for the unavailable icon image
		);
		this.geneticElement = geneticElement;
		this.xmlURL = 'data/linkout/linkoutOptions.xml';
		this.services = [];
		this.dialog=null;
		this.domContainer=null;
		this.domSelectList =null;		// DOM element of the list
		this.domPreviewHolder =null;		// DOM element of the Preview Holder
		Eplant.queue.add(this.loadData,this,null,this.geneticElement.identifier+"_Loading");
	};
	ZUI.Util.inheritClass(Eplant.View, Eplant.Views.LinkoutView);	// Inherit parent prototype

	Eplant.Views.LinkoutView.viewName = "LinkoutView";
	Eplant.Views.LinkoutView.displayName = "Linkout Options";
	Eplant.Views.LinkoutView.hierarchy = "genetic element";
	Eplant.Views.LinkoutView.magnification = 100;
	Eplant.Views.LinkoutView.description = "Linkout Options";
	Eplant.Views.LinkoutView.citation = "";
	Eplant.Views.LinkoutView.activeIconImageURL = "img/active/externalTools.png";
	Eplant.Views.LinkoutView.availableIconImageURL = "img/available/externalTools.png";
	Eplant.Views.LinkoutView.unavailableIconImageURL = "img/unavailable/externalTools.png";
	Eplant.Views.LinkoutView.viewType = "zui";

	Eplant.Views.LinkoutView.prototype.show = function() {

		/* Show SelectList */
		this.dialog = DialogManager.artDialog(this.domContainer);

		/*if(Eplant.showViewIntruction&&!Eplant.viewInstructions[this.magnification]){
			if(this.viewInstruction){
			DialogManager.artDialogDynamic(this.viewInstruction);
			Eplant.viewInstructions[this.magnification] = true;
			}
		}*/
	};

	Eplant.Views.HeatMapView.prototype.remove = function() {
		Eplant.View.prototype.remove.call(this);

	};

	/**
		* Inactive callback method.
		*
		* @override
	*/
	Eplant.Views.LinkoutView.prototype.hide = function() {

		/* Hide SelectList */
		if(this.dialog)
		{
			this.dialog.close();
		}
	};

	Eplant.Views.LinkoutView.prototype.loadData = function() {
        /* Get eFP definition */
        $.ajax({
            type: "GET",
            url: this.xmlURL,
            dataType: "xml",
            success: $.proxy(function(response) {
				var servicesXml = $(response).find('service');
                for (var n = 0; n < servicesXml.length; n++) {
					var serviceData = servicesXml[n];
					var service = {
						name: serviceData.attributes['name'].value,
						type: serviceData.attributes['type']?serviceData.attributes['type'].value:'',
						connect: $('connect', serviceData).attr('url'),
						link: $('link', serviceData).attr('url'),
						icon: $('icon', serviceData).attr('filename'),
						noresult_regex: $('noresult_regex', serviceData).attr('pattern'),
						image: $('<img/>)',{
							src:$('image', serviceData).attr('filename')
							}).css({
							width:'100%',
							display:'block'
						})
					}
					this.services.push(service);
				}
				this.createDOM();
			}, this)
		});
	};

	Eplant.Views.LinkoutView.prototype.createDOM = function() {
		/* Create container DOM element */
		this.domContainer= document.createElement("div");
		/* Create title DOM element */
		this.domTitle = document.createElement("span");

		/* Set CSS class of title for styling */
		$(this.domTitle).addClass("eplant-selectList-title");

		/* Set title content */
		$(this.domTitle).html("Links to External Tools");


		/* Add title DOM element to the container */
		$(this.domContainer).append(this.domTitle);

		var table = document.createElement('TABLE');
		$(table).css({width:'100%',height:'100%','table-layout': 'fixed'});

    	var tableBody = document.createElement('TBODY');
    	table.appendChild(tableBody);

		var tr = document.createElement('TR');
		tableBody.appendChild(tr);

		var td = document.createElement('TD');


		this.domSelectList = document.createElement("div");
		/* Set CSS class of container for styling */
		$(this.domSelectList).addClass("efp-selectList");

		/* Disable context menu */
		this.domSelectList.oncontextmenu = function() {
			return false;
		};






		$(td).append(this.domSelectList);
		tr.appendChild(td);

		td = document.createElement('TD');

		var br = document.createElement("br");
		$(td).append(br);

		this.domPreviewHolder= document.createElement("div");
		/* Set CSS class of container for styling */
		/* Disable context menu */
		this.domPreviewHolder.oncontextmenu = function() {
			return false;
		};


		$(td).append(this.domPreviewHolder);
		tr.appendChild(td);

		$(table).appendTo(this.domContainer);

		for(var i=0;i<this.services.length;i++)
		{
			var service = this.services[i];
			Eplant.queue.add(function(){

				var serviceDOM = document.createElement("span");
				var wrapper = {
					view:this.view,
					service:this.service,
					serviceDOM:serviceDOM
				};

				$(serviceDOM).addClass("efp-selectList-choice");
				$(serviceDOM).attr('href',this.service.link.replace('GENE',this.view.geneticElement.identifier));
				$(serviceDOM).text(this.service.name.replace('GENE',this.view.geneticElement.identifier));
				$(serviceDOM).on({
					click:$.proxy(function(){
						window.open(this.service.link.replace('GENE',this.view.geneticElement.identifier), '_blank');
					}, wrapper),
					mouseenter: $.proxy(function(){
						$(this.serviceDOM).addClass("eplant-selectList-choice-selected");
						$(this.view.domPreviewHolder).append(this.service.image);
					}, wrapper),
					mouseleave: $.proxy(function(){
						$(this.serviceDOM).removeClass("eplant-selectList-choice-selected");
						$(this.service.image).detach();
					}, wrapper)
				});
				$(this.view.domSelectList).append(serviceDOM);
			},{view:this,service:service},null,this.geneticElement.identifier+"_Loading");
		}
		Eplant.queue.add(this.loadFinish,this,null,this.geneticElement.identifier+"_Loading");
	};
})();
