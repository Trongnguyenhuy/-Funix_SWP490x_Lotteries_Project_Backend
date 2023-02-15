const CLIENT_HOME_PAGE = "http://localhost:3000/home";
const express = require("express");
const passport = require("passport");
const authController = require("../controllers/auth");
const { check, body } = require("express-validator");
const isAuth = require("../middlewares/is-Auth");
require("../middlewares/googleAuth");
require("../middlewares/facebookAuth");
require("../middlewares/twitterAuth");

const router = express.Router();

router.post(
  "/signup",
  [
    check("email").isEmail().withMessage("LÀM ƠN NHẬP ĐÚNG EMAIL"),
    body(
      "name",
      "LÀM ƠN NHẬP TÊN LÀ KÝ TỰ CHỮ VÀ SỐ, CÓ ÍT NHẤT 5 KÝ TỰ HOẶC HƠN"
    )
      .isLength({ min: 5 })
      .not()
      .isEmpty()
      .trim()
      .escape(),
    body(
      "password",
      "LÀM ƠN NHẬP MẬT KHẨU LÀ KÝ TỰ CHỮ VÀ SỐ, CÓ ÍT NHẤT 9 KÝ TỰ HOẶC HƠN"
    )
      .isAlphanumeric()
      .isLength({ min: 9 }),
  ],
  authController.signup
);

router.get("/signup-success", authController.signupSuccess);

router.post(
  "/login",
  [
    check("email").isEmail().withMessage("LÀM ƠN NHẬP ĐÚNG EMAIL"),
    body(
      "password",
      "LÀM ƠN NHẬP MẬT KHẨU LÀ KÝ TỰ CHỮ VÀ SỐ, CÓ ÍT NHẤT 9 KÝ TỰ HOẶC HƠN"
    ).isLength({ min: 9 }),
  ],
  authController.login
);

router.get("/logout", authController.logout);

router.get("/users", authController.getUsers);

router.get("/user/:id", authController.getUser);

router.post(
  "/addnewuser",
  [
    check("email").isEmail().withMessage("LÀM ƠN NHẬP ĐÚNG EMAIL"),
    body(
      "name",
      "LÀM ƠN NHẬP TÊN LÀ KÝ TỰ CHỮ VÀ SỐ, CÓ ÍT NHẤT 5 KÝ TỰ HOẶC HƠN"
    )
      .isLength({ min: 5 })
      .not()
      .isEmpty()
      .trim()
      .escape(),
    body(
      "password",
      "LÀM ƠN NHẬP MẬT KHẨU LÀ KÝ TỰ CHỮ VÀ SỐ, CÓ ÍT NHẤT 9 KÝ TỰ HOẶC HƠN"
    ).isLength({ min: 9 }),
  ],
  isAuth,
  authController.addNewUser
);

router.delete("/deleteuser/:id", isAuth, authController.deleteUser);

router.post("/deleteusers", isAuth, authController.deleteUsers);

router.put(
  "/updateuser/:id",
  [
    check("email").isEmail().withMessage("LÀM ƠN NHẬP ĐÚNG EMAIL"),
    body(
      "name",
      "LÀM ƠN NHẬP TÊN LÀ KÝ TỰ CHỮ VÀ SỐ, CÓ ÍT NHẤT 5 KÝ TỰ HOẶC HƠN"
    )
      .isLength({ min: 5 })
      .not()
      .isEmpty()
      .trim()
      .escape(),
  ],
  isAuth,
  authController.updateUser
);

router.put(
  "/changeprofile/:id",
  [
    check("email").isEmail().withMessage("LÀM ƠN NHẬP ĐÚNG EMAIL"),
    body(
      "name",
      "LÀM ƠN NHẬP TÊN LÀ KÝ TỰ CHỮ VÀ SỐ, CÓ ÍT NHẤT 5 KÝ TỰ HOẶC HƠN"
    )
      .isLength({ min: 5 })
      .not()
      .isEmpty()
      .trim()
      .escape(),
  ],
  authController.changeProfile
);

router.put(
  "/changepassword/:id",
  [
    body(
      "oldPassword",
      "LÀM ƠN NHẬP MẬT KHẨU LÀ KÝ TỰ CHỮ VÀ SỐ, CÓ ÍT NHẤT 9 KÝ TỰ HOẶC HƠN"
    ).isLength({ min: 9 }),
    body(
      "newPassword",
      "LÀM ƠN NHẬP MẬT KHẨU LÀ KÝ TỰ CHỮ VÀ SỐ, CÓ ÍT NHẤT 9 KÝ TỰ HOẶC HƠN"
    ).isLength({ min: 9 }),
  ],
  authController.changePassword
);

router.put(
  "/forgotpassword",
  [check("email").isEmail().withMessage("LÀM ƠN NHẬP ĐÚNG EMAIL")],
  authController.forgotPassword
);

// Google Login

router.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["email", "profile"] })
);

router.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    successRedirect: CLIENT_HOME_PAGE,
    failureRedirect: "/usermanager/auth/google/failure",
  })
);

router.get("/auth/google/success", isLoggedIn, authController.authSuccess);

router.get("/auth/google/failure", authController.authFailure);

// Login with Facebook.

router.get("/auth/facebook", passport.authenticate("facebook"));

router.get(
  "/auth/facebook/callback",
  passport.authenticate("facebook", {
    successRedirect: CLIENT_HOME_PAGE,
    failureRedirect: "/usermanager/auth/facebook/failure",
  })
);

router.get("/auth/facebook/success", isLoggedIn, authController.authSuccess);

router.get("/auth/facebook/failure", authController.authFailure);

// Login with Twitter.

router.get("/auth/twitter", passport.authenticate("twitter"));

router.get(
  "/auth/twitter/callback",
  passport.authenticate("twitter", {
    successRedirect: CLIENT_HOME_PAGE,
    failureRedirect: "/usermanager/auth/twitter/failure",
  })
);

router.get("/auth/twitter/success", isLoggedIn, authController.authSuccess);

router.get("/auth/twitter/failure", authController.authFailure);

function isLoggedIn(req, res, next) {
   if(req.user === undefined) {
      res.status(401).json({
        statusCode: 401,
        message: "USER CHƯA LOGIN",
      });
    } else {
      next();
    }
}

module.exports = router;
