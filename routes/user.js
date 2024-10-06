const { Router } = require("express");

const User = require("../models/user");

const router = Router();

router.get("/signin", (req, res) => {
  return res.render("signin");
});

router.get("/signup", (req, res) => {
  return res.render("signup");
});

router.post("/signin", async (req, res) => {
  const { email, password } = req.body;
  try {
    const token = await User.matchPasswordAndGenerateToken(email, password);

    const user = await User.findOne({ email });
    req.session.user = { fullName: user.fullName, email }; // Store user's fullName in session

    console.log("User session data:", req.session.user); // Debug log

    return res.cookie("token", token).redirect("/");
  } catch (error) {
    return res.render("signin", {
      error: "Incorrect Email or Password",
    });
  }
});

router.get("/logout", (req, res) => {
  req.session.user = null; // Clear user session data
  res.clearCookie("token").redirect("/");
});

// router.post("/signup", async (req, res) => {
//   const { fullName, email, ...otherData } = req.body;

//   if (!email || email.trim() === "") {
//     return res.status(400).send("Email is required");
//   }

//   try {
//     const newUser = new User({ fullName, email, ...otherData });
//     await newUser.save();

//     req.session.user = { fullName, email }; // Store both email and fullName

//     res.status(201).send("User created successfully");
//   } catch (error) {
//     console.error(error);
//     res.status(500).send("Error creating user");
//   }
// });

// router.post("/signup", async (req, res) => {
//   const { fullName, email, password } = req.body; // Correct field names

//   // Validate input
//   if (!fullName || !email || !password) {
//     return res.render("signup", { error: "All fields are required." });
//   }

//   try {
//     const newUser = new User({ fullName, email, password });
//     await newUser.save();

//     // Store user info in session
//     req.session.user = { fullName, email };

//     // Redirect to the home page or a success page
//     return res.redirect("/");
//   } catch (error) {
//     console.error("Error creating user:", error);

//     // Handle duplicate email error
//     if (error.code === 11000) {
//       return res.render("signup", {
//         error: "Email already exists. Please choose another one.",
//       });
//     }

//     // General error handling
//     return res.render("signup", { error: "Error creating user." });
//   }
// });

router.post("/signup", async (req, res) => {
  const { fullName, email, password } = req.body; // Correct field names

  // Validate input
  if (!fullName || !email || !password) {
    return res.render("signup", { error: "All fields are required." });
  }
  const em = email;

  try {
    // Check if the email already exists in the database

    // Proceed to create a new user
    const newUser = new User({ fullName, email, password });
    await newUser.save();

    // Store user info in session
    req.session.user = { fullName, email };

    // Redirect to the home page or a success page
    return res.redirect("/");
  } catch (error) {
    console.error("Error creating user:", error);

    // Handle general error
    return res.render("signup", { error: "Error creating user." });
  }
});

module.exports = router;
