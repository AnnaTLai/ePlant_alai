/*

COPII-coated ER to Golgi transport vesicle
ER to Golgi transport vesicle membrane
Golgi lumen
Golgi membrane
Golgi-associated vesicle
Golgi-associated vesicle membrane
cell wall
chloroplast
chloroplast envelope
chloroplast inner membrane
chloroplast stroma
chloroplast thylakoid
chloroplast thylakoid membrane
cytoplasm
cytoplasmic microtubule
cytosol
endoplasmic reticulum lumen
endoplasmic reticulum membrane
endoplasmic reticulum-Golgi intermediate compartment
endosome
extracellular region
mitochondrial envelope
mitochondrial inner membrane
mitochondrial intermembrane space
mitochondrial matrix
mitochondrial outer membrane
mitochondrion
nuclear envelope
nucleoplasm
periplasmic space
peroxisomal matrix
plant-type cell wall
plant-type vacuole
plant-type vacuole lumen
plant-type vacuole membrane
plasma membrane
plastid
plastid envelope
plastid membrane
plastid stroma
protein storage vacuole
trans-Golgi network membrane
vacuolar lumen
mitochondrial outer membrane
mitochondrion
nuclear envelope
nucleoplasm
periplasmic space
peroxisomal matrix
plant-type cell wall
plant-type vacuole
plant-type vacuole lumen
plant-type vacuole membrane
plasma membrane
plastid
plastid envelope
plastid membrane
plastid stroma
protein storage vacuole
trans-Golgi network membrane
vacuolar lumen

New structure based on plant reactome:

Extracellular

Cellular (all organelles are children of the cytoplasm which is also inside the cell wall)
  Plant cell wall
    •plant-type cell wall
    •Plasma membrane
  
  cytoplasm
    •cytoplasmic microtubule
    •cytosol (loose in cytoplasm)
  
  Golgi
    •trans-Golgi network membrane
    •COPII-coated ER to Golgi transport vesicle
    •ER to Golgi transport vesicle membrane
    •Golgi lumen   
    •Golgi membrane
    •Golgi-associated vesicle
    •Golgi-associated vesicle membrane
  
  Chloroplast
    •chloroplast envelope
    •chloroplast inner membrane
    •chloroplast stroma
    •chloroplast thylakoid
    •chloroplast thylakoid membrane
   
  Endoplasmic reticulum
    •endoplasmic reticulum lumen
    •endoplasmic reticulum membrane
    •endoplasmic reticulum-Golgi intermediate compartment
    •endosome
   
  Mitochondrion
    •mitochondrial envelope
    •mitochondrial inner membrane
    •mitochondrial intermembrane space
    •mitochondrial matrix
    •mitochondrial outer membrane
    •mitochondrion
   
  Nucleus
    •nuclear envelope
    •nucleoplasm
   
  periplasmic space (maybe remove?)
   
  peroxisomal matrix (only part of the peroxisome from plant reactome)
  
  type vacuole
    •plant-type vacuole membrane 
      •plant-type vacuole lumen
    •protein storage vacuole
      •vacuolar lumen
   
  plastid
    •plastid envelope
    •plastid membrane
    •plastid stroma

*/

