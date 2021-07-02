import User from "../models/User";
import Video from "../models/Video";
import fetch from "node-fetch";
import bcrypt from "bcrypt";

export const getJoin = (req, res) => {
  res.render("join", { pageTitle: "Join" });
};
export const postJoin = async (req, res) => {
  const { name, username, email, password, password2, location } = req.body;
  const pageTitle = "Join";
  if (password !== password2) {
    return res.status(400).render("join", {
      pageTitle,
      errorMessage: "Password confirmation does not match.",
    });
  }
  const exists = await User.exists({ $or: [{ username }, { email }] });
  if (exists) {
    return res.status(400).render("join", {
      pageTitle,
      errorMessage: "This username/email is already taken.",
    });
  }
  try {
    await User.create({
      name,
      username,
      email,
      password,
      location,
    });
    return res.redirect("/login");
  } catch (error) {
    return res.status(400).render("join", {
      pageTitle,
      errorMessage: error._message,
    });
  }
};
export const getLogin = (req, res) => {
  return res.render("login", { pageTitle: "Login" });
};
export const postLogin = async (req, res) => {
  const { username, password } = req.body;
  const pageTitle = "Login";
  const user = await User.findOne({ username, socialOnly: false });
  if (!user) {
    return res.status(400).render("login", {
      pageTitle,
      errorMessage: "An account with this username does not exists.",
    });
  }

  const passwordCorrect = await bcrypt.compare(password, user.password);
  if (!passwordCorrect) {
    return res.status(400).render("login", {
      pageTitle,
      errorMessage: "Wrong password",
    });
  }
  req.session.loggedIn = true;
  req.session.user = user;
  return res.redirect("/");
};

export const startGithubLogin = (req, res) => {
  const baseUrl = `https://github.com/login/oauth/authorize`;
  const config = {
    client_id: process.env.GH_CLIENT,
    allow_signup: false,
    scope: "read:user user:email",
  };
  const params = new URLSearchParams(config).toString();
  const finalUrl = `${baseUrl}?${params}`;
  return res.redirect(finalUrl);
};

export const finishGithubLogin = async (req, res) => {
  const baseUrl = "https://github.com/login/oauth/access_token";
  const config = {
    client_id: process.env.GH_CLIENT,
    client_secret: process.env.GH_SECRET,
    code: req.query.code,
  };
  const params = new URLSearchParams(config).toString();
  const finalUrl = `${baseUrl}?${params}`;
  const tokenRequest = await (
    await fetch(finalUrl, {
      method: "POST",
      headers: {
        Accept: "application/json",
      },
    })
  ).json();
  if ("access_token" in tokenRequest) {
    const { access_token } = tokenRequest;
    const apiUrl = "https://api.github.com";
    const userData = await (
      await fetch(`${apiUrl}/user`, {
        headers: {
          Authorization: `token ${access_token}`,
        },
      })
    ).json();
    const emailData = await (
      await fetch(`${apiUrl}/user/emails`, {
        headers: {
          Authorization: `token ${access_token}`,
        },
      })
    ).json();
    const emailObj = emailData.find(
      (email) => email.primary === true && email.verified === true
    );
    if (!emailObj) {
      // set notification
      return res.redirect("/login");
    }
    let user = await User.findOne({ email: emailObj.email });
    if (!user) {
      user = await User.create({
        avatarUrl: userData.avatar_url,
        name: userData.name,
        username: userData.login,
        email: emailObj.email,
        password: "",
        socialOnly: true,
        location: userData.location,
      });
    }
    req.session.loggedIn = true;
    req.session.user = user;
    return res.redirect("/");
  } else {
    return res.redirect("/login");
  }
};

export const startKakaoLogin = (req, res) => {
  const baseUrl = `https://kauth.kakao.com/oauth/authorize`;
  const config = {
    response_type: "code",
    client_id: process.env.KAKAO_CLIENT,
    redirect_uri: "http://localhost:4000/users/kakao/finish",
  };
  const params = new URLSearchParams(config).toString();
  const finalUrl = `${baseUrl}?${params}`;
  return res.redirect(finalUrl);
};
export const finishKakaoLogin = async (req, res) => {
  const baseUrl = "https://kauth.kakao.com/oauth/token";
  const config = {
    grant_type: "authorization_code",
    client_id: process.env.KAKAO_CLIENT,
    redirect_uri: "http://localhost:4000/users/kakao/finish",
    code: req.query.code,
    client_secret: process.env.KAKAO_SECRET,
  };
  const params = new URLSearchParams(config).toString();
  const finalUrl = `${baseUrl}?${params}`;
  const tokenRequest = await (
    await fetch(finalUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    })
  ).json();
  if ("access_token" in tokenRequest) {
    const { access_token } = tokenRequest;
    // scope: account_email profile_image profile_nickname
    const apiUrl = "https://kapi.kakao.com/v2/user/me";
    const data = await (
      await fetch(`${apiUrl}`, {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      })
    ).json();
    const {
      profile: { nickname, profile_image_url },
      email,
    } = data.kakao_account;
    if (!email) {
      // set notification
      return res.redirect("/login");
    }
    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        avatarUrl: profile_image_url,
        name: nickname,
        username: nickname,
        email,
        password: "",
        socialOnly: true,
        location: "",
      });
    }
    req.session.loggedIn = true;
    req.session.user = user;
    return res.redirect("/");
  } else {
    return res.redirect("/login");
  }
};

