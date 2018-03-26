
function appendManga(mangaObj, chChoices) {
    var $row = $('<tr></tr>');
    var mangaTitle = '<td><a href="' + mangaObj['mangaLink'] + '">' + mangaObj['title'] + '</a></td>';
    var currentCh = '<td><a href="' + mangaObj['currentChapterLink'] + '">' + mangaObj['currentChapter'] + '</a></td>';
    var latestCh = '<td><a href="' + mangaObj['latestChapterLink'] + '">' + mangaObj['latestChapter'] + '</a></td>';
    var xStr = '<td align="center"><img class="deleteBtn" value="' + mangaObj['mangaLink'] + '" src="/img/x.svg"></td>';

    $row.append(mangaTitle);
    $row.append(currentCh);
    $row.append(latestCh);
    $row.append(xStr);
    $("#mangaList").append($row);
}

function displayMangaList(mangaList) {
    for (var manga in mangaList) {
        appendManga(mangaList[manga]);
    }
}

function getMangaData(mangaPage) {
    var mangaObj = {};

    console.log("Getting manga data");
    var mangaTitle = $(mangaPage).find("div h1.title").text();

    var chapterList = $(mangaPage).find(".detail_list ul").first();
    var latestChapterData = $(chapterList).find("li").first().find("a");
    var latestChapterLink = "http:" + $(latestChapterData).attr("href");
    var latestChapter = $(latestChapterData).text().trim().split(" ").pop().trim();

    var firstChapterData = $(chapterList).find("li").last().find("a");
    var firstChapterLink = "http:" + $(firstChapterData).attr("href");
    var firstChapter = $(firstChapterData).text().trim().split(" ").pop().trim();

    mangaObj["title"] = mangaTitle;
    mangaObj["latestChapterLink"] = latestChapterLink;
    mangaObj["latestChapter"] = latestChapter;

    // Default current chapter to first chapter
    mangaObj["currentChapterLink"] = firstChapterLink;
    mangaObj["currentChapter"] = firstChapter;

    console.log(mangaObj);
    return mangaObj;
}

function saveManga(mangaUrl) {
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

// Update from "latest" page
function updateLatest(mangaUrl) {
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

// Update from each individual manga's page
function updateSavedManga() {
    chrome.storage.sync.get("mangaUpdates", function(data) {
        var mangaUpdates = data["mangaUpdates"];
        for (var manga in mangaUpdates) {
            saveManga(manga);
        }
    });
}

$(document).ready(function() {
    $("#saveButton").click(function() {
        var mangaUrl = $("#mangaUrl").val();
        saveManga(mangaUrl);
    });

    $('#mangaList').on('click', 'a', function() {
        chrome.tabs.create({url: $(this).attr('href')});
        return false;
    });

    chrome.alarms.getAll(function(data) {
        console.log(data);
    });

    chrome.storage.sync.get(null, function(data) {
        // Display saved manga
        var mangaList = data['mangaUpdates'];
        displayMangaList(mangaList);
    });

    updateLatest("http://www.mangahere.cc/latest/");
});

$(document).on('click', '.deleteBtn', function() {
    var mangaLink = $(this).attr('value');
    var div = $(this).closest("tr");

    chrome.storage.sync.get("mangaUpdates", function(data) {
        var mangaUpdates = data['mangaUpdates'];
        delete mangaUpdates[mangaLink];
        data['mangaUpdates'] = mangaUpdates;

        chrome.storage.sync.set(data, function() {
            div.remove();
        });
    });
});