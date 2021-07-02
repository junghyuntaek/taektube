import Video from "../models/Video";
import User from "../models/User";
import Comment from "../models/Comment";

export const home = async (req, res) => {
  const videos = await Video.find({})
    .sort({ createdAt: "desc" })
    .populate("owner");
  return res.render("home", { pageTitle: "Home", videos });
};
export const watch = async (req, res) => {
  const { id } = req.params;
  const video = await Video.findById(id).populate("owner").populate("comments");
  if (!video) {
    return res.status(404).render("404", { pageTitle: "Video not found." });
  }
  const followIndex = req.session.user.follows.indexOf(String(video.owner._id));
  return res.render("watch", { pageTitle: video.title, video, followIndex });
};
export const getEdit = async (req, res) => {
  const { id } = req.params;
  const {
    user: { _id },
  } = req.session;
  const video = await Video.findById(id);
  if (!video) {
    return res.status(404).render("404", { pageTitle: "Video not found." });
  }
  if (String(video.owner) !== String(_id)) {
    req.flash("error", "Not authorized");
    return res.status(403).redirect("/");
  }
  return res.render("edit", { pageTitle: `Edit: ${video.title}`, video });
};
export const postEdit = async (req, res) => {
  const { id } = req.params;
  const { title, description, hashtags } = req.body;
  const {
    user: { _id },
  } = req.session;
  const video = await Video.exists({ _id: id });
  if (!video) {
    return res.status(404).render("404", { pageTitle: "Video not found." });
  }
  if (String(video.owner) !== String(_id)) {
    req.flash("error", "You are not the owner of the video.");
    return res.status(403).redirect("/");
  }
  await Video.findByIdAndUpdate(id, {
    title,
    description,
    hashtags: Video.formatHashtags(hashtags),
  });
  req.flash("success", "Changes saved.");
  return res.redirect(`/videos/${id}`);
};

export const getUpload = (req, res) => {
  return res.render("upload", { pageTitle: "Upload Video" });
};

export const postUpload = async (req, res) => {
  const {
    user: { _id },
  } = req.session;
  const { video, thumb } = req.files;
  const { title, description, hashtags } = req.body;
  try {
    const newVideo = await Video.create({
      title,
      description,
      fileUrl: video[0].path,
      thumbUrl: thumb[0].path,
      owner: _id,
      hashtags: Video.formatHashtags(hashtags),
    });
    const user = await User.findById(_id);
    user.videos.push(newVideo._id);
    await user.save();
    return res.redirect("/");
  } catch (error) {
    return res.status(400).render("upload", {
      pageTitle: "Upload Video",
      errorMessage: error._message,
    });
  }
};

export const deleteVideo = async (req, res) => {
  const { id } = req.params;
  const {
    user: { _id },
  } = req.session;
  const video = await Video.findById(id);
  if (!video) {
    return res.status(404).render("404", { pageTitle: "Video not found." });
  }
  if (String(video.owner) !== String(_id)) {
    return res.status(403).redirect("/");
  }
  const user = await User.findById(_id);
  const videosIndex = user.videos.indexOf(id);
  user.videos.splice(videosIndex, 1);
  await user.save();
  await Video.findByIdAndDelete(id);
  return res.redirect("/");
};

export const search = async (req, res) => {
  const { keyword } = req.query;
  let videos = [];
  if (keyword) {
    videos = await Video.find({
      title: {
        $regex: new RegExp(keyword, "i"),
      },
    }).populate("owner");
  }
  return res.render("search", { pageTitle: "Search", videos });
};

export const registerView = async (req, res) => {
  const { id } = req.params;
  const video = await Video.findById(id);
  if (!video) {
    return res.sendStatus(404);
  }
  video.meta.views = video.meta.views + 1;
  await video.save();
  return res.sendStatus(200);
};

export const createComment = async (req, res) => {
  const {
    session: { user },
    body: { text },
    params: { id },
  } = req;

  const video = await Video.findById(id);
  if (!video) {
    return res.sendStatus(404);
  }
  const comment = await Comment.create({
    text,
    owner: user._id,
    video: id,
  });
  video.comments.push(comment._id);
  await video.save();
  const userComment = await User.findById(user._id);
  userComment.comments.push(comment._id);
  await userComment.save();
  return res.status(201).json({ newCommentId: comment._id });
};

export const modifyComment = async (req, res) => {
  const {
    session: { user },
    body: { text },
    params: { videoId, commentId },
  } = req;

  const video = await Video.findById(videoId);
  const comment = await Comment.findById(commentId);
  if (!video) {
    return res.sendStatus(404);
  }
  if (String(comment.owner) !== String(user._id)) {
    return res.sendStatus(404);
  }
  await Comment.findByIdAndUpdate(commentId, { text });
  return res.sendStatus(201);
};

export const deleteComment = async (req, res) => {
  const {
    params: { videoId, commentId },
    session: { user },
  } = req;
  const comment = await Comment.findById(commentId);
  const findVideo = await Video.findById(videoId);
  if (!comment) {
    return res.sendStatus(404);
  }
  if (String(comment.owner) !== String(user._id)) {
    return res.sendStatus(404);
  }
  if (String(findVideo.owner) !== String(user._id)) {
    return res.sendStatus(404);
  }
  // 유저 해당 댓글 삭제
  const findUser = await User.findById(user._id);
  const userCommentIndex = findUser.comments.indexOf(commentId);
  findUser.comments.splice(userCommentIndex, 1);
  await findUser.save();
  // 비디오 해당 댓글 삭제
  const videoCommentIndex = findVideo.comments.indexOf(commentId);
  findVideo.comments.splice(videoCommentIndex, 1);
  await findVideo.save();

  await Comment.findByIdAndDelete(commentId);
  return res.sendStatus(204);
};
