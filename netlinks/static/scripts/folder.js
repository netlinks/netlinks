	//************** GLOBAL VARIABLES ***********************//
	
	//this global variable is to store current folder being displayed. 
	//this variable is used at many places eg - refresh page, to save in address bar
	var g_current_folder_key;
	
	
	//clipboard object for cut/copy/paste
	var g_clipboard = new Array();
	g_clipboard["action"] = "";
	g_clipboard["object_type"] = "";
	g_clipboard["object"] = "";


$( document ).ready( function() {
	
	
	//******************** Set height of contents area and width of address bar elements container****************//
	$( "#div-ad-bar-elmts-container" ).width( $( window ).width() - 100 );
	
	


	/************************************ ONCE THE PAGE IS LOADED, SHOW THE ROOT FOLDER*************************************/
	$.fn.openFolder( "HOME" );	
	
	// Store the initial folder id so we can revisit it later
    history.replaceState( "HOME", null, null );
	


	 ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	/////////////////////////////////////////// UI EVENT HANDLERS /////////////////////////////////////////////////////////////////
   ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	
 	//******************** Bind event listener to window. This is to enable browser back button functionality ****************//
	//window.addEventListener('popstate', function(event) {
	window.onpopstate = function(event) {
		console.log("Browser Back/Forward triggered");			
		$.fn.openFolder(event.state);
    };
	
	//******************** On resize window adjust height of contents area ****************//
	$( window ).resize( function() {
  		$( "#div-ad-bar-elmts-container" ).width( $( window ).width() - 100 );
	});
	
	

	
	/************************************* ON CLICK ANYWHERE ON THE PAGE **********************************************************/
	$(document).on( "click", function() {         
	
		//hide the right click menus
		$( "#ul-wspace-right-click-menu" ).fadeOut(100);
		$( "#ul-icon-right-click-menu" ).fadeOut(100);
		
	});  
	
	

	/************************************ On Click on home button ************************************************************/
	
	$(document).on( "click", "#div-home" , function() {
		$.fn.openFolder( "HOME" );
		window.history.pushState( "HOME", null, null ); 		//updating browser history
	});
	
	
	/************************************ On Click on power button ************************************************************/
	
	$(document).on( "click", "#div-power-button" , function() {
		window.close();     
	});
	

	/************************************ON  CLICK ON ICONS ************************************************************/	
	
	$(document).on( "click", ".div-thumbnail-hook" , function() {         
	
		var type = $(this).attr( "data-type" );
		var folder_id = $(this).attr( "id" );
			
		if(type == "folder" )
		{
			$.fn.openFolder(folder_id);
			window.history.pushState(folder_id,null,null);
		}	
		else if (type == "link" )
		{
			//get url of the link and open file
			var url = $(this).attr( "data-url" );				
			$.fn.openFile(url);
		}
	});  
	
	
	
	/************************************ON  CLICK ON ADDRESS BAR ELEMENTS ************************************************************/	
	
	$(document).on( "click", ".div-ad-bar-folder-hook" , function() {         
	
		$.fn.openFolder(this.id);
		window.history.pushState(this.id,null,null);	//updateing browser history
	});  
	
	
	
	
	/******************************* ON MOUSE DOWN ON CONTENTS AREA ************************************************************/
	
	$(document).on( "mousedown", "#div-contents", function(event) {
		
	
		//////////////////////////////////      NOTICE - ANY ACTION OF THIS EVENT SHOULD BE BELOW THIS BLOCK     ////////////////////////////////////
		//this condition is to avoid this click from capturing by child element (icons). If the event is not from folder container exit the function	
		if (event.target.id != "div-contents" )
		{
			return;
		}
		
		//////////////////////////////////      NOTICE - ANY ACTION OF THIS EVENT SHOULD BE BELOW THIS BLOCK     ////////////////////////////////////
	
	
	
	
	
	
	
	
		//hide the icon rightclick menu
		$( "#ul-icon-right-click-menu" ).fadeOut(100);
		
		
		
		if (event.which == 3)  	//if right click
		{
			
			//if clipboard is not null make the 'paste' menu in the right click menu active. otherwise it will be deactivated
			if(g_clipboard["action"] != "" )
			{
				$( "#ul-wspace-right-click-menu li[action='paste']" ).removeClass( "ui-state-disabled" );		
			}
					
			
			
			//activate the wspace right click menu
			$( "#ul-wspace-right-click-menu" ).menu({
				
					select: function( event, ui ) {
	
								//Call function - right click handler. Pass the icon object and menu element object (ui)	
								//this function will handlw what happens when clicked on a menu item	
						  		$.fn.wspaceRightClickHandler(ui);
					}
			});
			
			
			//set position of right click menu to mouse pointer
			$( "#ul-wspace-right-click-menu" ).css({left: event.pageX, top: event.pageY});
			
			//show right click menu
			$( "#ul-wspace-right-click-menu" ).fadeIn(300);
			
			
		}	
	
	});
	
	
	/************************************ON MOUSE DOWN ON ICONS ************************************************************/	

	
	$(document).on( "mousedown", ".div-thumbnail-hook", function(event) {
		
		
		
		//hide the right click menus
		$( "#ul-wspace-right-click-menu" ).fadeOut(100);
		$( "#ul-icon-right-click-menu" ).fadeOut(100);
		
		//capture the icon where mouse is down
		var icon = this;	
		
				
		///////////////////////////////////////////////////
		//if mouse button is right, ie, right click
		if (event.which == 3)  
		{
			
			console.log( "icon rightclick detected" );
			//hide right click menu
			$( "#ul-wspace-right-click-menu" ).fadeOut(100);
			
					
			//make right click menu
			$( "#ul-icon-right-click-menu" ).menu({
				
					select: function( event, ui ) {
	
								//Call function - right click handler. Pass the icon object and menu element object (ui)	
								//this function will handlw what happens when clicked on a menu item			 		
						  		$.fn.iconRightClickHandler(icon, ui);
					}
			});
			
			//set position of right click menu to mouse pointer
			$( "#ul-icon-right-click-menu" ).css({left: event.pageX, top: event.pageY});
			
			//show right click menu
			$( "#ul-icon-right-click-menu" ).fadeIn(300);
		}
		
	});  
	/************************************END - ON MOUSE DOWN ON ICONS ************************************************************/		

	
	
	
});




















     /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// 
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
   ///////////////////////////////////////////////////// FUNCTION DEFENITIONS/////////////////////////////////////////////////////////
  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// 
 ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////





    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
   ///////////////////////////////////////////////////// DISPLAY SERVICES ///////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////




