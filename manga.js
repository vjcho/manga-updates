
function appendManga(title, manga) {
    $("#mangaList").append("<p>" + title + " - Ch " + manga['latestChapter'] + "</p>");
}

function saveManga() {
    var mangaTitle = $("#mangaTitle").val();

    // Save title to sync storage
    chrome.storage.sync.get("mangaUpdates", function(data) {
        mangaObj = {
          "latestChapter": 0,
          "read": true
        };

        data["mangaUpdates"][mangaTitle] = mangaObj;

        chrome.storage.sync.set(data, function() {
            appendManga(mangaTitle, mangaObj);
        });
    });
}

$(document).ready(function() {
    $("#saveButton").click(saveManga);

    // If no mangaUpdates obj, create new one
    chrome.storage.sync.get(null, function(data) {
        if (!('mangaUpdates' in data))
            chrome.storage.sync.set({"mangaUpdates": {}});
        else {
            // Display saved manga
            var mangaList = data['mangaUpdates'];
            for (var manga in mangaList) {
                console.log(manga);
                appendManga(manga, mangaList[manga]);
            }
        }
    });
});