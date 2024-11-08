require("dotenv").config();

const path = require("path");
const express = require("express");
const session = require("express-session");
const mongoose = require("mongoose");
mongoose.set("strictQuery", true);
const cookieParser = require("cookie-parser");
// const { checkForAuthenticationCookie } = require("./middleware/authMiddleware");
const {
  checkForAuthenticationCookie,
} = require("./middlewares/authentication");

const app = express();

app.use(cookieParser());
app.use(checkForAuthenticationCookie("authToken")); // Replace "authToken" with your actual cookie name

const cors = require("cors");

app.use(
  cors({
    origin: "http://127.0.0.1:5500", // Adjust this to your Svelte frontend port
    credentials: true, // Allow cookies and credentials if needed
  })
);

app.use(
  session({
    secret: "secret", // Change this to a secure random key
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }, // Set secure to true in production with HTTPS
  })
);

app.use((req, res, next) => {
  res.locals.user = req.session.user; // Store the user session in res.locals
  next();
});

app.use(express.urlencoded({ extended: true }));

const Blog = require("./models/blog");

const userRoute = require("./routes/user");
const blogRoute = require("./routes/blog");

// const app = express();
const PORT = process.env.PORT || 8000;

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));

app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(checkForAuthenticationCookie("token"));
app.use(express.static(path.resolve("./public")));

app.get("/", async (req, res) => {
  const allBlogs = await Blog.find({});
  console.log("User in home route:", req.session.user); // Debug log

  res.render("home", {
    user: req.session.user, // Pass user session data to view
    // user: req.user,
    blogs: allBlogs,
  });
});

app.use("/user", userRoute);
app.use("/blog", blogRoute);

app.listen(PORT, () => console.log(`Server Started at PORT:${PORT}`));

module.exports = app;