/************************************ FUNCTION TO DRAW ICONS ON THE PAGE ************************************************************/

$.fn.drawIcons = function (folder_contents) {
	console.log( "drawIcons()" );
	
	var txt = "";		//variable to store the dynamic html
	var file_icon = "/images/file-icon-default.png";
			
	//iterate through the data from server and construct the inner html
	for (i in folder_contents)
	{
		//if element is folder, iterate though the list of folders and construct the inner html
		if (i=="folder" )	
		{
			type = "folder";
			for (j in folder_contents[i])
        	{
          		txt = txt + "<div class='div-thumbnail div-thumbnail-hook' id = '"  + folder_contents[i][j].key + "' data-type='" + type + "'><div class='div-thumbnail-icon'><img class='img-thumbnail-folder-icon' src='" + folder_contents[i][j].icon + "'></img></div><div class='div-thumbnail-desc div-thumbnail-desc-hook' title='" + folder_contents[i][j].name + "'><span class='span-thumbnail-desc span-thumbnail-desc-hook'>" + folder_contents[i][j].name + "</span></div></div>";
        	}
	   	}
		//if element is link, iterate though the list of links and construct the inner html
	   	else if (i=="link" )
	   	{
	   		type = "link";
	   		for (j in folder_contents[i])
        	{
          		txt = txt + "<div class='div-thumbnail  div-thumbnail-hook' id = '"  + folder_contents[i][j].key + "' data-type='" + type + "' data-url='" + folder_contents[i][j].url + "'><div class='div-thumbnail-icon'><img class='img-thumbnail-file-icon' src='" + file_icon + "' width='107px' height='110px'></img></div><div class='div-thumbnail-desc div-thumbnail-desc-hook' title='" + folder_contents[i][j].name + "'><span class='span-thumbnail-desc span-thumbnail-desc-hook'>" + folder_contents[i][j].name +"</span></div></div>";
        	}
	   	}
	}
	
	//write the dynamically generated html to the folder area
	$( "#div-contents" ).html(txt);
	
	//make the icons draggable
	$( ".div-thumbnail-hook" ).draggable({
				 containment: "#td-folder-container",
				 zIndex: 100 ,
				 opacity: .9
			});
	
	//make the icons droppable 		
	$( ".div-thumbnail-hook" ).droppable({
				accept: ".div-thumbnail-hook",
				tolerance: "intersect",
				hoverClass: "div-thumbnail-droppable",
				
				
				//do the following while dropped in this icon
				drop: function(event,ui)  
				{
					//call handler for droping one icon over another
					$.fn.iconDragDropHandler(event,ui,this);		//pass event, ui object and droppable object [ie, this - object on which drop is happened]
				}
	});
	
};

