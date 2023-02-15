const User = require("../models/user");
const Ticket = require("../models/ticket");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const deleteFile = require("../util/deleteFile");
const { validationResult } = require("express-validator/check");
const sendMail = require("../util/sendMail");
const CLIENT_HOME_PAGE = "http://localhost:3000";

exports.signup = async (req, res, next) => {
  // Đăng Ký Người Dùng Mới

  const email = req.body.email;
  const password = req.body.password;
  const name = req.body.name;
  const imgUrl = "https://picsum.photos/200";
  const isAdmin = false;

  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const error = new Error(errors.array()[0].msg);
      error.statusCode = 422;
      throw error;
    }

    const results = await User.find({ email: email });

    if (results.length >= 1) {
      const error = new Error("ĐỊA CHỈ EMAIL ĐÃ ĐƯỢC ĐĂNG KÝ");
      error.statusCode = 409;
      throw error;
    }

    const hashedPw = await bcrypt.hash(password, 12);

    if (req.body.googleId !== undefined) {
      // Đăng Ký Bằng Tài Khoản Mạng Xã Hội Google.
      const user = new User({
        email: email,
        password: hashedPw,
        name: name,
        imgUrl: imgUrl,
        isAdmin: isAdmin,
        googleId: req.body.googleId,
      });

      const result = await user.save();

      const token = jwt.sign(
        {
          email: result.email,
          userId: result._id.toString(),
        },
        "BB6arv15@#$",
        { expiresIn: "1h" }
      );

      const timeSignup = new Date();

      res.status(200).json({
        message: "TẠO NGƯỜI DÙNG THÀNH CÔNG",
        statusCode: 200,
        content: {
          token: token,
          userId: result._id.toString(),
          name: result.name,
          imgUrl: result.imgUrl,
          isAdmin: result.isAdmin,
          timeLogin: timeSignup.toISOString(),
        },
      });
    } else {
      // Đăng Ký Tài Khoản Thông Thường
      const user = {
        email: email,
        password: hashedPw,
        name: name,
        imgUrl: imgUrl,
        isAdmin: isAdmin,
      };

      const token = jwt.sign(
        {
          user: user,
        },
        "BB6arv15@#$",
        { expiresIn: "1h" }
      );

      const mailContent = sendMail.content("Xác Thực Tài Khoản", token);

      const mailOption = sendMail.mainOptions(
        email,
        "Email Xác Thực Tài Khoản",
        mailContent
      );

      sendMail.transporter.sendMail(mailOption, (err, info) => {
        if (err) {
          console.log(err);
          const error = new Error("GỬI EMAIL XÁC THỰC NGƯỜI DÙNG THẤT BẠI");
          error.statusCode = 424;
          throw error;
        } else {
          console.log("Message sent: " + info.response);
          res.status(200).json({
            message: "GỬI EMAIL XÁC THỰC NGƯỜI DÙNG THÀNH CÔNG",
            sendMailStatus: true,
            statusCode: 200,
          });
        }
      });
    }
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.signupSuccess = async (req, res, next) => {
  // Đăng Ký Người Dùng Mới Với Xác thực Email thành công
  const validToken = req.query.token;

  try {
    decodedToken = jwt.verify(validToken, "BB6arv15@#$");

    if (!decodedToken) {
      const error = new Error("Decodetoke KHÔNG THÀNH CÔNG");
      error.StatusCode = 401;
      throw error;
    }

    const user = new User({ ...decodedToken.user });

    const result = await user.save();

    res.redirect(CLIENT_HOME_PAGE);
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.login = async (req, res, next) => {
  // Đăng nhập tài khoản người dùng.
  const email = req.body.email;
  const password = req.body.password;

  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const error = new Error(errors.array()[0].msg);
      error.statusCode = 422;
      throw error;
    }

    const user = await User.find({ email: email });

    if (user.length < 1) {
      const error = new Error("NGƯỜI DÙNG VỚI EMAIL ĐĂNG NHẬP KHÔNG TÌM THẤY.");
      error.statusCode = 401;
      throw error;
    }

    const isEqual = await bcrypt.compare(password, user[0].password);

    if (!isEqual) {
      const error = new Error("SAI MẬT KHẨU.");
      error.statusCode = 401;
      throw error;
    }

    const token = jwt.sign(
      {
        email: user[0].email,
        userId: user[0]._id.toString(),
        isAdmin: user[0].isAdmin,
      },
      "BB6arv15@#$",
      { expiresIn: "1h" }
    );

    const timeLogin = new Date();

    res.status(200).json({
      statusCode: 200,
      content: {
        token: token,
        userId: user[0]._id.toString(),
        name: user[0].name,
        imgUrl: user[0].imgUrl,
        isAdmin: user[0].isAdmin,
        timeLogin: timeLogin.toISOString(),
      },
      message: "ĐĂNG NHẬP THÀNH CÔNG",
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.authSuccess = async (req, res, next) => {
  // Đăng Nhập Bằng Mạng Xã Hội Thành Công
  let user = req.user;

  try {
    if (user.googleSignup === true) {
      res.status(200).json({
        statusCode: 200,
        googleSignup: true,
        content: {
          email: user.email,
          name: user.name,
          googleId: user.googleId,
        },
        message: "LÀM ƠN NHẬP VÀO THÔNG TIN BỊ THIẾU",
      });
    } else {
      const token = jwt.sign(
        {
          email: user.email,
          userId: user._id.toString(),
          isAdmin: user.isAdmin,
        },
        "BB6arv15@#$",
        { expiresIn: "1h" }
      );

      const timeLogin = new Date();

      res.status(200).json({
        statusCode: 200,
        googleSignup: false,
        content: {
          token: token,
          userId: user._id.toString(),
          name: user.name,
          imgUrl: user.imgUrl,
          isAdmin: user.isAdmin,
          timeLogin: timeLogin.toISOString(),
        },
        message: "ĐĂNG NHẬP THÀNH CÔNG",
      });
    }
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.authFailure = async (req, res, next) => {
  // thất bại khi đăng nhạp bằng tài khoản mạng xã hội
  res.status(401).json({
    statusCode: 401,
    message: "ĐĂNG NHẬP BẰNG TÀI KHOẢN MẠNG XÃ HỘI THẤT BẠI",
  });
};

exports.logout = async (req, res, next) => {
  // Đăng xuất người dùng
  try {
    if (req.session && req.session.cookie) {
      res.cookie("connect.sid", null, {
        expires: new Date("Thu, 01 Jan 1970 00:00:00 UTC"),
        httpOnly: true,
      });

      req.session.destroy();
    }

    res.status(200).json({
      statusCode: 200,
      message: "ĐĂNG XUẤT THÀNH CÔNG",
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.getUsers = async (req, res, next) => {
  // Lấy Danh Sách Tất Cả Các User
  try {
    const users = await User.find();

    if (users.length < 1) {
      const error = new Error("KHÔNG TÌM THẤY NGƯỜI DÙNG.");
      error.statusCode = 401;
      throw error;
    }

    const tickets = await Ticket.find();

    res.status(200).json({
      statusCode: 200,
      content: {
        users: users,
        tickets: tickets,
      },
      message: "LẤY DANH SÁCH NGƯỜI DÙNG THÀNH CÔNG",
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.getUser = async (req, res, next) => {
  // Lấy Thông Tin Người Dùng Đơn Lẻ Bằng Id
  const userId = req.params.id;

  try {
    const user = await User.find({ _id: userId });

    if (user.length < 1) {
      const error = new Error("KHÔNG TÌM THẤY NGƯỜI DÙNG");
      error.statusCode = 401;
      throw error;
    }

    const tickets = await Ticket.find({ userId: userId });

    res.status(200).json({
      statusCode: 200,
      content: {
        user: {
          userId: user[0]._id.toString(),
          email: user[0].email,
          phoneNumber: user[0].phoneNumber,
          name: user[0].name,
          imgUrl: user[0].imgUrl,
          isAdmin: user[0].isAdmin,
        },
        tickets: tickets,
      },
      message: "LẤY THÔNG TIN NGƯỜI DÙNG THÀNH CÔNG",
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.addNewUser = async (req, res, next) => {
  // Thêm Mới Người Dùng Từ Trang Quản Trị
  const username = req.body.name;
  const email = req.body.email;
  const password = req.body.password;
  const phoneNumber = req.body.phoneNumber;
  const isAdmin = req.body.isAdmin;
  let imageUrl;

  if (req.file) {
    imageUrl = req.file.path.replace("\\", "/");
  } else {
    imageUrl = "https://picsum.photos/200";
  }

  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const error = new Error(errors.array()[0].msg);
      error.statusCode = 422;
      throw error;
    }

    const result = await User.find({
      $or: [{ name: username }, { email: email }],
    });

    if (result.length > 1) {
      const error = new Error("EMAIL HOẶC USERNAME ĐÃ ĐƯỢC ĐĂNG KÝ");
      error.statusCode = 409;
      throw error;
    }

    const mailContent = sendMail.content("Cập Nhật Mật Khẩu Mới", password);
    const mailOption = sendMail.mainOptions(
      email,
      "Email Cấp phát Mật khẩu",
      mailContent
    );

    sendMail.transporter.sendMail(mailOption, (err, info) => {
      if (err) {
        console.log(err);
      } else {
        console.log("Message sent: " + info.response);
      }
    });

    const hashedPw = await bcrypt.hash(password, 12);

    const user = new User({
      email: email,
      name: username,
      password: hashedPw,
      isAdmin: isAdmin,
      phoneNumber: phoneNumber,
      imgUrl: imageUrl,
    });

    const saveUser = await user.save();

    res.status(200).json({
      statusCode: 200,
      content: saveUser,
      message: "THÊM NGƯỜI DÙNG THÀNH CÔNG",
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.deleteUser = async (req, res, next) => {
  // Xóa Một Người Dùng Thực Hiện Từ Trang Admin
  const userId = req.params.id;
  try {
    const result = await User.find({ _id: userId });

    if (result.length < 1) {
      const error = new Error("NGƯỜI DÙNG KHÔNG TỒN TẠI, XÓA THẤT BẠI");
      error.statusCode = 409;
      throw error;
    }

    if (result[0].isAdmin) {
      const error = new Error("KHÔNG THỂ XÓA NGƯỜI QUẢN TRỊ");
      error.statusCode = 403;
      throw error;
    }

    if (!result[0].imgUrl.includes("https://")) {
      deleteFile.deleteFile(result[0].imgUrl);
    }

    await User.deleteOne({ _id: userId });

    const tickets = await Ticket.find({ userId: userId });

    if (tickets.length > 0) {
      for await (let ticket of tickets) {
        await Ticket.deleteOne({ _id: ticket._id });
      }
    }

    res.status(200).json({
      statusCode: 200,
      message: "XÓA NGƯỜI DÙNG THÀNH CÔNG",
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.deleteUsers = async (req, res, next) => {
  // Xóa Nhiều Người Dùng Được Chọn Từ Trang Quản Trị
  const arrUsersId = req.body.users.split(",");
  try {
    for (const userId of arrUsersId) {
      const user = await User.find({ _id: userId });

      if (user.length < 1) {
        const error = new Error("KHÔNG TÌM THẤY NGƯỜI DÙNG, XÓA THẤT BẠI");
        error.statusCode = 401;
        throw error;
      }

      if (user[0].isAdmin) {
        const error = new Error("KHÔNG THỂ XÓA NGƯỜI QUẢN TRỊ");
        error.statusCode = 403;
        throw error;
      }
    }

    for (const userId of arrUsersId) {
      const user = await User.find({ _id: userId });

      if (
        !user[0].imgUrl.includes("https://") ||
        user[0].imgUrl !== undefined
      ) {
        deleteFile.deleteFile(user[0].imgUrl);
      }

      await User.deleteOne({ _id: userId });

      const tickets = await Ticket.find({ userId: userId });

      if (tickets.length > 0) {
        for await (let ticket of tickets) {
          await Ticket.deleteOne({ _id: ticket._id });
        }
      }
    }

    res.status(200).json({
      statusCode: 200,
      message: "XÓA NGƯỜI DÙNG THÀNH CÔNG",
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.updateUser = async (req, res, next) => {
  // Cập Nhật Thông Tin Người Dùng Từ Trang Quản Trị
  const userId = req.params.id;
  const adminId = req.body.userLoginId;
  const password = req.body.password;
  const updateUser = {
    name: req.body.name,
    email: req.body.email,
    isAdmin: req.body.isAdmin,
    phoneNumber: req.body.phoneNumber,
  };

  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const error = new Error(errors.array()[0].msg);
      error.statusCode = 422;
      throw error;
    }

    const user = await User.find({ _id: userId });

    if (user.length < 1) {
      const error = new Error("KHÔNG TÌM THẤY NGƯỜI DÙNG");
      error.statusCode = 401;
      throw error;
    }

    if (user[0].isAdmin && adminId !== userId) {
      const error = new Error("KHÔNG THỂ THAY ĐỔI THÔNG TIN NGƯỜI QUẢN TRỊ");
      error.statusCode = 403;
      throw error;
    }

    if (req.file) {
      const imageUrl = req.file.path.replace("\\", "/");

      if (
        !user[0].imgUrl.includes("https://") ||
        user[0].imgUrl !== undefined
      ) {
        deleteFile.deleteFile(user[0].imgUrl);
      }

      updateUser.imgUrl = imageUrl;
    } else if (user[0].imgUrl === undefined) {
      updateUser.imgUrl = "https://picsum.photos/200";
    }

    if (password.length > 0) {
      const isEqual = await bcrypt.compare(password, user[0].password);

      if (!isEqual) {
        const hashedPw = await bcrypt.hash(password, 12);

        updateUser.password = hashedPw;

        const mailContent = sendMail.content("Cập Nhật Mật Khẩu Mới", password);
        const mailOption = sendMail.mainOptions(
          user[0].email,
          "Email Cập Nhật Mật khẩu",
          mailContent
        );

        sendMail.transporter.sendMail(mailOption, (err, info) => {
          if (err) {
            console.log(err);
          } else {
            console.log("Message sent: " + info.response);
          }
        });
      }
    }

    const filter = { _id: userId };

    let result = await User.findOneAndUpdate(filter, updateUser, {
      new: true,
    });

    res.status(200).json({
      statusCode: 200,
      message: "CẬP NHẬT THÔNG TIN NGƯỜI DÙNG THÀNH CÔNG",
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.forgotPassword = async (req, res, next) => {
  // Cập nhật mật khẩu mới khi người dùng quên mật khẩu
  console.log(req.body);
  const email = req.body.email;

  try {
    const user = await User.find({ email: email });

    if (user.length < 1) {
      const error = new Error(
        `KHÔNG TÌM THẤY NGƯỜI DÙNG ${email} TRÊN HỆ THỐNG`
      );
      error.statusCode = 401;
      throw error;
    }

    const password = sendMail.generatePassword(9);

    const mailContent = sendMail.content("Cập Nhật Mật Khẩu Mới", password);

    const mailOption = sendMail.mainOptions(
      user[0].email,
      "Email Lấy Lại Mật khẩu Mới",
      mailContent
    );

    sendMail.transporter.sendMail(mailOption, (err, info) => {
      if (err) {
        console.log(err);
      } else {
        console.log("Message sent: " + info.response);
      }
    });

    const hashedPw = await bcrypt.hash(password, 12);

    const filter = { email: email };

    let result = await User.findOneAndUpdate(
      filter,
      { password: hashedPw },
      {
        new: true,
      }
    );

    res.status(200).json({
      statusCode: 200,
      content: result,
      message: "LẤY LẠI MẬT KHẨU THÀNH CÔNG",
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.changeProfile = async (req, res, next) => {
  // Thay đổi thông tin profile của User
  const userId = req.params.id;
  const userLoginId = req.body.userLoginId;

  if (userId !== userLoginId) {
    const error = new Error("DỮ LIỆU THAY ĐỔI BẤT THƯỜNG.");
    error.statusCode = 403;
    throw error;
  }

  const updateUser = {
    name: req.body.name,
    email: req.body.email,
    phoneNumber: req.body.phoneNumber,
  };

  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const error = new Error(errors.array()[0].msg);
      error.statusCode = 422;
      throw error;
    }
    const user = await User.find({ _id: userId });

    if (user.length < 1) {
      const error = new Error("KHÔNG TÌM THẤY NGƯỜI DÙNG.");
      error.statusCode = 401;
      throw error;
    }

    if (req.file) {
      const imageUrl = req.file.path.replace("\\", "/");

      if (
        !user[0].imgUrl.includes("https://") ||
        user[0].imgUrl !== undefined
      ) {
        deleteFile.deleteFile(user[0].imgUrl);
      }

      updateUser.imgUrl = imageUrl;
    } else if (user[0].imgUrl === undefined) {
      updateUser.imgUrl = "https://picsum.photos/200";
    }

    const filter = { _id: userId };

    let result = await User.findOneAndUpdate(filter, updateUser, {
      new: true,
    });

    const token = jwt.sign(
      {
        email: result.email,
        userId: result._id.toString(),
        isAdmin: result.isAdmin,
      },
      "BB6arv15@#$",
      { expiresIn: "1h" }
    );

    const timeLogin = new Date();

    res.status(200).json({
      statusCode: 200,
      content: {
        token: token,
        userId: result._id.toString(),
        name: result.name,
        imgUrl: result.imgUrl,
        isAdmin: result.isAdmin,
        email: result.email,
        phoneNumber: result.phoneNumber,
        timeLogin: timeLogin.toISOString(),
      },
      message: "THAY ĐỔI PROFILE THÀNH CÔNG",
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.changePassword = async (req, res, next) => {
  // Thay đổi profile của User
  const userId = req.params.id;
  const userLoginId = req.body.userLoginId;

  if (userId !== userLoginId) {
    const error = new Error("DỮ LIỆU THAY ĐỔI BẤT THƯỜNG.");
    error.statusCode = 403;
    throw error;
  }

  const oldPassword = req.body.oldPassword;
  const newPassword = req.body.newPassword;

  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const error = new Error(errors.array()[0].msg);
      error.statusCode = 422;
      throw error;
    }

    const user = await User.find({ _id: userId });

    const isEqual = await bcrypt.compare(oldPassword, user[0].password);

    if (!isEqual) {
      const error = new Error("MẬT KHẨU CŨ KHÔNG ĐÚNG.");
      error.statusCode = 401;
      throw error;
    }

    const hashedPw = await bcrypt.hash(newPassword, 12);

    const filter = { _id: userId };

    let result = await User.findOneAndUpdate(
      filter,
      { password: hashedPw },
      {
        new: true,
      }
    );

    const token = jwt.sign(
      {
        email: result.email,
        userId: result._id.toString(),
        isAdmin: result.isAdmin,
      },
      "BB6arv15@#$",
      { expiresIn: "1h" }
    );

    const timeLogin = new Date();

    res.status(200).json({
      statusCode: 200,
      content: {
        token: token,
        userId: result._id.toString(),
        name: result.name,
        imgUrl: result.imgUrl,
        isAdmin: result.isAdmin,
        timeLogin: timeLogin.toISOString(),
      },
      message: "THAY ĐỔI PASSWORD THÀNH CÔNG",
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};
