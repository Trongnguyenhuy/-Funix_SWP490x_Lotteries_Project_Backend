const Lottery = require("../models/lottery");
const Station = require("../models/station");
const Ticket = require("../models/ticket");
const dateTime = require("../util/dateTime");
const dataModify = require("../util/dataModify");
const { validationResult } = require("express-validator/check");
const webScrapping = require("../util/webScrapping");

const deleteFile = require("../util/deleteFile");

exports.getBanner = async (req, res, next) => {
  // Lấy Thông Tin Cho Banner, là những đài có thời gian xổ gần nhất sắp tới

  try {
    let now = new Date();
    let tomorrow = dateTime.getTomorrow(now);
    let results = [];

    let station = await Station.find({
      "open.weekDay": {
        $in: [dateTime.getWeekDay(now), dateTime.getWeekDay(tomorrow)],
      },
    });

    for await (let item of station) {
      let stationArr = item.baseUrlAPI.split("/");
      let stationString = stationArr[stationArr.length - 1];
      let result = {};
      let hoursdiff;
      let isToday;

      isToday = item.open.weekDay.includes(dateTime.getWeekDay(now));

      let imgUrl = await webScrapping.getImg(stationString);

      if (isToday) {
        hoursdiff = dateTime.getHoursDiff(now, item.open.time);
      } else {
        hoursdiff =
          dateTime.getHoursDiff(now, item.open.time) + 24 * 60 * 60 * 1000;
      }

      if (isToday && hoursdiff > 0) {
        result = { ...item._doc, imgUrl, hoursdiff, isToday };
        results.push(result);
      } else if (!isToday && hoursdiff < 86400000) {
        result = { ...item._doc, imgUrl, hoursdiff, isToday };
        results.push(result);
      }
    }

    res.status(200).json({
      content: results,
      statusCode: 200,
      message: "LẤY DỮ LIỆU THÀNH CÔNG",
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.getLottery = async (req, res, next) => {
  // Lấy Thông tin tất cả các Vé Dò

  try {
    let lotteries = await Lottery.find().populate("stationId");

    if (lotteries.length < 1) {
      const error = new Error("KHÔNG TÌM THẤY VÉ DÒ");
      error.statusCode = 401;
      throw error;
    }

    res.status(200).json({
      content: lotteries,
      statusCode: 200,
      message: "LẤY THÔNG TIN VÉ DÒ THÀNH CÔNG",
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.getLotteryByZone = async (req, res, next) => {
  // Lấy Thông tin tất cả các Vé Dò theo Miền
  const zoneCode = req.query.zone;

  try {
    let lotteries = await Lottery.find().populate("stationId");

    if (lotteries.length < 1) {
      const error = new Error("KHÔNG TÌM THẤY VÉ DÒ");
      error.statusCode = 401;
      throw error;
    }

    lotteries = lotteries.filter((item) => {
      return item.stationId.zoneCode === zoneCode;
    });

    res.status(200).json({
      content: lotteries,
      statusCode: 200,
      message: "LẤY THÔNG TIN VÉ DÒ THÀNH CÔNG",
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.getLotteryByStationName = async (req, res, next) => {
  // Lấy Thông tin các Vé Dò theo Đài Và Ngày Cụ Thể
  const stationName = req.query.stationName;
  const zone = dataModify.translateZoneCode(req.query.zone, "toCode");
  const date = req.query.date;

  try {
    let lotteries = await Lottery.find().populate("stationId");

    if (lotteries.length < 1) {
      const error = new Error("KHÔNG TÌM THẤY VÉ DÒ");
      error.statusCode = 401;
      throw error;
    }

    if (zone === "mb01") {
      lotteries = lotteries.filter((item) => {
        return item.stationId.zoneCode === zone.toUpperCase();
      });
    } else {
      lotteries = lotteries.filter((item) => {
        return item.stationId.name.toLowerCase() === stationName.toLowerCase();
      });
    }

    if (date.length > 0) {
      lotteries = lotteries.filter((item) => {
        return item.date === date;
      });
    }

    if (lotteries.length < 1) {
      res.status(401).json({
        statusCode: 401,
        message: "VÉ DÒ MÀ BẠN VỪA TÌM KIẾM KHÔNG CÓ TRÊN CSDL",
      });
    } else {
      res.status(200).json({
        content: lotteries,
        statusCode: 200,
        message: "LẤY THÔNG TIN VÉ DÒ THÀNH CÔNG",
      });
    }
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.getLotteryDetail = async (req, res, next) => {
  // Lấy Thông Tin chi tiết Vé Dò
  const lotteryId = req.params.id;
  const list = req.query.list;

  try {
    const lottery = await Lottery.find({ _id: lotteryId }).populate(
      "stationId"
    );

    if (lottery.length < 1) {
      const error = new Error("VÉ DÒ KHÔNG TÌM THẤY");
      error.statusCode = 401;
      throw error;
    }

    if (list) {
      const lotteryList = await Lottery.find({
        stationId: lottery[0].stationId,
      }).populate("stationId");

      res.status(200).json({
        content: lotteryList,
        status: 200,
        message: "LẤY DANH SÁCH VÉ DÒ THÀNH CÔNG",
      });
    } else {
      res.status(200).json({
        content: lottery,
        status: 200,
        message: "LẤY DANH SÁCH VÉ DÒ THÀNH CÔNG",
      });
    }
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.checkTicket = async (req, res, next) => {
  // Dò vé số theo đài cho người không đăng nhập.
  const ticketNumber = req.body.ticket;
  const date = req.body.date;
  const station = req.body.station;
  const timeCheck = new Date();

  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const error = new Error(errors.array()[0].msg);
      error.statusCode = 422;
      throw error;
    }

    const stations = await Station.find({ name: station });

    if (stations.length < 1) {
      const error = new Error("NHÀ ĐÀI KHÔNG TÌM THẤY");
      error.statusCode = 401;
      throw error;
    }

    let checkDate = stations[0].open.weekDay.includes(
      dateTime.getWeekDay(date)
    );

    if (!checkDate) {
      const error = new Error(
        `NHÀ ĐÀI ${station} KHÔNG MỞ THƯỞNG VÀO NGÀY ${date}, VUI LÒNG NHẬP ĐÚNG NGÀY MỞ THƯỞNG!`
      );
      error.statusCode = 401;
      throw error;
    }

    const searchTicket = await dataModify.checkTicket(
      ticketNumber,
      stations[0],
      date
    );

    const results = {
      ticket: ticketNumber,
      date: date,
      timeCheck: timeCheck.toISOString(),
      station: station,
      zoneCode: searchTicket.zoneCode,
      lotteryId: searchTicket.id,
      result: { ...searchTicket.search },
    };

    res.status(200).json({
      statusCode: 200,
      content: {
        results: results,
      },
      message: "DÒ VÉ THÀNH CÔNG",
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.checkTicketForUser = async (req, res, next) => {
  // Dò vé số theo đài và lưu lịch sử dò của người dùng.
  const ticketNumber = req.body.ticket;
  const date = req.body.date;
  const station = req.body.station;
  const userId = req.body.userId;
  const timeCheck = new Date();

  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const error = new Error(errors.array()[0].msg);
      error.statusCode = 422;
      throw error;
    }

    const stations = await Station.find({ name: station });

    if (stations.length < 1) {
      const error = new Error("NHÀ ĐÀI KHÔNG TÌM THẤY");
      error.statusCode = 401;
      throw error;
    }

    let checkDate = stations[0].open.weekDay.includes(
      dateTime.getWeekDay(date)
    );

    if (!checkDate) {
      const error = new Error(
        `NHÀ ĐÀI ${station} KHÔNG MỞ THƯỞNG VÀO NGÀY ${date}, VUI LÒNG NHẬP ĐÚNG NGÀY MỞ THƯỞNG!`
      );
      error.statusCode = 401;
      throw error;
    }

    const searchTicket = await dataModify.checkTicket(
      ticketNumber,
      stations[0],
      date
    );

    const ticketResult = await Ticket.find({
      ticket: ticketNumber,
      lotteryId: searchTicket.id,
    });

    if (ticketResult.length < 1) {
      const ticket = new Ticket({
        ticket: ticketNumber,
        date: date,
        timeCheck: timeCheck.toISOString(),
        station: station,
        zoneCode: searchTicket.zoneCode,
        userId: req.body.userId,
        lotteryId: searchTicket.id,
      });

      const results = await ticket.save();

      const returnResults = { ...results };

      returnResults._doc.result = { ...searchTicket.search };

      const historyCheckTicket = await Ticket.find({ userId: userId });

      res.status(200).json({
        statusCode: 200,
        content: {
          results: returnResults._doc,
          history: historyCheckTicket,
        },
        message: "DÒ VÉ THÀNH CÔNG",
      });
    } else {
      const results = { ...ticketResult[0]._doc };

      results.result = { ...searchTicket.search };

      const historyCheckTicket = await Ticket.find({ userId: userId });

      res.status(200).json({
        statusCode: 200,
        content: {
          results: results,
          history: historyCheckTicket.sort((a, b) => {
            a.timeCheck - b.timeCheck;
          }),
        },
        message: "DÒ VÉ THÀNH CÔNG",
      });
    }
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.postAddNewLottery = async (req, res, next) => {
  // Thêm mới một vé dò từ trang quản trị
  const stationName = req.body.station.trim();
  const date = req.body.date;
  let imageUrl;

  let result;

  try {
    if (req.file) {
      imageUrl = req.file.path.replace("\\", "/");
    } else {
      imageUrl = req.body.image;
    }

    const station = await Station.find({ name: stationName });

    if (station.length < 1) {
      const error = new Error("KHÔNG TÌM THẤY ĐÀI ĐÃ NHẬP");
      error.statusCode = 401;
      throw error;
    }

    const lottery = await Lottery.find({
      stationId: station[0]._id,
      date: date,
    });

    if (lottery.length > 1) {
      const error = new Error("ĐÃ CÓ VÉ DÒ TRONG CƠ SỞ DỮ LIỆU");
      error.statusCode = 409;
      throw error;
    }

    if (req.body.zoneCode === "MB01") {
      const newLotteryNothzone = new Lottery({
        stationId: station[0]._id,
        date: date,
        imgUrl: imageUrl,
        result: {
          jackpot: req.body.jackpot.split("-"),
          signJackpot: req.body.signJackpot.split("-"),
          firstNum: req.body.firstNum.split("-"),
          secondNum: req.body.secondNum.split("-"),
          thirdNum: req.body.thirdNum.split("-"),
          fourthNum: req.body.fourthNum.split("-"),
          fifthNum: req.body.fifthNum.split("-"),
          sixthNum: req.body.sixthNum.split("-"),
          seventhNum: req.body.seventhNum.split("-"),
        },
      });
      result = await newLotteryNothzone.save();
    } else {
      const newLotterySouthAndCenterZone = new Lottery({
        stationId: station[0]._id,
        date: date,
        imgUrl: imageUrl,
        result: {
          jackpot: req.body.jackpot.split("-"),
          firstNum: req.body.firstNum.split("-"),
          secondNum: req.body.secondNum.split("-"),
          thirdNum: req.body.thirdNum.split("-"),
          fourthNum: req.body.fourthNum.split("-"),
          fifthNum: req.body.fifthNum.split("-"),
          sixthNum: req.body.sixthNum.split("-"),
          seventhNum: req.body.seventhNum.split("-"),
          eighthNum: req.body.eighthNum.split("-"),
        },
      });

      result = await newLotterySouthAndCenterZone.save();
    }

    res.status(200).json({
      statusCode: 200,
      content: result,
      message: "THÊM VÉ DÒ THÀNH CÔNG",
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.postAddNewLotteryAuto = async (req, res, next) => {
  // Thêm mới một vé dò từ trang quản trị một cách tự động
  const stationName = req.body.stationName.trim();
  const date = req.body.date.trim();
  let autoGetLottery;
  try {
    const station = await Station.find({ name: stationName });

    if (station.length < 1) {
      const error = new Error("KHÔNG TÌM THẤY ĐÀI ĐÃ NHẬP");
      error.statusCode = 401;
      throw error;
    }

    let data = await webScrapping.getData(station[0].baseUrlAPI, date);

    let stationNameArr = station[0].baseUrlAPI.split("/");
    let stationNamestr = stationNameArr[stationNameArr.length - 1];

    let imgUrl = await webScrapping.getImg(stationNamestr, date);

    if (Object.values(data) < 1) {
      const error = new Error("KHÔNG LẤY ĐƯỢC DỮ LIỆU VÉ DÒ");
      error.statusCode = 401;
      throw error;
    }

    if (data.openDay !== date) {
      const error = new Error(
        "SAI NGÀY MỞ THƯỞNG, LÀM ƠN NHẬP LẠI NGÀY MỞ THƯỞNG"
      );
      error.statusCode = 401;
      throw error;
    }

    if (imgUrl.length < 1) {
      const error = new Error("KHÔNG LẤY ĐƯỢC DỮ LIỆU HÌNH ẢNH VÉ DÒ");
      error.statusCode = 401;
      throw error;
    }

    if (station[0].zoneCode === "MB01") {
      autoGetLottery = {
        stationId: { ...station[0]._doc },
        date: date,
        imgUrl: imgUrl,
        result: {
          jackpot: data.jackpot,
          signJackpot: data.signJackpots,
          firstNum: data.firstNum,
          secondNum: data.secondNum,
          thirdNum: data.thirdNum,
          fourthNum: data.fourthNum,
          fifthNum: data.fifthNum,
          sixthNum: data.sixthNum,
          seventhNum: data.seventhNum,
        },
      };
    } else {
      autoGetLottery = {
        stationId: { ...station[0]._doc },
        date: date,
        imgUrl: imgUrl,
        result: {
          jackpot: data.jackpot,
          firstNum: data.firstNum,
          secondNum: data.secondNum,
          thirdNum: data.thirdNum,
          fourthNum: data.fourthNum,
          fifthNum: data.fifthNum,
          sixthNum: data.sixthNum,
          seventhNum: data.seventhNum,
          eighthNum: data.eighthNum,
        },
      };
    }

    res.status(200).json({
      statusCode: 200,
      content: autoGetLottery,
      message: "THÊM VÉ DÒ THÀNH CÔNG",
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.putUpdateLottery = async (req, res, next) => {
  // Thay đổi thông tin của một vé dò từ trang quản trị
  const lotteryId = req.params.id;
  const stationName = req.body.station;
  const date = req.body.date;
  let updateLottery;

  try {
    const station = await Station.find({ name: stationName });

    if (station.length < 1) {
      const error = new Error("KHÔNG TÌM THẤY ĐÀI ĐÃ NHẬP");
      error.statusCode = 401;
      throw error;
    }

    if (req.body.zone === "MB01") {
      updateLottery = {
        stationId: station[0]._id,
        date: date,
        result: {
          jackpot: req.body.jackpot.split("-"),
          signJackpot: req.body.signJackpot.split("-"),
          firstNum: req.body.firstNum.split("-"),
          secondNum: req.body.secondNum.split("-"),
          thirdNum: req.body.thirdNum.split("-"),
          fourthNum: req.body.fourthNum.split("-"),
          fifthNum: req.body.fifthNum.split("-"),
          sixthNum: req.body.sixthNum.split("-"),
          seventhNum: req.body.seventhNum.split("-"),
        },
      };
    } else {
      updateLottery = {
        stationId: station[0]._id,
        date: date,
        result: {
          jackpot: req.body.jackpot.split("-"),
          firstNum: req.body.firstNum.split("-"),
          secondNum: req.body.secondNum.split("-"),
          thirdNum: req.body.thirdNum.split("-"),
          fourthNum: req.body.fourthNum.split("-"),
          fifthNum: req.body.fifthNum.split("-"),
          sixthNum: req.body.sixthNum.split("-"),
          seventhNum: req.body.seventhNum.split("-"),
          eighthNum: req.body.eighthNum.split("-"),
        },
      };
    }

    if (req.file) {
      const imageUrl = req.file.path.replace("\\", "/");

      const lottery = await Lottery.find({ _id: lotteryId });

      if (lottery.length < 1) {
        const error = new Error("KHÔNG TÌM THẤY VÉ DÒ");
        error.statusCode = 401;
        throw error;
      }

      if (!lottery[0].imgUrl.includes("https://")) {
        deleteFile.deleteFile(lottery[0].imgUrl);
      }

      updateLottery.imgUrl = imageUrl;
    }

    const filter = { _id: lotteryId };

    let result = await Lottery.findOneAndUpdate(filter, updateLottery, {
      new: true,
    });

    res.status(200).json({
      statusCode: 200,
      content: result,
      message: "CẬP NHẬT VÉ DÒ THÀNH CÔNG",
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.deleteLottery = async (req, res, next) => {
  // Xóa vé dò từ trang quản trị
  const lotteryId = req.params.id;

  try {
    const lottery = await Lottery.find({ _id: lotteryId });

    if (lottery.length < 1) {
      const error = new Error("VÉ DÒ KHÔNG ĐƯỢC TÌM THẤY, XÓA VÉ DÒ THẤT BẠI");
      error.statusCode = 401;
      throw error;
    }

    if (!lottery[0].imgUrl.includes("https://")) {
      deleteFile.deleteFile(lottery[0].imgUrl);
    }

    await Lottery.deleteOne({ _id: lotteryId });

    res.status(200).json({
      statusCode: 200,
      message: "XÓA VÉ DÒ THÀNH CÔNG",
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.deleteLotteries = async (req, res, next) => {
  // Xóa các vé dò đã chọn trong trang quản trị
  const lotteries = req.body.lotteries.split(",");

  try {
    for (const lotteryId of lotteries) {
      const lottery = await Lottery.find({ _id: lotteryId });

      if (lottery.length < 1) {
        const error = new Error("KHÔNG TÌM THẤY VÉ DÒ, XÓA THẤT BẠI");
        error.statusCode = 401;
        throw error;
      }

      if (!lottery[0].imgUrl.includes("https://")) {
        deleteFile.deleteFile(lottery[0].imgUrl);
      }

      await Lottery.deleteOne({ _id: lotteryId });
    }

    res.status(200).json({
      statusCode: 200,
      message: "XÓA VÉ DÒ THÀNH CÔNG",
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.getStaticLottery = async (req, res, next) => {
  // Thống Kê
  const year = req.query.year;

  const results = [];
  let monthObj;
  try {
    const lotteries = await Lottery.find();

    if (lotteries.length < 1) {
      const error = new Error("KHÔNG TÌM THẤY VÉ DÒ, XÓA THẤT BẠI");
      error.statusCode = 401;
      throw error;
    }

    const data = lotteries.filter((item) => {
      let filterYear = item.date.split("/")[2];
      return filterYear === year;
    });

    if (data.length < 1) {
      monthObj = dataModify.createInitialMonthStaticData();
    } else {
      const staticData = data.map((item) => {
        return item.date;
      });

      monthObj = dataModify.createMonthStaticData(staticData);
    }

    for (const [key, value] of Object.entries(monthObj)) {
      results.push({
        month: "Tháng " + key,
        lottery: value,
      });
    }

    res.status(200).json({
      statusCode: 200,
      content: results,
      message: "LẤY DỮ LIỆU THÀNH CÔNG",
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};


exports.deleteTicket = async (req, res, next) => {
  // Xóa Lịch Sử Dò Vé từ trang quản trị
  const ticketId = req.params.id;

  try {
    const ticket = await Ticket.find({ _id: ticketId });

    if (ticket.length < 1) {
      const error = new Error(`KHÔNG TÌM THẤY LỊCH SỬ DÒ CÓ ID: ${ticketId}, XÓA THẤT BẠI`);
      error.statusCode = 401;
      throw error;
    }

    await Ticket.deleteOne({ _id: ticketId });

    res.status(200).json({
      statusCode: 200,
      message: "XÓA LỊCH SỬ DÒ THÀNH CÔNG",
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};
