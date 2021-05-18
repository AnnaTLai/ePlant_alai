// autocomplete AGI ID function

jQuery(function() {
	
});

jQuery(document).ready(function() {
	var firstOption = $('#optionsHolder').find('.searchOptionDiv').first();
	jQuery("#optionHolder .searchOptionDiv").removeClass('activeSearchOptionDiv');
	$(firstOption).addClass('activeSearchOptionDiv');
	$('.searchOption',firstOption).prop("checked", true);
	var checkedOption = $('.searchOption',firstOption).val();
	var searchInput = $(firstOption).parents('#optionHolder').find('.searchOptionDiv:not(.activeSearchOptionDiv)').find('.search-input');
	if(searchInput.length>0){
		$(searchInput).val('')
	}
	jQuery("#optionHolder .proceedButton").attr('disabled','disabled');
	jQuery(".proceedButton",firstOption).removeAttr('disabled');
	jQuery("#optionHolder .exampleButton").attr('disabled','disabled');
	jQuery(".exampleButton",firstOption).removeAttr('disabled');
	
	jQuery("#user_agi").change(function(){
		var gene = jQuery("#user_agi").val();
		geneName_exists(gene, function(data){});
		}).autocomplete({
		source: "//bar.utoronto.ca/ntools/cgi-bin/get_alias.pl",
		minLength: 2,
		select: function(event, ui) {
			//jQuery("#user_agi").val(ui.item.label);
			//jQuery("#alias_agi").val(ui.item.id);
			ui.item.value=ui.item.id;
			jQuery(this).val(ui.item.id);
		},
		close:function(){
			var gene = jQuery(this).val();
			geneName_exists(gene, function(data){});
		}
	});
	
	jQuery("#startSearch").on("click", function() {
		generateStandardSearchQuery();
	});
	
	jQuery("#goBackToOptions").on("click", function() {
		resetAllTissues();
		$('#optionHolder').animate({'left':'0%'},1000);
		$('#geneSearchHolder').animate({'left':'100%'},1000);
		$('#advancedOptionsHolder').insertAfter('#optionsHolder');
	});
	
	
	
	jQuery("#optionHolder .searchOptionDiv").on("click", function() {
		jQuery("#optionHolder .searchOptionDiv").removeClass('activeSearchOptionDiv');
		$(this).addClass('activeSearchOptionDiv');
		$('.searchOption',this).prop("checked", true);
		var checkedOption = $('.searchOption',this).val();
		var searchInput = $(this).parents('#optionHolder').find('.searchOptionDiv:not(.activeSearchOptionDiv)').find('.search-input');
		if(searchInput.length>0){
			$(searchInput).val('')
		}
		jQuery("#optionHolder .proceedButton").attr('disabled','disabled');
		jQuery(".proceedButton",this).removeAttr('disabled');
		jQuery("#optionHolder .exampleButton").attr('disabled','disabled');
		jQuery(".exampleButton",this).removeAttr('disabled');
	});
	
	jQuery("#optionHolder .search-input").autocomplete({
		source: "//bar.utoronto.ca/ntools/cgi-bin/get_alias.pl",
		minLength: 2,
		select: function(event, ui) {
			//jQuery("#user_agi").val(ui.item.label);
			//jQuery("#alias_agi").val(ui.item.id);
			ui.item.value=ui.item.id;
			jQuery(this).val(ui.item.id);
		},
		close:function(){
			var gene = jQuery(this).val();
			geneName_exists(gene, function(data){});
		}
	});
	
	jQuery("#optionHolder .proceedButton").on("click", function() {
		var checkedOption = $('input[name=searchOption]:checked', "#optionHolder").val();
		if(checkedOption==='1'){
			var agiId = $(this).parents('.searchOptionDiv').find('.search-input').val();
			jQuery("#user_agi").val(agiId);
			var gene = jQuery("#user_agi").val();
			geneName_exists(gene, 
			function(data){
				generateStandardSearchQuery();
			}, 
			function(){
				window.top.art.dialog({
					content: 'The Agi ID entered is not valid, please verify.',
					lock: true,
					background : '#000',
					opacity : 0.6
				});
			});
		}
		else if(checkedOption==='2'){
			var agiId = $(this).parents('.searchOptionDiv').find('.search-input').val();
			jQuery("#user_agi").val(agiId);
			var gene = jQuery("#user_agi").val();
			geneName_exists(gene, 
			function(data){
				$('#instructionText').html('Select the tissues you would like to include or exclude from the search.');
				$('#agiIdRow').show();
				slideLeft();
			},
			function(){
				window.top.art.dialog({
					content: 'The Agi ID entered is not valid, please verify.',
					lock: true,
					background : '#000',
					opacity : 0.6
				});
			});
			
		}
		else if(checkedOption==='3'){
			jQuery("#user_agi").val('');
			$('#instructionText').html('Define an expression pattern by clicking on the tissues you wish to include in the search and set the expression level to whatever you like.');
			geneName_exists('', function(data){});
			$('#agiIdRow').hide();
			slideLeft();
		}
	});
	
	jQuery("#optionHolder #exampleButton1").on("click", function() {
		$(this).parents('.searchOptionDiv').find('.search-input').val('AT3G24650');
		$('#agiIdRow').show();
		jQuery("#user_agi").val('AT3G24650');
		geneName_exists('AT3G24650', function(data){});
		window.top.art.dialog({
			content: 'Press the Search button to find genes with expression patterns similar to AT3G24540.',
			lock: true,
			background : '#000',
			opacity : 0.6
		});
	});
	
	jQuery("#optionHolder #exampleButton2").on("click", function() {
		randomAllTissues();
		$('#agiIdRow').show();
		$(this).parents('.searchOptionDiv').find('.search-input').val('AT3G24650');
		jQuery("#user_agi").val('AT3G24650');
		geneName_exists('AT3G24650', function(data){});
		$('#instructionText').html('Select the tissues you would like to include or exclude from the search.');
		window.top.art.dialog({
			content: 'Please click "Find Genes that Match this Profile" to start.',
			lock: true,
			background : '#000',
			opacity : 0.6
		});
		slideLeft();
	});
	
	jQuery("#optionHolder #exampleButton3").on("click", function() {
		randomAllTissues();
		geneName_exists('', function(data){});
		$('#agiIdRow').hide();
		$('#instructionText').html('Define an expression pattern by clicking on the tissues you wish to include in the search and set the expression level to whatever you like.');
		window.top.art.dialog({
			content: 'Please click "Find Genes that Match this Profile" to start.',
			lock: true,
			background : '#000',
			opacity : 0.6
		});
		slideLeft();
		
		
	});
	
	function slideLeft() {
		$('#optionHolder').animate({'left':'-100%'},1000);
		$('#geneSearchHolder').animate({'left':'0%'},1000);
		$('#advancedOptionsHolder').insertBefore('#expressionDefiner');
	};
	function geneName_exists(gene, callback, failCallback) {
		var regex = "([Aa][Tt][12345CM][Gg][0-9]{5})|([0-9]{6}(_[xsfi])?_at)|[0-9]{6,9};"
		jQuery.ajax({
			url: "//bar.utoronto.ca/ntools/cgi-bin/check_alias.pl",
			data: {"gene": gene},
			type: "post",
			dataType: "json",
			success: function(data) {
				
				if (data == 1) {
					/*if (!(gene.match(regex))) 
						{
						jQuery("#alias_id").val(gene);
						}
						var test = jQuery("#alias_agi").val();
					jQuery("#eaform").submit();*/
					
					jQuery("#user_agi_valid").text('AGI ID Query Included');
					jQuery("#user_agi_valid_icon").attr('src','images/correct.png');
					if(callback) callback(data);
				}
				else if ( (data == 0) && (gene.match(regex)) )
				{
					/*jQuery("#eaform").submit();*/
					jQuery("#user_agi_valid").text('AGI ID Query Included');
					jQuery("#user_agi_valid_icon").attr('src','images/correct.png');
					if(callback) callback(data);
				}
				else{
					jQuery("#user_agi_valid").text('Invalid AGI ID');
					jQuery("#user_agi_valid_icon").attr('src','images/incorrect.png');
					jQuery("#user_agi").val('');
					if(failCallback) failCallback();
				}
				//generateStandardSearchQuery();
			}
			}).error(function() {
			jQuery("#user_agi_valid").text('AGI ID Service Encoutner a problem.');
			jQuery("#user_agi_valid_icon").attr('src','images/incorrect.png');
			jQuery("#user_agi").val('');
			failCallback();
		});
		return false;
	}
});							