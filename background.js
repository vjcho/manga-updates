chrome.runtime.onInstalled.addListener(function() {
    // Create alarm if not already existing
    chrome.alarms.get("checkLatestAlarm", function(alarm) {
        if (!alarm)
            chrome.alarms.create("checkLatestAlarm", {periodInMinutes: 30} );
    }); 

    // Create mangaUpdates object if not already existing
    chrome.storage.sync.get(null, function(data) {
        console.log(data);
        if (!('mangaUpdates' in data))
            chrome.storage.sync.set({"mangaUpdates": {}});
    });
});

chrome.runtime.onStartup.addListener(function() {
    // Check each manga's page and update
    alarm("onStartup");
    updateSavedManga();
});

// Check latest page every hour
chrome.alarms.onAlarm.addListener(function(alarm) {
    if (alarm.name == 'checkLatestAlarm') {
        alert("updating latest");
        updateLatest();
    }
});
