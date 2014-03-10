var QUERY = 'kittens';

var urlGenerator = {
    getCurrentURL_: function (url) {
    chrome.tabs.getSelected(null, function(tab) {
		var action = "addlink"
				var params = {
					"url" : tab.url,
					"name" : "testlink",
					"parent" : "ag1kZXZ-bmV0LWxpbmtzcjQLEgZGb2xkZXIiFTE4NTgwNDc2NDIyMDEzOTEyNDExOAwLEgZGb2xkZXIYgICAgICAgAkM"
				}
				
				$.post("http://localhost:8080/link",{
      				action : action,
       				params : JSON.stringify(params)
      			},
      			function(data,status){
      				console.log("Success");
      			});
	});;
  }
};

document.addEventListener('DOMContentLoaded', function () {
  urlGenerator.getCurrentURL_();
});
