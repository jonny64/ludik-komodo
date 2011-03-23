/* Copyright (c) 2011 jonny64 See the file LICENSE.txt for licensing
/* information. */

var Ludik = (function(){
	var _getCurrentScreenType = function () {
		var fileName = ko.views.manager.currentView.koDoc.baseName;
		return fileName.substring(0, fileName.lastIndexOf('.'));
	};
	
	var _gotoSubname = function (subname) {
		var scimoz = ko.views.manager.currentView.scimoz;
	
		scimoz.currentPos = scimoz.anchor = 0;
		scimoz.searchAnchor();
		var pos = scimoz.searchNext(0, subname);
		if (pos != -1) {
			scimoz.gotoPos(pos);
			scimoz.scrollCaret();
		}
	};
	
	var _switchTo = function (folderType, callbackFn) {
		var currentScreenDir = ko.views.manager.currentView.koDoc.file.dirName;
		
		var osPath = Components.classes["@activestate.com/koOsPath;1"].
			getService(Components.interfaces.koIOsPath);
	
		var libDir = osPath.dirname(currentScreenDir);
		var switchedScreenPath = osPath.join(libDir, folderType);
		var switchedScreenFile = osPath.join(
			switchedScreenPath,
			_getCurrentScreenType() + '.pm'
		);
		
		if (!osPath.exists(switchedScreenFile)) {
			ko.dialogs.alert("Can't find file " + switchedScreenFile);
			return;
		}
	
		// ko.open.URI is async
		ko.open.URI (switchedScreenFile , "editor", false, callbackFn);
	};
	
	var _parentFolder = function (folder){
		return ko.uriparse.baseName(folder);
	}
	
	var _getCurrentFolder = function (){
		return _parentFolder(ko.views.manager.currentView.koDoc.file.dirName);
	}
	
	function _setCurrentTabLabel (label){
		
		var view = ko.views.manager.currentView;
		var tabs = view.parentNode.parentNode.parentNode.tabs;
		var tabPanels = tabs.parentNode.childNodes[1];
		var currentTab;
		tabPanels = tabPanels.childNodes;
		for (var i = 0; i < tabPanels.length; i++) {
			if (tabPanels[i].childNodes[0] == view) {
				currentTab = tabs.childNodes[i];
				break;
			}
		}
		
		if (!currentTab) {
			ko.dialogs.alert("_setCurrentTabLabel: can't find current tab!");
			return;
		}
		currentTab.label = label;
	}
	
	var _onViewOpen = function (event) {
		
		var PARENT_DIR_SUFFIX = {
			'Content'      : '(C)',
			'Model'        : '(M)',
			'Presentation' : '(P)'
		};
		
		var file = event.originalTarget.koDoc.file;
		var parentDir = _parentFolder(file.dirName);
		
		var suffix = PARENT_DIR_SUFFIX [parentDir];
		if (suffix) {
			_setCurrentTabLabel(file.baseName + suffix);
		}
	};
	
	window.addEventListener('view_opened', _onViewOpen, false);

	return {
		switchTo : function (subType){
	
			var FUNCTION_FOLDER = {
				get_item_of  : 'Content',
				select       : 'Content',
				do_update    : 'Content',
				do_create    : 'Content',
				do_delete    : 'Content',
				draw_item_of : 'Presentation',
				draw         : 'Presentation'
			};
		
			_switchTo (FUNCTION_FOLDER [subType], function () {
				_gotoSubname ('sub ' + subType + '_' + _getCurrentScreenType());
			});
		},
		
		gotoModel : function () {
			
			if (_getCurrentFolder () != 'Model') {
				this._oldFolder = _getCurrentFolder();
				_switchTo('Model');
				return;
			}
			
			_switchTo (this._oldFolder);
		}
	}
})();