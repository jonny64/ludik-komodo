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
	
	var _getCurrentFolder = function () {
		var path = ko.views.manager.currentView.koDoc.file.dirName.split('\\');
		return path [path.length - 1];
	}
	
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