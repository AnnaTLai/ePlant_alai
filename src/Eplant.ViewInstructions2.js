(function() {

/**
 * Eplant.Views namespace
 * By Hans Yu
 *
 * This namespace is reserved for ePlant Views
 *
 * @namespace
 */
Eplant.ViewInstructions = {
"Chromosome viewer":"",
"Interaction viewer":"The Interactions viewer displays predicted and confirmed interacting proteins for the selected gene.",
"World eFP":'The World eFP displays natural variation of gene expression from samples around the world.',
"Plant eFP" :"<p>The Plant eFP displays expression levels of genes in various tissues.</p><p>You can toggle between absolute and relative mode with these buttons: <img width='20px' src='img/efpmode-absolute.png'/><img width='20px' src='img/efpmode-relative.png'/></p><p>Use the <img width='20px' src='img/getimage.png'> button to save a copy of the chart.</p>",
"Cell eFP":"",
"Molecule viewer":"This view displays the 3D molecular structure of the protein associated with the selected gene.",
"Sequence viewer":"This is an implementation of JBrowse, a genome browser that lets you explore sequence data from a broad overview all the way down to individual bases. Zoom in and out of your selected gene to explore binding sites and other gene features.",
"Experimental viewer":"<p>The Experiment viewer displays the results of numerous experiments. Select a view with the menu selector .</p>",
"Heat Map viewer":"<p>This Heat Map displays the expression levels for 350+ samples of all genes that are loaded. Hover over a sample to see its data. Click on a sample to open the associated eFP viewer.</p><p>You can load more genes by name with the box on the left, or use the <a onclick='Eplant.expressionAnglerClick()'>Expression Angler</a> to load genes with a particular expression pattern.</p><p>To view data at different biological scales, use the icons on the left.</p>",
"Welcome Screen":"Select a gene with the box on the left, or use the Expression Angler to describe an expression pattern and find genes that match it.",
"Linkout Options":"View the selected gene with a dynamic link-out to other bioinformatic tools. Tools will open in a new page."
		
};

})();