//current cell structure
const cellStructurePlantReactome = {
  "extracellular region": {
    parent: null,
    displayName: "extracellular region",
    style: {
      'border-color': 'white',
    }
  },
  
  "periplasmic space": {
    parent: "extracellular region",
    displayName: "Periplasmic space",
    style: {
      'border-color': '#63DCC6',
    }
  },

  "plant-type cell wall": {
    parent: "extracellular region",
    displayName: "plant-type cell wall",
    style: {
      'background-color': '#EB88B3',
      'border-color': '#EB88B3',
      'padding': '5px',
    }
  },"cytoplasm": {
    parent: "plant-type cell wall",
    displayName: "cytoplasm",
    style: {
      'border-color': '#EB88B3',
      
    },
  },
  "plant-type vacuole membrane": {
    parent: "cytoplasm",
    displayName: "plant-type vacuole membrane",
    style: {
      'background-color': '#F1EF71',
      'border-color': '#F1EF71',
      'padding': '5px',

    }
  },"plant-type vacuole lumen": {
    parent: "plant-type vacuole membrane",
    displayName: "lumen",
    style: {
      'border-color': '#F1EF71',
      'padding': '50px',
      
    },
  },

  "protein storage vacuole": {
    parent: "cytoplasm",
    displayName: "protein storage vacuole",
    style: {
      'background-color': '#F1EF71',
      'border-color': '#F1EF71',
      'padding': '5px',

    }
  },

  "endoplasmic reticulum membrane": {
    parent: "cytoplasm",
    displayName: "endoplasmic reticulum membrane",
    style: {
      'border-color': '#DC4A51',
      'background-color': '#DC4A51',
      'padding': '5px',
      
    },
  },"endoplasmic reticulum lumen": {
    parent: "endoplasmic reticulum membrane",
    displayName: "lumen",
    style: {
      'border-color': '#DC4A51',
      'padding': '50px',
      
    },
  },

  "plastid membrane": {
    parent: "cytoplasm",
    displayName: "plastid membrane",
    style: {
      'border-color': '#B74A4F',
      'background-color': '#B74A4F',
      'padding': '5px', 
    },
  },"plastid": {
    parent: "plastid membrane",
    displayName: "plastid",
    style: {
      'border-color': '#B74A4F',
      
    },
  },

  "chloroplast membrane": {
    parent: "cytoplasm",
    displayName: "chloroplast",
    style: {
      'border-color': '#89CB8A',
      'background-color': '#89CB8A',
      'padding': '5px',
    },
  },"chloroplast": {
    parent: "cytoplasm",
    displayName: "chloroplast",
    style: {
      'border-color': '#89CB8A',
      
    },
  },

  "peroxisomal matrix": {
    parent: "cytoplasm",
    displayName: "perixosomal matrix",
    style: {
      'border-color': '#924A92',
      
    },
  },

  "mitochondrial membrane": {
    parent: "cytoplasm",
    displayName: "mitochondrial membrane",
    style: {
      'border-color': '#F1A46B',
      
    },
  },"mitochondrial matrix": {
    parent: "mitochondrial membrane",
    displayName: "mitochondrial matrix",
    style: {
      'border-color': '#F1A46B',
      
    },
  },

  "nuclear envelope": {
    parent: "cytoplasm",
    displayName: "nuclear envelope",
    style: {
      'border-color': '#7F98FF',
      'background-color': '#7F98FF',
      'padding': '5px',
      
    },
  },"nucleoplasm": {
    parent: "nuclear envelope",
    displayName: "nucleoplasm",
    style: {
      'border-color': '#7F98FF',
      
    },
  },

  "Golgi membrane": {
    parent: "cytoplasm",
    displayName: "Golgi membrane",
    style: {
      'border-color': '#A48568',
      'background-color': '#A48568',
      'padding': '5px',
      
    },
  },"Golgi lumen": {
    parent: "Golgi lumen",
    displayName: "nucleoplasm",
    style: {
      'border-color': '#A48568',
      
    },
  },
}

const compartmentMap = {
  //plant reactome id: our id
  //https://plantreactome.gramene.org/content/schema/objects/Compartment
  "COPII-coated ER to Golgi transport vesicle": "Golgi membrane",
  "ER to Golgi transport vesicle membrane": "endoplasmic reticulum membrane",
  "Golgi lumen": "Golgi lumen",
  "Golgi membrane": "Golgi membrane",
  "Golgi-associated vesicle": "Golgi lumen",
  "Golgi-associated vesicle membrane": "Golgi membrane",
  "cell wall": "cell wall",
  "chloroplast": "chloroplast",
  "chloroplast envelope": "chloroplast membrane",
  "chloroplast inner membrane": "chloroplast membrane",
  "chloroplast stroma": "chloroplast",
  "chloroplast thylakoid": "chloroplast",
  "chloroplast thylakoid membrane": "chloroplast",
  "cytoplasm": "cytoplasm",
  "cytoplasmic microtubule": "cytoplasm",
  "cytosol": "cytoplasm",
  "endoplasmic reticulum lumen": "endoplasmic reticulum lumen",
  "endoplasmic reticulum membrane": "endoplasmic reticulum membrane",
  "endoplasmic reticulum-Golgi intermediate compartment": "endoplasmic reticulum membrane",
  "endosome": "extracellular region",
  "extracellular region": "extracellular region",
  "mitochondrial envelope": "mitochondrial membrane",
  "mitochondrial inner membrane": "mitochondrial membrane",
  "mitochondrial intermembrane space": "mitochondrial membrane",
  "mitochondrial matrix": "mitochondrial matrix",
  "mitochondrial outer membrane": "mitochondrial membrane",
  "mitochondrion": "mitochondrial matrix",
  "nuclear envelope": "nuclear envelope",
  "nucleoplasm": "nucleoplasm",
  "periplasmic space": "periplasmic space",
  "peroxisomal matrix": "peroxisomal matrix",
  "plant-type cell wall": "plant-type cell wall",
  "plant-type vacuole": "plant-type vacuole lumen",
  "plant-type vacuole lumen": "plant-type vacuole lumen",
  "plant-type vacuole membrane": "plant-type vacuole membrane",
  "plasma membrane": "plant-type cell wall",
  "plastid": "plastid",
  "plastid envelope": "plastid membrane",
  "plastid membrane": "plastid membrane",
  "plastid stroma": "plastid",
  "protein storage vacuole": "protein storage vacuole",
  "trans-Golgi network membrane": "Golgi membrane",
  "vacuolar lumen": "plant-type vacuole lumen",
}