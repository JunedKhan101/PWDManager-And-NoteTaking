const express = require("express");
const { check, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const router = express.Router();
const auth = require("../middleware/auth");
require('dotenv').config();
const User = require("../Models/User");

router.post(
  "/signup",
  [
    check("username", "Please Enter a Valid Username")
      .not()
      .isEmpty(),
    check("email", "Please enter a valid email").isEmail(),
    check("password", "Please enter a valid password").isLength({
      min: 6
    })
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array()
      });
    }

    const { username, email, password } = req.body;
    try {
      let user = await User.findOne({
        email
      });
      if (user) {
        return res.status(400).json({
          msg: "User Already Exists"
        });
      }

      user = new User({
        username,
        email,
        password
      });

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);

      await user.save();

      const payload = {
        user: {
          id: user.id
        }
      };

      let accesstoken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET,
        {
          expiresIn: '5m'
        },
        (err, token) => {
          if (err) {
            console.log(err);
            throw err;
          }
          else {
            res.cookie("jwt", newToken);
            res.redirect('/');
          }
        }
      );
    } catch (err) {
      console.log(err.message);
      res.status(500).send("Error in Saving");
    }
    res.redirect('/login');
  }
);

router.post(
  "/login",
  [
    check("password", "Please enter a valid password").isLength({
      min: 6
    })
  ],
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array()
      });
    }

    const { username, password } = req.body;
    try {
      let user = await User.findOne({ username: username });
      if (!user)
        return res.status(400).json({ message: "User Not Exist" });
    
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch)
        return res.status(400).json({
          message: "Incorrect Password !"
        });
      const payload = {
        user: { id: user.id }
      };

      let accesstoken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET,
        {
          expiresIn: '5m'
        },
        (err, token) => {
          if (err) throw err;
          res.cookie("jwt", token);
        }
      );
      let refreshtoken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, {
        expiresIn: '5m'
      });
      user = await User.updateOne({ username: user.username }, { $set: { refreshtoken: refreshtoken } });
      res.redirect('/');
    } catch (e) {
      console.error(e);
    }
  }
);

router.get("/me", auth, async (req, res) => {
  try {
    // request.user is getting fetched from Middleware after token authentication
    const user = await User.findById(req.user.id);
    res.json(user);
  } catch (e) {
    res.send({ message: "Error in Fetching user" });
  }
});

module.exports = router;

