require("dotenv").config();

const path = require("path");

const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const session = require("express-session");
const multer = require("multer");
const { v4: uuidv4 } = require("uuid");
const passport = require("passport");
const cors = require("cors");

const authRouter = require("./routes/auth");
const lotteryRouter = require("./routes/lottery");
const stationRouter = require("./routes/station");

const PORT = 8080;
const URI = process.env.URL;

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images");
  },
  filename: (req, file, cb) => {
    cb(null, uuidv4() + "-" + file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/jpeg" ||
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const app = express();

app.use(
  session({
    secret: "ngocmaiosen",
    resave: false,
    saveUninitialized: true,
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use(bodyParser.json());

app.use("/images", express.static(path.join(__dirname, "images")));

app.use(
  multer({ storage: fileStorage, fileFilter: fileFilter }).single("image")
);

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

app.use(
  cors({
    origin: "http://localhost:3000",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true, // allow session cookie from browser to pass through
  })
);

app.use("/usermanager", authRouter);
app.use("/lotterymanager", lotteryRouter);
app.use("/stationmanager", stationRouter);

app.use((error, req, res, next) => {
  const status = error.statusCode || 500;
  const message = error.message;
  const data = error.data;

  res.status(status).json({
    statusCode: status,
    message: message,
    data: data,
  });
});

mongoose
  .connect(URI)
  .then((results) => {
    app.listen(PORT, () => {
      console.log(`listen on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.log(err);
  });
