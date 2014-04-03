$( document ).ready( function() {  //this is to make sure the script starts only after DOM is loaded and ready


/*************** GLOBAL VARIABLES *************************/

//this global variable is to store current folder being displayed. This will be pushed to g_prev_folder_key_stack. This is to enable back button functionality
//this variable is used at many places eg - refresh page
var g_current_folder_key;

//this global stack is to remember the folder hierarchy visited to enable back button.
var g_prev_folder_key_stack = [];  

//this global variable is to store current highlighted icon. this can be used to capture the highlighted icon at various places. 
var g_highlighed_icon = "NONE";	

//clipboard object for cut/copy/paste

var g_clipboard = new Array();
g_clipboard["action"] = "";
g_clipboard["object_type"] = "";
g_clipboard["object_key"] = "";



/*************** END - GLOBAL VARIABLES *************************/














/************************************ FUNCTION TO HANDLE DRAG AND DROP OPERATION ************************************************************/

$.fn.iconDragDropHandler = function (event, ui, target_element) {
	
	var target_type = $(target_element).attr("data-type");
	var target_id =  $(target_element).attr("id");
	var object_type = ui.draggable.attr("data-type");
	var object_id = ui.draggable.attr("id");
	
	
	//if dropping over folder
	if (target_type == "folder")
	{
		//if dragging icon is a file (ie link)
		if (object_type == "link")
		{
			//move the file to the target folder
			$.fn.moveFile(object_id, target_id);
					
		}
		
		//if dragging icon is a folder
		else if (object_type == "folder")
		{
			//move the file to the target folder
			$.fn.moveFolder(object_id, target_id);
		}
		
		//clear the dragged element from the GUI
		$("#" + object_id).remove();
		
	}
	
	//if dropping over a file
	else if (target_type == "link")
	{
		//alert("not allowed");		//cannot move icons in to a file
	}
	
	else
	{
		alert("Error: undefined");
	} 
	
};

/************************************ END - FUNCTION TO HANDLE DRAG AND DROP OPERATION ************************************************************/










/************************************ FUNCTION TO DRAW ICONS ON THE PAGE ************************************************************/

$.fn.drawIcons = function (data,status,folder_contents) {
	
	var txt="";		//variable to store the dynamic html
			
	//iterate through the data from server and construct the inner html
	for (i in folder_contents)
	{
		//if element is folder, iterate though the list of folders and construct the inner html
		if (i=="folder")	
		{
			type = "folder";
			for (j in folder_contents[i])
        	{
          		txt = txt + "<div class='div-thumbnail-container div-thumbnail-container-hook' id = '"  + folder_contents[i][j].key + "' data-type='" + type + "' data-seq='" + j +"'><div class='div-thumbnail-icon'><img class='img-thumbnail-folder-icon' src='/images/folder-icon.png' width='107px' height='110px'></img></div><div class='div-thumbnail-desc div-thumbnail-desc-hook'>" + folder_contents[i][j].name + "</div></div>"; 
        	}
	   	}
		//if element is link, iterate though the list of links and construct the inner html
	   	else if (i=="link")
	   	{
	   		type = "link";
	   		for (j in folder_contents[i])
        	{
          		txt = txt + "<div class='div-thumbnail-container  div-thumbnail-container-hook' id = '"  + folder_contents[i][j].key + "' data-type='" + type + "' data-seq='" + j + "' data-url='"+folder_contents[i][j].url+"'><div class='div-thumbnail-icon'><img class='img-thumbnail-file-icon' src='/images/unk-file-icon.png' width='107px' height='110px'></img></div><div class='div-thumbnail-desc div-thumbnail-desc-hook'>" + folder_contents[i][j].name +"</div></div>";
        	}
	   	}
	}
	
	//write the dynamically generated html to the folder area
	$("#td-folder-container").html(txt);
	
	//make the icons draggable
	$(".div-thumbnail-container-hook").draggable({
				 containment: "#td-folder-container",
				 zIndex: 100 ,
				 opacity: 0.70
			});
	
	//make the icons droppable 		
	$(".div-thumbnail-container-hook").droppable({
				accept: ".div-thumbnail-container-hook",
				tolerance: "intersect",
				hoverClass: "div-thumbnail-container-droppable",
				
				
				//do the following while dropped in this icon
				drop: function(event,ui)  
				{
					//call handler for droping one icon over another
					$.fn.iconDragDropHandler(event,ui,this);		//pass event, ui object and droppable object [ie, this - object on which drop is happened]
				}
	});
	
};

/************************************END - FUNCTION TO DRAW ICONS ON THE PAGE ************************************************************/
















/************************************FUNCTION - DISPLAY FOLDER CONTENTS ************************************************************/

$.fn.displayFolderContents = function (key) {
	
	
	// update global current folder key as the id of the folder opening right now. this is to enable back function
	g_current_folder_key = key;
	
	
	//set variables to be posted to server to retrieve the folder contents
	var action = "viewfolder";
	var params = {
		"folder_key" : key,
	};
	
	// Post the action and get contents from the server and display the contents
	
	$.post("folder",{
			action : action,
			params : JSON.stringify(params)
	})
	.done(function(data,status){
		
		//on response from the server follow below procedure
		
		//conver the jason data in the server response to javascript object
		folder_contents = JSON.parse(data);
		
		//draw icons from the server response
		$.fn.drawIcons(data, status, folder_contents);
		
		//display  path of the current displayed folder in folder path area besides the back button. Pass the current folder's path
		$.fn.displayFolderPath(folder_contents["current_folder"].path);			
		
	})
	.fail(function() {
		console.log("view folder post failed");
	});
};

/************************************END FUNCTION - DISPLAY FOLDER CONTENTS************************************************************/














/************************************FUNCTION - DISPLAY PROPERTIES IN SIDE BAR ************************************************************/	

$.fn.displayPropertiesSideBar = function (type, seq) {
	
	/******display folder properties***********/
	
	var txt = "";
		
	if(type == "folder")
	{
		txt += "<div class='div-object-detail'><span>Name: " +folder_contents["folder"][seq].name+"</span></div>";	/*Folder Name*/
		txt += "<div class='div-object-detail'><span>Contains " +folder_contents["folder"][seq].n_items+" files and folders</span></div>"; /*Contents*/
		
		//convert the json date to javascript date object
		var date_c = new Date(folder_contents["folder"][seq].date_c); 
				
		txt += "<div class='div-object-detail'><span>Created on " +date_c.toLocaleString()+"</span></div>";	/*Date created*/
		
		//convert the json date to javascript date object
		var date_m = new Date(folder_contents["folder"][seq].date_m);
		
		txt += "<div class='div-object-detail'><span>Last Modified on " +date_c.toLocaleString()+"</span></div>";	/*Date modified*/
		txt += "<div class='div-object-detail'><span>Path: " +folder_contents["folder"][seq].path+"</span></div>";	/*Folder Path*/
	}
	else if(type == "link")
	{
		txt += "<div class='div-object-detail'><span>File Name: "+folder_contents["link"][seq].name+"</span></div>";	/*Link Name*/
		txt += "<div class='div-object-detail'><span>Website: " +folder_contents["link"][seq].website+"</span></div>";	/*Link Website*/
		txt += "<div class='div-object-detail'><span>URL: " +folder_contents["link"][seq].url+"</span></div>";	/*Link URL*/
		txt += "<div class='div-object-detail'><span>Description: " +folder_contents["link"][seq].description+"</span></div>";	/*Link Description*/
		
		//convert the json date to javascript date object
		var date_c = new Date(folder_contents["link"][seq].date_c);
		
		txt += "<div class='div-object-detail'><span>Created on " +date_c.toLocaleString()+"</span></div>";	/*Link Date created*/
		
		//convert the json date to javascript date object
		var date_m = new Date(folder_contents["link"][seq].date_m);
		
		txt += "<div class='div-object-detail'><span>Last Modified on " +date_m.toLocaleString()+"</span></div>";	/*Link Date modified*/
		txt += "<div class='div-object-detail'><span>Path: " +folder_contents["link"][seq].path+"</span></div>";	/*Link Name*/
		txt += "<div class='div-object-detail'><span>File Type: " +folder_contents["link"][seq].file_type+"</span></div>";	/*Link Name*/
	}
	
	
	//draw the html to properties side bar area
	$("#td-properties-container").html(txt);
	
	
	
};

/************************************END - FUNCTION - DISPLAY PROPERTIES IN SIDE BAR ************************************************************/



/**************************** FUNCTION - REFRESH CURRENT FOLDER******************************************************/


$.fn.refreshCurrentFolderView = function(){
	$.fn.displayFolderContents(g_current_folder_key);
};

	
/**************************** FUNCTION - REFRESH CURRENT FOLDER******************************************************/	
	
	
	
	
	
	
	
	
/**************************** FUNCTION - DISPLAY PATH OF CURRENT FOLDER******************************************************/


$.fn.displayFolderPath = function (path) {
	$("#div-current-folder-path").html(path);
};


/****************************END OF FUNCTION - DISPLAY PATH OF CURRENT FOLDER******************************************************/	








/************************************ FUNCTION WSPACE RIGHT CLICK MENU HANDLER ***********************************************************/


$.fn.wspaceRightClickHandler = function (ui){
	
	
	//hide the wspace right click menu
	$(".ul-wspace-right-click-menu").hide();
		
	
	//get action from selected menu item
	var action = $(ui.item).attr("action");
	var clipboard_action = g_clipboard["action"];
	var object_type = g_clipboard["object_type"];
	var object_key = g_clipboard["object_key"];
	var target_folder = g_current_folder_key;
	
	  /////////////////////////////////////////////////////////////////////////////////////////////////////////////
	 ///////////////////////////////////////////// P A S T E /////////////////////////////////////////////////////
	/////////////////////////////////////////////////////////////////////////////////////////////////////////////
	if (action == "paste")
	{
				//if clipboard action was copy, copy the clipboard item to current folder
				if ( clipboard_action == "COPY" )
				{	
								//if the copied item was a file, copy the file to current folder
								if ( object_type == "FILE" )
								{
									//copy file to target folder
									$.fn.copyFile( object_key, target_folder );
								}
								
								//if the copied item was a folder, copy the file to current folder
								else if ( object_type == "FOLDER" )
								{
								
									//copy folder to target folder
									$.fn.copyFolder( object_key, target_folder );
								}
								else
								{
									console.log("someting is wrong");
								}	
			
				}
				
				//if clipboard action was CUT, move the clipboard item to current folder
				else if ( clipboard_action == "CUT" )
				{
								//if the cut item was a file, move the file to current folder
								if ( object_type == "FILE" )
								{
									
									//move file to target folder
									$.fn.moveFile( object_key, target_folder );
									
									
									//refresh the current folder view
									//TODO for smoother GUI experience, instead of refreshing, we can draw icon on this folder
									
									
									
								}
								
								//if the cut item was a folder, move the file to current folder
								else if ( object_type == "FOLDER" )
								{
									//move folder to target folder
									$.fn.moveFolder( object_key, target_folder );
									
								}
								
								else
								{
									console.log("someting is wrong");
								}
					
				}
								
				else
				{
								console.log("something is wrong");
				}
				
				
			}
			
	
	 
	  //////////////////////////////////////////////////////////////////////////////////////////////////////////////
	 ////////////////////////////////////////// A D D F I L E /////////////////////////////////////////////////////
	//////////////////////////////////////////////////////////////////////////////////////////////////////////////
	else if ( action == "addfile" )
	{
		
		txt = "<form id='form-addfile'>Name: <input type='text' id='tbox-addfile-name' class='tbox-addfile-name'><br>Link: <input type='text' id='tbox-addfile-url' class='tbox-addfile-url'><br><input type='submit' value='Add'></form>";
	
		$.fn.openWindow(txt);
		//It will be good idea to show a better input field other than the window.
		
		//attach evnet listener to the newly created form in new window
		$( "#form-addfile" ).submit(function( event ) {
			
			//get new name of the folder
			var file_name = $("#form-addfile").find("#tbox-addfile-name").val();
			var url = $("#form-addfile").find("#tbox-addfile-url").val();
		
			$.fn.addFile(file_name, url, g_current_folder_key);
					
			//prevent browser default form submit action
			event.preventDefault();
		});
		
	}
	
	
	
	  //////////////////////////////////////////////////////////////////////////////////////////////////////////////
	 ////////////////////////////////////////// A D D F O L D E R /////////////////////////////////////////////////
	//////////////////////////////////////////////////////////////////////////////////////////////////////////////
	else if ( action == "addfolder" )
	{
		console.log("adding folder");
		
		$.fn.addFolder(g_current_folder_key);
			
	}
	
	
	
	
	  //////////////////////////////////////////////////////////////////////////////////////////////////////////////
	 ///////////////////////////////////////////// R E F R E S H //////////////////////////////////////////////////
	//////////////////////////////////////////////////////////////////////////////////////////////////////////////
	else if ( action == "refresh" )
	{
	
		//redraw the folder contents. This will request data of the current folder from the server and redraw the contents
		$.fn.refreshCurrentFolderView();
		
	}
	
	
	
	
	
	else
	{
		console.log("something is wrong");
	}
	
};


/************************************ END FUNCTION WSPACE RIGHT CLICK MENU HANDLER ***********************************************************/










/************************************ FUNCTION RIGHT CLICK MENU HANDLER ***********************************************************/

$.fn.iconRightClickHandler = function (icon, ui) {
	
	//get action from selected menu item
	var action = $(ui.item).attr("action");
	
	console.log(action);
	
	//find out the icon type (forlder or link) and its key
	var icon_type = $(icon).attr("data-type");
	var icon_key = $(icon).attr("id"); 
	
	
	if ( icon_type == "folder" )
	{
				//////////////////////////////
				// if action is open
				if ( action == "open" )
				{
					//open folder
					$.fn.openFolder(icon_key);
					
				}
				
				
				
				//////////////////////////////
				// if action is copy
				else if ( action == "copy" )
				{
					
					console.log("copying");
					
					//save icon details to clipboard			
					g_clipboard["action"] = "COPY";
					g_clipboard["object_type"] = "FOLDER";
					g_clipboard["object_key"] = icon_key;
		
						
				}
				
				
				
				//////////////////////////////
				// if action is cut
				else if ( action == "cut" )
				{
					console.log("cutting");
					
					//save icon details to clipboard
					g_clipboard["action"] = "CUT";
					g_clipboard["object_type"] = "FOLDER";
					g_clipboard["object_key"] = icon_key;
		
						
				}
				
				
				
				
				//////////////////////////////
				// if action is rename
				else if ( action == "rename" )
				{
					
					//get current name of the folder. this is to highlight the name in edit box
					var current_name = $(icon).find(".div-thumbnail-desc-hook").html();
					
					
					txt = "<form id='form-icon-rename' action='javascript:void(0);'><input id='tbox-icon-rename' class='tbox-icon-rename' type='text' value='"+current_name+"'></form>";
					
					//change the name value with the form to text field create above
					$(icon).find(".div-thumbnail-desc-hook").html(txt);
					//Get focus to the text box and select all text inside it
					$(icon).find("#tbox-icon-rename").focus().select();
					
					//attach evnet listener to the newly created form above
					$( "#form-icon-rename" ).submit(function( event ) {
						
						//get new name of the folder
						var new_name = $(icon).find("#tbox-icon-rename").val();
					
						//call fucntion to save the new name to the backend server
						$.fn.renameFolder(icon_key, new_name, icon);
						
						//prevent browser default form submit action
						event.preventDefault();
					});
					
					$( "#form-icon-rename" ).focusout(function( event ) {
						
						//get new name of the folder
						var new_name = $(icon).find("#tbox-icon-rename").val();
					
						//call fucntion to save the new name to the backend server
						$.fn.renameFolder(icon_key, new_name, icon);
					});
					
					 
						
				}
				
				
				
				
				
				///////////////////////////////////////
				// if action is delete
				else if ( action == "delete" )
				{
					
					var r = confirm("Are you sure you want to delete?");
					
					if ( r == true )
					{
					  	$.fn.deleteFolder(icon_key);
						
						//remove the deleted icon from the UI
						$("#" + icon_key).remove();
					}
					else
					{
					  	return;
					}
					
					
				}
				
				
				
				
				//TODO need to add other action - copy, rename etc....
				else 
				{
					console.log("coming soon");
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
					var url = $(icon).attr("data-url");
					
					//open the file
					$.fn.openFile(url);
						
				}
				
				
				
				//////////////////////////////
				// if action is copy
				else if ( action == "copy" )
				{
					
					console.log("copying file");
					//save icon details to clipboard			
					g_clipboard["action"] = "COPY";
					g_clipboard["object_type"] = "FILE";
					g_clipboard["object_key"] = icon_key;
		
						
				}
				
				
				
				//////////////////////////////
				// if action is cut
				else if ( action == "cut" )
				{
					console.log("cutting file");
					//save icon details to clipboard
					g_clipboard["action"] = "CUT";
					g_clipboard["object_type"] = "FILE";
					g_clipboard["object_key"] = icon_key;
		
						
				}
				
				
				
				
				//////////////////////////////
				// if action is rename
				else if ( action == "rename" )
				{
					//get current name of the file. This is to show it highlighed while editing
					var current_name = $(icon).find(".div-thumbnail-desc-hook").html();
										
					txt = "<form id='form-icon-rename' action='javascript:void(0);'><input id='tbox-icon-rename' class='tbox-icon-rename' type='text' value='"+current_name+"'></form>";
					
					//change the name value with the form text field created above
					$(icon).find(".div-thumbnail-desc-hook").html(txt);					
					//Get focus to the text box and select all text inside it
					$(icon).find("#tbox-icon-rename").focus().select();
					
					//when submitting the save - ie-press enter - save the new name
					$( "#form-icon-rename" ).submit(function( event ) {
						
						//get new name of the file
						var new_name = $(icon).find("#tbox-icon-rename").val();
						
						//call fucntion to save the new name to the backend server
						$.fn.renameFile(icon_key, new_name, icon);
						
						//prevent browser default form submit action
						event.preventDefault();
					});
					
					//when focus is out from the file name text field, save the new name
					$( "#form-icon-rename" ).focusout(function( event ) {
					
						//get new name of the file
						var new_name = $(icon).find("#tbox-icon-rename").val();
						
						//call fucntion to save the new name to the backend server
						$.fn.renameFile(icon_key, new_name, icon);
					});
					
				}
				
				
				
				
				//////////////////////////////
				// if action is delete
				else if ( action == "delete" )
				{
					var r = confirm("Are you sure you want to delete?");
					
					if ( r == true )
					{
					  	//delete file
						$.fn.deleteFile(icon_key);					
					}
					else
					{
					  	return;
					}
							
				}
				
				
				
				
				
				//TODO need to add other action - copy, rename etc....
				else 
				{
					console.log("coming soon");
				}
	}
	
	
	
	//hide icon right click menu
	$(".ul-icon-right-click-menu").hide();
	
};



/************************************END FUNCTION RIGHT CLICK MENU HANDLER ************************************************************/











/************************************ FUNCTION ADD FOLDER ************************************************************/

$.fn.addFolder = function (folder_id) {
	
	var action = "addfolder";
	var params = {
		"parent_folder_key" : g_current_folder_key
	};
	
	$.post("folder",{
			action : action,
			params : JSON.stringify(params)
	})
	.done(function(data,status){
		
		setTimeout(function(){
			$.fn.refreshCurrentFolderView();
			}, 300
		);
		
	})
	.fail(function(){
		console.log("addfolder post failed");
	});

};

/************************************ END FUNCTION ADD FOLDER ************************************************************/










/************************************ FUNCTION OPEN FOLDER ************************************************************/



$.fn.openFolder = function (folder_id) {

//Push parent folder key of present folder to the stack before displaying new folder. This is to enable back function.	
		g_prev_folder_key_stack.push(g_current_folder_key);
		
		//Call fucntion to display the folder contents
		$.fn.displayFolderContents(folder_id);
		
		//Clear properties side bar
		$("#td-properties-container").html("");

};


/************************************ FUNCTION OPEM FOLDER ************************************************************/






/**************************** FUNCTION TO COPY FOLDER ******************************************************/


$.fn.copyFolder = function (object_key, target_folder_key) {

	var action = "copyfolder";
	var params = {
		"folder_key" : object_key,
		"target_folder_key" : target_folder_key	
	};
	
	
	$.post("folder",{
		action : action,
		params : JSON.stringify(params)
	})
	.done(function(data,status){
		
		setTimeout(function(){
			$.fn.refreshCurrentFolderView();
			}, 300
		);
		
	})
	.fail(function(){
		console.log("copyfolder post failed");
	}); 

};


/**************************** END - FUNCTION TO COPY FOLDER ******************************************************/







/**************************** FUNCTION TO MOVE FOLDER ******************************************************/


$.fn.moveFolder = function (object_key, target_folder_key) {

	var action = "movefolder";
	var params = {
		"folder_key" : object_key,
		"target_folder_key" : target_folder_key	
	};
	
	
	$.post("folder",{
		action : action,
		params : JSON.stringify(params)
	})
	.done(function(data,status){
		
		setTimeout(function(){
			$.fn.refreshCurrentFolderView();
			}, 300
		);
		
	})
	.fail(function(){
		console.log("movefolder post failed");
	}); 

};


/**************************** END - FUNCTION TO MOVE FOLDER ******************************************************/







/**************************** FUNCTION TO RENAME FOLDER ******************************************************/

$.fn.renameFolder = function (folder_key, name, icon) {
	
	var action = "updatefolder";
	var params = {
		"folder_key" : folder_key,
		"new_name" : name
	};
	
	
	$.post("folder",{
			action : action,
			params : JSON.stringify(params)
	})
	.done(function(data,status){
			
			$(icon).find(".div-thumbnail-desc-hook").html(name);
	})
	.fail(function(){
		console.log("updatefolder post failed");
	});

	
};

/**************************** END - FUNCTION TO RENAME FOLDER ******************************************************/







/************************************ FUNCTION DELETE FOLDER ************************************************************/

$.fn.deleteFolder = function (icon_key) {
		
	var action = "deletefolder";
	var params = {
		"folder_key" : icon_key
	};
	
	
	$.post("folder",{
			action : action,
			params : JSON.stringify(params)
	})
	.done(function(data,status){
			
			//if success remove the deleted icon from the UI
			$("#" + icon_key).remove();
	})
	.fail(function(){
		console.log("deletefolder post failed");
	});
	
};


/************************************ END - FUNCTION DELETE FOLDER ************************************************************/





/*****************************************FUNCTION ADD FILE **********************************************************/

$.fn.addFile = function (name, url, parent_folder) {
	
	var action = "addlink";
	var params = {
		"name" : name,
		"url" : url,
		"parent" : parent_folder
	};
	
	
	$.post("link",{
			action : action,
			params : JSON.stringify(params)
	})
	.done(function(data,status){
		
		setTimeout(function(){
			$.fn.refreshCurrentFolderView();
			}, 300
		);
					
		$.fn.closeWindow();
		
	})
	.fail(function(){
		console.log("addlink post failed");
	});	
	
};
 
/*****************************************FUNCTION ADD FILE **********************************************************/





/*****************************************FUNCTION OPEN FILE **********************************************************/

$.fn.openFile = function (url) {
	
	window.open(url);
	
	
	/*$.post("app",{
			appid : "linkviewer",
			params : url
	})
	.done(function(data,status){
		
		//TODO when multitasking is to be enabled, new app window have to be created.
		
		//response from the server needs to be pushed in the new window's iframe
		var app_url = data;
		
		//Make window content from the server response
		txt = "<iframe class='iframe-app-content' id='iframe-app-content-1' src='"+ app_url +"'></iframe>";
		
		//open widow with the content from the server
		$.fn.openWindow(txt, app_url);
		
	})
	.fail(function(){
		console.log("linkviewer post failed");
	});*/
	 	
};


/*********************************** END FUNCTION OPEN FILE ************************************************/





/**************************** FUNCTION TO COPY FILE ******************************************************/


$.fn.copyFile = function (object_key, target_folder_key) {

	var action = "copylink";
	var params = {
		"link_key" : object_key,
		"target_folder_key" : target_folder_key	
	};
	
	
	$.post("link",{
			action : action,
			params : JSON.stringify(params)
	})
	.done(function(data,status){
		
		setTimeout(function(){
			$.fn.refreshCurrentFolderView();
			}, 300
		);
		
	})
	.fail(function(){
		console.log("copylink post failed");
	}); 

};


/**************************** END - FUNCTION TO COPY FILE ******************************************************/











/**************************** FUNCTION TO MOVE FILE ******************************************************/


$.fn.moveFile = function (object_key, target_folder_key) {

	var action = "movelink";
	var params = {
		"link_key" : object_key,
		"target_folder_key" : target_folder_key	
	};
	
	
	$.post("link",{
			action : action,
			params : JSON.stringify(params)
	})
	.done(function(data,status){

		setTimeout(function(){
			$.fn.refreshCurrentFolderView();
			}, 300
		);

	})
	.fail(function(){
		console.log("addfolder post failed");
	}); 

};


/**************************** END - FUNCTION TO MOVE FILE ******************************************************/







/**************************** FUNCTION TO RENAME FILE ******************************************************/

$.fn.renameFile = function (link_key, name, icon) {
	
	var action = "updatelink";
	var params = {
		"link_key" : link_key,
		"new_name" : name	
	};
	
	
	$.post("link",{
			action : action,
			params : JSON.stringify(params)
	})
	.done(function(data,status){
			$(icon).find(".div-thumbnail-desc-hook").html(name);
	})
	.fail(function(){
		console.log("updatelink post failed");
	});
		
};

/**************************** END - FUNCTION TO RENAME FILE ******************************************************/













/************************************ FUNCTION DELETE FILE ************************************************************/

$.fn.deleteFile = function (icon_key) {
		
	var action = "deletelink";
	var params = {
		"link_key" : icon_key
	};
	
	
	$.post("link",{
			action : action,
			params : JSON.stringify(params)
	})
	.done(function(data,status){
		//if success remove the deleted icon from the UI
		$("#" + icon_key).remove();
	})
	.fail(function(){
		console.log("addfolder post failed");
	});
	
};


/************************************ END - FUNCTION DELETE FILE ************************************************************/







/************************************ END - FUNCTION HIGHLIGHT ICON ************************************************************/

$.fn.highlightIcon = function (icon) {

	if (icon == 0)		//if icon is zero; just reset previous highlighted icon
	{
		if (g_highlighed_icon != "NONE")
		{
			$(g_highlighed_icon).switchClass("div-thumbnail-container-highlight", "div-thumbnail-container");
		}	
	}
	
	else
	{
		// reset border and background colors of prev highlighed icon. 
	
		if (g_highlighed_icon != "NONE")
		{
			$(g_highlighed_icon).switchClass("div-thumbnail-container-highlight", "div-thumbnail-container");
		}
		
		
		//make this icon as highlighed icon			
		g_highlighed_icon = icon;
		
		//hightlight this icon - change appearance
		$(icon).switchClass("div-thumbnail-container", "div-thumbnail-container-highlight", {duration: 100 });
	}
	
};


/************************************ END - FUNCTION HIGHLIGHT ICON ************************************************************/






/************ ICON UI INTERACTIONS **********/
/************ ICON UI INTERACTIONS **********/
/************ ICON UI INTERACTIONS **********/
/************ ICON UI INTERACTIONS **********/
/************ ICON UI INTERACTIONS **********/


/****************************ONMOUSEDOWN - WHITE SPACE******************************************************/


$(document).on("mousedown", "#td-folder-container", function(event) {
	
	
	//this condition is to avoid this click from capturing by child element (icons). If the event is not from folder container exit the function	
	if (event.target.id != "td-folder-container")
	{
		return;
	}
	//otherwise continue	


//////////////////////////////////      NOTICE !!!!!!!!!!!!!!!!!!!!!     ////////////////////////////////////
	
	// ANY ACTION OF THIS FUNCTION SHOULD BE BELOW THIS LINE
	// ANY ACTION OF THIS FUNCTION SHOULD BE BELOW THIS LINE
	// ANY ACTION OF THIS FUNCTION SHOULD BE BELOW THIS LINE
	
////////////////////////////////////////////////////////////////////////////////////////////////////////////	
	
	
	//hide the  icon right click menu. It may be displayed
	$("#ul-icon-right-click-menu").hide();
		
	
	
	///////////////////////////////////////////////
	//if mouse button is left, ie, normal click
	if (event.which == 1)  
	{
				
		//hide the  right click menus
		$("#ul-wspace-right-click-menu").hide();
		
		//reset icon highlight
		$.fn.highlightIcon(0); 
		
	}
	
	
	
	
	///////////////////////////////////////////////
	//if mouse button is middle
	else if (event.which == 2) 
	{
		console.log("middle click coming soon");
		
	}
	
	
	
	
	///////////////////////////////////////////////
	//if mouse button is right, ie, right click
	else if (event.which == 3)  
	{
		
		//if clipboard is not null make the 'paste' menu in the right click menu active. otherwise it will be deactivated
		if(g_clipboard["action"] != "")
		{
			$(".ul-wspace-right-click-menu li[action='paste']").removeClass("ui-state-disabled");		
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
		$("#ul-wspace-right-click-menu").css({left: event.pageX, top: event.pageY});
		
		//show right click menu
		$("#ul-wspace-right-click-menu").show();
		
		
	}
	
	
	
	
	/////////////////////////////////////////
	//if mouse button is none of the above
	else
	{
		console.log("you got strange mouse button");
	}
	
});

/****************************END ONMOUSEDOWN - WHITE SPACE******************************************************/



	
/****************************ONCLICK - SYS FOLDERS******************************************************/

$(document).on("click", ".div-sysfolder", function() {

	//hide the right click menu
	$("#ul-icon-right-click-menu").hide();
	$("#ul-wspace-right-click-menu").hide();
	
	//open folder
	$.fn.openFolder(this.id);
	
});
	
	
	
/****************************END OF CLICK ON SYSFOLDER ICONS******************************************************/	



	

/************************************ONCLICK ICONS ************************************************************/	


$(document).on("mousedown", ".div-thumbnail-container-hook", function(event) {
	
	//capture the icon where mouse is down
	var icon = this;	
	
	
	 //////////////////////////////////////////////////////////////
	//if mouse button is left, ie, normal click
	if (event.which == 1)  
	{
		
		//highlight this icon
		$.fn.highlightIcon(icon);
		
		//hide right click menu
		$("#ul-wspace-right-click-menu").hide();
		
		
		 //////////////////////////////////////////////////////////////
		//collect details to display folder properties in the side bar	
		var type = $(icon).attr("data-type");
		var seq = $(icon).attr("data-seq");
		
		//display the sidebar details
		$.fn.displayPropertiesSideBar(type, seq);
	}
	
	
	
	
	 ///////////////////////////////////////////////////
	//if mouse button is middle
	else if (event.which == 2)  
	{
		//console.log("you clicked middle button");
	}
	
	
	
	///////////////////////////////////////////////////
	//if mouse button is right, ie, right click
	else if (event.which == 3)  
	{
		
		//highlight this icon
		$.fn.highlightIcon(icon);
		
		//hide right click menu
		$("#ul-wspace-right-click-menu").hide();
		
				
		//make right click menu
		$( "#ul-icon-right-click-menu" ).menu({
			
				select: function( event, ui ) {

							//Call function - right click handler. Pass the icon object and menu element object (ui)	
							//this function will handlw what happens when clicked on a menu item			 		
					  		$.fn.iconRightClickHandler(icon, ui);
				}
		});
		
		//set position of right click menu to mouse pointer
		$("#ul-icon-right-click-menu").css({left: event.pageX, top: event.pageY});
		
		//show right click menu
		$("#ul-icon-right-click-menu").show();
	}
	
	
	
	//////////////////////////////////
	//if mouse button is none of the above
	else
	{
		console.log("you got a strange mouse");
	}
	
});  
/************************************END - ONCLICK ICONS ************************************************************/	




/************************************ON DOUBLE CLICK ON ICONS ************************************************************/	

$(document).on("dblclick", ".div-thumbnail-container-highlight" , function() {     

	var type = $(this).attr("data-type");
	
	//hide right click menu
	$(".ul-icon-right-click-menu").hide();
		
	if(type == "folder")
	{
		//open folder
		$.fn.openFolder(this.id);
		
	}	
	else if (type == "link")
	{
		//get url of the link
		var url = $(this).attr("data-url");
			
		$.fn.openFile(url);
	}
});  



/************************************END - ON DOUBLE CLICK ON ICONS ************************************************************/	


/************************************ONCLICK UP FOLDER ************************************************************/

$(document).on("click", ".div-prev-folder-button", function() {

		
	//get prev folder key from the stack
	prev_folder_key = g_prev_folder_key_stack.pop();
	
	//display contents of previous folder
	if ( typeof prev_folder_key != 'undefined')
	{
		$.fn.displayFolderContents(prev_folder_key);
	}
	else
	{
		alert("no more back");
	}
	
	
});

/************************************END ONCLICK UP FOLDER************************************************************/



















/**************************************************************************************************************************/
/**************************************************************************************************************************/
/************************************ WINDOW MANAGER FUNCTIONS ************************************************************/
/************************************ WINDOW MANAGER FUNCTIONS ************************************************************/
/************************************ WINDOW MANAGER FUNCTIONS ************************************************************/
/************************************ WINDOW MANAGER FUNCTIONS ************************************************************/
/**************************************************************************************************************************/
/**************************************************************************************************************************/

/******************** GLOBAL VARIABLES ************************************************************************************/


//create a global array of app windows. this global array will maintain the windows opened at run time.

var g_appwindow = new Array();

/******************** END GLOBAL VARIABLES ************************************************************************************/

/************************************ WINDOW OBJECT DEFINITION ************************************************************/

// This is a class defenition, NOT a function. This object will store the properties of windows that are open in the page.
//TODO this object needs to be saved in the data store whenever there is a change in the object.
function Appwindow()  	
{
	this.window_state = "";
	this.z_index = "";
}

/************************************ END WINDOW OBJECT DEFINITION ************************************************************/






/***********************************  FUNCTION OPEN WINDOWN ************************************************/

$.fn.openWindow = function (content, url) {
	
	
	//create an object for this window
	
	g_appwindow[1] = new Appwindow();
	g_appwindow[1].window_state = "NORMAL";
	g_appwindow[1].app_url = url;
	
	
	//write iframe to the window contents
	$("#div-app-window-content-1").html(content);
	
	//Show the window
	$("#div-app-window-1" ).show("fade","slow");   				
	
	
	//make window draggable. dragging is possible only if mouse down over window title. so, setting hanlder as window title
	$("#div-app-window-1").draggable(
			{ handle: "#div-app-window-title-1" }, 
			{ delay: 200 },
			{ scroll: false },
			{iframeFix: true}
	);
	
	$("#div-app-window-1").resizable(
			{ animate: true },
			{ animateEasing: "easeInOutQuart" }
	);		
};

/*********************************** END FUNCTION OPEN WINDOWN ************************************************/








/***********************************  FUNCTION CLOSE WINDOWN ************************************************/

$.fn.closeWindow = function () {
	
	//Hide main app window
	//TODO when multitasking is to be enabled, the app window have to be removed instead of hiding it.
	$("#div-app-window-1").hide("fade");
	
	//TODO delete window from g_appwindow global variable
	
	
};

/*********************************** END FUNCTION CLOSE WINDOWN ************************************************/












/***********************************  FUNCTION MAXIMIZE WINDOWN ************************************************/

$.fn.maximizeWindow = function () {
	
	//unlike the function name indicates, this function is not only for maximizing windows.
	//function name inidicates whats to be done when maximize button clicked. If windows is already maximized, need to resize it.
	//if you have a better function name, you're welcome
	
	//get current window's sate
	window_state = g_appwindow[1].window_state;
	
	if(window_state == "NORMAL")
	{
		
		//current window state is normal. Need to make window full screen
		
		//The drag operation of the window would change the app-window's postion. 
		//Need to clear it so that it will take values from the CSS class. Otherwise dragged window will not be full screen.
		$("#div-app-window-1").css("top", "").css("left", "").css("width", "").css("height", "");
		
		
		//change the style cass and apply the fullscreen styles
		$("#div-app-window-1").switchClass("div-app-window","div-app-window-fullscreen");
		$("#div-app-window-title-1").switchClass("div-app-window-title","div-app-window-title-fullscreen");
		$("#div-app-window-control-buttons-1").switchClass("div-app-window-control-buttons","div-app-window-control-buttons-fullscreen");
		$("#div-app-window-content-1").switchClass("div-app-window-content","div-app-window-content-fullscreen");
		
		
		
		//TODO disable draggable and resizable
		//$("#div-app-window-1").draggable( "disable" );
		//$("#div-app-window-1").resizable( "disable" );
		
		
		
		//Make control buttons draggable
		$("#div-app-window-control-buttons-1").draggable(
								{ scroll: false },
								{ axis: "y" },
								{containment: "#div-app-window-1"}
								//{iframeFix: true} //disales click of buttons
							);
		
		
		//The drag operation of the div would change the it's postion.
		//Need to clear element specific values so that div will take values from the CSS class. the div will not be positioned properly after transition
		$("#div-app-window-control-buttons-1").css("top", "").css("left", "").css("width", "").css("height", "").css("position", "");;
		
		
		
		//set window_state to maximized
		g_appwindow[1].window_state = "MAXIMIZED";	
		
	}
	
	else if (window_state == "MAXIMIZED")
	{
		
		//Need to clear element specific values so that div will take values from the CSS class. Otherwise dragged window will not be full screen.
		$("#div-app-window-control-buttons-1").css("top", "").css("left", "").css("width", "").css("height", "");
		
		
		$("#div-app-window-1").switchClass("div-app-window-fullscreen", "div-app-window");
		$("#div-app-window-title-1").switchClass("div-app-window-title-fullscreen", "div-app-window-title");
		$("#div-app-window-control-buttons-1").switchClass("div-app-window-control-buttons-fullscreen", "div-app-window-control-buttons");
		$("#div-app-window-content-1").switchClass("div-app-window-content-fullscreen", "div-app-window-content");
		
		//$("#div-app-window-control-buttons-1").draggable("disable"); TODO 
		
		g_appwindow[1].window_state = "NORMAL";
	}
	
	else
	{
		alert("invalid window state");
	}
	
	
	
};

/*********************************** END FUNCTION CLOSE WINDOWN ************************************************/











/***********************************  FUNCTION 	OPEN APP IN NEW WINDOWN ************************************************/

$.fn.openAppInNewWindow = function () {
	
	//open new tab with app url
	console.log(g_appwindow[1].app_url);
	window.open(g_appwindow[1].app_url);
	
	
	//alert( $("iframe-app-content-1").contents().get(0).location.href );      //not working because of security, will work only if iframe belong to same website
	
};


/***********************************  END FUNCTION 	OPEN APP IN NEW WINDOWN ************************************************/












/*****************WINDOW  UI INTERACTIONS **********************/
/*****************WINDOW  UI INTERACTIONS **********************/
/*****************WINDOW  UI INTERACTIONS **********************/
/*****************WINDOW  UI INTERACTIONS **********************/
/*****************WINDOW  UI INTERACTIONS **********************/


/************************************ ON CLICK OF CONTROL BUTTONS ON WINDOW ************************************************************/

$(document).on("click", ".div-app-window-close-button", function() {

	$.fn.closeWindow();
	
});


$(document).on("click", ".div-app-window-full-screen-button", function() {

	$.fn.maximizeWindow();
	
});


$(document).on("click", ".div-app-window-new-window-button", function() {

	$.fn.openAppInNewWindow();
	
});

/************************************END ONCLICK FULLSCREEN BUTTON ON WINDOW************************************************************/







/************************************ ONCE THE PAGE IS LOADED, SHOW THE MYDRIVE FOLDER*************************************/


$.fn.displayFolderContents( $(".div-sysfolder-mydrive-hook").attr("id") );

/*************************************** END - SHOW MY DRIVE FOLDER**************************************************/






/**************** Experiments *************/
/**************** Experiments *************/
/**************** Experiments *************/
/**************** Experiments *************





$(document).ready(function () {
	$(".div-thumbnail-container-hook").mousedown(function(event) {
	    switch (event.which) {
	        case 1:
	            alert('Left mouse button pressed');
	            break;
	        case 2:
	            alert('Middle mouse button pressed');
	            break;
	        case 3:
	            alert('Right mouse button pressed');
	            break;
	        default:
	            alert('You have a strange mouse');
	    }
	});
	
});





**************** Experiments *************/
/**************** Experiments *************/
/**************** Experiments *************/
/**************** Experiments *************/




});    //END OF DOCUMENT READY FUNCTION


