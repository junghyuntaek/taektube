import mongoose from "mongoose";

mongoose.connect(process.env.DB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex: true,
});
//mongodb://127.0.0.1:27017/database

const db = mongoose.connection;

const handleOpen = () => console.log("✅ Conneced to DB");
const handleError = (error) => console.log("❌ DB Error:", error);

db.on("error", handleError);
db.once("open", handleOpen);