var QUERY = 'kittens';

var urlGenerator = {
    getCurrentURL: function (url) {
    chrome.tabs.getSelected(null, function(tab) {
		alert(tab.url);
	});;
  }
};

document.addEventListener('DOMContentLoaded', function () {
  urlGenerator.getCurrentURL();
});

chrome.contextMenus.create({
    id: 'addlinktonetlink',  
    title: 'Add link to Netlink',
    contexts: ['all']
}, function () {
    if (chrome.runtime.lastError) {
        alert('ERROR: ' + chrome.runtime.lastError.message);
    }
});

chrome.contextMenus.onClicked.addListener(function(info, tab) {
    if (info.menuItemId === 'addlinktonetlink') {
        alert(tab.url);
    }
});