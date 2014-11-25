
//get current tab
chrome.tabs.query({currentWindow: true, active: true}, function(tabs){
    tab = tabs[0];
	if ( tab.url == "chrome://newtab/" )
	{
		console.log("New Tab Page. Redirecting to Netlinks Website");
		window.close();		//hiding popup
		chrome.tabs.update(tab.id, {url: "http://net-links.appspot.com"});	//redirect netlinks page
	}
	else
	{
		console.log("Saving Link");
		$.fn.addFile(tab);
	}
});



$.fn.addFile = function (tab) {
	
	$("#container").load("progress.txt");
	
	var action = "addlink";
	var params = {
		"name" : tab.title,
		"url" : tab.url,
	};
	
	$.post("http://net-links.appspot.com/link",{
			action : action,
			params : JSON.stringify(params)
	})
	.done(function(data,status){
		$.fn.updatePopup(data);
	})
	.fail(function(){
		console.log("addlink post failed");
		$("#container").html("Network Failure!");
	});	
	
};

$.fn.updatePopup = function (data) {
	
	console.log(data);
	
	response = JSON.parse(data);
	if (response["status"] == "LOGIN_FAILED")
	{
		$("#container").load("login_fail.txt", function() {
				$("#login_link").attr("href", response["login_url"]);		//run this once load of login_fail is completed. Load() is asynchronous
		});		
	}
	else if(response["status"] == "SUCCESS")
	{
		$("#container").load("link_saved.txt");
		$(document).on( "click", "#import" , function() {
			$.fn.saveBookmarks();
		});
	}
	else
	{
		console.log("Save failed. Something is wrong at server side.")
		$("#container").html("Something is wrong :(");
	}
};

$.fn.saveBookmarks = function () {
	console.log( "importing" );
	
	chrome.bookmarks.getTree(function(bookmarkTreeNodes) {
		
		bookmarkTreeNodes[0].title = "Bookmarks"
		var bookmarkTree = JSON.stringify(bookmarkTreeNodes[0])		//chrome returns array of objects. The first object is the bookmark tree
		
		$("#container").load("progress.txt");
				
		$.post("http://net-links.appspot.com/import",{
			bookmarkTree : bookmarkTree
		})
		.done(function(data,status){
			console.log(data);
			$("#container").html("Bookmarks Saved");
		})
		.fail(function(){
			console.log("addlink post failed");
			$("#container").html("Network Failure!");
		});	
	});
};

$(document).on( "click", "#more" , function() {
	$("#import").slideToggle("swing");
});   

