// A file for the eplant constants
//haven't fixed to use yet
//also added something in index.js for this.
'use strict'
export const eplant_name_dict = {
    //TODO: Complete all the names
    "ARABIDOPSIS": "Arabidopsis%20thaliana",
    "SOYBEAN": "Glycine%20max",
    "POP":"Populus%20trichocarpa",
    "MED":"Medicago%20truncatula",
    "POTATO": "Solanum%20tuberosum",
    "TOMATO":"Solanum%20lycopersicum",
    "RICE":"Oryza%20sativa",
    "MAIZE":"Zea%20mays",
    "BARLEY":"Hordeum%20vulgare"
};

export const eplant_dict = {
    "ARABIDOPSIS": "eplant",
    "SOYBEAN": "eplant_soybean",
    "POP":"eplant_poplar",
    "MED":"eplant_medicago",
    "POTATO": "eplant_potato",
    "TOMATO":"eplant_tomato",
    "RICE":"eplant_rice",
    "MAIZE":"eplant_maize",
    "BARLEY":"eplant_barley"
};

export const eplant_views_dict = {
    "ARABIDOPSIS": ["World", "Plant", "Cell", "Molecule", "Interactions", "Pathway", "Chromosome", "Heat Map"],
    "SOYBEAN": [ "Plant", "Molecule","Chromosome"],
    "POP":["World", "Plant", "Molecule", "Chromosome"],
    "MED":[ "Plant", "Molecule", "Chromosome"],
    "POTATO": ["Plant","Chromosome"],
    "TOMATO":["Plant", "Cell", "Molecule", "Chromosome"],
    "RICE":["Plant", "Molecule", "Interactions","Chromosome"],
    "MAIZE":[ "Plant", "Interactions","Chromosome"],
    "BARLEY":["Chromosome"]
}