export const logout = (req, res) => {
  req.session.destroy();
  return res.redirect("/");
};
export const getEdit = (req, res) => {
  return res.render("edit-profile", { pageTitle: "Edit Profile" });
};
export const postEdit = async (req, res) => {
  const {
    session: {
      user: { _id, avatarUrl, email: sessionEmail, username: sessionUsername },
    },
    body: { name, email, username, location },
    file,
  } = req;
  let searchParam = [];
  if (sessionEmail !== email) {
    searchParam.push({ email });
  }
  if (sessionUsername !== username) {
    searchParam.push({ username });
  }
  if (searchParam > 0) {
    const editUser = await User.findone({ $or: searchParam });
    if (editUser && editUser.id.toString() !== _id) {
      return res.status(400).render("edit-profile", {
        pageTitle: "Edit Profile",
        errorMessage: "This username/email is already taken.",
      });
    }
  }

  const updatedUser = await User.findByIdAndUpdate(
    _id,
    {
      avatarUrl: file ? file.path : avatarUrl,
      name,
      email,
      username,
      location,
    },
    { new: true }
  );
  req.session.user = updatedUser;

  return res.redirect("/users/edit");
};

export const getChangePassword = (req, res) => {
  if (req.session.user.socialOnly === true) {
    req.flash("error", "Can't change password.");
    return res.redirect("/");
  }
  return res.render("users/change-password", { pageTitle: "Change Password" });
};
export const postChangePassword = async (req, res) => {
  // send notification
  const {
    session: {
      user: { _id },
    },
    body: { oldPassword, newPassword, newPasswordConfirmation },
  } = req;
  const user = await User.findById(_id);
  const ok = await bcrypt.compare(oldPassword, user.password);
  const pageTitle = "Change Password";
  if (!ok) {
    return res.status(400).render("users/change-password", {
      pageTitle,
      errorMessage: "The current password is incorrect",
    });
  }
  if (newPassword !== newPasswordConfirmation) {
    return res.status(400).render("users/change-password", {
      pageTitle,
      errorMessage: "The password does not match the confirmation",
    });
  }
  user.password = newPassword;
  await user.save();
  req.flash("info", "Password updated");
  return res.redirect("/users/logout");
};

// 유저 탈퇴 만들기
export const remove = (req, res) => res.send("Remove User");

export const see = async (req, res) => {
  const { id } = req.params;
  const user = await User.findById(id).populate({
    path: "videos",
    populate: {
      path: "owner",
      model: "User",
    },
  });
  if (!user) {
    return res.status(404).render("404", { pageTitle: "User not found" });
  }
  const followIndex = req.session.user.follows.indexOf(id);
  return res.render("users/profile", {
    pageTitle: `${user.name} Profile`,
    user,
    followIndex,
  });
};
// 구독 정보 처리
export const following = async (req, res) => {
  const { followId, followingId } = req.params;
  const followUser = await User.findById(followId);
  const followingUser = await User.findById(followingId);
  if (!(followUser && followingUser)) {
    return res.sendStatus(404);
  }
  followUser.follows.push(followingId);
  await followUser.save();
  req.session.user = followUser;
  followingUser.followers = followingUser.followers + 1;
  await followingUser.save();
  return res.sendStatus(200);
};

export const deleteFollowing = async (req, res) => {
  const { followId, followingId } = req.params;
  const followUser = await User.findById(followId);
  const followingUser = await User.findById(followingId);
  if (!(followUser && followingUser)) {
    return res.sendStatus(404);
  }
  const followIndex = followUser.follows.indexOf(followingId);
  followUser.follows.splice(followIndex, 1);
  await followUser.save();
  req.session.user = followUser;
  followingUser.followers = followingUser.followers - 1;
  await followingUser.save();
  return res.sendStatus(200);
};
