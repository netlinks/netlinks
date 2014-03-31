
var urlGenerator = {
    getCurrentURL_: function (url) {
    chrome.tabs.getSelected(null, function(tab) {
		var login_url = "http://localhost:8080/"
		var action = "addlink"
				var params = {
					"url" : tab.url,
					"name" : tab.title
				}
		
		$.post("http://localhost:8080/link",{
			action : action,
			params : JSON.stringify(params)
		},
		function(data,status){
			console.log(data);
			if (data == "False")
			{
				$("body").html("<br><a href='"+login_url+"' target='_blank'>Login</a>")
			}
			else
			{
				$("body").html("<br>Link Saved <br>")
			}
		});
	});;
  }
};

document.addEventListener('DOMContentLoaded', function () {
  urlGenerator.getCurrentURL_();
});
