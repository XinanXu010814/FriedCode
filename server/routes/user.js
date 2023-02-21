const router = require("express").Router();
const {body, validationResult} = require("express-validator");
const pool = require("../db");
const bcrypt = require("bcrypt");
const jwtGenerator = require("../utils/jwtGenerator");
const authorization = require("../middleware/authorization");

const START_RATING = 1500;

// Register route
router.post("/register",
  body("username")
    .trim().escape()
    .notEmpty().withMessage("Username cannot be empty")
    .isLength({max: 16}).withMessage("Username cannot exceed 16 characters"),
  body("email")
    .isEmail().normalizeEmail().withMessage("Email is invalid")
    .isLength({max: 255}).withMessage("Email cannot exceed 255 characters")
    .bail()
    .custom(async email => {
      const users = await pool.query(
        "SELECT * FROM users WHERE email = $1",
        [email]
      );
  
      // If user with that email exists, return error
      if (users.rows.length !== 0) {
        return Promise.reject("An account already exists with that email");
      }
    }),
  body("password")
    .notEmpty().withMessage("Password cannot be empty"),
  //   .isLength({min: 6}).withMessage("Password must be at least 6 characters long"),
  
  async (req, res) => {
    try {

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json(errors);
      }

      const {username, email, password} = req.body;

      // Bcrypt user password
      const saltRounds = 10;
      const salt = await bcrypt.genSalt(saltRounds);

      const bcryptPassword = await bcrypt.hash(password, salt);

      // Add new user to database
      const newUser = await pool.query(
        "INSERT INTO users (username, email, password, rating) VALUES ($1, $2, $3, $4) RETURNING uid",
        [username, email, bcryptPassword, START_RATING]
      );

      // Generate jwt token, respond
      const token = jwtGenerator(newUser.rows[0].uid);
      res.json({token});

    } catch (error) {
      console.error(error.message);
      res.status(500).send("Server Error");
    }
  }
);

// Login route
router.post("/login",
  body("email")
    .isEmail().normalizeEmail().withMessage("Email is invalid")
    .bail()
    .custom(async (email, {req}) => {
      const users = await pool.query(
        "SELECT * FROM users WHERE email = $1",
        [email]
      );

      // If user does not exist, return error
      if (users.rows.length === 0) {
        return Promise.reject("Incorrect email");
      }
      req.user = users.rows[0];
    }
  ),
  body("password")
    .custom(async (password, {req}) => {
      if (!req.user) {
        return;
      }
      // Compare password with hash stored in database
      const validPassword = await bcrypt.compare(password, req.user.password);

      // If password does not match, return error
      if (!validPassword) {
        return Promise.reject("Incorrect email or password");
      }
    }
  ),

  async (req, res) => {
    try {

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json(errors);
      }

      // Generate jwt token, respond
      const token = jwtGenerator(req.user.uid);
      res.json({token});

    } catch (error) {
      console.error(error.message);
      res.status(500).send("Server Error");
    }
  }
);

// Verify authorization route
router.get("/verify", authorization, async (req, res) => {
  try {

    res.json(true);

  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server Error");
  }
});

// Info route
router.get("/info", authorization, async (req, res) => {
  try {

    const user = await pool.query(
      "SELECT uid, username, rating, prefers_dark_theme FROM users WHERE uid = $1",
      [req.uid]
    );

    res.json(user.rows[0]);
    
  } catch (error) {
    console.error(error.message);
    res.status(500).json("Server Error");
  }
});

// Set theme preference route
router.post("/set-theme", authorization, (req, res) => {
  try {

    pool.query(
      "UPDATE users SET prefers_dark_theme = $1 WHERE uid = $2",
      [req.body.prefers_dark_theme, req.uid]
    );

  } catch (error) {
    console.error(error.message);
    res.status(500).json("Server Error");
  }
});

module.exports = router;