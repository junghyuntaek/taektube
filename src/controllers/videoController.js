export const trending = (req, res) => res.send("Home Page Videos");
export const search = (req, res) => res.send("Search");

export const upload = (req, res) => res.send("Upload");
export const see = (req, res) => {
  return res.send(`Watch Video #${req.params.id}`);
}
export const edit = (req, res) => {
  return res.send("Edit");
}
export const remove = (req, res) => {
  return res.send("Remove");
}