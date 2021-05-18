
Eplant.getScreenShot = function(toPrint) {
	var dfd = $.Deferred();
	var $toPrint = toPrint?$(toPrint):$('#viewPort');
	var addedEle = [];
	if($('svg',$toPrint).length>0)
	{
		$('svg',$toPrint).each(function() {
			var c = document.createElement('canvas');
			$(c).css({
				left:$(this).position().left,
				top:$(this).position().top,
				position:'absolute'
			})
			var svgStr=(new XMLSerializer()).serializeToString(this);//$(this).html().replace(/>\s+/g, ">").replace(/\s+</g, "<").replace(/<canvas.+/g,"");
			$(Eplant.ViewModes[Eplant.currentViewModes]).prepend(c);
			canvg(c,svgStr);
			addedEle.push(c);
			$(this).hide();
		});	
	}
	html2canvas($toPrint, {
		onrendered: function(canvas) {
			if (canvas) {
				var imgUrl = canvas.toDataURL();
				var img = $('<img />', { 
					src: imgUrl,
					alt: 'Screenshot'
				});
				
				
			}
			dfd.resolve(img);
			if(addedEle.length>0)
			{
				for(var i =0;i<addedEle.length;i++)
				{
					var c = addedEle.pop();
					$(c).remove();
				}
			}
			$('svg',$toPrint).each(function() {
				$(this).show();
			});
		}
		
	});
	return dfd.promise();
};

