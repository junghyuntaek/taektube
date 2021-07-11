const videos = document.querySelectorAll("video");

const handleVideoPlay = (event) => {
  const video = event.target;
  video.play();
};

const handleVideoReset = (event) => {
  const video = event.target;
  video.pause();
  video.currentTime = 1.0;
};

if (videos) {
  videos.forEach((video) => {
    video.addEventListener("mouseover", handleVideoPlay);
    video.addEventListener("mouseout", handleVideoReset);
  });
}
