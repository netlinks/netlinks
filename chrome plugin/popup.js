//get current active tab
chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
		tab = tabs[0];
		$.fn.addFile(tab);
		
})

$.fn.addFile = function (tab) {
	
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
	});	
	
};

$.fn.updatePopup = function (data) {
	console.log(data);
	login_url = "http://localhost:8080/"
	if (data == "LOGIN FAILED")
	{
		$("body").html("<br>Please <a href='"+login_url+"' target='_blank'>Login</a>")
	}
	else if(data == "SUCCESS")
	{
		$("body").html("<br>Link Saved <br><br><p id='import' style='border-style:solid;border-width:1px;'>Import Bookmarks</p>")	
		$("#import").click(function() {
			$.fn.saveBookmarks();
		});
	}
	else
	{
		console.log("Save failed. Something is wrong at server side.")
	}
};

$.fn.saveBookmarks = function () {
	console.log( "importing" );
	
	chrome.bookmarks.getTree(function(bookmarkTreeNodes) {
		
		bookmarkTreeNodes[0].title = "Bookmarks"
		var bookmarkTree = JSON.stringify(bookmarkTreeNodes[0])		//chrome returns array of objects. The first object is the bookmark tree
		console.log(bookmarkTree);
		
		$.post("http://localhost:8080/import",{
			bookmarkTree : bookmarkTree
		})
		.done(function(data,status){
			console.log(data);
		})
		.fail(function(){
			console.log("addlink post failed");
		});	
	});
};


