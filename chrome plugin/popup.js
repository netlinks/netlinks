//get current active tab
chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
		tab = tabs[0];
		$.fn.addFile(tab);
		
})

$.fn.addFile = function (tab) {
	
	$("#container").load("progress.txt");
	
	var action = "addlink";
	var params = {
		"name" : tab.title,
		"url" : tab.url,
	};
	
	$.post("http://localhost:8080/link",{
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
	login_url = "http://localhost:8080/"
	if (data == "LOGIN FAILED")
	{
		$("#container").load("login_fail.txt");
	}
	else if(data == "SUCCESS")
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
				
		$.post("http://localhost:8080/import",{
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

