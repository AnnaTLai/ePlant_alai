/*BEN CHANGED:

  broke the bindpathways function from Ida's version into smaller functions

  replaced the dropdown with flex box buttons

  added a screen that says no pathways found when none are found

  added a pathway loading screen

  replaced the xml parser with a json based process instead of regex
  
  style changes

  tippy tooltip attached to active gene label

  added proper event firing

  removed all old files

  refactored to cytoscape 3

  html labels

  legend

*/
(function () {
  /**
   * Eplant.Views.PathwayView class
   *
   * @constructor
   * @param {Eplant.GeneticElement} geneticElement GeneticElement associated with this view
   * @prop {String} name Name of view displayed in title, inherited from Eplant.View
   */
  Eplant.Views.PathwayView = function (geneticElement) {
    // Get constructor
    var constructor = Eplant.Views.PathwayView;

    // Call parent constructor
    Eplant.View.call(this,
      constructor.displayName, // Name of the View visible to the user
      constructor.viewName,
      constructor.hierarchy, // Hierarchy of the View
      constructor.magnification, // Magnification level of the View
      constructor.description, // Description of the View visible to the user
      constructor.citation, // Citation template of the View
      constructor.activeIconImageURL, // URL for the active icon image
      constructor.availableIconImageURL, // URL for the available icon image
      constructor.unavailableIconImageURL // URL for the unavailable icon image
    );
    /**
     * Is cytoscape currently rendering, used for loading
     * @type {Boolean}
     */
    this.renderingCytoscape = false;
    /**
     * Legend
     * @type {Eplant.Views.PathwayView.Legend}
     */
    this.legend = null;
    /**
     * The genetic element for which to display pathway; inherited from param
     * @type {Object}
     */
    this.geneticElement = geneticElement;

    /**
     * Name of view, specifies top level container used by Eplant.ViewModes
     * @type {String}
     */
    this.viewMode = 'pathway';

    // Creates all containers
    this.constructDOM();

    /**
     * Array of pathways returned by database query against genetic element
     * @type {Array}
     */
    this.pathwaysRecord = [];
    /**
     * Number of pathways returned by database query against genetic element
     * @type {Number}
     */
    this.numPathwayFound = 0;
    /**
     * The visibility status of the pathway selection menu
     * @type {Boolean}
     */
    this.selectionShown = true;

    /**
     * Tracks all event binding which needs to occur on first active call
     * @type {Boolean}
     */
    this.initialLoad = true;

    this.identifier_id = '';

    // Create view-specific UI buttons
    this.createViewSpecificUIButtons();


    this.loadData();

    this.legend = new Eplant.Views.PathwayView.Legend(this);

  };

  /**
   * Static variables
   */
  ZUI.Util.inheritClass(Eplant.View, Eplant.Views.PathwayView);
  Eplant.Views.PathwayView.viewName = 'PathwayView';
  Eplant.Views.PathwayView.displayName = 'Pathways viewer';
  Eplant.Views.PathwayView.hierarchy = 'genetic element';
  Eplant.Views.PathwayView.magnification = 60;
  Eplant.Views.PathwayView.description = 'Pathways viewer';
  Eplant.Views.PathwayView.citation = '';
  Eplant.Views.PathwayView.activeIconImageURL = 'img/active/pathway.png';
  Eplant.Views.PathwayView.availableIconImageURL = 'img/available/pathway.png';
  Eplant.Views.PathwayView.unavailableIconImageURL = 'img/unavailable/pathway.png';
  
  /* Static methods */

  /**
   * Initializes HTML elements required for Pathway View
   */
  Eplant.Views.PathwayView.initialize = function () {
    //Eplant.Views.PathwayView.domContainer = document.getElementById('Pathway_container');
    Eplant.Views.PathwayView.domContainer = $('#Pathway_container');
    $(Eplant.Views.PathwayView.domContainer).css({
      PathwayView: 'none',
      visibility: 'hidden',
    });
    $(this.sbgnVizDOM).css({
      display: 'none',
      visibility: 'hidden',
    });

    Eplant.Views.PathwayView.cacheContainer = document.getElementById('Pathway_cache');
  };

  /* Instance methods */



  /**
   * Creates view-specific UI buttons.
   * @returns {void}
   */
  Eplant.Views.PathwayView.prototype.createViewSpecificUIButtons = function () {
    // more info 
    // Legend
    var viewSpecificUIButton = new Eplant.ViewSpecificUIButton(
      // imageSource
      'img/legend.png',
      // description
      'Toggle legend.',
      function (data) {
        // Check whether legend is showing
        console.trace({
          data
        });
        if (data.PathwayView.legend.isVisible) {
          // Hide legend
          data.PathwayView.legend.hide();
        } else {
          // Show legend
          data.PathwayView.legend.show();
        }
      }, {
        PathwayView: this
      }
    );
    this.viewSpecificUIButtons.push(viewSpecificUIButton);
  };

  /**
   * Creates title label DOM containing view name and gene identifier
   */
  Eplant.Views.PathwayView.prototype.constructTitleDom = function () {
    /**
     * Top HTML container for view label, inherited from Eplant.View
     * @type {HTMLElement}
     */
    $(this.labelDom).empty();

    /**
     * HTML text container for view label, inherited from Eplant.View
     * @type {HTMLElement}
     */
    this.viewNameDom = document.createElement('span');

    var labelText = this.geneticElement.identifier;
    this.geneticElement.identifier
    // Include first alias if one exists
    if (this.geneticElement.aliases && this.geneticElement.aliases.length &&
      this.geneticElement.aliases[0].length) {
      labelText += ' / ' + this.geneticElement.aliases.join(', ');
    }
    var text = this.name + ': ' + labelText;
    this.viewNameDom.appendChild(document.createTextNode(text));
    this.labelDom.appendChild(this.viewNameDom);

    $("#Pathway_container").append(this.labelDom);
  };

  /**
   * Creates DOM containers for Pathway view
   */
  Eplant.Views.PathwayView.prototype.constructDOM = function () {
    /**
     * Top level HTML container for Pathway View
     * @type {HTMLElement}
     */
    this.domContainer = document.createElement('div');
    $(this.domContainer).attr('id', 'pathwayHolder');
    $(this.domContainer).css({
      position: 'relative',
      width: '100%',
      height: '100%',
    });

    /**
     * HTML container for pathway selection menu
     * @type {HTMLElement}
     */
    this.selectionTitleDOM = document.createElement('div');
    $(this.selectionTitleDOM).attr('id', 'pathwaySelect');
    $(this.selectionTitleDOM).css({
      width: '85%',
      margin: '50 50',
    });
    $(this.domContainer).append(this.selectionTitleDOM);

    /**
     * HTML container for sbgn visualization. Loaded in index.html to allow sbgnviz to work
     * @type {HTMLElement}
     */
    this.sbgnVizDOM = $('#pathwayViz');


    /**
     * Blocks off the visualization canvas when cytoscape is rendering
     * 
     * @type {HTMLElement}
     */
    this.loadingScreen = document.getElementById('pathwayLoadingScreen');

    this.noPathwaysMessageDiv = document.getElementById('noPathwaysFoundMessage');
  };

  /**
   * Creates a pathway selector div
   */
  Eplant.Views.PathwayView.PathwaySelector = function (options, onSelection) {
    this.container = document.createElement('div');
    this.container.id = "pathway-selector-box"
    this.selected = options[0].value;
    this.onSelection = onSelection;
    this.options = options;

    // Create all the buttons
    this.buttons = []
    for (let option of this.options) {
      let button = document.createElement('button');
      button.textContent = option.text;
      button.onclick = () => {
        this.selected = option.value;
        this.render();
        this.onSelection();
      }
      this.buttons.push(button);
      this.container.appendChild(button);
    }
    this.enabled = true;
    this.render();
  }
  

  /**
   * Updates the pathway selector buttons
   */
  Eplant.Views.PathwayView.PathwaySelector.prototype.render = function () {
    for (let i = 0; i < this.options.length; i++) {
      this.buttons[i].className = "pathway-selector-button";
      this.buttons[i].disabled = !this.enabled
      if (!this.enabled) this.buttons[i].className += " pathway-selector-disabled"
      if (this.options[i].value == this.selected) this.buttons[i].id = "pathway-selector-active";
      else this.buttons[i].id = "";
    }
  }
  /**
   * Enables the pathway selector buttons
   */
  Eplant.Views.PathwayView.PathwaySelector.prototype.enable = function () {
    this.enabled = true;
    this.render();
  }
  /**
   * Enables the pathway selector buttons
   */
  Eplant.Views.PathwayView.PathwaySelector.prototype.disable = function () {
    this.enabled = false;
    this.render();
  }


  /**
   * Loads all the pathway results from Reactome analysis service.
   */
  Eplant.Views.PathwayView.prototype.loadData = function () {
    var url = `//plantreactome.gramene.org/ContentService/data/pathways/low/diagram/identifier/${this.geneticElement.identifier}/allForms?species=Arabidopsis%20thaliana`;

    // var pathway = this.selectionTitleDOM
    // var that = this;

    fetch(url)
      .then(
        (response) => {
          if (response.status !== 200) {
            console.warn('Looks like there was a problem. Status Code: ' +
              response.status);
            this.loadFinish();
            return;
          }

          // Examine the text in the response
          response.json().then((data) => {
            var options = []

            for (var i = 0; i < data.length; i++) {
              options.push({
                text: data[i].name[0],
                value: data[i].dbId
              });
            }
            this.pathwayOptions = options;
            this.loadFinish();
          });
        }
      )
      .catch(function (err) {
        console.error('Fetch Error -', err);
      });

  };

  /**
   * Active callback method.
   *
   * @override
   */
  Eplant.Views.PathwayView.prototype.active = function () {
    if (!this.isLoadedData) {
      this.noPathwaysMessageDiv.style.display = 'block';
      return;
    }
    // Call parent method
    Eplant.View.prototype.active.call(this);
    
    this.noPathwaysMessageDiv.style.display = 'none';


    // Load HTML elements onto eplant
    $(Eplant.Views.PathwayView.domContainer).append(this.domContainer);
    // Make visible
    $(Eplant.Views.PathwayView.domContainer).css({
      visibility: 'visible',
      display:  'block',
    });
    $(this.sbgnVizDOM).css({
      visibility: 'visible',
      display: 'block',
    });

    this.resizeVizContainer();

    if (this.pathwayOptions && !this.pathwaySelector) {
      this.pathwaySelector = new Eplant.Views.PathwayView.PathwaySelector(this.pathwayOptions, this.updatePathway.bind(this));
      this.selectionTitleDOM.append(this.pathwaySelector.container)
    }
    if (this.initialLoad) {
      this.bindPathwayLoad();
      this.initialLoad = false;
    }

    // Create title label
    if (this.name) {
      this.constructTitleDom();
    }

    if (!this.pathwayOptions) {
      return this.noPathwaysMessageDiv.style.display = 'block';
    }

    if (!this.renderingCytoscape) this.updatePathway();

    //attach legend
    if (this.legend.isVisible) {
      this.legend.attach();
    }
  };

  /**
   * Resizes the sbgn viz container
   */
  Eplant.Views.PathwayView.prototype.resizeVizContainer = function () {
    $(this.sbgnVizDOM).css({
      width: '100%',
      height: '100%',
      position: 'absolute',
      top: '100px',
      border: 'none',
    });
  };

  /**
   * Runs when cytoscape is finished rendering/loading
   */
  Eplant.Views.PathwayView.prototype.cytoscapeReady = function () {
    this.pathwaySelector.enable();
    this.loadingScreen.style.display = 'none';
    this.renderingCytoscape = false;
  }

  /**
   * Updates the visualization in the pathway viewer
   */
  Eplant.Views.PathwayView.prototype.updatePathway = function () {
    this.pathwaySelector.disable();
    this.renderingCytoscape = true;
    if($("#plantReactomeLinkoutButton").length) $("plantReactomeLinkoutButton").remove() //prevent multiple instances of the button from building up
    this.loadingScreen.style.display = 'block';
    //('#pathwayViz').empty();
    //$('#container').empty();

    var find_dbid = this.pathwaySelector.selected;

    var bar_content_services_url = "//bar.utoronto.ca/webservices/reactome/bar_jsonExporter.php?level=Level3&dbId=" + find_dbid; //used for primary pathway information
    var biopax_3_url = "//plantreactome.gramene.org/ReactomeRESTfulAPI/RESTfulWS/biopaxExporter/Level3/" + find_dbid //used to find missing agi identifiers
    var pathway_hierarchy_url = "//plantreactome.gramene.org/ContentService/data/eventsHierarchy/3702"; //contains the hierarchy of all pathways. Used for button names

    console.log(find_dbid);

    var jsonReq = new XMLHttpRequest();
    var pathway = {
      json: null,
      xml: null,
      allpath: null
    };

    /* the function process() takes the json response from bar_content_services_url and deletes the unused information in it. 
     *  first it renames the glyph and arc properties to metabolites and reactions
     *  it then loops through and cleans both the metabolites and the reactions 
     */
    function process(json) {
      var total_meta = {}; // save all the metabolites as keys
            
      json["metabolites"] = json.glyph;
      json["reactions"] = json.arc;

      delete json.glyph;
      delete json.arc;


      //metabolites (nodes)
      for (let i = 0; i < json.metabolites.length; i++){
        if (json.metabolites[i].bbox) delete json.metabolites[i].bbox;
        if (json.metabolites[i].port) delete json.metabolites[i].port;

        //move the contents of the label object from bar_content_services_url to the name property
        if (json.metabolites[i].label){
          json.metabolites[i].name = (json.metabolites[i].label.text ? json.metabolites[i].label.text : undefined);
          delete json.metabolites[i].label
        }

        if (json.metabolites[i].name != null) {
          total_meta[json.metabolites[i].name] = json.metabolites[i].name
        }
      }

      //reactions (edges)
      for (let i = 0; i < json.reactions.length; i++){
        if (json.reactions[i].port) delete json.reactions[i].port;

        //remove unneccessary prefix from target of reaction (edge)
        if (json.reactions[i].target.slice(0,10) == "InputPort_") json.reactions[i].target = json.reactions[i].target.slice(10); //remove "InputPort_" from the target of the edges
        if (json.reactions[i].target.slice(0,11) == "OutputPort_") json.reactions[i].target = json.reactions[i].target.slice(11); //remove "OutputPort_" from the target of the edges
        
        //remove unneccessary prefix from source of reaction (edge)
        if (json.reactions[i].source.slice(0,10) == "InputPort_") json.reactions[i].source = json.reactions[i].source.slice(10); //remove "InputPort_" from the source of the edges
        if (json.reactions[i].source.slice(0,11) == "OutputPort_") json.reactions[i].source = json.reactions[i].source.slice(11); //remove "OutputPort_" from the source of the edges

        if (json.reactions[i].start != null && json.reactions[i].end != null) {
          delete json.reactions[i].start;
          delete json.reactions[i].end;
        }
      }

      console.log(json);
      replace_with_AGI(total_meta, json);
    };

    //creating a separate function from createCellHierarchy in case mapping algorithm needs to change
    function mapReactomeCompartment(node, compartmentMap){
      //set the id to the correct one
      if(node.class == 'compartment'){
        node.id = compartmentMap[node.id];
      }
      // set the parent to the correct one
      // we use the compartmentRef property to do this before conversion to cy.js
      // this is done by the createCellHierarchy function for the components
      else {
        if(node.hasOwnProperty('compartmentRef')) {
          node.compartmentRef = compartmentMap[node.compartmentRef];
        }
        //if called after property has been changed to "parent" this will run
        if(node.hasOwnProperty('parent')) {
          node.parent = compartmentMap[node.parent];
        }
      }
    }


    function createCellHierarchy(cyData, cellStructure, compartmentMap) {
      const exists = {}
      
      //note which cell compartments are in the graph and map to our structure
      for (let i = 0; i < cyData.nodes.length; i++) {
        mapReactomeCompartment(cyData.nodes[i], compartmentMap)   
        if (!exists[cyData.nodes[i].id]) exists[cyData.nodes[i].id] = true;
        else {
          delete cyData.nodes[i] //prevent multiple nodes from existing
        }
      }

      //make sure the keys increase linearly as deletion just removes the index deleted, leaving a gap and causing the rest of the code to crash without this line
      cyData.nodes = Object.values(cyData.nodes)

      //set display names and parents
      for (let i = 0; i < cyData.nodes.length; i++) {
        if (cyData.nodes[i].class == 'compartment') {
          
          //if the id is in our cell structure (it should be after mapReactomeCompartment), set the display name to the expected one
          if (cellStructure[cyData.nodes[i].id]) cyData.nodes[i].name = cellStructure[cyData.nodes[i].id].displayName;
          else console.log(`There is no entry in cyData for ${cyData.nodes[i].name}`);
  
          // If the parent compartment isn't in the pathway use its parent
          let parent = cellStructure[cyData.nodes[i].id].parent;
          while (!exists[parent] && parent) parent = (cellStructure[parent].parent ? cellStructure[parent].parent : undefined);
          cyData.nodes[i].parent = parent;
        }
      }
    }

    // used to modify JSON object to be compatible with cytoscapeJS
    function convert_to_cyjs(cyData) {
      var converted = {};
      converted.nodes = cyData.metabolites;
      converted.edges = cyData.reactions;

      //delete cyData.language;

      // cyData.nodes = cyData.metabolites;
      // cyData.edges = cyData.reactions;
      // delete cyData.metabolites;
      // delete cyData.reactions;
      createCellHierarchy(converted, cellStructurePlantReactome, compartmentMap);

      //move all node information into data object
      for (let i = 0; i < converted.nodes.length; i++) {
        //rename the compartmentRef property to parent, compartments will not have a compartmentRef property as they've been handled in createCellHierarchy()
        if (converted.nodes[i].class != 'compartment') {
          converted.nodes[i].parent = converted.nodes[i].compartmentRef;
          delete converted.nodes[i].compartmentRef;
        }
        converted.nodes[i] = {data: converted.nodes[i]};
      }
      //make sure the keys increase linearly as deletion just removes the index deleted
      converted.nodes = Object.values(converted.nodes)


      //loop used for editing the object based on edges
      for (let i = 0; i < converted.edges.length; i++) {
        converted.edges[i] = {data: converted.edges[i]};

        /* if the source is a node inside a complex node make the source be the complex node itself */
        // loop through all nodes and if complex, loop through the list of internal nodes, checking against the source and target
        for (let j = 0; j < converted.nodes.length; j++) {      
          if (converted.nodes[j].data.class === "complex") {
            for (let k = 0; k < converted.nodes[j].data.glyph.length; k++) {
              if (converted.edges[i].data.source === converted.nodes[j].data.glyph[k].id) converted.edges[i].data.source = converted.nodes[j].data.id; //if the source is found inside set it to the parent
              if (converted.edges[i].data.target === converted.nodes[j].data.glyph[k].id) converted.edges[i].data.target = converted.nodes[j].data.id; //if the target is found inside set it to the parent
            }
          }
        }
      }
      converted.edges = Object.values(converted.edges)

      return converted;
    }

    const that = this;
    /* the function replace_with_AGI() takes a list of all the elements that need AGI tags, finds them from biopax_3_url and places them into the original json
     *  it first parses the xml into a json object using the X2JS library,
     *  then it loops through the physical entities and adds the AGI tags to the list, repeating this with the proteins and small molecules,
     *  after finishing looking through the xml file from biopax_3_url, it then constructs a object to use to swap the values in the bar_content_services_url 
     *  response with AGI identifiers and edits the list of elements to have their AGI tags,
     * 
     * 
     */
    function replace_with_AGI(total_meta, original_json) {
      // var X2JS = require("x2js");
      var x2js = new X2JS();
      var xml = x2js.xml_str2json(pathway.xml);
      var xml = xml.RDF

      var PhysicalEntities = xml.PhysicalEntity
      var Proteins = xml.Protein
      var SmallMolecules = xml.SmallMolecule

      //source used to store all the data from xml
      //e.g. source["phys-ent-participant12862"] = ["Protein6","Protein7","Protein8"] in 9133207
      var source = {};

      //used to extract all identifiers in PhysicalEntity in xml file
      if (PhysicalEntities != null) {
        if (PhysicalEntities.displayName != null && PhysicalEntities.displayName.__text != null) {
          var PhysicalEntity = [];
          if (PhysicalEntities.memberPhysicalEntity != null) {
            for (var j in PhysicalEntities.memberPhysicalEntity) {
              if (PhysicalEntities.memberPhysicalEntity[j]["_rdf:resource"] != null) {
                if (PhysicalEntities.memberPhysicalEntity[j]["_rdf:resource"].includes("#")) { 
                  var PhysicalEntity_AGI = PhysicalEntities.memberPhysicalEntity[j]["_rdf:resource"].replace("#", "") 
                  PhysicalEntity.push(PhysicalEntity_AGI)
                } else {
                  PhysicalEntity.push(PhysicalEntities.memberPhysicalEntity[j]["_rdf:resource"])
                }
              } 
              /* Calling .toString() like is done here gives the string "[Object, Object]" which will always evaluate to false */
              // else if (PhysicalEntities.memberPhysicalEntity[j] != null && PhysicalEntities.memberPhysicalEntity[j].toString().match(/#/ig) != null) {
              //   var ss = PhysicalEntities.memberPhysicalEntity[j].replace(/(#)(.+)/ig, '$2') // same as .replace("#", "") from above
              //   s.push(ss)
              // }
            }
            source[PhysicalEntities.displayName.__text] = PhysicalEntity;
          } 
          else if (PhysicalEntities.memberPhysicalEntity == null &&
            PhysicalEntities.name != null) {
            for (var j in PhysicalEntities[i].name) {
              PhysicalEntity.push(PhysicalEntities.name[j].__text)
            }
            source[PhysicalEntities.displayName.__text] = PhysicalEntity;
          }
        } 
        else {
          for (var i = 0; i < PhysicalEntities.length; i++) {
            var PhysicalEntity = [];
            if (PhysicalEntities[i].memberPhysicalEntity != null) {
              for (var j in PhysicalEntities[i].memberPhysicalEntity) {
                if (PhysicalEntities[i].memberPhysicalEntity[j]["_rdf:resource"] != null) {
                  if (PhysicalEntities[i].memberPhysicalEntity[j]["_rdf:resource"].includes("#")) { 
                    var PhysicalEntity_AGI = PhysicalEntities[i].memberPhysicalEntity[j]["_rdf:resource"].replace("#", "")
                    PhysicalEntity.push(PhysicalEntity_AGI)
                  } 
                  else {
                    PhysicalEntity.push(PhysicalEntities[i].memberPhysicalEntity[j]["_rdf:resource"])
                  }
                } 
                /* Calling .toString() like is done here gives the string "[Object, Object]" which will always evaluate to false */
                // else if (PhysicalEntities[i].memberPhysicalEntity[j] != null && PhysicalEntities[i].memberPhysicalEntity[j].toString().match(/#/ig) != null) {
                //   var ss = PhysicalEntities[i].memberPhysicalEntity[j].replace(/(#)(.+)/ig, '$2')
                //   s.push(ss)
                // }
              }
              source[PhysicalEntities[i].displayName.__text] = PhysicalEntity;
            } 
            else if (PhysicalEntities[i].memberPhysicalEntity == null && PhysicalEntities[i].name != null) {
              for (var j in PhysicalEntities[i].name) {
                PhysicalEntity.push(PhysicalEntities[i].name[j].__text)
              }
              source[PhysicalEntities[i].displayName.__text] = PhysicalEntity;
            }
          }
        }
      }

      //used to extract all identifiers in Protein in xml file
      for (var i = 0; i < Proteins.length; i++) {
        var protein = [];
        if (Proteins[i].displayName.__text != null && Proteins[i].displayName.__text.toString().match(/AT\dG\d+/ig) == null && Proteins[i].memberPhysicalEntity != null) {
          for (var j in Proteins[i].memberPhysicalEntity) {
            if (Proteins[i].memberPhysicalEntity[j]["_rdf:resource"] != null) {
              if (Proteins[i].memberPhysicalEntity[j]["_rdf:resource"].includes("#")) {
                var protein_AGI = Proteins[i].memberPhysicalEntity[j]["_rdf:resource"].replace("#", "")
                protein.push(protein_AGI)
              } 
              else {
                protein.push(PhysicalEntities[i].memberPhysicalEntity[j]["_rdf:resource"])
              }
            } else if (Proteins[i].memberPhysicalEntity[j] != null && Proteins[i].memberPhysicalEntity[j].toString().match(/#/ig) != null) {
              var protein_AGI = Proteins[i].memberPhysicalEntity[j].replace(/(#)(.+)/ig, '$2')
              protein.push(protein_AGI)
            }
          }
          source[Proteins[i].displayName.__text] = protein;
          source[Proteins[i]["_rdf:ID"]] = protein;
        } else if (Proteins[i].displayName.__text != null && Proteins[i].displayName.__text.toString().match(/AT\dG\d+/ig) != null && Proteins[i].memberPhysicalEntity == null) {
          protein.push(Proteins[i].displayName.__text)
          source[Proteins[i]["_rdf:ID"]] = protein;
        }
      }

      //use to extract all names in SmallMolecules, only used to replace LOC_OS and phys_ent into the first name in .name array list
      //consider the case for only one SmallMolecule
      if(SmallMolecules != null){
        if (SmallMolecules.displayName != null && SmallMolecules.displayName.__text != null && (SmallMolecules.displayName.__text.toString().match(/(phys-ent-participant)(\d+)/ig) != null || SmallMolecules.displayName.__text.toString().match(/(loc_os\d+)/ig) != null)) {
          if (SmallMolecules.name != null) {
            if (SmallMolecules.name.__text != null) {
              source[SmallMolecules.displayName.__text] = [SmallMolecules.name.__text]
            } else {
              source[SmallMolecules.displayName.__text] = [SmallMolecules.name[0].__text]
            }
          } else {
            source[SmallMolecules.displayName.__text] = [SmallMolecules.displayName.__text]
          }
        } else {
          for (var i in SmallMolecules) {
            if (SmallMolecules[i].displayName != null && SmallMolecules[i].displayName.__text != null &&
              (SmallMolecules[i].displayName.__text.toString().match(/(phys-ent-participant)(\d+)/ig) != null || SmallMolecules[i].displayName.__text.toString().match(/(loc_os\d+)/ig) != null)) {
  
              if (SmallMolecules[i].name != null) {
                if (SmallMolecules[i].name.__text != null) {
                  source[SmallMolecules[i].displayName.__text] = [SmallMolecules[i].name.__text]
                } else {
                  source[SmallMolecules[i].displayName.__text] = [SmallMolecules[i].name[0].__text]
                }
              } else {
                source[SmallMolecules[i].displayName.__text] = [SmallMolecules[i].displayName.__text]
              }
            }
          }
        }
      }

      //use a loop to replace all the #Protein\d+ into AGI identifiers
      for (var i in source) {
        for (var j in source) {
          for (var k in source[i]) {
            if (source[i][k] == j) {
              source[i][k] = source[j]
            }
          }
        }
      }
      var metabolite_to_AGI = {}; //used to rebuild source, have a more clear view
      for (var i in source) {
        var AGIs = [];
        for (var j in source[i]) {
          if (typeof source[i][j] !== 'function') {
            AGIs.push(source[i][j])
          }
        }
        AGIs = AGIs.join().split(',');
        metabolite_to_AGI[i] = [...new Set(AGIs)];
      }

      //replace AGI identifiers name in total_meta
      // can use for debug and see which identifier is in wrong place
      for (var i in total_meta) {
        for (var j in metabolite_to_AGI) {
          if (j == i) {
            total_meta[i] = metabolite_to_AGI[j]
          }
        }
      }

      //add identifiers into original JSON file
      for (var i in original_json.metabolites) {
        for (var j in total_meta) {
          if (original_json.metabolites[i].name != null && original_json.metabolites[i].name == j) {
            original_json.metabolites[i].name = total_meta[j]
            if (Eplant.activeSpecies.activeGeneticElement.identifier in total_meta /*[i]*/ ) {
              this.identifier_id = original_json.metabolites[i].id
            }
          }
        }
      }

      var str_obj = JSON.stringify(original_json)
      // str_obj = str_obj.replace(/(\\)/ig, '')
      // str_obj = str_obj.replace(/(")({)(.+?)(})(")/ig, '$2' + '$3' + '$4')
      //console.log(str_obj)   // used for debugging
      var edited_json = JSON.parse(str_obj);
      var parsed_for_cy = convert_to_cyjs(edited_json)

      //not needed after swapping to html labels
      //add newlines to the multi-element node labels
      var final_obj = parsed_for_cy; // will be the same as parsed_for_cy but for nodes with multiple names we have strings with the names seperated by \n characters instead of arrays
      for (let i = 0; i < final_obj.nodes.length; i++) {
        if (Array.isArray(final_obj.nodes[i].data.name) /*final_obj.nodes[i].data.class === "or" || final_obj.nodes[i].data.class === "unspecified entity"*/) {
          final_obj.nodes[i].data.name = final_obj.nodes[i].data.name.join("\n");
        }
      }


      //make sure that they all have names, if they don't add a name property with empty string contents
      for (let i = 0; i < final_obj.nodes.length; i++) {
        // add the name property to the process nodes missing it
        if (!final_obj.nodes[i].data.name) {
          if (parsed_for_cy.nodes[i].data.class === "process") final_obj.nodes[i].data.name = " "
          else final_obj.nodes[i].data.name = final_obj.nodes[i].data.class;
        }
      }
      console.log(final_obj);

      /* plant reactome for more information button */
      //look at response from url_3 to find id name
      var allPathways = JSON.parse(pathway.allpath)
      
      //look at the button to find name of pathway
      var pathwayName = $("#pathway-selector-active").text();

      //recursively search for pathway with matching name and return the id
      function findPlantReactomeID (pathwayName, node) {
        if (node.name == pathwayName) return node.stId;
        if (node.children) {
          for (newNode of node.children){
            const id = findPlantReactomeID(pathwayName, newNode);
            if (id) return id;
          }
        }
      }
      
      //call the recursive search function on all of the trees from url_3
      var plantReactomeID;
      for (node of allPathways){
        let temp =  findPlantReactomeID(pathwayName, node)
        if (temp){
          plantReactomeID = temp;
          break
        }
      }

      //construct the url for plant reactome
      var plantReactomeURL = `//plantreactome.gramene.org/PathwayBrowser/#/${plantReactomeID}`

      //create the button
      button = document.createElement('button')
      button.id = "plantReactomeLinkoutButton"
      //button.class = "button"
      button.appendChild(document.createTextNode("Go to Plant Reactome for more information."))
      button.onclick = function() {window.open(plantReactomeURL)}

      //add the button to the dom
      $('#pathwayViz').append(button)

      var cy = cytoscape({
        container: $('#pathwayCytoscape'),
        elements: final_obj,
        wheelSensitivity: 0.2,
        style: [{
            selector: 'node',
            style: {
              'text-events': 'yes',
              width: 15,
              height: 15,
              'text-outline-opacity': 0,
              'text-background-color': 'white',
              'text-background-opacity': 0,
              'text-wrap': 'wrap',
              'font-size': '10px',
              'line-height': '1px',
              label: 'data(name)',
              'color': 'white',
              'text-opacity': 0,
              'text-halign': 'center',
              'text-valign': 'center',
            }
          },
          {
            selector: ':parent',
            style: {
              'background-opacity': 1,
              'background-color': 'white',
              'border-width': 3,
              'border-opacity': 1,
              'border-color': 'grey',
              'padding': '15px',
              shape: 'roundrectangle',
              'text-halign': 'center',
              'text-valign': 'top',
              'font-size': '14px',
              label: 'data(name)',
              'color': 'white',
              'text-opacity': 0,
              'text-outline-opacity': 0,
              'text-background-color': 'white',
              'text-background-opacity': 0,
            }
          },
          {
            selector: 'edge',
            style: {
              'width': 1,
              'font-size': 4,
              'target-arrow-shape': 'triangle',
              'arrow-scale': 0.7,
              'curve-style': 'bezier',
              'control-point-step-size': 30,
            }
          },
        ],
      });

      
      /* remove duplicate nodes branching into homologues */
      // the edges going into homologues all have class == "logic arc", but not all logic arcs branch into homologues. We delete only the ones branching into homologues from macromolecules
      var logic_arcs = cy.edges('[class = "logic arc"]');
      for (var i = 0; i < logic_arcs.length; i++) {
        //if the edge goes from a macromolecule to an or
        if (cy.nodes(`[id = "${logic_arcs[i]._private.data.source}"][class = "macromolecule"]`).length && cy.nodes(`[id = "${logic_arcs[i]._private.data.target}"][class = "or"]`).length){
          logic_arcs[i].sources().remove();
          logic_arcs[i].remove();
        }
        else if (logic_arcs[i]._private.data.source === logic_arcs[i]._private.data.target) {
          logic_arcs[i].remove();
        }
      }

      /*--------------- style overrides for different classes ---------------*/
      /* NODES
      four different types of node class
        macromolecule
        or:                     a collection of multiple macromolecules on a single node
        unspecified entity:     only seen once and it was the same as an or
        simple chemical:        chemical compounds, such as H2O
        complex:                Nested pathways, we don't use the information inside them. if the user wants to see they can go to plant reactome 
      */
      cy.nodes('[class = "process"]').style({
        'border-width': 0,
        'background-opacity': 0,
        'background-image-opacity': 1,
        'background-image': 'img/available/pathway.png',
        width: 25,
        height: 25,
        'background-width': '100%',
        'background-height': '100%',

      });
      cy.nodes('[class = "macromolecule"]').style({
        shape: 'square',
        'background-color': "#333333",
        'background-opacity': 0,
        'border-opacity': 0,
        width: 20,
        height: 20,
      });
      cy.nodes('[class = "or"]').style({
        shape: 'square',
        'background-color': "#333333",
        'background-opacity': 0,
        'border-opacity': 0,
        width: 20,
        height: 20,
      });
      cy.nodes('[class = "unspecified entity"]').style({
        shape: 'square',
        'background-color': "#333333",
        'background-opacity': 0,
        'border-opacity': 0,
        width: 20,
        height: 20,
      });
      cy.nodes('[class = "simple chemical"]').style({
        'background-color': '#333333',
      });
      cy.nodes('[class = "complex"]').style({
        shape: 'hexagon',
        'background-color': "#8484D2",
        'border-opacity': 0,
        width: 20,
        height: 17,
      });


      /* EDGES
      Four different types of edge class
        logic arc: protein => protein
        catalysis: protein => reaction
        production: reaction => molecule 
        consumption: molecule => reaction
      */
      cy.edges('[class = "consumption"]').style({
        'line-color': '#333333',
        'target-arrow-color': '#333333',
      });
      cy.edges('[class = "logic arc"]').style({
        'line-color': '#666666',
        'target-arrow-color': '#666666',
      });
      cy.edges('[class = "catalysis"]').style({
        'line-color': '#99cc00',
        'target-arrow-color': '#99cc00',
      });
      /* style overrides for the different cell compartments
      Cell compartments and styles are defined in const cellStructure above and applied iteratively
      */
      for (const cellComponent of Object.keys(cellStructurePlantReactome)) {
        cy.nodes(`[id = "${cellComponent}"]`).style(cellStructurePlantReactome[cellComponent].style);
      }


      /* Layout */
      cy.nodes(`[class != "process"][class != "macromolecule"][class != "or"][class != "unspecified entity"]`).style({
        'text-valign': 'top'
      })
      //label position overrides, used for positioning nodes so their labels don't overlap

      cy.layout({
        name: 'cose-bilkent',
        //quality: 'proof',
        //animate: false,
        nodeDimensionsIncludeLabels: true, //doesn't work because the labels are html
        // Node repulsion (non overlapping) multiplier
        //nodeRepulsion: 2500,
        // Padding on fit
        //padding: 25,
        stop: that.cytoscapeReady()
/*
        
        // Maximum number of iterations to perform
        numIter: 7500,
        
        // Type of layout animation. The option set is {'during', 'end', false}
        animate: false,
        // Whether to include labels in node dimensions. Useful for avoiding label overlap
        nodeDimensionsIncludeLabels: true,
          // Ideal (intra-graph) edge length
        idealEdgeLength: 100,
        // Divisor to compute edge forces
        edgeElasticity: 0.4,
        // Whether to fit the network view after when done
        fit: true,
*/
      }).run();

      /*adding the tooltip*/

      //BEN CHANGED (swapped to mutation observer)
      var active_gene = Eplant.activeSpecies.activeGeneticElement.identifier

      /* target node for the mutation observer */
      //NOTE: non jquery as mutation observer needs non-jquery objects for the node inputs
      //var targetNode = document.getElementById("activeCyNodeLabel").parentElement.parentElement.parentElement.parentElement.parentElement;
      const targetNode = document.getElementById('pathwayCytoscape') //same as the line above
      const config = {
        //attributes: true, 
        childList: true, 
        subtree: true
      }

      let tippyContentSVG = Eplant.activeSpecies.activeGeneticElement.views.KlepikovaView.svgdom[0];
      let tooltips = [];

      const callback = (mutationList, observer) => {
        for (const mutation of mutationList) {
          if (mutation.addedNodes.length) {
            for (node of mutation.addedNodes) {
              if (node.contains(document.getElementById("activeCyNodeLabel"))){
                
                //prevents memory leaks: if multiple somehow get added this makes sure that ALL of the old ones get deleted, not just one
                while (tooltips.length) {
                  let tip = tooltips.shift();
                  if (!tip.destroy) continue;
                  tip.destroy();
                }

                tippyContentSVG.style.cssText = "width: 100%; height: 100%; left: 0; top: 0; display: inline-block;";
                
                tooltips.push(tippy("#activeCyNodeLabel", {
                  // tippy options:
                  content: `<div><div style="position:absolute">Klepikova eFP View for ${active_gene}</div><div>` + tippyContentSVG.outerHTML + `</div></div>`,
                  allowHTML: true,
                  zIndex: 999999999,
                  delay: [20, 200],
                  theme: 'light',
                })[0]);
              }
            }
          }
        }
      }

      const observer = new MutationObserver(callback);
      
      observer.observe(targetNode, config);
      
      //prevent nodes from overlapping on drag, serves to prevent the user from dragging a node into a different cell compartment
      cy.nodes().noOverlap();    
      
      /* node html labels */
      
      //create html labels for non compartment nodes
      cy.nodeHtmlLabel([{
        //process nodes don't have a label so we don't need to look at them. Compartments, macromolecules and unspecified entities are done below
        query: `node[class != "compartment"][class != "process"][class != "macromolecule"][class != "or"][class != "unspecified entity"][class != "complex"]`, // cytoscape query selector
        halign: 'center', // title vertical position. Can be 'left',''center, 'right'
        valign: 'top', // title vertical position. Can be 'top',''center, 'bottom'
        halignBox: 'center', // title vertical position. Can be 'left',''center, 'right'
        valignBox: 'top', // title relative box vertical position. Can be 'top',''center, 'bottom'
        cssClass: 'cyNodeContainer', // any classes will be as attribute of <div> container for every title
        tpl(data) {
          //don't need to check for active gene as it will be a macromolecule or an in an "or" grouping
          return '<span class="cyNode" >' + data.name.replace(/\n/g, "<br>") + '</span>'; // your html template here
        }
      }]);
      cy.nodeHtmlLabel([{
        query: `node[class = "macromolecule"]`, // cytoscape query selector
        halign: 'center', // title vertical position. Can be 'left',''center, 'right'
        valign: 'center', // title vertical position. Can be 'top',''center, 'bottom'
        halignBox: 'center', // title vertical position. Can be 'left',''center, 'right'
        valignBox: 'center', // title relative box vertical position. Can be 'top',''center, 'bottom'
        cssClass: 'cyNodeContainer', // any classes will be as attribute of <div> container for every title
        tpl(data) {
          //bold the active gene
          if (data.name.includes(active_gene)) {             
            let out = `<span class="cyNode">`
            let elements = data.name.split("\n")
            for (let i = 0; i < elements.length; i++) {
              if (elements[i] == active_gene) {
                out += `<span class="pathwayLabelSpacer"></span><span id="activeCyNodeLabel">${elements[i]}</span><span class="pathwayLabelSpacer"></span><br>`
              } else {
                out += `<span class="pathwayLabelSpacer"></span>${elements[i]}<span class="pathwayLabelSpacer"></span><br>`
              }
            }
            out = out.slice(0,-4) + "</span>"; // removes final <br> tag from looping and closes the span
            return out;
          } else {
            return '<span class="cyNode" >' + data.name.replace(/\n/g, "<br>") + '</span>'; // your html template here
          }
        }
      }]);
      cy.nodeHtmlLabel([{
        //or nodes are just macromolecule nodes with multiple genes
        query: `node[class = "or"]`, // cytoscape query selector
        halign: 'center', // title vertical position. Can be 'left',''center, 'right'
        valign: 'center', // title vertical position. Can be 'top',''center, 'bottom'
        halignBox: 'center', // title vertical position. Can be 'left',''center, 'right'
        valignBox: 'center', // title relative box vertical position. Can be 'top',''center, 'bottom'
        cssClass: 'cyNodeContainer', // any classes will be as attribute of <div> container for every title
        tpl(data) {
          //bold the active gene
          if (data.name.includes(active_gene)) {             
            let out = `<span class="cyNode">`
            let elements = data.name.split("\n")
            for (let i = 0; i < elements.length; i++) {
              if (elements[i] == active_gene) {
                out += `<span class="pathwayLabelSpacer"></span><span id="activeCyNodeLabel">${elements[i]}</span><span class="pathwayLabelSpacer"></span><br>`
              } else {
                out += `<span class="pathwayLabelSpacer"></span>${elements[i]}<span class="pathwayLabelSpacer"></span><br>`
              }
            }
            out = out.slice(0,-4) + "</span>"; // removes final <br> tag from looping and closes the span
            return out;
          } else {
            return '<span class="cyNode" >' + data.name.replace(/\n/g, "<br>") + '</span>'; // your html template here
          }
        }
      }]);
      cy.nodeHtmlLabel([{
        //unspecified entity nodes are an edge case where the api sets the class of a node to unspecified entity. 
        //In my testing they always should have been either or nodes or macromolecules
        query: `node[class = "unspecified entity"]`, // cytoscape query selector
        halign: 'center', // title vertical position. Can be 'left',''center, 'right'
        valign: 'center', // title vertical position. Can be 'top',''center, 'bottom'
        halignBox: 'center', // title vertical position. Can be 'left',''center, 'right'
        valignBox: 'center', // title relative box vertical position. Can be 'top',''center, 'bottom'
        cssClass: 'cyNodeContainerUnspecified', // any classes will be as attribute of <div> container for every title
        tpl(data) {
          //bold the active gene
          if (data.name.includes(active_gene)) {             
            let out = `<span class="cyNode">`
            let elements = data.name.split("\n")
            for (let i = 0; i < elements.length; i++) {
              if (elements[i] == active_gene) {
                out += `<span class="pathwayLabelSpacer"></span><span id="activeCyNodeLabel">${elements[i]}</span><span class="pathwayLabelSpacer"></span><br>`
              } else {
                out += `<span class="pathwayLabelSpacer"></span>${elements[i]}<span class="pathwayLabelSpacer"></span><br>`
              }
            }
            out = out.slice(0,-4) + "</span>"; // removes final <br> tag from looping and closes the span
            return out;
          } else {
            return '<span class="cyNode" >' + data.name.replace(/\n/g, "<br>") + '</span>'; // your html template here
          }
        }
      }]);
      cy.nodeHtmlLabel([{
        //unspecified entity nodes are an edge case where the api sets the class of a node to unspecified entity. 
        //In my testing they always should have been either or nodes or macromolecules
        query: `node[class = "complex"]`, // cytoscape query selector
        halign: 'center', // title vertical position. Can be 'left',''center, 'right'
        valign: 'top', // title vertical position. Can be 'top',''center, 'bottom'
        halignBox: 'center', // title vertical position. Can be 'left',''center, 'right'
        valignBox: 'top', // title relative box vertical position. Can be 'top',''center, 'bottom'
        cssClass: 'cyNodeContainerComplex', // any classes will be as attribute of <div> container for every title
        tpl(data) {
          //bold the active gene
          if (data.name.includes(active_gene)) {             
            let out = `<span class="cyNode">`
            let elements = data.name.split("\n")
            for (let i = 0; i < elements.length; i++) {
              if (elements[i] == active_gene) {
                out += `<span class="pathwayLabelSpacer"></span><span id="activeCyNodeLabel">${elements[i]}</span><span class="pathwayLabelSpacer"></span><br>`
              } else {
                out += `<span class="pathwayLabelSpacer"></span>${elements[i]}<span class="pathwayLabelSpacer"></span><br>`
              }
            }
            out = out.slice(0,-4) + "</span>"; // removes final <br> tag from looping and closes the span
            return out;
          } else {
            return '<span class="cyNode" >' + data.name.replace(/\n/g, "<br>") + '</span>'; // your html template here
          }
        }
      }]);
      
      //labels for parent nodes other than the lumens
      //we deal with the lumen labels down below. They need to be in a div with a specific class which cannot be done from within this function

      cy.nodeHtmlLabel([{
        query: `node[class = "compartment"][id *= "membrane"]`, // cytoscape query selector
        halign: 'center', // title vertical position. Can be 'left',''center, 'right'
        valign: 'top', // title vertical position. Can be 'top',''center, 'bottom'
        halignBox: 'center', // title vertical position. Can be 'left',''center, 'right'
        valignBox: 'top', // title relative box vertical position. Can be 'top',''center, 'bottom'
        cssClass: 'cyCompartmentMembraneContainer', // any classes will be as attribute of <div> container for every title
        tpl(data) {
          return '<span class="cyCompartmentMembrane" >' + data.name + '</span>'; // your html template here
        }
      }]);
      //labels for the lumen. Separated so a div with a class and style="bottom: 25px" can be applied. Does not work without the 
      cy.nodeHtmlLabel([{
        query: `node[class = "compartment"][id *= "lumen"]`, // cytoscape query selector
        halign: 'center', // title vertical position. Can be 'left',''center, 'right'
        valign: 'top', // title vertical position. Can be 'top',''center, 'bottom'
        halignBox: 'center', // title vertical position. Can be 'left',''center, 'right'
        valignBox: 'top', // title relative box vertical position. Can be 'top',''center, 'bottom'
        cssClass: 'cyCompartmentLumenContainer', // any classes will be as attribute of <div> container for every title
        tpl(data) {
          return '<span class="cyCompartmentLumen" >' + data.name + '</span>'; // your html template here    
        }
      }]);
      cy.nodeHtmlLabel([{
        query: `node[class = "compartment"][id !*= "membrane"][id !*= "lumen"]`, // cytoscape query selector
        halign: 'center', // title vertical position. Can be 'left',''center, 'right'
        valign: 'top', // title vertical position. Can be 'top',''center, 'bottom'
        halignBox: 'center', // title vertical position. Can be 'left',''center, 'right'
        valignBox: 'top', // title relative box vertical position. Can be 'top',''center, 'bottom'
        cssClass: 'cyCompartmentContainer', // any classes will be as attribute of <div> container for every title
        tpl(data) {
          return '<span class="cyCompartment" >' + data.name + '</span>'; // your html template here
        }
      }]);

      cy.fit(20);
      cy.center();
    };




    //get all the lower level pathways
    var ap = new XMLHttpRequest()
    ap.open("GET", pathway_hierarchy_url, true);
    ap.onload = function (oEvent) {
      if (this.readyState !== 4 || this.status !== 200) {
        console.error('cannot download all the pathways from Content Service')
        return;
      }
      pathway.allpath = ap.response;
      if (pathway.allpath != null) {
        //get_dbid(pathway.allpath)
        get_pathway_data_from_url(bar_content_services_url, biopax_3_url)
      } else {
        console.error("no content from Content Service");
      }
    };
    ap.send()

    function get_pathway_data_from_url(url_1, url_2) {
      //get single pathway json data
      jsonReq.open("GET", url_1, true);

      jsonReq.onload = function (oEvent) {
        if (this.readyState !== 4 || this.status !== 200) {
          console.error('cannot download json')
          return;
        }
        var arrayBuffer = JSON.parse(jsonReq.response); // Note: not oReq.responseText
        pathway.json = arrayBuffer;
        if (pathway.xml !== null) {  
          process(pathway.json) //will only run if the xml has responded first
        }
      };
      jsonReq.send()


      // get xml data
      var xmlReq = new XMLHttpRequest();
      xmlReq.open("GET", url_2, true);

      xmlReq.onload = function (oEvent) {
        if (this.readyState !== 4 || this.status !== 200) {
          console.error('cannot download xml');
          return;
        }
        var arrayBuffer = xmlReq.response; // Note: not oReq.responseText
        pathway.xml = arrayBuffer;
        if (pathway.json !== null) {
          process(pathway.json) //similar to the call above, only the second one to respond will run
        }
      };

      xmlReq.send();
    }

  }

  /**
   * Sets onclick behavior of pathway links to load sbgnviz
   */
  Eplant.Views.PathwayView.prototype.bindPathwayLoad = function () {
    $('#pathways').on('change', this.updatePathway);
    //document.getElementById('pathways').addEventListener('change', this.updatePathway)
  };

  /**
   * Reposition HTML container after loading
   * @override
   */
  Eplant.Views.PathwayView.prototype.afterActive = function () {
    Eplant.View.prototype.afterActive.call(this);
    //this.domContainer.style.top = "0%"; //this.domContainer is already defined when this is called so to replace the jquery we don't need to use document methods
    $(this.domContainer).css({
      top: '0%'
    });
  };

  //removed was added
  Eplant.Views.PathwayView.prototype.remove = function () {
    // Call parent method
    Eplant.View.prototype.remove.call(this);

  };

  /**
   * Inactive callback method.
   *
   * @override
   */
  Eplant.Views.PathwayView.prototype.inactive = function () {
    // Call parent method
    Eplant.View.prototype.inactive.call(this);

    $(this.domContainer).detach(); // the closest to detach without jquery is remove which does not store the data
    $(Eplant.Views.PathwayView.domContainer).css({
      visibility: 'hidden',
      display: 'none',
    });
    $(this.sbgnVizDOM).css({
      display: 'none',
      visibility: 'hidden',
    });

    // Detach legend
    if (this.legend.isVisible) {
      this.legend.detach();
    }
  };

  /**
   * Returns The exit-out animation configuration.
   *
   * @override
   * @return {Object} The exit-out animation configuration.
   */
  Eplant.Views.PathwayView.prototype.getExitOutAnimationConfig = function () {
    var config = Eplant.View.prototype.getExitOutAnimationConfig.call(this);
    config.begin = $.proxy(function () {
      $(this.domContainer).stop().animate({ 
        top: '250%'
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
  Eplant.Views.PathwayView.prototype.getEnterOutAnimationConfig = function () {
    var config = Eplant.View.prototype.getEnterOutAnimationConfig.call(this);
    config.begin = $.proxy(function () {
      $(this.domContainer).css({ 
        top: '-250%'
      });
      $(this.domContainer).stop().animate({
        top: '0%'
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
  Eplant.Views.PathwayView.prototype.getExitInAnimationConfig = function () {
    var config = Eplant.View.prototype.getExitInAnimationConfig.call(this);
    config.begin = $.proxy(function () {
      $(this.domContainer).stop().animate({ 
        top: '-250%'
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
  Eplant.Views.PathwayView.prototype.getEnterInAnimationConfig = function () {
    var config = Eplant.View.prototype.getEnterInAnimationConfig.call(this);
    config.begin = $.proxy(function () {
      $(this.domContainer).css({ 
        top: '250%'
      });
      $(this.domContainer).stop().animate({
        top: '0%'
      }, 1000);
    }, this);
    return config;
  };
}());