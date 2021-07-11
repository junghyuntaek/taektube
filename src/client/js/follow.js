const followBtn = document.getElementById("follow");
const followSpan = document.getElementById("followSpan");
const follwerNumber = document.getElementById("followerNumber");

const alertNotLogin = () => {
  alert("로그인이 필요한 기능입니다!");
};

const handleFollow = async () => {
  const { followid, followingid } = followBtn.dataset;
  if (followid === undefined) {
    alertNotLogin();
    return;
  }
  followBtn.classList.add("following");
  followSpan.innerText = "구독중";
  await fetch(`/api/users/${followid}/${followingid}/following`, {
    method: "POST",
  });
  const updateFollowerNumber = Number(followerNumber.innerText.substr(4, 1));
  followerNumber.innerText = `구독자 ${updateFollowerNumber + 1}명`;
};

const handleDeleteFollow = async () => {
  const { followid, followingid } = followBtn.dataset;
  if (followid === undefined) {
    alertNotLogin();
    return;
  }
  followBtn.classList.remove("following");
  followSpan.innerText = "구독";
  await fetch(`/api/users/${followid}/${followingid}/deleteFollowing`, {
    method: "DELETE",
  });
  const updateFollowerNumber = Number(followerNumber.innerText.substr(4, 1));
  followerNumber.innerText = `구독자 ${updateFollowerNumber - 1}명`;
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