/************************************END - FUNCTION TO DRAW ICONS ON THE PAGE ************************************************************/



/************************************ FUNCTION TO HANDLE DRAG AND DROP OPERATION ************************************************************/

$.fn.iconDragDropHandler = function (event, ui, target_element) {
	console.log( "iconDragDropHandler()" );
	
	var target_type = $(target_element).attr( "data-type" );
	var target_id =  $(target_element).attr( "id" );
	var object_type = ui.draggable.attr( "data-type" );
	var object_id = ui.draggable.attr( "id" );
	
	
	//if dropping over folder
	if (target_type == "folder" )
	{
		//if dragging icon is a file (ie link)
		if (object_type == "link" )
		{
			//move the file to the target folder
			$.fn.moveFile(object_id, target_id);
					
		}
		
		//if dragging icon is a folder
		else if (object_type == "folder" )
		{
			//move the file to the target folder
			$.fn.moveFolder(object_id, target_id);
		}
		
		//clear the dragged element from the GUI
		$( "#" + object_id).remove();
		
	}
	
	//if dropping over a file
	else if (target_type == "link" )
	{
		//alert( "not allowed" );		//cannot move icons in to a file
	}
	
	else
	{
		alert( "Error: undefined" );
	} 
	
};

/************************************ END - FUNCTION TO HANDLE DRAG AND DROP OPERATION ************************************************************/









/************************************ FUNCTION RIGHT CLICK MENU HANDLER ***********************************************************/

$.fn.iconRightClickHandler = function (icon, ui) {
	console.log( "iconRightClickHander" );
	$( "#ul-icon-right-click-menu" ).fadeOut(100);		//here because, the menu needs to be hidden while showing confirmation dialogue
					
	
	//get action from selected menu item
	var action = $(ui.item).attr( "action" );
	
	//find out the icon type (forlder or link) and its key
	var icon_type = $(icon).attr( "data-type" );
	var icon_key = $(icon).attr( "id" ); 
	
	
	if ( icon_type == "folder" )
	{
				//////////////////////////////
				// if action is open
				if ( action == "open" )
				{
					//open folder
					$.fn.openFolder(icon_key);
					window.history.pushState(icon_key,null,null);  
					
				}
				
				//////////////////////////////
				// if action is copy
				else if ( action == "copy" )
				{
					//save icon details to clipboard			
					g_clipboard["action"] = "COPY";
					g_clipboard["object_type"] = "FOLDER";
					g_clipboard["object"] = icon;
				}
				
				//////////////////////////////
				// if action is cut
				else if ( action == "cut" )
				{
					console.log( "cutting" );
					
					//save icon details to clipboard
					g_clipboard["action"] = "CUT";
					g_clipboard["object_type"] = "FOLDER";
					g_clipboard["object"] = icon;
				}
				
				//////////////////////////////
				// if action is rename
				else if ( action == "rename" )
				{	
					$.fn.enableRenameFolder(icon_key);
				}
				
				///////////////////////////////////////
				// if action is delete
				else if ( action == "delete" )
				{	
					
					var r = confirm( "Are you sure you want to delete?" );
					
					if ( r == true )
					{
						$( "#" + icon_key).remove();
					  	$.fn.deleteFolder(icon_key);
					}
					else
					{
					  	return;
					}
				}

				else 
				{
					console.log( "Invalid action" );
				}
	}
	
	////////////////////////////////////////////////////////////////////////////
	//if icon type is link (ie file)
	
	else if ( icon_type == "link" )
	{
				//////////////////////////////
				// if action is open
				if ( action == "open" )
				{
					//get url of the clicked file
					var url = $(icon).attr( "data-url" );
					
					//open the file
					$.fn.openFile(url);
				}
				
				//////////////////////////////
				// if action is copy
				else if ( action == "copy" )
				{	
					console.log( "copying file" );
					//save icon details to clipboard			
					g_clipboard["action"] = "COPY";
					g_clipboard["object_type"] = "FILE";
					g_clipboard["object"] = icon;				
				}
				
				//////////////////////////////
				// if action is cut
				else if ( action == "cut" )
				{
					console.log( "cutting file" );
					//save icon details to clipboard
					g_clipboard["action"] = "CUT";
					g_clipboard["object_type"] = "FILE";
					g_clipboard["object"] = icon;					
				}
				
				//////////////////////////////
				// if action is rename
				else if ( action == "rename" )
				{
					$.fn.enableRenameFile(icon_key);
				}

				//////////////////////////////
				// if action is delete
				else if ( action == "delete" )
				{
					$( "#ul-icon-right-click-menu" ).fadeOut(100);		//here because, the menu needs to be hidden while showing confirmation dialogue
					
					var r = confirm( "Are you sure you want to delete?" );
					
					if ( r == true )
					{
					  	//delete file
					  	$( "#" + icon_key).remove();
						$.fn.deleteFile(icon_key);					
					}
					else
					{
					  	return;
					}		
				}

				else 
				{
					console.log( "coming soon" );
				}
	}

	//hide icon right click menu
	$( "#ul-icon-right-click-menu" ).fadeOut(100);
	
};



