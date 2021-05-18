(function() {

	/**
		* Eplant.WordCloudDialog class
		* Coded by Hans Yu
		* UI designed by Jamie Waese
		*
		* Describes a GeneticElement information dialog.
		*
		* @constructor
		* @param {Eplant.GeneticElement} geneticElement The GeneticElement associated with this dialog.
		* @param {Number} x The x-coordinate position of the dialog.
		* @param {Number} y The y-coordinate position of the dialog.
	*/
	Eplant.WordCloudDialog = function() {
		/* Attributes */

		this.domContainer = null;				// DOM container element for the dialog

		/* Create dialog */
		this.createDialog();

	};

	/**
		* Creates the DOM elements of this dialog.
	*/
	Eplant.WordCloudDialog.prototype.createDialog = function() {
		/* DOM container */
		this.domContainer = document.createElement("div");

		var containerElement = document.createElement("div");
		$(containerElement).css({
			'position': 'absolute',
			bottom:'2%',
			left:'-50%',
			width:'80%',
			'margin-left': '65%',
			color:'grey',
			opacity:0.8
		});


		$(containerElement).enableSelection();
		containerElement.style.textAlign = "left";
		containerElement.innerHTML = "Loading citation...";
		var content = '';

		var queryString = "";
		for(var i =0;i<Eplant.activeSpecies.displayGeneticElements.length;i++){
			var geneticElement = Eplant.activeSpecies.displayGeneticElements[i];
			queryString+="gene="+geneticElement.identifier+"&";
		}
		if(queryString.length>0){
			queryString = queryString.substring(0,queryString.length-1);
		}
		$.ajax({
			type: "GET",
			url: "//bar.utoronto.ca/eplant/cgi-bin/gene_cloud.php?" + queryString,//"https://m2sb.org/php/GeneCloudBAR.php?output=graphic&" + queryString,
			timeout:3000
		})
		.done(function(response) {
			var filename="GeneCloud";

			/* Create container DOM element */
			var domContainer= document.createElement("div");

			$(domContainer).css({
				'text-align': 'center'
			});
			var titleContainer= document.createElement("div");


			$(titleContainer).append(
			'<h1>Word cloud based on semantic terms from gene descriptions</h1>');
			$(domContainer).append(titleContainer);

			var img = $('<img />', {
				alt: 'Screenshot',
				src:"//bar.utoronto.ca/eplant/cgi-bin/gene_cloud.php?" + queryString
				}).css({
				'max-width': '100%',
				'max-height': '100%',
				width: 'auto',
				height: 'auto'
			});
			var link = $('<a />', {
				'download':"wordCloud.png",
				'href':'https://m2sb.org/php/GeneCloudBAR.php?output=graphic&'+ queryString
			}).append(img);
			var domImageContainer= document.createElement("div");
			$(domImageContainer).css({
				'overflow': 'hidden',
				border: '1px solid #aaaaaa',
				margin: "0 10%"
			});
			$(domImageContainer).append(link);


			$(domContainer).append(domImageContainer);

			var domOtherFormat = $('<div>');
			/* Set CSS class of title for styling */
			$(domOtherFormat).css({
				'font-size': '30px',
				'line-height': '56px',
				color:'#000'
			});

			var pngLink = $('<a href="https://m2sb.org/php/GeneCloudBAR.php?output=graphic&'+ queryString+'" download="'+filename+'.png">Save PNG Image</a>').addClass("greenDownloadButton");

			$(domOtherFormat).append(pngLink);

			var rawLink = $('<a href="https://m2sb.org/php/GeneCloudBAR.php?output=table&'+ queryString+'" download="'+filename+'.tsv">Save Raw Data</a>').addClass("greenDownloadButton");
			$(domOtherFormat).append(rawLink);


			$(domContainer).append(domOtherFormat);

			var textContainer= document.createElement("div");
			$(textContainer).css({
				'text-align': 'left',
				'margin-top':'15px'
			});

			$(textContainer).append(
			'<p>This script uses a semantic technique to scan over gene descriptions of all the downloaded genes. It returns semantic terms, on a ‘word cloud’ format, that are significantly more represented in the list of genes compared to the whole genome background. It gives complementary yet similar results with GO term enrichment analysis but it does not care about categories. Each word in a description is handled on itself. If this word occurs more than randomly it is kept and displayed. For instance if your list of genes is enriched with the term "myb", "hairs", or "endomembrane" it will be displayed. The size of the words displayed in the cloud is proportional to "occurence x ratio of enrichment".</p><br><p>GeneCloud was written by <a href="mailto:gkrouk@gmail.com">Gabriel Krouk</a>, <a href="mailto:ccarre.univ@gmail.com"  target="_blank">Clément Carré</a> & <a href="mailto:cecile.fizames@supagro.inra.fr"  target="_blank">Cécile Fizames</a> at <a href="https://m2sb.org/?page=AtGeneCloudG"  target="_blank">Montpellier Systems & Synthetic Biology</a></p><p>If you find this useful please cite: <a href="http://dx.doi.org/10.1016/j.molp.2015.02.005"  target="_blank">http://dx.doi.org/10.1016/j.molp.2015.02.005</a>.</p>');
			$(domContainer).append(textContainer);

			DialogManager.artDialog(domContainer);

		})
		.fail(function(e,a,b,c){
			containerElement.innerHTML ='No citation information available for this view.';
		})
	};



	/**
		* Opens the WordCloudDialog.
	*/
	Eplant.WordCloudDialog.prototype.open = function() {

	};

	/**
		* Closes the WordCloudDialog.
	*/
	Eplant.WordCloudDialog.prototype.close = function() {
		if(this.dialog){

			this.dialog.close();
		}
	};

	/**
		* Cleans up the WordCloudDialog.
	*/
	Eplant.WordCloudDialog.prototype.remove = function() {
		if(this.dialog){

			this.dialog.close();
		}
	};

})();
