
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

function updateMangaList(mangaUrl) {
    // Get around CORS
    var url = "https://crossorigin.me/" + mangaUrl;
    $.get(url, function(response) {
        var manga_updates = $(response).find(".manga_updates").children();

        manga_updates.each(function() {
            var title = $(this).find("dt a").text();
            var latestChapter = $(this).find("dd a").last().text();
            var chapterNumber = latestChapter.match(/\d+$/)[0];

            chrome.storage.sync.get("mangaUpdates", function(data) {
                if (title in data["mangaUpdates"]) {
                    var updateObj = data;
                    updateObj["mangaUpdates"][title]["latestChapter"] = chapterNumber;
                    chrome.storage.sync.set(updateObj);
                }
            });
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
                appendManga(manga, mangaList[manga]);
            }
        }
    });

    updateMangaList("http://www.mangahere.cc/latest/");
});