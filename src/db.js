import mongoose from "mongoose";

mongoose.connect("mongodb://127.0.0.1:27017/wetube", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
});
//mongodb://127.0.0.1:27017/database

const db = mongoose.connection;

const handleOpen = () => console.log("✅ Conneced to DB");
const handleError = (error) => console.log("❌ DB Error:", error);

db.on("error", handleError);
db.once("open", handleOpen);