/************************************END FUNCTION RIGHT CLICK MENU HANDLER ************************************************************/











/************************************ FUNCTION WSPACE RIGHT CLICK MENU HANDLER ***********************************************************/


$.fn.wspaceRightClickHandler = function (ui){
	console.log( "wspaceRightClickHandler" );
	
	//get action from selected menu item
	var action = $(ui.item).attr( "action" );
	var clipboard_action = g_clipboard["action"];
	var object_type = g_clipboard["object_type"];
	var object_key = $(g_clipboard["object"]).attr( "id" );
	var target_folder = g_current_folder_key;
	

	 ///////////////////////////////////////////// P A S T E /////////////////////////////////////////////////////

	if (action == "paste" )
	{
				//if clipboard action was copy, copy the clipboard item to current folder
				if ( clipboard_action == "COPY" )
				{	
								//if the copied item was a file, copy the file to current folder
								if ( object_type == "FILE" )
								{
									$.fn.drawIcon(g_clipboard["object"]);				
									$.fn.copyFile( object_key, target_folder );
								}
								
								//if the copied item was a folder, copy the file to current folder
								else if ( object_type == "FOLDER" )
								{
									$.fn.drawIcon(g_clipboard["object"]);		
									$.fn.copyFolder( object_key, target_folder );
								}
								else
								{
									console.log( "invalid type in clipboard" );
								}	
			
				}
				
				//if clipboard action was CUT, move the clipboard item to current folder
				else if ( clipboard_action == "CUT" )
				{
								//if the cut item was a file, move the file to current folder
								if ( object_type == "FILE" )
								{
									$.fn.drawIcon(g_clipboard["object"]);		
									$.fn.moveFile( object_key, target_folder );
								}
								
								//if the cut item was a folder, move the file to current folder
								else if ( object_type == "FOLDER" )
								{
									$.fn.drawIcon(g_clipboard["object"]);		
									$.fn.moveFolder( object_key, target_folder );									
								}
								
								else
								{
									console.log( "invalid type in clipboard" );
								}
					
				}
								
				else
				{
								console.log( "invalid clipboard action" );
				}
				
				
			}
			
	

	 ////////////////////////////////////////// A D D F O L D E R /////////////////////////////////////////////////

	else if ( action == "addfolder" )
	{
		
		$.fn.addNewFolder(g_current_folder_key);
			
	}
	
	
	
	

	 ///////////////////////////////////////////// R E F R E S H //////////////////////////////////////////////////

	else if ( action == "refresh" )
	{
	
		//redraw the folder contents. This will request data of the current folder from the server and redraw the contents
		$.fn.refreshCurrentFolderView();
		
	}
	
	
	
	
	
	else
	{
		console.log( "invalid white space right click menu option" );
	}
	
};


/************************************ END FUNCTION WSPACE RIGHT CLICK MENU HANDLER ***********************************************************/
















/**************************** FUNCTION - REFRESH CURRENT FOLDER******************************************************/


