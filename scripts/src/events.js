import {
  extractVideoId,
  isPlaylistLink,
  addToPlaylist,
  skipToNextSong,
  setVolume,
  getTitle,
  renderPlaylist,
  getPlaylistVideos,
  text,
  playlist,
  player,
  lastProgress,
} from "./functions.js";

export let apiKey
export let isPaused = false;
var keyIcon = document.getElementById('keyIcon');
var popup = document.querySelector('.popup');
var popActive = false

keyIcon.addEventListener("click", () => {
  if (popActive === false) {
    popup.style.display = "block";
    popActive = true;
  } else {
    popup.style.display = "none";
    popActive = false;
  }
});

var newKey = document
  .getElementById("apiButton")
  .addEventListener("click", () => {
    apiKey = document.getElementById("apiKey").value;
    popup.style.display = "none";
    popActive = false;
    alert("API-Key Saved");
  });

document
  .getElementById("videoForm")
  .addEventListener("submit", function (event) {
    event.preventDefault();
    var videoLink = document.getElementById("videoLink").value;
    var videoId = extractVideoId(videoLink);
    if (videoId) {
      if (isPlaylistLink(videoLink)) {
        getPlaylistVideos(videoLink);
      } else {
        addToPlaylist(videoId);
      }
      document.getElementById("videoLink").value = "";
      renderPlaylist();
    } else {
      console.log(
        "Link de vídeo inválido. Certifique-se de inserir um link válido do YouTube."
      );
    }
  });

document.getElementById("playPause").addEventListener("click", function () {
  if (isPaused) {
    player.playVideo();
    text.innerHTML = `<i class="fa-solid fa-pause" style="color: #23272A;"></i>`;
    isPaused = false;
  } else {
    player.pauseVideo();
    text.innerHTML = `<i class="fa-solid fa-play" style="color: #23272A;"></i>`;
    isPaused = true;
  }
});

document.getElementById("skipsong").addEventListener("click", function () {
  skipToNextSong();
});

document
  .getElementById("volumeUpButton")
  .addEventListener("click", function () {
    var currentVolume = player.getVolume();
    if (currentVolume < 100) {
      player.setVolume(currentVolume + 10);
    }
  });

document
  .getElementById("volumeDownButton")
  .addEventListener("click", function () {
    var currentVolume = player.getVolume();
    if (currentVolume > 0) {
      player.setVolume(currentVolume - 10);
    }
  });

var volumeSlider = document.getElementById("volumeSlider");
volumeSlider.addEventListener("input", function () {
  var volumeValue = parseInt(volumeSlider.value);
  setVolume(volumeValue);
});