const followBtn = document.getElementById("follow");
const followSpan = document.getElementById("followSpan");
const follwers = document.getElementById("followers");

const handleFollow = async () => {
  followBtn.classList.add("following");
  followSpan.innerText = "구독중";
  const { followid, followingid } = followBtn.dataset;
  await fetch(`/api/users/${followid}/${followingid}/following`, {
    method: "POST",
  });
  const followersNumber = Number(followers.innerText.substr(4, 1));
  followers.innerText = `구독자 ${followersNumber + 1}명`;
};

const handleDeleteFollow = async () => {
  followBtn.classList.remove("following");
  followSpan.innerText = "구독";
  const { followid, followingid } = followBtn.dataset;
  await fetch(`/api/users/${followid}/${followingid}/deleteFollowing`, {
    method: "DELETE",
  });
  const followersNumber = Number(followers.innerText.substr(4, 1));
  followers.innerText = `구독자 ${followersNumber - 1}명`;
};

const handleFollowDeleteFollow = () => {
  if (followBtn.className === "follow") {
    handleFollow();
  } else {
    handleDeleteFollow();
  }
};

if (followBtn) {
  followBtn.addEventListener("click", handleFollowDeleteFollow);
}