$.fn.refreshCurrentFolderView = function(){
	console.log( "refreshCurrentFolderView()" );
	$.fn.openFolder(g_current_folder_key);
};

	
/**************************** FUNCTION - REFRESH CURRENT FOLDER******************************************************/	
	
	
/**************************** FUNCTION - REFRESH CURRENT FOLDER******************************************************/
$.fn.drawIcon = function (icon) {
	console.log( "drawIcon()" );
	$( "#div-contents" ).append(icon);
	
	//make the icon draggable
	
	$(icon).draggable({
				 containment: "#td-folder-container",
				 zIndex: 100 ,
				 opacity: .9
			});
	
	//make the icons droppable 		
	$(icon).droppable({
				accept: ".div-thumbnail-hook",
				tolerance: "intersect",
				hoverClass: "div-thumbnail-droppable",
				
				
				//do the following while dropped in this icon
				drop: function(event,ui)  
				{
					//call handler for droping one icon over another
					$.fn.iconDragDropHandler(event,ui,this);		//pass event, ui object and droppable object [ie, this - object on which drop is happened]
				}
	});	
	
};
/**************************** FUNCTION - REFRESH CURRENT FOLDER******************************************************/




/**************************** FUNCTION - UPDATE ADDRESS BAR ******************************************************/
$.fn.updateAddressBar = function (folder_path) {
	console.log( "updateAddressBar()" );
	
	$( "#div-ad-bar-elmts-container" ).empty();	
	
	var folder_id;
	var folder_name;
	
	for ( i in folder_path ) {
		folder_id = folder_path[i].key;
		folder_name = folder_path[i].name;
		
		$( "#div-ad-bar-elmts-container" ).prepend( "<div class='div-ad-bar-element'><div class='div-ad-bar-seperator'><span class='span-ad-bar-seperator'>►</span></div><div id='" + folder_id + "' class='div-ad-bar-folder div-ad-bar-folder-hook' title='" + folder_name + "' ><span class='span-ad-bar-folder'>" + folder_name + "</span></div></div>" );
	}	
};
/**************************** END - FUNCTION - UPDATE ADDRESS BAR ******************************************************/












    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
   ///////////////////////////////////////////////////// FOLDER SERVICES /////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////



/************************************ FUNCTION ENABLE RENAME FOLDER ******************************************************************/

$.fn.enableRenameFolder = function (icon_key) {
	console.log( "enableRenameFolder()" );
	//get current name of the folder. this is to highlight the name in edit box
	var current_name = $( "#"+icon_key).find( ".span-thumbnail-desc-hook" ).html();
		
	name_form = "<form id='form-icon-rename' action='javascript:void(0);'><input id='tbox-icon-rename' type='text' value='"+current_name+"'></form>";
	
	//change the name value with the above form
	$( "#"+icon_key).find( ".span-thumbnail-desc-hook" ).html(name_form);
	//Get focus to the text box and select all text inside it
	$( "#"+icon_key).find( "#tbox-icon-rename" ).focus().select();
	
	//attach evnet listener to the newly created form above
	$( "#form-icon-rename" ).submit(function( event ) {
		
		console.log( "Submit detected -renaming folder" );
		//get new name of the folder
		var new_name = $( "#"+icon_key).find( "#tbox-icon-rename" ).val();
	
		//call fucntion to save the new name to the backend server
		$.fn.renameFolder(icon_key, new_name);
		
		//prevent browser default form submit action
		event.preventDefault();
	});
	
	$( "#form-icon-rename" ).focusout(function( event ) {
		
		//get new name of the folder
		var new_name = $( "#"+icon_key).find( "#tbox-icon-rename" ).val();
		
		//call fucntion to save the new name to the backend server
		$.fn.renameFolder(icon_key, new_name);
	});

	
};

/************************************ END - FUNCTION ENABLE RENAME FOLDER ************************************************************/



/************************************ FUNCTION DRAW FOLDER ************************************************************/

$.fn.drawNewFolder = function (folder_key) {
	console.log( "drawNewFolder()" );
	new_folder = "<div class='div-thumbnail div-thumbnail-hook' id = '" + folder_key + "' data-type='folder'><div class='div-thumbnail-icon'><img class='img-thumbnail-folder-icon' src='/images/folder-icon.png'></img></div><div class='div-thumbnail-desc div-thumbnail-desc-hook' title='New Folder'><span class='span-thumbnail-desc span-thumbnail-desc-hook'>New Folder</span></div></div>";
	
	$( "#div-contents" ).append(new_folder);

	$.fn.enableRenameFolder(folder_key);
};

