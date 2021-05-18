(function() {

  /**
    * Eplant.Views.PublicationView class
    *
    * @constructor
    * @param {Eplant.GeneticElement} The GeneticElement associated with this view.
  */
  Eplant.Views.PublicationView = function(geneticElement) {
    // Get constructor
    var constructor = Eplant.Views.PublicationView;

    // Call parent constructor
    Eplant.View.call(this,
    constructor.displayName,      // Name of the View visible to the user
    constructor.viewName,
    constructor.hierarchy,      // Hierarchy of the View
    constructor.magnification,      // Magnification level of the View
    constructor.description,      // Description of the View visible to the user
    constructor.citation,      // Citation template of the View
    constructor.activeIconImageURL,    // URL for the active icon image
    constructor.availableIconImageURL,    // URL for the available icon image
    constructor.unavailableIconImageURL  // URL for the unavailable icon image
    );

    // Attributes
    this.geneticElement = geneticElement;
    this.viewMode ="geneinfo";

    if(this.name)
    {
      $(this.labelDom).empty();
      this.viewNameDom = document.createElement("span");
      var labelText = this.geneticElement.identifier;
      if (this.geneticElement.aliases && this.geneticElement.aliases.length && this.geneticElement.aliases[0].length) {
        labelText += " / " + this.geneticElement.aliases.join(", ");
      }
      var text = this.name+': '+labelText;
      /*if(this.geneticElement.isRelated){
        text += ", "+this.geneticElement.identifier+" correlates to "+this.geneticElement.relatedGene.identifier+" with an r-value of "+this.geneticElement.rValueToRelatedGene;
      }*/
      this.viewNameDom.appendChild(document.createTextNode(text));
      $(this.viewNameDom).appendTo(this.labelDom);
    }


    this.domContainer = document.createElement("div");

    $(this.domContainer).attr('id','geneInfo'+this.geneticElement.identifier);
    $(this.domContainer).css({
      position: 'relative',
      width: '100%',
      height: '100%',
      'z-index': '-1',
    });
    this.tableContainer=null;

    this.loadData();
  };
  ZUI.Util.inheritClass(Eplant.View, Eplant.Views.PublicationView);  // Inherit parent prototype
  Eplant.Views.PublicationView.viewName = "PublicationView";
  Eplant.Views.PublicationView.displayName = "Publication viewer";
  Eplant.Views.PublicationView.hierarchy = "genetic element";
  Eplant.Views.PublicationView.magnification = 2;
  Eplant.Views.PublicationView.description = "Publication viewer";
  Eplant.Views.PublicationView.citation = "";
  Eplant.Views.PublicationView.activeIconImageURL = "img/active/publications.png";
  Eplant.Views.PublicationView.availableIconImageURL = "img/available/publications.png";
  Eplant.Views.PublicationView.unavailableIconImageURL = "img/unavailable/publications.png";
  Eplant.Views.PublicationView.viewType = "geneinfo";
  /* Constants */
  Eplant.Views.PublicationView.domContainer = null;    // DOM container for JSmol
  Eplant.Views.PublicationView.applet = null;      // JSmol applet object
  Eplant.Views.PublicationView.container = null;    // JSmol container (inside the main domContainer)
  Eplant.Views.PublicationView.canvas = null;      // JSmol canvas

  /* Static methods */
  /**
    * Initializes JSmol
  */
  Eplant.Views.PublicationView.initialize = function() {
    // Get JSmol DOM container
    Eplant.Views.PublicationView.domContainer = document.getElementById("GeneInfo_container");
    // Define JSmol initialization info

    Eplant.Views.PublicationView.Params = {
      htmlPage: '',
      page_fragment: "pages/publication.html"
    }

    Eplant.Views.PublicationView.Params.htmlPage = $.get(Eplant.Views.PublicationView.Params.page_fragment, function(data) {
      Eplant.Views.PublicationView.Params.htmlPage = data;
    });



  };
  Eplant.Views.PublicationView.prototype.loadData = function() {
    $.when(Eplant.Views.PublicationView.Params.htmlPage).then($.proxy(function( res ) {
      var clone = $(res).clone();
      $(this.domContainer).append(clone);
      this.tableContainer = $(this.domContainer).find('.geneInfoTableHolder')[0];

      /*// browser window scroll (in pixels) after which the "back to top" link is shown
        var offset = 100,
        //browser window scroll (in pixels) after which the "back to top" link opacity is reduced
        offset_opacity = 1200,
        //duration of the top scrolling animation (in ms)
        scroll_top_duration = 700,
        //grab the "back to top" link
        $back_to_top = $('.cd-top',this.domContainer);

        //hide or show the "back to top" link
        $(this.tableContainer).scroll(function(){
        ( $(this).scrollTop() > offset ) ? $back_to_top.addClass('cd-is-visible') : $back_to_top.removeClass('cd-is-visible cd-fade-out');
        if( $(this).scrollTop() > offset_opacity ) {
        $back_to_top.addClass('cd-fade-out');
        }
        });

        //smooth scroll to top
        $back_to_top.on('click', $.proxy(function(event){
        event.preventDefault();
        $(this.tableContainer).animate({
        scrollTop: 0 ,
        }, scroll_top_duration
        );

        // close all the accoridan boxes
        $('.content-visible',this.tableContainer).removeClass('content-visible');
        $('.cd-faq-content',this.tableContainer).css('display', 'none');

      },this));*/


      $(clone).find('#publicationsTable').attr('id', "publicationsTable" + this.geneticElement.identifier);
      $(clone).find('#geneRIFsTable').attr('id', "geneRIFsTable" + this.geneticElement.identifier);

      var config = {
        IDs: {

          divPublicationsTableId:'publicationsTable'+ this.geneticElement.identifier,
          divGeneRIFsTableId:"geneRIFsTable" + this.geneticElement.identifier
        }

      }
      $.fn.dataTable.ext.errMode = 'none';


      // Populate Publications table
      var publicationsTable = $("#"+config.IDs.divPublicationsTableId,this.domContainer)
      .on( 'error.dt', $.proxy(function ( e, settings, techNote, message ) {
        $(e.currentTarget).text("The web service is not responding, please try again later.");
        this.loadFail();
      } ,this))
      .on( 'xhr.dt', $.proxy(function ( e, xhr, result ) {
        this.publicationsRawData = JSON.stringify(result);
      },this))
      .DataTable( {
        paging: true,
        pageLength: 10,
        lengthChange: true,
        lengthMenu: [[5, 10, 25, 50, -1], [5, 10, 25, 50, "All"]],
        ordering: true,
        searching: true,
        order: [[ 1, "desc" ]],
        select: true,
        ajax: {
          type: 'GET',
          url: '//bar.utoronto.ca/webservices/bar_araport/publications_by_locus.php',
          async: true,
          data: { locus: this.geneticElement.identifier },
          dataType: 'json',
          "dataSrc": "result"
        },
        columns: [
          { "data": "first_author" },
          { "data": "year" },
          { "data": "journal" },
          { "data": "title" },
          { "data": "pubmed_id",
            "fnCreatedCell": function (nTd, sData, oData, iRow, iCol) {
              $(nTd).html("<a class='pubmedLink' href='http://www.ncbi.nlm.nih.gov/pubmed/"+oData.pubmed_id+"' target='_blank'>"+oData.pubmed_id+"</a>");
            }
          }
        ]
      });

      // Populate GeneRIFs table
      var geneRIFsTable = $("#"+config.IDs.divGeneRIFsTableId,this.domContainer)
      .on( 'error.dt',  $.proxy(function ( e, settings, techNote, message ) {
        $(e.currentTarget).text("The web service is not responding, please try again later.");
        this.loadFail();
      },this) )
      .on( 'xhr.dt', $.proxy(function ( e, xhr, result ) {
        this.geneRIFsRawData = JSON.stringify(result);
      } ,this))
      .DataTable( {
        paging: true,
        pageLength: 10,
        lengthChange: true,
        lengthMenu: [[5, 10, 25, 50, -1], [5, 10, 25, 50, "All"]],
        ordering: true,
        searching: true,
        select: true,
        ajax: {
          type: 'GET',
          url: '//bar.utoronto.ca/webservices/bar_araport/generifs_by_locus.php',
          async: true,
          data: { locus: this.geneticElement.identifier },
          dataType: 'json',
          "dataSrc": "result"
        },
        columns: [
          { "data": "annotation" },
          { "data": "publication.pubmed_id",
            "fnCreatedCell": function (nTd, sData, oData, iRow, iCol) {
              $(nTd).html("<a class='pubmedLink' href='http://www.ncbi.nlm.nih.gov/pubmed/"+oData.publication.pubmed_id+"' target='_blank'>"+oData.publication.pubmed_id+"</a>");
            }
          }
        ]
      });


      this.loadFinish();
    },this));
  };

  Eplant.Views.PublicationView.prototype.loadFinish = function() {
    /* Set load status */
    this.isLoadedData = true;


  };



  /**
    * Active callback method.
    *
    * @override
  */
  Eplant.Views.PublicationView.prototype.active = function() {
    // Call parent method
    Eplant.View.prototype.active.call(this);

    //this.resize();
    $(this.domContainer).appendTo(Eplant.Views.PublicationView.domContainer);
    // Make JSmol visible
    $(Eplant.Views.PublicationView.domContainer).css({"visibility": "visible"});
    // Get JSmol canvas


  };

  Eplant.Views.PublicationView.prototype.afterActive = function() {
    Eplant.View.prototype.afterActive.call(this);
    $(this.domContainer).css({
      top: "0%"
    });

  };

  Eplant.Views.PublicationView.prototype.remove = function () {
    // Call parent method
    Eplant.View.prototype.remove.call(this);


  };


  Eplant.Views.PublicationView.prototype.downloadRawData = function() {

    var downloadString = "";
    var currentdate = new Date();
    var datetime = "This file contains raw data downloaded from ePlant on " + currentdate.getDate() + "/"
    + (currentdate.getMonth()+1)  + "/"
    + currentdate.getFullYear() + " @ "
    + currentdate.getHours() + ":"
    + currentdate.getMinutes() + ":"
    + currentdate.getSeconds();
    downloadString+=datetime+"\n";
    var labelText = this.geneticElement.identifier;
    if (this.geneticElement.aliases && this.geneticElement.aliases.length && this.geneticElement.aliases[0].length) {
      labelText += " / " + this.geneticElement.aliases.join(", ");
    }
    downloadString+=this.name+": "+labelText+"\n";

    downloadString+="URL: "+Eplant.urlForCurrentState()+"\n";
    downloadString+="JSON data: \n";


    if(this.publicationsRawData){
      downloadString+="\n\nPublications Raw Data:\n";
      downloadString+=this.publicationsRawData;
    }
    if(this.geneRIFsRawData){
      downloadString+="\n\nGene RIFs Raw Data:\n";
      downloadString+=this.geneRIFsRawData;
    }
    var blob = new Blob([downloadString], {type: "text/plain;charset=utf-8"});
    saveAs(blob, this.name+"-"+this.geneticElement.identifier+".txt");

  };

  /**
    * Inactive callback method.
    *
    * @override
  */
  Eplant.Views.PublicationView.prototype.inactive = function() {
    // Call parent method
    Eplant.View.prototype.inactive.call(this);

    $(this.domContainer).detach();
    // Hide JSmol
    $(Eplant.Views.PublicationView.domContainer).css({"visibility": "hidden"});

  };

  /**
    * Returns The exit-out animation configuration.
    *
    * @override
    * @return {Object} The exit-out animation configuration.
  */
  Eplant.Views.PublicationView.prototype.getExitOutAnimationConfig = function() {
    var config = Eplant.View.prototype.getExitOutAnimationConfig.call(this);
    config.begin = $.proxy(function() {
      $(this.domContainer).stop().animate({
        top: "250%"
      }, 1000);
    }, this);
    return config;
  };

  /**
    * Returns The enter-out animation configuration.
    *
    * @override
    * @return {Object} The enter-out animation configuration.
  */
  Eplant.Views.PublicationView.prototype.getEnterOutAnimationConfig = function() {
    var config = Eplant.View.prototype.getEnterOutAnimationConfig.call(this);
    config.begin = $.proxy(function() {

      $(this.domContainer).css({
        top: "-250%"
      });
      $(this.domContainer).stop().animate({
        top: "0%"
      }, 1000);
    }, this);
    return config;
  };

  /**
    * Returns The exit-in animation configuration.
    *
    * @override
    * @return {Object} The exit-in animation configuration.
  */
  Eplant.Views.PublicationView.prototype.getExitInAnimationConfig = function() {
    var config = Eplant.View.prototype.getExitInAnimationConfig.call(this);
    config.begin = $.proxy(function() {
      $(this.domContainer).stop().animate({
        top: "-250%"
      }, 1000);
    }, this);
    return config;
  };

  /**
    * Returns The enter-in animation configuration.
    *
    * @override
    * @return {Object} The enter-in animation configuration.
  */
  Eplant.Views.PublicationView.prototype.getEnterInAnimationConfig = function() {
    var config = Eplant.View.prototype.getEnterInAnimationConfig.call(this);
    config.begin = $.proxy(function() {
      $(this.domContainer).css({
        top: "250%"
      });
      $(this.domContainer).stop().animate({
        top: "0%"
      }, 1000);
    }, this);
    return config;
  };





})();
