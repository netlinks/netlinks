var QUERY = 'kittens';

var urlGenerator = {
    getCurrentURL_: function (url) {
    chrome.tabs.getSelected(null, function(tab) {
		alert(tab.url);
	});;
  }
};

// Run our kitten generation script as soon as the document's DOM is ready.
document.addEventListener('DOMContentLoaded', function () {
  urlGenerator.getCurrentURL_();
});
