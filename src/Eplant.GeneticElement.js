(function() {

  /**
    * Eplant.GeneticElement class
    * By Hans Yu
    *
    * Describes an ePlant genetic element.
    *
    * @constructor
    * @param {Object} info Information for this genetic element wrapped in an Object.
    * @param {Eplant.Chromosome} info.chromosome Chromosome that contains this genetic element.
    * @param {String} info.identifier Identifier of this genetic element.
    * @param {Array<String>} info.aliases Array of aliases of this genetic element.
    * @param {String} info.annotation Annotation of this genetic element.
    * @param {String} info.type Type of this genetic element.
    * @param {String} info.strand Strand of this genetic element ("+" or "-").
    * @param {Number} info.start Start base-pair position of this genetic element.
    * @param {Number} info.end End base-pair position of this genetic element.
  */
  Eplant.GeneticElement = function(info) {
    /* Store information */
    this.chromosome = (info.chromosome === undefined) ? null : info.chromosome;
    this.identifier = (info.identifier === undefined) ? null : info.identifier;
    this.aliases = (info.aliases === undefined) ? null : info.aliases;
    this.annotation = (info.annotation === undefined) ? null : info.annotation;
    this.type = (info.type === undefined) ? null : info.type;
    this.strand = (info.strand === undefined) ? null : info.strand;
    this.start = (info.start === undefined) ? null : info.start;
    this.end = (info.end === undefined) ? null : info.end;
    this.species = (info.chromosome === undefined || info.chromosome.species === undefined) ? null : info.chromosome.species;

    this.proteinSequence = null;
    this.proteinSequenceDeferred = null;

    this.isRelated = false;
    this.relatedGene = null;
    this.rValueToRelatedGene = 0;
    if(info.relationOptions){
      this.isRelated=info.relationOptions.isRelated;
      this.relatedGene=info.relationOptions.relatedGene;
      this.isUsingCustomBait=info.relationOptions.isUsingCustomBait;
      this.rValueToRelatedGene=info.relationOptions.rValueToRelatedGene;
    }

    /* Check whether necessary information are provided */
    if (this.chromosome === null) console.log("Warning: No Chromosome is specified for the GeneticElement.");
    if (this.identifier === null) console.log("Warning: No identifier is specified for the GeneticElement.");
    if (this.type === null) console.log("Warning: No type is specified for the GeneticElement.");
    if (this.start === null) console.log("Warning: No start position is specified for the GeneticElement.");
    if (this.end === null) console.log("Warning: No end position is specified for the GeneticElement.");

    /* Other attributes */
    this.views = null;      // Object container for Views
    this.viewHeatmaps = [];
    this.isLoadedViews = false;    // Whether Views are loaded
    this.isLoadedViewsData = false;    // Whether Views are loaded
    this.isLoadedEFPViewsData = false;    // Whether Views are loaded
    this.geneticElementDialog = null;  // GeneticElementDialog associated with this GeneticElement
    this.geneticElementListDialog = null;  // GeneticElementListDialog associated with this GeneticElement
    this.geneticElementInfoDialog = null;  // GeneticElementInfoDialog associated with this GeneticElement
    this.annotationTags = [];    // Annotation tags
    this.loadSimilarGenesDialog = null; //Dialog of loading similiar genes
    this.expressionAnglerDialog = null; //Dialog of expression angler
    this.expressionAnglerGenes = []; //Dialog of expression angler
    this.expressionAnglerGenesLoaded = false;    // Whether Views are loaded
    this.expressionAnglerGenesLoadedNumber = 0;    // Whether Views are loaded
    this.updateGeneListDomTimeout = null;
    this.expressionXhrService = null;
    this.expressionXhrLink = null;
    this.domGeneListItem = null; //Dialog of loading similiar genes
    this.xhrService = null;
    this.xhrLink = null;
    this.max = 0;
    this.extremum = 0;
    this.experimentViewMax = 0;
    this.experimentViewExtremum = 0;
    this.loadedEventFired = false;
    this.loadedEFPEventFired = false;
    /* Create AnnotationTags */
    for (var n = 0; n < Eplant.GeneticElement.AnnotationTag.Colors.length; n++) {
      var annotationTag = new Eplant.GeneticElement.AnnotationTag(Eplant.GeneticElement.AnnotationTag.Colors[n], this);
      this.annotationTags.push(annotationTag);
    }
    Eplant.queue._queueInProcess[this.identifier+"_Loading"]=true;
  };

  Eplant.GeneticElement.prototype.updateMax = function() {

    for (var ViewName in this.views) {
      /* Get View constructor */
      var View = this.views[ViewName];
      if(View.hierarchy ==="genetic element"&&View.isEFPView){
        ///////////////////////////////////////////////////////////////////
        var localMax = this.views[ViewName].max;
        if(this.max<localMax){
          this.max =localMax;
        }
        if(View.magnification ===35&&localMax>this.experimentViewMax){
          this.experimentViewMax = localMax;
        }
        ////////////////////////////////////////////////////////////////////
        var localExtremum = this.views[ViewName].extremum;
        if(this.extremum<localExtremum){
          this.extremum =localExtremum;
        }
        if(View.magnification ===35&&localExtremum>this.experimentViewExtremum){
          this.experimentViewExtremum = localExtremum;
        }
      }
    }

  }

  Eplant.GeneticElement.prototype.createHeatMap = function() {
    var row = $('<tr></tr>').addClass('gene-tr');
    for (var ViewName in Eplant.Views) {
      /* Get View constructor */
      var View = Eplant.Views[ViewName];

      /* Skip if View hiearchy is not at the level of genetic element */
      if (View.hierarchy == "genetic element")
      {
        var viewDom = this.createViewDom(ViewName);
        //var viewDom = geneticElement.views[this.viewNames[j]].heatmapDom;
        if(viewDom){
          viewDom.css({'height':'25px'})
          $(viewDom).on('click',$.proxy(function(){
            Eplant.changeActiveView(geneticElement.views[this.viewName]);
          },{viewName:ViewName}));
          rowData = $('<td></td>').append(viewDom).addClass('view-td');
          row.append(rowData);
        }

      }
    }

    return row;
  }

  Eplant.GeneticElement.prototype.createViewDom = function(viewName) {
    var view = this.views[viewName];
    var table = null;
    if(view.isLoadedData&&view.groups){
      table = $('<table></table>').css({
        width:'100%',
        height:'100%'
      });
      row = $('<tr></tr>');
      for (var j = 0; j < view.groups.length; j++) {
        var group = view.groups[j];
        var rowData = $('<td></td>')
        .attr('data-rel-color',group.color)
        .attr('data-gene',this.identifier)
        .attr('data-tissue',group.name)
        .attr('data-expression-level',group.mean)
        .attr('data-database',group.database)
        .attr('data-view-name',view.name);
        row.append(rowData);

        rowData.attr('data-abs-color',Eplant.getAbsoluteColor(group))

        var color;
        if(this.mode==='absolute'){
          color=rowData.attr('data-abs-color');
        }
        else{
          color=rowData.attr('data-rel-color');
        }
        rowData.css({'background-color':color});
      }
      table.append(row);
      }else{
      this.allLoaded = false;
    }
    return table;
  };


  /**
    * Loads Views for this GeneticElement.
  */
  Eplant.GeneticElement.prototype.loadViews = function() {

    /* Confirm views have not been loaded */
    if (!this.views) {
      /* Set up Object wrapper */
      this.views = {};
      /* Loop through Eplant.Views namespace */
      for (var ViewName in Eplant.Views) {
        /* Get View constructor */
        var View = Eplant.Views[ViewName];

        /* Skip if View hiearchy is not at the level of genetic element */
        if (View.hierarchy == "genetic element")
        {
          /* Create View */
          this.views[ViewName] = new View(this);

        }
      }

      Eplant.updateGeneticElementPanel();

    }


  };

  Eplant.GeneticElement.prototype.updateEFPViews = function() {

    if (this.views) {
      for (var ViewName in this.views) {

        if ( this.views[ViewName].updateDisplay)
        {
          var view =  this.views[ViewName];

          Eplant.queue.add(function(){
            this.updateDisplay();
          }, view,null,this.identifier+"_Loading");

        }
      }
    }
  };

  /**
    * Drops loaded Views for this GeneticElement.
  */
  Eplant.GeneticElement.prototype.dropViews = function() {
    debugger;
    /* Change activeGeneticElement if this is activeGeneticElement */
    if (this.species.activeGeneticElement == this) {
      /* Find the first GeneticElement with views loaded and set it to the activeGeneticElement */
      for (var n = 0; n < this.species.geneticElements.length; n++) {
        var geneticElement = this.species.geneticElements[n];
        if (geneticElement.isLoadedViews && geneticElement != this) {    // Found
          this.species.setActiveGeneticElement(geneticElement);
          break;
        }
      }

      /* Set activeGeneticElement to null if none is found */
      if (this.species.activeGeneticElement == this) {
        this.species.setActiveGeneticElement(null);
      }
    }

    /* Clean up Views */
    for (var ViewName in this.views) {
      var view = this.views[ViewName];
      view.remove();
    }
    /* Clear views */
    this.views = null;

    /* Reset AnnotationTags */
    for (var n = 0; n < this.annotationTags.length; n++) {
      var annotationTag = this.annotationTags[n];
      if (annotationTag.isSelected) {
        annotationTag.unselect();
      }
    }

    /* Set flag for View loading */
    this.isLoadedViews = false;

    /* Fire event */
    var event = new ZUI.Event("drop-views", this, null);
    ZUI.fireEvent(event);
  };

  /**
    * Gets the AnnotationTag with the specified color.
    *
    * @param {String} color Color HEX of the AnnotationTag.
    * @return {Eplant.GeneticElement.AnnotationTag} Matching AnnotationTag.
  */
  Eplant.GeneticElement.prototype.getAnnotationTagByColor = function(color) {
    /* Loop through AnnotationTag objects to find the AnnotationTag with a matching color */
    for (var n = 0; n < this.annotationTags.length; n++) {
      var annotationTag = this.annotationTags[n];
      if (annotationTag.color.toUpperCase() == color.toUpperCase()) {
        return annotationTag;
      }
    }

    /* Not found */
    return null;
  };

  Eplant.GeneticElement.prototype.updateListDom = function() {
    this.expressionAnglerGenesLoadedNumber=0;
    $(this.domGeneListItem).replaceWith(this.getDom());
    if(this.expressionAnglerGenesLoadedNumber===this.expressionAnglerGenes.length)this.expressionAnglerGenesLoaded = true;
    if(!this.expressionAnglerGenesLoaded){
      this.updateGeneListDomTimesout = setTimeout( $.proxy(function(){this.updateListDom();},this), 2000 );
    }
  };


  Eplant.GeneticElement.prototype.refreshHeatmap = function() {
    Eplant.queue.add(function(){
      if(this.isLoadedEFPViewsData){
        if(this.heatmapDom){
          $(this.heatmapDom).remove();
        }
        this.heatmapDom = document.createElement("div");
        $(this.heatmapDom).css({
          width:'100%',
          height:'25px',
          position:'absolute',
          opacity:'0',
          overflow:'hidden'
        });

        $(this.domGeneListItem).prepend(this.heatmapDom);
        var tbHeatMap=this.geneticElementHeatmap();
        $(this.heatmapDom).append(tbHeatMap);
        Eplant.getScreenShot(tbHeatMap).then($.proxy(function(ss){
          if(Eplant.geneticElementPanelMapOn){
            $(this.heatmapDom).css({
              opacity:'1'
            });
          }
          $(this.heatmapDom).append($(ss).css({
            width:'100%',
            margin: 0,
            height: '25px',
            top: 0
          }));
          $(tbHeatMap).remove();
        },this));
      }
    },this,null,this.identifier+"_Loading");
  };
  /**
    * Gets the dom
    *
  */
  Eplant.GeneticElement.prototype.getDom = function() {
    this.checkViewsLoading();
    /* Create DOM element for GeneticElement item */
    if(!this.domGeneListItem){
      this.domGeneListItem = document.createElement("div");
      $(this.domGeneListItem).addClass("eplant-geneticElementPanel-item");

      $(this.domGeneListItem).attr('id',this.identifier+'list-item');
      if (this == Eplant.activeSpecies.activeGeneticElement) {
        $(this.domGeneListItem).addClass("eplant-geneticElementPanel-item-focus");
      }


      /* Create icon for summoning GeneticElementDialog */
      var domIcon = document.createElement("img");
      /* Set image */

      $(domIcon).attr("src", "img/list.png");

      $(domIcon).attr("data-dropdown", "#dropdown-" + this.identifier);
      /* Click event handler */
      $(domIcon).click($.proxy(function() {
        /* Check whether GeneticElementDialog is already open */
        if (this.geneticElementListDialog) { // Yes
          /* Close */
          this.geneticElementListDialog.close();
          } else { // No
          /* Find the index of this GeneticElement among the GeneticElements of the parent Species with loaded Views */
          var index = 0;
          for (var n = 0; n < this.species.geneticElements.length; n++) {
            var geneticElement = this.species.geneticElements[n];
            if (geneticElement == this) {
              break;
            }
            if (this.isLoadedViews) {
              index++;
            }
          }

          /* Create new GeneticElementDialog */
          this.geneticElementListDialog = new Eplant.GeneticElementListDialog(this);
          this.geneticElementListDialog.pinned = true;
        }
      }, this));
      /* Append icon to item container */
      $(this.domGeneListItem).append(domIcon);


      /* Create label */
      this.domListItemLabel = document.createElement("span");
      var labelText = this.identifier;
      if (this.aliases && this.aliases.length && this.aliases[0].length) {
        labelText += " / " + this.aliases.join(", ");
      }
      $(this.domListItemLabel).html(labelText);
      $(this.domListItemLabel).attr('title',labelText);
      $(this.domListItemLabel).click($.proxy(function() {
        this.species.setActiveGeneticElement(this);
      }, this));
      $(this.domListItemLabel).mouseover($.proxy(function() {
        /* Fire ZUI event */
        var event = new ZUI.Event("mouseover-geneticElementPanel-item", this, null);
        ZUI.fireEvent(event);
      }, this));
      $(this.domListItemLabel).mouseout($.proxy(function() {
        /* Fire ZUI event */
        var event = new ZUI.Event("mouseout-geneticElementPanel-item", this, null);
        ZUI.fireEvent(event);
      }, this));
      $(this.domGeneListItem).append(this.domListItemLabel);


      /* Create icon for summoning GeneticElementDialog */
      var domIconDiv = document.createElement("div");

      domIconDiv.className = "hint--right hint--success hint-rounded";
      domIconDiv.setAttribute("data-hint", 'Get annotation and strand information for this gene');
      domIconDiv.setAttribute("title", 'Get annotation and strand information for this gene');
      domIconDiv.setAttribute("data-enabled", "true");

      $(domIconDiv).tooltip({
        position: {
          my: 'left center', at: 'right+5 center'
        },
        tooltipClass:'right'
      });

      var domIcon = document.createElement("img");
      /* Set image */
      $(domIcon).attr("src", "img/info.png");


      /* Click event handler */
      $(domIcon).click($.proxy(function() {
        /* Check whether GeneticElementDialog is already open */
        if (this.geneticElementInfoDialog) { // Yes
          /* Close */
          this.geneticElementInfoDialog.close();
          } else { // No
          /* Find the index of this GeneticElement among the GeneticElements of the parent Species with loaded Views */
          var index = 0;
          for (var n = 0; n < this.species.geneticElements.length; n++) {
            var geneticElement = this.species.geneticElements[n];
            if (geneticElement == this) {
              break;
            }
            if (this.isLoadedViews) {
              index++;
            }
          }

          /* Create new GeneticElementDialog */
          this.geneticElementInfoDialog = new Eplant.GeneticElementInfoDialog(this);
        }
      }, this));


      /* Append icon to item container */
      $(domIconDiv).append(domIcon).appendTo(this.domGeneListItem);


      if (!this.isLoadedViewsData) {
        var percent = Math.round(this.totalPercentage * 100);
        var percentText = percent + "%";
        this.domListItemLoading = document.createElement("span");
        this.domListItemLoadingBar  = document.createElement("div");
        this.domListItemLoadingText = document.createElement("p");

        $(this.domListItemLoading).css('width', percentText);
        $(this.domListItemLoadingText).text(percentText);
        $(this.domListItemLoadingBar).addClass("meter");
        $(this.domListItemLoadingBar).addClass("meterAnimate");
        $(this.domListItemLoadingBar).append(this.domListItemLoading);
        $(this.domListItemLoadingBar).append(this.domListItemLoadingText);
        $(this.domGeneListItem).append(this.domListItemLoadingBar);
        this.domLoadingCancelButton = document.createElement("button");
        this.domLoadingCancelButton.innerHTML = 'Cancel';
        $(this.domLoadingCancelButton).addClass('gene-cancel-button');
        /* Click event handler */
        $(this.domLoadingCancelButton).click($.proxy(function(event) {
          event.stopPropagation();
          this.remove();
        }, this));
        /* Append icon to item container */
        $(this.domGeneListItem).append(this.domLoadingCancelButton);

      }
    }
    else
    {
      if (!this.isLoadedViewsData) {
        var percent = Math.round(this.totalPercentage * 100);
        var percentText = percent + "%";

        $(this.domListItemLoading).css('width', percentText);
        $(this.domListItemLoadingText).text(percentText);
      }
      else{
        this.checkHeatMap();

        $(this.domListItemLoadingBar).detach();
        $(this.domLoadingCancelButton).detach();
        $(this.domListItemLoading).detach();
      }

    }

    if (this !== Eplant.activeSpecies.activeGeneticElement) {
      $(this.domGeneListItem).removeClass("eplant-geneticElementPanel-item-focus");
    }
    else{
      $(this.domGeneListItem).addClass("eplant-geneticElementPanel-item-focus");

    }


    return this.domGeneListItem;
  };


  Eplant.GeneticElement.prototype.checkHeatMap = function() {
    Eplant.queue.add(function(){


      if(this.isLoadedEFPViewsData){

        if(!this.heatmapDom){
          this.heatmapDom = document.createElement("div");
          $(this.heatmapDom).css({
            width:'100%',
            height:'25px',
            position:'absolute',
            opacity:'0',
            overflow:'hidden'
          });
          $(this.domGeneListItem).prepend(this.heatmapDom);
          var tbHeatMap=this.geneticElementHeatmap();
          $(this.heatmapDom).append(tbHeatMap);
          Eplant.getScreenShot(tbHeatMap).then($.proxy(function(ss){
            if(Eplant.geneticElementPanelMapOn){
              $(this.heatmapDom).css({
                opacity:'1'
              });
            }
            $(this.heatmapDom).append($(ss).css({
              width:'100%',
              margin: 0,
              height: '25px',
              top: 0
            }));
            $(tbHeatMap).remove();
          },this));
          }else{
          $(this.domGeneListItem).prepend(this.heatmapDom);
        }
        if(Eplant.geneticElementPanelMapOn){
          $(this.heatmapDom).css({
            opacity:'1'
          });
        }
        else{
          $(this.heatmapDom).css({
            opacity:'0'
          });
        }


      }
    }, this,null,this.identifier+"_Loading");
  };

  Eplant.GeneticElement.prototype.geneticElementHeatmap = function() {
    var row = $('<tr></tr>').addClass('gene-tr');
    $(row).attr('data-geneIdentifier',this.identifier);
    /* Get View constructor */

    for (var ViewName in this.views) {
      /* Get View constructor */
      var view = this.views[ViewName];
      if(view.isLoadedData&&view.isEFPView){
        var viewDom = this.createViewDom(view,'absolute');
        if(viewDom){
          viewDom.css({'height':'25px'})
        }
        rowData = $('<td></td>').append(viewDom).css('height','25px');
        row.append(rowData);
      }


    }


    return row;
  };

  Eplant.GeneticElement.prototype.createViewDom = function(view, mode) {
    var table = null;
    if(view.isLoadedData){
      table = $('<table></table>').css({
        width:'100%',
        height:'100%'
      });
      row = $('<tr></tr>');
      for (var j = 0; j < view.groups.length; j++) {
        var group = view.groups[j];
        var rowData = $('<td></td>')
        .attr('data-rel-color',group.color)
        .attr('data-gene',this.identifier)
        .attr('data-tissue',group.name)
        .attr('data-expression-level',group.mean)
        .attr('data-database',group.database)
        .attr('data-view-name',view.name)
        .attr('data-abs-color',group.color)
        .css({width:"1px"});;
        row.append(rowData);

        var color;
        color=rowData.attr('data-abs-color');

        rowData.css({'background-color':color});
      }
      table.append(row);
      }else{
      this.allLoaded = false;
    }
    return table;
  };

  Eplant.GeneticElement.prototype.appendExpressionAnglerGenesDom = function(domItem) {
    this.expressionAnglerGenesLoadedNumber=0;
    if(this.expressionAnglerGenes.length>0){
      var ul = $('<ul/>');
      for(var i = 0;i<this.expressionAnglerGenes.length;i++){
        var li = $('<li/>');
        var geneDom = this.expressionAnglerGenes[i].getDom();
        li.append(geneDom);
        li.appendTo(ul);
      }
      ul.appendTo(domItem);
    }
    return domItem;
  };

  Eplant.GeneticElement.prototype.checkViewsLoading = function() {
    this.checkEFPViewsLoading();
    if(!this.isLoadedViewsData){
      var loaded = true;
      this.totalPercentage = 0;
      for (var ViewName in this.views) {
        /* Get View constructor */
        var view = this.views[ViewName];
        if(view.hierarchy ==="genetic element"){
          if (!view.isLoadedData) {
            loaded = false;
            } else {
            this.totalPercentage += Eplant.eachGeneticViewAsPercent;
          }
        }
      }
      if (this.totalPercentage >= 1) loaded = true;
      this.isLoadedViewsData = loaded;
    }
    /*if(this.isLoadedViewsData && this.isRelated){
      this.relatedGene.expressionAnglerGenesLoadedNumber++;
    }*/
    if(this.isLoadedViewsData ){
      if(!this.loadedEventFired){
        this.loadedEventFired=true;
        /* Set flag for view loading */
        this.isLoadedViews = true;




        /* Fire event */
        var event = new ZUI.Event("load-views", this, null);
        ZUI.fireEvent(event);
      }

      this.updateMax();

    }
  };

  Eplant.GeneticElement.prototype.checkEFPViewsLoading = function() {
    if(!this.isLoadedEFPViewsData){
      var loaded = true;
      this.totalEFPPercentage = 0;
      for (var ViewName in this.views) {
        /* Get View constructor */
        var view = this.views[ViewName];
        if(view.isEFPView&&view.hierarchy ==="genetic element"){
          if (!view.isLoadedData ) {
            loaded = false;
            } else {
            this.totalEFPPercentage += Eplant.eachEFPViewAsPercent;
          }
        }
      }
      if (this.totalEFPPercentage >= 1) loaded = true;
      this.isLoadedEFPViewsData = loaded;
      }else{
      if(!this.loadedEFPEventFired){
        this.isLoadedEFPViews = true;
        this.loadedEFPEventFired=true;
        /* Fire event */
        var event = new ZUI.Event("load-efp-views", this, null);
        ZUI.fireEvent(event);
      }
    }
  };

  /**
    * Cleans up this GeneticElement.
  */
  Eplant.GeneticElement.prototype.remove = function() {
    /* Fire event for  */
    var event = new ZUI.Event("remove-geneticElement", this, {
    });
    ZUI.fireEvent(event);
    Eplant.queue.clearWithId(this.identifier+"_Loading");
    this.dropViews();
    /*
      if(this.expressionAnglerGenes.length>0){
      while(this.expressionAnglerGenes.length>0){
      this.expressionAnglerGenes[0].unrelate();
      }
    }*/
    $(this.domGeneListItem).remove(); //remove it from the list of genes in the left panel
    this.chromosome.removeGeneticElement(this); //remove it from the chromosome view
    this.species.displayGeneticElements.splice(this.species.displayGeneticElements.indexOf(this), 1);
    /* Clean up GeneticElementDialog */
    if(this.geneticElementDialog)this.geneticElementDialog.remove(); //remove the genetic element dialog from the chromosome view
    if(this.geneticElementListDialog)this.geneticElementListDialog.remove(); //remove the dialog from the left side panel
    if(this.geneticElementInfoDialog)this.geneticElementInfoDialog.remove();

    //BEN CHANGED
    Eplant.updateGeneticElementPanel(); 
    Eplant.updateIconDock();

  };

  Eplant.GeneticElement.prototype.unrelate = function() {
    /* Clean up Views */
    if(this.isRelated){
      this.relatedGene.expressionAnglerGenes.splice(this.relatedGene.expressionAnglerGenes.indexOf(this), 1);
      this.isRelated=false;
      this.relatedGene=null;
      this.rValueToRelatedGene=null;
      this.expressionAnglerGenesLoaded = false;
      this.expressionAnglerGenesLoadedNumber = 0;


      if($.grep( Eplant.activeSpecies.displayGeneticElements, function(e){ return e.identifier == this.identifier; }).length===0){
        Eplant.activeSpecies.displayGeneticElements.push(this);
        }else{
        DialogManager.artDialogDynamic(this.identifier+' is already loaded.');
      }
    }
  };

  /**
    * Get genes similiar to this GeneticElement.
  */
  Eplant.GeneticElement.prototype.getSimilarGenes = function() {
    var dom = $('<div/>', {
    });
    dom.css({'text-align':'center'});
    var p = $('<div/>', {
      text: 'Loading genes similiar to '+this.identifier+', click cancel to stop loading.'
    });
    var propgressBar = $('<div/>', {
      'class': 'progressBar'
    });
    var propgressLabel = $('<div/>', {
      'class': 'progressLabel'
    });


    var cancelButton = $('<input/>', {
      type: 'button',
      value: "cancel",
      'class':'gene-cancel-button '
    });
    cancelButton.css({'margin-top':'10px'});
    cancelButton.on('click',$.proxy(function(){
      if(this.xhrLink) {
        this.xhrLink.abort();
        this.xhrLink = null;
      }
      if(this.xhrService) {
        this.xhrService.abort();
        this.xhrService = null;
      }
      if(this.loadSimilarGenesDialog) this.loadSimilarGenesDialog.close();
    },this));
    $(dom).append(p).append(propgressBar.append(propgressLabel)).append(cancelButton);
    this.loadSimilarGenesDialog = DialogManager.artDialogDynamic(dom[0], {
      init:function() {


      }
    });

    var $progressbar = $( ".progressbar",dom ),
    $progressLabel = $( ".progressLabel",dom );

    $progressbar.progressbar({
      value: false,
      change: function() {
        $progressLabel.text( $progressbar.progressbar( "value" ) + "%" );
      },
      complete: function() {
        $progressLabel.text( "Complete!" );
      }
    });

    function progress() {
      var val = $progressbar.progressbar( "value" ) || 0;

      $progressbar.progressbar( "value", val + 4 );

      if ( val < 99 ) {
        setTimeout( progress, 1000 );
      }
    }

    setTimeout( progress, 1000 );

    /* Clean up Views */
    this.xhrService = $.get( "//bar.utoronto.ca/ntools/cgi-bin/ntools_expression_angler.cgi?default_db=AtGenExpress_Tissue_Plus_raw&match_count=10&agi_id="+this.identifier, $.proxy(function( data ) {
      var doc = $.parseHTML(data)
      var tempFileLink = $('b:contains("View list of agis as text")', doc)
      .parent().attr('href').replace('..','//bar.utoronto.ca/ntools');
      this.xhrLink = $.get( tempFileLink,  $.proxy(function( list ) {
        var genesArray = list.split('\n').filter(function(el) {return el.length != 0});
        Eplant.queryIdentifier(genesArray);
        if(this.loadSimilarGenesDialog) this.loadSimilarGenesDialog.close();
      },this));
    },this))
    .always(function() {
      if(this.loadSimilarGenesDialog) this.loadSimilarGenesDialog.close();
    });
  };


  /**
    *
  */
  Eplant.GeneticElement.prototype.expressionAngler = function() {
    var dom = $('<div/>', {
    });
    dom.css({'text-align':'left',
    width:'500px'});
    dom.load( "pages/relatedGenes.html", $.proxy(function( response, status, xhr ) {
      if ( status == "error" ) {
        return;
        }else{

        var submitButton = $('<input/>', {
          type: 'button',
          value: "Start Loading",
          'class':'button greenButton'
        });
        var domDesc = document.createElement("div");
        $(domDesc).css({"margin":"5 15 5 4",'color':'#999','width':'400px'});
        $(domDesc).html("This program will return a list of genes with the highest Pearson correlation coefficients for gene expression vectors as compared to "+this.identifier+". ");

        submitButton.on('click',$.proxy(function(){
          var lowRvalue = ($( "#r-value-slider-range" ,dom).slider( "values", 0 )+0)/100;
          var highRvalue = ($( "#r-value-slider-range" ,dom).slider( "values", 1 )+0)/100;
          var matchCount = $('input[name=matchGroup]:checked',dom).val();//$( "#matchCountInput" ).val();
          var database = "AtGenExpress_Tissue_Plus_raw";

          //var database = $( "#databaseSelect" ).val();
          var expressionUrl = this.generateStandardSearchQuery(database,highRvalue,lowRvalue,matchCount);
          if(this.expressionAnglerDialog) this.expressionAnglerDialog.close();
          Eplant.ExpressionAngler(expressionUrl, this.identifier,matchCount);


        },this));
        var cancelButton = $('<input/>', {
          type: 'button',
          value: "Cancel",
          'class':'button greenButton'
        });
        cancelButton.css({'margin':'5px',"width":"100px",'background-color':'#C4C4C4'});
        cancelButton.on('click',$.proxy(function(){
          if(this.expressionAnglerDialog) this.expressionAnglerDialog.close();
        },this));
        $(dom)/*.append(domDesc).append(table)*/.append(submitButton).append(cancelButton);
        this.expressionAnglerDialog = DialogManager.artDialogDynamic(dom[0], {
          init:function() {
            /*$(rInput).slider({
              range: true,
              min: 0,
              max: 100,
              values: [ 75, 100 ],
              slide: function( event, ui ) {
              $(rInputLabel).html((ui.values[ 0 ]/100) + " - " + (ui.values[ 1 ]/100) );
              }
            });*/
            $( "#r-value-slider-range" ).slider({
              range: true,
              min: -100,
              max: 100,
              values: [ 75, 100 ],
              slide: function( event, ui ) {
                $( "#amount" ).val((ui.values[ 0 ]/100) + " to " + (ui.values[ 1 ]/100) );
              }
            });
            $( "#amount" ).val( $( "#r-value-slider-range" ).slider( "values", 0 ) +
            " - " + $( "#r-value-slider-range" ).slider( "values", 1 ) ).css("color", "black");
          }

        });

      }
    },this));
    // /* Table */
    // var table = document.createElement("table");
    // $(table).css({
    // 'width':'500px',
    // 'border-collapse': 'separate',
    // 'border-spacing': '7'

    // });

    // $(this.domContainer).append(table);


    // var tr = document.createElement("tr");
    // var td = document.createElement("td");
    // $('<input />', { type: 'radio', id: 'similarGenesNumRadio', value: '', checked:true }).appendTo(td).click(function(){
    // $('input[type="radio"]',this.closest('table')).each(function(){
    // this.checked = false;
    // });
    // this.checked = true;
    // });
    // /* Label */
    // var label = document.createElement("label");
    // $(label).html("How many?");
    // $(td).append(label);
    // $(tr).append(td);
    // td = document.createElement("td");
    // /* Treshold input */
    // var matchCountInput = document.createElement("input");
    // $(matchCountInput).width(200);
    // $(matchCountInput).addClass('');
    // $(matchCountInput).attr('id','matchCountInput');
    // $(matchCountInput).val('10');
    // $(td).append(matchCountInput);
    // $(tr).append(td);
    // $(table).append(tr);

    // tr = document.createElement("tr");
    // td = document.createElement("td");
    // $('<input />', { type: 'radio', id: 'similarGenesRRadio', value: '' }).appendTo(td).click(function(){
    // $('input[type="radio"]',this.closest('table')).each(function(){
    // this.checked = false;
    // });
    // this.checked = true;
    // });
    // /* Label */
    // label = document.createElement("label");
    // $(label).html("R Value Cut-off's");
    // $(td).append(label);
    // $(tr).append(td);
    // td = document.createElement("td");
    // /* Treshold input */
    // var rInput = document.createElement("div");
    // $(rInput).css({'width': '200px',
    // 'display': 'inline-block',
    // 'margin-right': '10px'});
    // $(rInput).addClass('');
    // $(rInput).attr('id','rInput');
    // $(rInput).val('1');
    // $(td).append(rInput);
    // var rInputLabel = document.createElement("label");
    // $(rInputLabel).html("0.75 - 1");
    // $(rInputLabel).attr('id','rInputLabel');
    // $(td).append(rInputLabel);

    // var domSliderDesc = document.createElement("div");
    // $(domSliderDesc).css({"margin":"5 15 5 4",'color':'#999','width':'400px','display':'none'});
    // $(domSliderDesc).html("Use the slider to define a lower and upper r-value. The highest the r-value can be is 1, and that means that two vectors are a perfect match. Zero is no match, and -1 is a perfect anti-correlation, i.e. the expression response is exactly opposite to that of your gene of interest. A tighter r-value range will result in smaller output files.");

    // var rInputInfo = document.createElement("img");
    // $(rInputInfo).attr("src",'img/info.png').css({'margin-left': '10px','display': 'inline-block','width':'16px','cursor': 'pointer'});
    // $(rInputInfo).attr('id','rInputInfo');
    // $(rInputInfo).on('click',$.proxy(function(){
    // $(domSliderDesc).slideToggle("slow");
    // },this));
    // $(td).append(rInputInfo);

    // $(tr).append(td);
    // $(table).append(tr);
    // tr = document.createElement("tr");
    // td = document.createElement("td");
    // $(td).attr('colspan',2);

    // $(td).append(domSliderDesc);
    // $(tr).append(td);
    // $(table).append(tr);

    // tr = document.createElement("tr");
    // td = document.createElement("td");
    // /* Label */
    // label = document.createElement("label");
    // $(label).html("Database");
    // $(td).append(label);
    // $(tr).append(td);
    // td = document.createElement("td");
    // var databaseSelect = $('<select />',{
    // id:'databaseSelect'
    // });
    // $(databaseSelect).width(200);
    // if(Eplant.expressionAnglerDbMap.length>0){
    // for(var i =0;i<Eplant.expressionAnglerDbMap.length;i++) {
    // $('<option />', {value: Eplant.expressionAnglerDbMap[i].database, text: Eplant.expressionAnglerDbMap[i].name}).appendTo(databaseSelect);
    // }
    // }else{
    // $('<option />', {value: 'AtGenExpress_Tissue_raw', text: 'Plant View'}).appendTo(databaseSelect);
    // }
    // $(td).append(databaseSelect);
    // $(tr).append(td);
    // $(table).append(tr);

  };

  Eplant.GeneticElement.prototype.generateStandardSearchQuery = function (database, highRvalue, lowRvalue, count) {
    var search = "";
    var URL = "//bar.utoronto.ca/ntools/cgi-bin/ntools_expression_angler.cgi?";
    var agiID = "";
    var defaultDB = "&database="+database;
    var lowerRcutoff = "";
    var upperRcutoff = "";
    var match_count = "";

    // either set agiID or set custom bait = yes
    agiID = "agi_id="+this.identifier;



    // if Select an r-value cutoff range is selected, get them
    if ($('#similarGenesRRadio').is(':checked')) {
      lowerRcutoff = "&lower_r_cutoff="+lowRvalue;
      upperRcutoff = "&upper_r_cutoff="+highRvalue;
    }
    else if ($('#similarGenesNumRadio').is(':checked')) {
      // if Limit the results is selected, get the number
      match_count = "&match_count="+count;
    }

    // start building the search
    search = URL+agiID+defaultDB+lowerRcutoff+upperRcutoff+match_count;

    // postSearchQuery(search);
    return search;
  }

  Eplant.GeneticElement.prototype.getProteinSequence = function () {
    if(this.proteinSequence){
      return this.proteinSequence;
    }
    else if(this.proteinSequenceDeferred){
      return this.proteinSequenceDeferred;
    }
    else{
      this.proteinSequenceDeferred = $.ajax({
        url: '//bar.utoronto.ca/webservices/araport/api/bar_get_protein_sequence_by_identifier.php/search?identifier='+this.geneticElement.identifier+'.1&source=Araport',
        type: 'GET',
        timeout: 5000,
        error: $.proxy(function() {
        },this),
        success: $.proxy(function(summary) {
          this.proteinSequence = summary;

        },this)});
    }
  }
})();
