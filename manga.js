
function appendManga(manga) {
    document.getElementById("mangaList").innerHTML += "<p>" + manga + "</p>";
}

function saveManga() {
    var mangaTitle = document.getElementById("mangaTitle").value;

    // Save title to sync storage
    chrome.storage.sync.get("mangaUpdates", function(data) {
        data["mangaUpdates"][mangaTitle] = {
          "latestChapter": 0,
          "read": true
        };

        chrome.storage.sync.set(data, function() {
            appendManga(mangaTitle);
        });
    });
}

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById("saveButton").addEventListener("click", saveManga);

    // If no mangaUpdates obj, create new one
    chrome.storage.sync.get(null, function(data) {
        if (!('mangaUpdates' in data))
            chrome.storage.sync.set({"mangaUpdates": {}});
        else {
            // Display saved manga
            for (var manga in data['mangaUpdates']) {
                console.log(manga);
                appendManga(manga);
            }
        }
    });
});