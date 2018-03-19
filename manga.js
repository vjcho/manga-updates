
function appendManga(manga) {
    var linkStr = '<a href="' + manga['latestChapterLink'] + '">' + manga['title'] + ' - Ch ' + manga['latestChapter'] + '</a>';
    $("#mangaList").append('<div class="mangaItem">' + linkStr + '</div>');
}

function getMangaData(mangaPage) {
    var mangaObj = {};

    console.log("Getting manga data");
    var mangaTitle = $(mangaPage).find("div h1.title").text();

    var latestChapterData = $(mangaPage).find(".detail_list ul li").first().find("a");
    var latestChapterLink = "http:" + $(latestChapterData).attr("href");
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
            var mangaPage = "http:" + $(this).find("dt a").attr("href");
            var latestChapter = $(this).find("dd a").first().text();
            var chapterNumber = latestChapter.trim().split(" ").pop().trim();
            var latestChapterLink = "http:" + $(this).find("dd a").attr("href");

            chrome.storage.sync.get("mangaUpdates", function(data) {
                var mangaUpdates = data["mangaUpdates"]
                if (mangaPage in mangaUpdates) {
                    mangaUpdates[mangaPage]["latestChapter"] = chapterNumber;
                    mangaUpdates[mangaPage]["latestChapterLink"] = latestChapterLink;
                    data["mangaUpdates"] = mangaUpdates;
                    chrome.storage.sync.set(data);
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