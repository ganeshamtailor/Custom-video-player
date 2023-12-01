const videoContainer = document.querySelector(".video-container")
const videoControlsContainer = document.querySelector('.video-controls-container')
const playPauseBtn = document.querySelector(".play-pause-btn")
// const captionsBtn = document.querySelector(".captions-btn")
const speedBtn = document.querySelector(".speed-btn")
const theaterBtn = document.querySelector(".theater-btn")
const fullScreenBtn = document.querySelector(".full-screen-btn")
const miniPlayerBtn = document.querySelector(".mini-player-btn")
const muteBtn = document.querySelector(".mute-btn")
const volumeSlider = document.querySelector(".volume-slider")
const currentTimeElem = document.querySelector(".current-time")
const totalTimeElem = document.querySelector(".total-time")
const previewImg = document.querySelector(".preview-img")
const thumbnailImg = document.querySelector(".thumbnail-img")
const timelineContainer = document.querySelector(".timeline-container")
const video = document.querySelector("video")
const tooltip = document.createElement('div');
tooltip.classList.add('tooltip');
timelineContainer.appendChild(tooltip);



document.addEventListener("keydown", function(event) {
    
    switch (event.code) {
        case "Space":
        case "KeyK":
            event.preventDefault()
            toggleplay()
            break
        case "KeyF":
            toggleFullScreenMode()
            break
        case "KeyT":
            toggleTheaterMode()
            break
        case "KeyI":
            toggleMiniPlayerMode()
            break
        case "KeyM":
            toggleMute()
            break
        case "ArrowLeft":
        case "KeyJ":
            skip(-5)
            break
        case "ArrowRight":
        case "KeyL":
            skip(5)
            break
        case "KeyC":
            toggleCaptions()
            break
    }
})

timelineContainer.addEventListener("mousemove", handleTimelineUpdate)
timelineContainer.addEventListener("mousedown", toggleScrubbing)
document.addEventListener("mouseup", e => {
  if (isScrubbing) toggleScrubbing(e)
})
document.addEventListener("mousemove", e => {
  if (isScrubbing) handleTimelineUpdate(e)
})

let isScrubbing = false
let wasPaused
function toggleScrubbing(e) {
  const rect = timelineContainer.getBoundingClientRect()
  const percent = Math.min(Math.max(0, e.x - rect.x), rect.width) / rect.width
  isScrubbing = (e.buttons & 1) === 1
  videoContainer.classList.toggle("scrubbing", isScrubbing)
  if (isScrubbing) {
    wasPaused = video.paused
    video.pause()
  } else {
    video.currentTime = percent * video.duration
    if (!wasPaused) video.play()
  }

  handleTimelineUpdate(e)
}

function handleTimelineUpdate(e) {
  const rect = timelineContainer.getBoundingClientRect();
  const percent = Math.min(Math.max(0, e.x - rect.x), rect.width) / rect.width;
  const currentTime = percent * video.duration;

  const chapterMetaData = [
      { from: 0, to: 60, chapterName: 'Chapter 1' },
      { from: 60, to: 120, chapterName: 'Chapter 2' },
      { from: 120, to: 210, chapterName: 'Chapter 3' },
  ];
  
  const currentChapter = chapterMetaData.find(chapter => currentTime >= chapter.from && currentTime < chapter.to);
  const previewImgSrc = `assets/previewImgs/${currentChapter.chapterName}.jpg`;

  previewImg.src = previewImgSrc;
  timelineContainer.style.setProperty("--preview-position", percent);

  tooltip.textContent = currentChapter.chapterName;
  tooltip.style.left = `${percent * 100}%`;
  document.getElementById('time-and-chapter').textContent = `Time: ${currentTime.toFixed(2)}, Chapter: ${currentChapter.chapterName}`;

  if (isScrubbing) {
      e.preventDefault();
      thumbnailImg.src = previewImgSrc;
      timelineContainer.style.setProperty("--progress-position", percent);
  }
}  

function moveToChapter(chapterName) {
  const chapterMetaData = [
    { from: 0, to: 60, chapterName: 'Chapter 1' },
    { from: 60, to: 120, chapterName: 'Chapter 2' },
    { from: 120, to: 210, chapterName: 'Chapter 3' },
  ];

  const chapter = chapterMetaData.find(chapter => chapter.chapterName === chapterName);

  if (chapter) {
    video.currentTime = chapter.from;
  }
}

function displayChapters() {
  const chapterMetaData = [
    { from: 0, to: 60, chapterName: 'Chapter 1' },
    { from: 60, to: 120, chapterName: 'Chapter 2' },
    { from: 120, to: 210, chapterName: 'Chapter 3' },
  ];

  const chapterContainer = document.getElementById('chapter-container');

  chapterMetaData.forEach(chapter => {
    const chapterElement = document.createElement('span');
    chapterElement.textContent = chapter.chapterName;
    chapterElement.addEventListener('click', () => moveToChapter(chapter.chapterName));

    chapterContainer.appendChild(chapterElement);
  });
}

