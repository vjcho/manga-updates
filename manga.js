
function saveManga() {
    var mangaTitle = document.getElementById("mangaTitle").value;

    // Save title to sync storage
    chrome.storage.sync.get("mangaUpdates", function(data) {
        data["mangaUpdates"][mangaTitle] = {
          "latestChapter": 0,
          "read": true
        };

        chrome.storage.sync.set(data);
    };)
}

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById("saveButton").addEventListener("click", saveManga);

    // If no mangaUpdates obj, create new one
    chrome.storage.sync.get(null, function(data) {
        if (!('mangaUpdates' in data))
            chrome.storage.sync.set({"mangaUpdates": {}});
    })
});