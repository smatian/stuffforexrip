// send message when document is loaded
window.addEventListener("load", function() {
    console.log("Sending message to parent window...");
});

window.addEventListener("message", function(event) {
    if (event.origin === "https://examripper-288287396080.herokuapp.com") {

        console.log("Auth token", event.data.content.message.authToken)
        console.log("donr status", event.data.content.message.is_active_patron)
        // Save data to local storage
        chrome.storage.local.set({
            name: event.data.content.message.name,
            pfp: event.data.content.message.profile_picture_url,
            donor_status: event.data.content.message.is_active_patron,
            email: event.data.content.message.email_address,
            authToken: event.data.content.message.authToken
        }, function() {
            console.log('Data is saved to local storage.');
            console.log(chrome.storage.local.get("authToken"))
        });
    }
});