// Call the function when the page loads
window.onload = displayChapters;

// Playback Speed
speedBtn.addEventListener("click", changePlaybackSpeed)

function changePlaybackSpeed() {
  let newPlaybackRate = video.playbackRate + 0.25
  if (newPlaybackRate > 2) newPlaybackRate = 0.25
  video.playbackRate = newPlaybackRate
  speedBtn.textContent = `${newPlaybackRate}x`
}


// Caption
/**function hideCaptionsButton(){
  captionsBtn.style.display="none";
}
const captions = video.textTracks[0]
captions.mode = "hidden"

captionsBtn.addEventListener("click", toggleCaptions)

function toggleCaptions() {
  const isHidden = captions.mode === "hidden"
  captions.mode = isHidden ? "showing" : "hidden"
  videoContainer.classList.toggle("captions", isHidden)
}
**/

// Volume
video.addEventListener("loadeddata", () => {
    totalTimeElem.textContent = formatDuration(video.duration)
  })
  
  video.addEventListener("timeupdate", () => {
    currentTimeElem.textContent = formatDuration(video.currentTime)
    const percent = video.currentTime / video.duration
    timelineContainer.style.setProperty("--progress-position", percent)
  })
  
  const leadingZeroFormatter = new Intl.NumberFormat(undefined, {
    minimumIntegerDigits: 2,
  })
  function formatDuration(time) {
    const seconds = Math.floor(time % 60)
    const minutes = Math.floor(time / 60) % 60
    const hours = Math.floor(time / 3600)
    if (hours === 0) {
      return `${minutes}:${leadingZeroFormatter.format(seconds)}`
    } else {
      return `${hours}:${leadingZeroFormatter.format(
        minutes
      )}:${leadingZeroFormatter.format(seconds)}`
    }
  }
  
  function skip(duration) {
    video.currentTime += duration
  }
  

muteBtn.addEventListener("click", toggleMute)
volumeSlider.addEventListener("input", e => {
  video.volume = e.target.value
  video.muted = e.target.value === 0
})

function toggleMute() {
  video.muted = !video.muted
}

video.addEventListener("volumechange", () => {
  volumeSlider.value = video.volume
  let volumeLevel
  if (video.muted || video.volume === 0) {
    volumeSlider.value = 0
    volumeLevel = "muted"
  } else if (video.volume >= 0.5) {
    volumeLevel = "high"
  } else {
    volumeLevel = "low"
  }

  videoContainer.dataset.volumeLevel = volumeLevel
})

// View Modes
theaterBtn.addEventListener("click", toggleTheaterMode)
fullScreenBtn.addEventListener("click", toggleFullScreenMode)
miniPlayerBtn.addEventListener("click", toggleMiniPlayerMode)

function toggleTheaterMode() {
  videoContainer.classList.toggle("theater")
}

function toggleFullScreenMode() {
  if (document.fullscreenElement == null) {
    videoContainer.requestFullscreen()
  } else {
    document.exitFullscreen()
  }
}

function toggleMiniPlayerMode() {
  if (videoContainer.classList.contains("mini-player")) {
    document.exitPictureInPicture()
  } else {
    video.requestPictureInPicture()
  }
}

document.addEventListener("fullscreenchange", () => {
  videoContainer.classList.toggle("full-screen", document.fullscreenElement)
})

video.addEventListener("enterpictureinpicture", () => {
  videoContainer.classList.add("mini-player")
})

video.addEventListener("leavepictureinpicture", () => {
  videoContainer.classList.remove("mini-player")
})


// play & pause
playPauseBtn.addEventListener("click", toggleplay)
video.addEventListener("click", toggleplay)

function toggleplay() {
    video.paused ? video.play() : video.pause()
}

video.addEventListener("play", () => {
    videoContainer.classList.remove("paused")
})

video.addEventListener("pause", () => {
  videoContainer.classList.add("paused")
})

let timeoutId;

// Function to hide controls
function hideControls() {
    videoControlsContainer.style.visibility = "hidden";
}

// Function to show controls and reset the inactivity timer
function showControlsAndResetTimer() {
    // Show controls when activity is detected
    videoControlsContainer.style.visibility = "visible";

    // Clear the existing timeout
    clearTimeout(timeoutId);

    // Set a new timeout
    timeoutId = setTimeout(hideControls, 5000);
}

// Listen for mousemove event on the video container
videoContainer.addEventListener("mousemove", showControlsAndResetTimer);
videoContainer.addEventListener("touchmove", showControlsAndResetTimer);

// Initialize the inactivity timer when the page loads
showControlsAndResetTimer();
