require("dotenv").config();

const path = require("path");
const express = require("express");
const session = require("express-session");
const mongoose = require("mongoose");
mongoose.set("strictQuery", true);
const cookiePaser = require("cookie-parser");

const app = express();
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

const {
  checkForAuthenticationCookie,
} = require("./middlewares/authentication");

// const app = express();
const PORT = process.env.PORT || 8000;

mongoose
  .connect(
    "mongodb+srv://rachit_joshi:rachit_joshi@cluster0.6tisf.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
  )
  .then((e) => console.log("MongoDB Connected"));

app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));

app.use(express.urlencoded({ extended: false }));
app.use(cookiePaser());
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
