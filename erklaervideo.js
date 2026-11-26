const videoButton = document.querySelector("#video-start");
const videoGif = document.querySelector("#video-platzhalter");

videoButton.addEventListener("click", () => {
  videoGif.src = videoGif.dataset.src;
  videoButton.hidden = true;
  videoGif.hidden = false;
});