export let lastProgress = 0;
export let player;
export let playlist = [];
export let text = document.getElementById('playPause')
import { apiKey, isPaused } from './events.js'

text.innerHTML = `<i class="fa-solid fa-pause" style="color: #23272A;"></i>`;

export function playNextInPlaylist() {
  if (playlist.length > 0) {
    var nextVideoId = playlist.shift();
    if (!player) {
      player = new YT.Player("player", {
        height: "0",
        width: "0",
        videoId: nextVideoId,
        playerVars: {
          autoplay: 1,
          controls: 0,
          rel: 0,
          disablekb: 1,
          modestbranding: 1,
        },
        events: {
          onReady: function (event) {
            onPlayerReady(event);
            setTitleNowPlaying(nextVideoId);
          },
        },
      });
    } else {
      player.loadVideoById(nextVideoId);
      setTitleNowPlaying(nextVideoId);
    }
  } else {
    console.log("A fila de reprodução está vazia.");
  }
}

export function isPlaylistLink(link) {
  return link.includes("list=");
}

export function getPlaylistVideos(playlistLink) {
  var playlistId = extractPlaylistId(playlistLink);
  if (playlistId) {
    fetchPlaylistVideos(playlistId);
  } else {
    console.log(
      "Link de playlist inválido. Certifique-se de inserir um link válido de playlist do YouTube."
    );
  }
}

export function extractPlaylistId(link) {
  var regex = /[?&]list=([^&#]+)/;
  var match = regex.exec(link);
  return match && match[1];
}

export function extractVideoId(link) {
  var regex = /[?&]v=([^&#]+)/;
  var match = regex.exec(link);
  return match && match[1];
}

export function addToPlaylist(videoId) {
  var playlistLimit = 2000;
  if (playlist.length >= playlistLimit) {
    playlist.shift();
  }

  playlist.push(videoId);

  if (!player) {
    playNextInPlaylist();
  }
}

export function seekTo(seconds) {
  if (player) {
    player.seekTo(seconds, true);
  }
}

export function setTitleNowPlaying(videoId) {
  if (!videoId) {
    document.getElementById("nowPlayingTitle").textContent = "Nenhum vídeo tocando";
  } else {
    getTitle(videoId, function (videoTitle) {
      document.getElementById("nowPlayingTitle").textContent = videoTitle;
    });
  }
}

export function onPlayerReady(event) {
  player.setVolume(10);
  player.setPlaybackQuality(240);
  document.getElementById("videoProgress").disabled = false;
  document.getElementById("skipsong").disabled = false;
  document.getElementById("playPause").disabled = false;
  document.getElementById("volumeUpButton").disabled = false;
  document.getElementById("volumeDownButton").disabled = false;
  document.getElementById("volumeSlider").disabled = false;

  var songTime = player.getDuration();
  console.log(songTime);
  var videoProgress = document.getElementById("videoProgress");
  videoProgress.addEventListener("input", function () {
    var currentTime = videoProgress.value;
    seekTo(currentTime);
  });

  player.addEventListener("onStateChange", function (event) {
    if (event.data === YT.PlayerState.PLAYING) {
      document.getElementById("compact-disc").classList.add("rotate");
    } else if (
      event.data === YT.PlayerState.PAUSED ||
      event.data === YT.PlayerState.ENDED
    ) {
      document.getElementById("compact-disc").classList.remove("rotate");
    }
  });

  player.addEventListener("onStateChange", function (event) {
    if (event.data === YT.PlayerState.ENDED) {
      skipToNextSong();
    }

  updateVideoProgress()
  setInterval(updateVideoProgress, 1000)
  });
}

export function skipToNextSong() {
  if (playlist.length > 0) {
    if (player) {
      player.stopVideo();
    }
    playNextInPlaylist();
    renderPlaylist();
  }
}

export function checkAndSkipIfStuck() {
  if (!isPaused && player) {
    var currentProgress = player.getCurrentTime();

    if (currentProgress === lastProgress) {
      skipToNextSong();
    }

    lastProgress = currentProgress;
  }
}

export function updateVideoProgress() {
  if (player) {
    var currentTime = player.getCurrentTime();
    var duration = player.getDuration();

    var videoProgress = document.getElementById("videoProgress");
    videoProgress.max = duration;
    videoProgress.value = currentTime;
  }
}

export function renderPlaylist() {
  var playlistContainer = document.getElementById("playlist");
  playlistContainer.innerHTML = "";

  if (playlist.length > 0) {
    var title = document.createElement("div");
    title.innerText = "Próxima Música:";
    title.style.fontSize = "16px";
    title.style.marginBottom = "2px";
    playlistContainer.appendChild(title);

    var nextSongContainer = document.createElement("div");
    nextSongContainer.style.display = "flex";
    nextSongContainer.style.alignItems = "center";

    var nextSongTitle = document.createElement("div");
    nextSongTitle.id = "nextSongTitle";
    nextSongTitle.style.fontFamily = "sans-serif";
    nextSongTitle.style.fontSize = "14px";
    nextSongContainer.appendChild(nextSongTitle);

    var removeNextButton = document.createElement("button");
    removeNextButton.style.marginLeft = "3%";
    removeNextButton.innerHTML = `<i id="removebutton" class="fa-solid fa-trash" style="color: #87263a;"></i>`;
    removeNextButton.addEventListener("click", function () {
      removeNextSong();
      renderPlaylist();
    });
    nextSongContainer.appendChild(removeNextButton);

    playlistContainer.appendChild(nextSongContainer);

    if (player && playlist.length > 0) {
      getTitle(playlist[0], function (videoTitle) {
        var nextSongTitle = document.getElementById("nextSongTitle");
        nextSongTitle.textContent = videoTitle;
      });
    }
  } else {
    console.log("A fila de reprodução está vazia.");
  }
}

export function removeNextSong() {
  if (playlist.length > 0) {
    playlist.shift();
  }
}

export function fetchPlaylistVideos(playlistId) {
  fetch(
    `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=${playlistId}&key=${apiKey}`
  )
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      if (data.items && data.items.length > 0) {
        data.items.forEach(function (item) {
          var videoId = item.snippet.resourceId.videoId;
          addToPlaylist(videoId);
        });
        if (!player) {
          playNextInPlaylist();
        }
      } else {
        console.log("Não foi possível obter informações da playlist.");
      }
    })
    .catch(function (error) {
      console.error("Erro ao obter informações da playlist:", error);
    });
}

export function getTitle(videoId, callback) {
  var maxCharacters = 26;
  fetch(
    `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&key=${apiKey}&fields=items(snippet(title))&part=snippet`
  )
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      if (data.items && data.items.length > 0) {
        var videoTitle = data.items[0].snippet.title;

        if (maxCharacters && videoTitle.length > maxCharacters) {
          videoTitle = videoTitle.substring(0, maxCharacters) + "...";
        }

        callback(videoTitle);
      } else {
        console.log("Não foi possível obter informações do vídeo.");
        callback("Título Desconhecido");
      }
    })
    .catch(function (error) {
      console.error("Erro ao obter informações do vídeo:", error);
      callback("Título Desconhecido");
    });
}

export function setVolume(volume) {
  if (player) {
    player.setVolume(volume);
  }
}
