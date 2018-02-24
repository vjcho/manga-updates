
function saveManga() {
  var mangaTitle = document.getElementById("mangaTitle").value;
  console.log(mangaTitle);
}

document.addEventListener('DOMContentLoaded', function() {
  document.getElementById("saveButton").addEventListener("click", saveManga);
});
