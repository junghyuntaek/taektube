const videoContainer = document.getElementById("videoContainer");
const form = document.getElementById("commentForm");
const deleteBtns = document.querySelectorAll(".delete__btn");
const modifyBtns = document.querySelectorAll(".modify__btn");

const videoId = videoContainer.dataset.id;

const addComment = (text, id) => {
  const videoComments = document.querySelector(".video__comments ul");
  const newComment = document.createElement("li");
  newComment.className = "video__comment";
  newComment.dataset.id = id;
  const icon = document.createElement("i");
  icon.className = "fas fa-comment";
  const span = document.createElement("span");
  span.innerText = `${text}`;
  const commentText = document.createElement("div");
  commentText.className = "video__comment-text";
  commentText.appendChild(icon);
  commentText.appendChild(span);
  const span2 = document.createElement("span");
  span2.className = "delete__btn";
  span2.innerText = "❌";
  const span3 = document.createElement("span");
  span3.className = "modify__btn";
  span3.innerText = "💬";
  const commentBtn = document.createElement("div");
  commentBtn.className = "video__comment-btn";
  commentBtn.appendChild(span2);
  commentBtn.appendChild(span3);
  newComment.appendChild(commentText);
  newComment.appendChild(commentBtn);
  videoComments.prepend(newComment);
  span2.addEventListener("click", handleDelete);
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
  modifyBtn.removeEventListener("click", handleModify);
  modifyBtn.addEventListener("click", handleStay);

  const commentBtn = modifyBtn.parentNode;
  const comment = commentBtn.parentNode;
  const commentText = comment.querySelector(".video__comment-text");
  const text = commentText.querySelector("span");

  const commentId = comment.dataset.id;
  commentText.classList.add("disabled");

  const modifyComment = document.createElement("form");
  modifyComment.className = "video__add-comments video__modify-comments";
  const textarea = document.createElement("textarea");
  textarea.cols = "30";
  textarea.rows = "1";
  textarea.placeholder = "Modify comment...";
  textarea.value = text.innerText;
  const button = document.createElement("button");
  button.innerText = "Modify";
  modifyComment.appendChild(textarea);
  modifyComment.appendChild(button);

  comment.prepend(modifyComment);

  modifyComment.addEventListener("submit", async (event) => {
    event.preventDefault();
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
      modifyComment.remove();
    }
  });
};

const handleStay = (event) => {
  const modifyBtn = event.target;
  modifyBtn.removeEventListener("click", handleStay);
  modifyBtn.addEventListener("click", handleModify);

  const commentBtn = modifyBtn.parentNode;
  const comment = commentBtn.parentNode;
  const commentText = comment.querySelector(".video__comment-text");
  const commentModify = comment.querySelector(".video__modify-comments");

  commentText.classList.remove("disabled");
  commentModify.remove();
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
