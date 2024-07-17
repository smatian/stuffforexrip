chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    if (changeInfo.status === 'complete' && tab.active) {
        console.log("Tab updated")
        let url = new URL(tab.url);
        let domain = url.hostname;

        if (domain.includes("google.com")) {
            console.log("Google")
            chrome.action.setPopup({tabId: tabId, popup: "popup/start.html"});
        } else if (domain.includes("reddit.com")) {
            console.log("Reddit")
            chrome.action.setPopup({tabId: tabId, popup: "popup/examripper.html"});
        } else {
            chrome.action.setPopup({tabId: tabId, popup: "popup/loggedInNoSub.html"});
        }
    }
});