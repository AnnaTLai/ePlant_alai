(function() {
	
    /**
		* Tab Manager namespace
		* By Jim Fan
		*
		*
		* @namespace
	*/
    TabManager = {};
    /* Attributes */
	TabManager.tabs = $('#tabs');
	TabManager.ul = $('#tabUl');
	TabManager.tabWidth = "";
	TabManager.totalTabs = 2;
	TabManager.tabHolder = $("#tabsHolder");
	TabManager.tabId = 2;
	
	
	
    /**
		* Initializes TabManager
	*/
    TabManager.initialize = function() {
		this.tabs = $('#tabs');
		this.ul = $('#tabUl');
		this.tabWidth = "";
		this.totalTabs = 2;
		this.tabHolder = $("#tabsHolder");
		this.tabId = 2;
		
        TabManager.tabs.tabs({
            tabTemplate: "<li><a class='fullTab' href='#{href}'>#{label}</a><span class='ui-icon ui-icon-close' role='presentation'>Remove Tab</span></li>",
			activate: function(event, ui) {
				var index = ui.newTab.index();
				var queryIndex = index + 1; // 1 based
				var tabId = TabManager.ul.find("li:nth-child( " + queryIndex + ")").attr("aria-controls");
				var activeView = Eplant.getTabActiveView(tabId);
				if (activeView) {
					Eplant.changeActiveView(activeView, tabId);
				} 
				else {
					Eplant.changeActiveView(Eplant.views["HomeView"], tabId);
				}
				
			}
		});
		
		
		
        TabManager.bindUIEvents();
		
		
	};
    TabManager.bindUIEvents = function() {
        $(window).on('resize', function() {
            //update totalTab
            TabManager.totalTabs = $('li', TabManager.ul).length;
			
            TabManager.resizeTabs();
			
			
			
		});
		
        //bind event
        TabManager.tabs.bind('addTab', function(event, id, title) {
            if (TabManager.totalTabs > 6) {
                art.dialog({
                    content: 'Too many tabs slow down the performance of Eplant, the maximum number of tabs is set to 6. ',
                    lock: true
				});
			} 
			else {
                var tabTemplate = "<li><a class='fullTab' href='#{href}'>#{label}</a><span class='ui-icon ui-icon-close' role='presentation'>Remove Tab</span></li>";
				
                var height = $(window).height() - 40;
                var label = title || "" + tabCounter,
				id = "tabs-" + TabManager.tabId,
				li = $(tabTemplate.replace(/#\{href\}/g, "#" + id).replace(/#\{label\}/g, label)),
				websiteframe = '<iframe id="' + id + '-content" class="tabIframe" src="tabs.html" width="100%" height="' + height + '" allowtransparency="true" frameBorder="0" onload="on_load();">Your browser does not support IFRAME</iframe>';
                TabManager.tabs.find(".ui-tabs-nav").append(li);
                TabManager.tabs.find('#addTab').appendTo(TabManager.tabs.find(".ui-tabs-nav"));
				TabManager.tabs.append("<div align='center' id='" + id + "' class='hide'></div>");
                TabManager.tabs.tabs("refresh");
				
                var activeTabId = TabManager.tabs.find("[aria-selected='true']").attr("aria-controls");
				
				Eplant.setTabActiveView(Eplant.activeSpecies.views["HomeView"], id);
				
				
				TabManager.tabs.trigger('selectTab', [TabManager.totalTabs - 1]);
				
				//increase totalTab
				TabManager.totalTabs = $('li', TabManager.ul).length;
				TabManager.tabId++;
				
				
				TabManager.showClose();
				TabManager.resizeTabs();
			}
		});
		//if tab closed
		TabManager.tabs.on("click", "span.ui-icon-close", function() {
			var index = $("li", TabManager.tabs).index($(this).parent());
			//TabManager.tabs.tabs("remove", index);
			TabManager.removeTab(index); 
		});
		
		TabManager.tabs.bind('selectTab', function(event, index) {
			TabManager.tabs.tabs("refresh").tabs({ active:index});
			
		});
		$('#add_tab').click(function() {
			TabManager.loadData(TabManager.tabId, "Welcome Screen");
			TabManager.tabId++;
		});
		
		
	};
	
	TabManager.removeTab = function(index) {
		var queryIndex = index + 1; // 1 based
		var tabId = TabManager.ul.find("li:nth-child( " + queryIndex + ")").attr("aria-controls");
		Eplant.deleteTabActiveView(tabId);
		TabManager.tabs.find( ".ui-tabs-nav li:eq("+index+")" ).remove();
		
		
		//update totalTab
		TabManager.totalTabs = $('li', TabManager.ul).length;
		TabManager.tabs.tabs("refresh").tabs({ active:TabManager.totalTabs-1});
		TabManager.tabId--;
		TabManager.showClose();
	};
	
	TabManager.resizeTabs = function() {
		
		var sumWidth = 0;
		TabManager.ul.children('li').each(function(i, e) {
			sumWidth += $(e).outerWidth(true);
			$('a', e).css('width', 'auto');
		});
		if (sumWidth > TabManager.tabHolder.outerWidth(true)) {
			TabManager.tabWidth = (TabManager.tabHolder.outerWidth(true) - 30) / TabManager.totalTabs-20;
			if (TabManager.ul.children('li').length > 1) {
				TabManager.ul.children('li').each(function(i, e) {
					$('a', e).width(TabManager.tabWidth);
				});
				TabManager.ul.find("#add_tab").css('width', 'auto');
				TabManager.ul.find("#addTab").css('width', '20px');
				TabManager.ul.find("#addTab").css('padding', '0');
			};
		} 
		else {
			var sumWidth = 0;
			TabManager.ul.children('li').each(function(i, e) {
				sumWidth += $(e).outerWidth(true);
				$('a', e).css('width', 'auto');
			});
			if (sumWidth > TabManager.tabHolder.outerWidth(true)) {
				TabManager.tabWidth = (TabManager.tabHolder.outerWidth(true) - 30) / TabManager.totalTabs-20;
				if (TabManager.ul.children('li').length > 1) {
					TabManager.ul.children('li').each(function(i, e) {
						$('a', e).width(TabManager.tabWidth);
					});
					TabManager.ul.find("#add_tab").css('width', 'auto');
					TabManager.ul.find("#addTab").css('width', '20px');
					TabManager.ul.find("#addTab").css('padding', '0');
				};
			} 
			
		}
		
	};
	
	TabManager.loadData = function(id, title) {
		if ($('#tabs-' + id).length <= 0) {
			TabManager.tabs.trigger('addTab', [id, title]);
			} else {
			var index = $('#tabs a[href="#tabs-' + id + '"]').parent().index();
			TabManager.tabs.trigger('selectTab', [index]);
		}
		
	};
	TabManager.showClose = function() {
		if(TabManager.totalTabs<=2)
		{
			$('.ui-icon-close',TabManager.ul).hide();
		}
		else
		{
			$('.ui-icon-close',TabManager.ul).show();
		}
	};
	TabManager.removeIdentifier = function(id) {
		var tab = TabManager.ul.find('a:contains("'+id+'")');
		if(tab){
			TabManager.removeTab(tab.closest('li').index());	
		}
	};
	
})();							