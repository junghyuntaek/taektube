const videoContainer = document.getElementById("videoContainer");
const form = document.getElementById("commentForm");
const deleteBtns = document.querySelectorAll(".delete__btn");
const modifyBtns = document.querySelectorAll(".modify__btn");

const videoId = videoContainer.dataset.id;

const addComment = (text, id) => {
  const { userid, name } = form.dataset;
  const addComments = form.parentNode;
  const addCommentsAvatar = addComments.querySelector("img");

  const videoComments = document.querySelector(".video__comments ul");
  const newComment = document.createElement("li");
  newComment.className = "video__comment";
  newComment.dataset.id = id;
  const div1 = document.createElement("div");
  div1.className = "video__comment-info";
  const div1A = document.createElement("a");
  div1A.href = `/users/${userid}`;
  if (!addCommentsAvatar) {
    const div1ASpan = document.createElement("span");
    div1ASpan.className = "video__comment__none-avatar";
    div1ASpan.innerText = "😂";
    div1A.appendChild(div1ASpan);
  } else {
    const avatar = addCommentsAvatar.src;
    const div1AImg = document.createElement("img");
    div1AImg.className = "video__comment__avatar";
    div1AImg.src = `${avatar}`;
    div1A.appendChild(div1AImg);
  }
  const div1Div1 = document.createElement("div");
  div1Div1.className = "video__comment-text";
  const div1Div1Div1 = document.createElement("div");
  const div1Div1Div1Span1 = document.createElement("span");
  div1Div1Div1Span1.className = "video__comment-name";
  div1Div1Div1Span1.innerText = `${name}`;
  div1Div1Div1.appendChild(div1Div1Div1Span1);
  const div1Div1Span2 = document.createElement("span");
  div1Div1Span2.className = "comment-text";
  div1Div1Span2.innerText = `${text}`;
  div1Div1.appendChild(div1Div1Div1);
  div1Div1.appendChild(div1Div1Span2);
  div1.appendChild(div1A);
  div1.appendChild(div1Div1);

  const div2 = document.createElement("div");
  div2.className = "video__comment-btn";
  const div2Span1 = document.createElement("span");
  div2Span1.className = "modify__btn";
  div2Span1.innerText = "💬";
  const div2Span2 = document.createElement("span");
  div2Span2.className = "delete__btn";
  div2Span2.innerText = "❌";
  div2.appendChild(div2Span1);
  div2.appendChild(div2Span2);

  newComment.appendChild(div1);
  newComment.appendChild(div2);
  videoComments.prepend(newComment);

  div2Span1.addEventListener("click", handleModify);
  div2Span2.addEventListener("click", handleDelete);
};

const handleSubmit = async (event) => {
  event.preventDefault();
  const textarea = form.querySelector("textarea");
  const text = textarea.value;
  if (text === "") {
    return;
  }
  const response = await fetch(`/api/videos/${videoId}/comment`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text }),
  });
  if (response.status === 201) {
    textarea.value = "";
    const { newCommentId } = await response.json();
    addComment(text, newCommentId);
  }
};

const handleDelete = async (event) => {
  const commentBtn = event.target.parentNode;
  const comment = commentBtn.parentNode;
  const deleteComment = await fetch(
    `/api/videos/${videoId}/comments/${comment.dataset.id}`,
    {
      method: "DELETE",
    }
  );
  if (deleteComment) {
    comment.remove();
  }
};

const handleModify = (event) => {
  const modifyBtn = event.target;

  const commentBtn = modifyBtn.parentNode;
  const comment = commentBtn.parentNode;
  const commentText = comment.querySelector(".video__comment-text");
  const text = commentText.querySelector(".comment-text");

  const commentId = comment.dataset.id;
  commentText.classList.add("disabled");
  commentBtn.classList.add("disabled");

  const modifyComment = document.createElement("form");
  modifyComment.className = "video__modifyComments-form";
  const textarea = document.createElement("textarea");
  textarea.placeholder = "공개 댓글 추가...";
  textarea.value = text.innerText;
  const buttonBox = document.createElement("div");
  const button1 = document.createElement("button");
  button1.className = "cancle-btn";
  button1.innerText = "취소";
  const button2 = document.createElement("button");
  button2.className = "modify-btn";
  button2.innerText = "수정";
  buttonBox.appendChild(button1);
  buttonBox.appendChild(button2);
  modifyComment.appendChild(textarea);
  modifyComment.appendChild(buttonBox);

  comment.appendChild(modifyComment);

  modifyComment.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (event.submitter.className === "cancle-btn") {
      event.preventDefault();
      commentText.classList.remove("disabled");
      commentBtn.classList.remove("disabled");
      modifyComment.remove();
      return;
    }
    const modifyText = textarea.value;
    if (modifyText === "") {
      return;
    }
    const response = await fetch(
      `/api/videos/${videoId}/modifyComment/${commentId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: modifyText }),
      }
    );
    if (response.status === 201) {
      text.innerText = modifyText;
      commentText.classList.remove("disabled");
      commentBtn.classList.remove("disabled");
      modifyComment.remove();
    }
  });
};

if (form) {
  form.addEventListener("submit", handleSubmit);
}
if (deleteBtns) {
  for (const deleteBtn of deleteBtns) {
    deleteBtn.addEventListener("click", handleDelete);
  }
}
if (modifyBtns) {
  for (const modifyBtn of modifyBtns) {
    modifyBtn.addEventListener("click", handleModify);
  }
}
