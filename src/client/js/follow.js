const followBtn = document.querySelector(".follow");
if (followBtn) const followSpan = followBtn.querySelector("span");

const handleFollow = async () => {
  followBtn.className = "following";
};

if (followBtn) {
  followBtn.addEventListener("click", handleFollow);
}