/************************************ END - FUNCTION DRAW FOLDER ************************************************************/


/************************************ FUNCTION ADD FOLDER ************************************************************/

$.fn.addNewFolder = function (folder_id) {
	console.log( "addNewFolder()" );
	var action = "addfolder";
	var params = {
		"parent_folder_key" : g_current_folder_key
	};
	
	$.post( "folder",{
			action : action,
			params : JSON.stringify(params)
	})
	.done(function(data,status){
		
		$.fn.drawNewFolder(data);
		
	})
	.fail(function(){
		console.log( "addfolder post failed" );
	});

};

/************************************ END FUNCTION ADD FOLDER ************************************************************/

/**************************** FUNCTION TO RENAME FOLDER ******************************************************/

$.fn.renameFolder = function (folder_key, name) {
	console.log( "renameFolder()" );
	$( "#"+folder_key).find( ".span-thumbnail-desc-hook" ).html(name);
	$( "#"+folder_key).find( ".div-thumbnail-desc-hook" ).attr( "title", name);
	
	var action = "updatefolder";
	var params = {
		"folder_key" : folder_key,
		"new_name" : name
	};
		
	$.post( "folder",{
			action : action,
			params : JSON.stringify(params)
	})
	.done(function(data,status){
			
	})
	.fail(function(){
		console.log( "updatefolder post failed" );
	});

	
};

/**************************** END - FUNCTION TO RENAME FOLDER ******************************************************/


/**************************** FUNCTION TO MOVE FOLDER ******************************************************/


$.fn.moveFolder = function (object_key, target_folder_key) {
	console.log( "moveFolder()" );
	var action = "movefolder";
	var params = {
		"folder_key" : object_key,
		"target_folder_key" : target_folder_key	
	};
	
	
	$.post( "folder",{
		action : action,
		params : JSON.stringify(params)
	})
	.done(function(data,status){
		
		
	})
	.fail(function(){
		console.log( "movefolder post failed" );
	}); 

};


/**************************** END - FUNCTION TO MOVE FOLDER ******************************************************/





/**************************** FUNCTION TO COPY FOLDER ******************************************************/


$.fn.copyFolder = function (object_key, target_folder_key) {
	console.log( "copyFolder()" );
	var action = "copyfolder";
	var params = {
		"folder_key" : object_key,
		"target_folder_key" : target_folder_key	
	};
	
		
	$.post( "folder",{
		action : action,
		params : JSON.stringify(params)
	})
	.done(function(data,status){
		
	})
	.fail(function(){
		console.log( "copyfolder post failed" );
	}); 

};


/**************************** END - FUNCTION TO COPY FOLDER ******************************************************/





/************************************ FUNCTION DELETE FOLDER ************************************************************/

$.fn.deleteFolder = function (icon_key) {
	console.log( "deleteFolder()" );
	var action = "deletefolder";
	var params = {
		"folder_key" : icon_key
	};
	
	
	$.post( "folder",{
			action : action,
			params : JSON.stringify(params)
	})
	.done(function(data,status){
			
	})
	.fail(function(){
		console.log( "deletefolder post failed" );
	});
	
};


/************************************ END - FUNCTION DELETE FOLDER ************************************************************/





/************************************ FUNCTION OPEN FOLDER ************************************************************/

$.fn.openFolder = function (folder_id) {
	console.log( "openFolder()" );
	//console.log("caller is " + arguments.callee.caller.toString());   //to know who is calling this function			
	//set variables to be posted to server to retrieve the folder contents
	var action = "viewfolder";
	var params = {
		"folder_key" : folder_id,
	};
	
	// Post the action and get contents from the server and display the contents
	
	$.post( "folder",{
			action : action,
			params : JSON.stringify(params)
	})
	.done(function(data,status){
		
		//conver the json data in the server response to javascript object
		folder_contents = JSON.parse(data);
	
		//Change the current folder key with data from the server
		g_current_folder_key = folder_contents["current_folder"].key;
		
		//update address bar		
		$.fn.updateAddressBar( folder_contents["folder_path"] );
		
		//draw icons from the server response
		$.fn.drawIcons(folder_contents);
		
	})
	.fail(function() {
		console.log( "view folder post failed" );
	});

};

