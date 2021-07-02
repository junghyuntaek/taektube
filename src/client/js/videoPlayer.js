const video = document.querySelector("video");
const playBtn = document.getElementById("play");
const playBtnIcon = playBtn.querySelector("i");
const currentTime = document.getElementById("currentTime");
const totalTime = document.getElementById("totalTime");
const timeline = document.getElementById("timeline");
const muteBtn = document.getElementById("mute");
const muteBtnIcon = muteBtn.querySelector("i");
const volumeContainer = document.getElementById("volumeContainer");
const volumeRange = document.getElementById("volume");
const fullScreenBtn = document.getElementById("fullScreen");
const fullScreenBtnIcon = fullScreenBtn.querySelector("i");
const videoContainer = document.getElementById("videoContainer");
const videoControls = document.getElementById("videoControls");

let controlsTimeout = null;
let controlsMovementTimeout = null;
let VolumeContainerTimeout = null;
let volumeValue = 0.5;
video.volume = volumeValue;

const handlePlayClick = () => {
  if (video.paused) {
    video.play();
  } else {
    video.pause();
  }
  playBtnIcon.classList = video.paused ? "fas fa-play" : "fas fa-pause";
};

const handleEnded = () => {
  playBtnIcon.classList = "fas fa-play";
  const { id } = videoContainer.dataset;
  fetch(`/api/videos/${id}/view`, {
    method: "POST",
  });
};

const handleMute = () => {
  if (video.muted) {
    video.muted = false;
  } else {
    video.muted = true;
  }
  muteBtnIcon.classList = video.muted
    ? "fas fa-volume-mute"
    : "fas fa-volume-up";
  volumeRange.value = video.muted ? 0 : volumeValue;
};

const handleVolumnChange = (event) => {
  const {
    target: { value },
  } = event;
  if (video.muted) {
    video.muted = false;
    muteBtn.innerText = "mute";
  }
  volumeValue = value;
  video.volume = value;
};

const formatTime = (seconds) =>
  new Date(seconds * 1000).toISOString().substr(11, 8);

const handelLoaddedMetadata = () => {
  if (Math.floor(video.duration) < 3600) {
    totalTime.innerText = formatTime(Math.floor(video.duration)).substr(3);
  } else {
    totalTime.innerText = formatTime(Math.floor(video.duration));
  }
  timeline.max = Math.floor(video.duration);
};

const handleTimeUpdate = () => {
  if (Math.floor(video.currentTime) < 3600) {
    currentTime.innerText = formatTime(Math.floor(video.currentTime)).substr(3);
  } else {
    currentTime.innerText = formatTime(Math.floor(video.currentTime));
  }
  timeline.value = Math.floor(video.currentTime);
};

const handleTimelineChange = (event) => {
  const {
    target: { value },
  } = event;
  video.currentTime = value;
};

const handleFullScreen = () => {
  const fullscreen = document.fullscreenElement;
  if (fullscreen) {
    document.exitFullscreen();
    fullScreenBtnIcon.classList = "fas fa-expand";
    videoControls.classList.remove("videoControls-fullScreen");
  } else {
    videoContainer.requestFullscreen();
    fullScreenBtnIcon.classList = "fas fa-compress";
    videoControls.classList.add("videoControls-fullScreen");
  }
};

const hideControls = () => videoControls.classList.remove("showing");

const handleMouseMove = () => {
  if (controlsTimeout) {
    clearTimeout(controlsTimeout);
    controlsTimeout = null;
  }
  if (controlsMovementTimeout) {
    clearTimeout(controlsMovementTimeout);
    controlsMovementTimeout = null;
  }
  videoControls.classList.add("showing");
  controlsMovementTimeout = setTimeout(hideControls, 2000);
};

const handleMouseLeave = () => {
  controlsTimeout = setTimeout(hideControls, 2000);
};

const handleVolumeMouseMove = () => {
  if (VolumeContainerTimeout) {
    clearTimeout(VolumeContainerTimeout);
  }
  volumeRange.classList.add("showing");
};

const handleVolumeMouseLeave = () => {
  VolumeContainerTimeout = setTimeout(
    () => volumeRange.classList.remove("showing"),
    1000
  );
};

const handleKeyUp = (e) => {
  if (e.key === " ") {
    handlePlayClick();
  } else if (e.key === "f") {
    videoContainer.requestFullscreen();
    fullScreenBtnIcon.classList = "fas fa-compress";
    videoControls.classList.add("videoControls-fullScreen");
  }
};

const handleVideoFocus = () => {
  videoContainer.addEventListener("keyup", handleKeyUp);
};

playBtn.addEventListener("click", handlePlayClick);
muteBtn.addEventListener("click", handleMute);
volumeContainer.addEventListener("mousemove", handleVolumeMouseMove);
volumeContainer.addEventListener("mouseleave", handleVolumeMouseLeave);
volumeRange.addEventListener("input", handleVolumnChange);
video.addEventListener("loadedmetadata", handelLoaddedMetadata);
video.addEventListener("timeupdate", handleTimeUpdate);
video.addEventListener("click", handlePlayClick);
video.addEventListener("ended", handleEnded);
videoContainer.addEventListener("mousemove", handleMouseMove);
videoContainer.addEventListener("mouseleave", handleMouseLeave);
videoContainer.addEventListener("focus", handleVideoFocus);
// videoContainer.addEventListener("fullscreenchange", handleFullscreenChange);
timeline.addEventListener("input", handleTimelineChange);
fullScreenBtn.addEventListener("click", handleFullScreen);
