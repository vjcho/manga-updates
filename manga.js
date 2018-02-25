
function appendManga(manga) {
    $("#mangaList").append('<a href="http:' + manga['latestChapterLink'] + '">' + manga['title'] + ' - Ch' + manga['latestChapter'] + "</a><br>");
}

function getMangaData(mangaPage) {
    var mangaObj = {};

    console.log("Getting manga data");
    var mangaTitle = $(mangaPage).find("div h1.title").text();

    var latestChapterData = $(mangaPage).find(".detail_list ul li").first().find("a");
    var latestChapterLink = $(latestChapterData).attr("href");
    var latestChapter = $(latestChapterData).text().trim().split(" ").pop().trim();

    mangaObj["title"] = mangaTitle;
    mangaObj["latestChapterLink"] = latestChapterLink;
    mangaObj["latestChapter"] = latestChapter;

    console.log(mangaObj);
    return mangaObj;
}

function saveManga() {
    var mangaUrl = $("#mangaUrl").val();

    // Get data from url
    $.get(mangaUrl, function(response) {
        var mangaObj = getMangaData(response);
        mangaObj['mangaLink'] = mangaUrl;

        // Save title to sync storage
        chrome.storage.sync.get("mangaUpdates", function(data) {
            data["mangaUpdates"][mangaUrl] = mangaObj;

            chrome.storage.sync.set(data, function() {
                appendManga(mangaObj);
            });
        });
    });
}

function updateMangaList(mangaUrl) {
    $.get(mangaUrl, function(response) {
        console.log("Updating manga");
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

    $('#mangaList').on('click', 'a', function(){
        chrome.tabs.create({url: $(this).attr('href')});
        return false;
   });

    // If no mangaUpdates obj, create new one
    chrome.storage.sync.get(null, function(data) {
        console.log(data);
        if (!('mangaUpdates' in data))
            chrome.storage.sync.set({"mangaUpdates": {}});
        else {
            // Display saved manga
            var mangaList = data['mangaUpdates'];
            for (var manga in mangaList) {
                appendManga(mangaList[manga]);
            }
        }
    });

    updateMangaList("http://www.mangahere.cc/latest/");
});