/************************************ FUNCTION OPEM FOLDER ************************************************************/














    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
   /////////////////////////////////////////////////////  FILE SERVICES  /////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////




/************************************ FUNCTION ENABLE RENAME FILE ******************************************************************/

$.fn.enableRenameFile = function (icon_key) {
	console.log( "enableRenameFile()" );
	//get current name of the folder. this is to highlight the name in edit box
	var current_name = $( "#"+icon_key).find( ".span-thumbnail-desc-hook" ).html();
		
	name_form = "<form id='form-icon-rename' action='javascript:void(0);'><input id='tbox-icon-rename' type='text' value='"+current_name+"'></form>";
	
	//change the name value with the above form
	$( "#"+icon_key).find( ".span-thumbnail-desc-hook" ).html(name_form);
	//Get focus to the text box and select all text inside it
	$( "#"+icon_key).find( "#tbox-icon-rename" ).focus().select();
	
	//attach evnet listener to the newly created form above
	$( "#form-icon-rename" ).submit(function( event ) {
		//get new name of the folder
		var new_name = $( "#"+icon_key).find( "#tbox-icon-rename" ).val();
	
		//call fucntion to save the new name to the backend server
		$.fn.renameFile(icon_key, new_name);
		
		//prevent browser default form submit action
		event.preventDefault();
	});
	
	$( "#form-icon-rename" ).focusout(function( event ) {
		//get new name of the folder
		var new_name = $( "#"+icon_key).find( "#tbox-icon-rename" ).val();
		
		//call fucntion to save the new name to the backend server
		$.fn.renameFile(icon_key, new_name);
	});

	
};

/************************************ END - FUNCTION ENABLE RENAME FILE************************************************************/


/**************************** FUNCTION TO COPY FILE ******************************************************/


$.fn.copyFile = function (object_key, target_folder_key) {
	console.log( "copyFile()" );
	var action = "copylink";
	var params = {
		"link_key" : object_key,
		"target_folder_key" : target_folder_key	
	};
	
	
	$.post( "link",{
			action : action,
			params : JSON.stringify(params)
	})
	.done(function(data,status){
		
	})
	.fail(function(){
		console.log( "copylink post failed" );
	}); 

};


/**************************** END - FUNCTION TO COPY FILE ******************************************************/




/**************************** FUNCTION TO MOVE FILE ******************************************************/


$.fn.moveFile = function (object_key, target_folder_key) {
	console.log( "moveFile()" );
	var action = "movelink";
	var params = {
		"link_key" : object_key,
		"target_folder_key" : target_folder_key	
	};
	
	
	$.post( "link",{
			action : action,
			params : JSON.stringify(params)
	})
	.done(function(data,status){

	})
	.fail(function(){
		console.log( "addfolder post failed" );
	}); 

};


/**************************** END - FUNCTION TO MOVE FILE ******************************************************/



/**************************** FUNCTION TO RENAME FILE ******************************************************/

$.fn.renameFile = function (link_key, name) {
	console.log( "renameFile()" );
	$( "#"+link_key).find( ".span-thumbnail-desc-hook" ).html(name);
	$( "#"+link_key).find( ".div-thumbnail-desc-hook" ).attr( "title", name);
	
	var action = "updatelink";
	var params = {
		"link_key" : link_key,
		"new_name" : name	
	};
	
	
	$.post( "link",{
			action : action,
			params : JSON.stringify(params)
	})
	.done(function(data,status){
			
	})
	.fail(function(){
		console.log( "updatelink post failed" );
	});
		
};

/**************************** END - FUNCTION TO RENAME FILE ******************************************************/




/************************************ FUNCTION DELETE FILE ************************************************************/

$.fn.deleteFile = function (icon_key) {
	console.log( "deleteFile()" );	
	var action = "deletelink";
	var params = {
		"link_key" : icon_key
	};
	
	
	$.post( "link",{
			action : action,
			params : JSON.stringify(params)
	})
	.done(function(data,status){
		
	})
	.fail(function(){
		console.log( "addfolder post failed" );
	});
	
};


/************************************ END - FUNCTION DELETE FILE ************************************************************/




/*****************************************FUNCTION OPEN FILE **********************************************************/

$.fn.openFile = function (url) {
	console.log( "openFile()" );
	window.open(url);

};

/*********************************** END FUNCTION OPEN FILE ************************************************/


	
