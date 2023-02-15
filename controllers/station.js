const Station = require("../models/station");
const deleteFile = require("../util/deleteFile");

exports.getStations = async (req, res, next) => {
  //Lấy Danh Sách các Đài
  const stationName = req.query.stationName;
  let stations;
  try {
    if (stationName) {
      stations = await Station.find({ name: stationName });
    } else {
      stations = await Station.find();
    }

    if (stations.length < 1) {
      const error = new Error("KHÔNG TÌM THẤY ĐÀI TRONG CƠ SỞ DỮ LIỆU");
      error.statusCode = 401;
      throw error;
    }

    res.status(200).json({
      content: stations,
      status: 200,
      message: "LẤY THÔNG TIN CÁC ĐÀI THÀNH CÔNG",
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.getStation = async (req, res, next) => {
  // Lấy thông tin một đài
  const stationId = req.params.id;

  try {
    const station = await Station.find({ _id: stationId });

    if (station.length < 1) {
      const error = new Error("KHÔNG TÌM THẤY ĐÀI TRONG CƠ SỞ DỮ LIỆU");
      error.statusCode = 401;
      throw error;
    }

    res.status(200).json({
      content: station[0],
      status: 200,
      message: "LẤY THÔNG TIN ĐÀI THÀNH CÔNG",
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.addNewStation = async (req, res, next) => {
  // Thêm Mới Một Đài

  const name = req.body.name;
  const fullName = req.body.fullName;
  const weekDay = req.body.weekDay;
  const time = req.body.time;
  const address = req.body.address;
  const phoneNumber = req.body.phoneNumber;
  const website = req.body.website;
  const zoneCode = req.body.zoneCode;

  try {
    if (!req.file) {
      const error = new Error("KHÔNG CÓ HÌNH ẢNH ĐƯỢC TẢI LÊN");
      error.statusCode = 422;
      throw error;
    }

    const imageUrl = req.file.path.replace("\\", "/");

    const station = await Station.find({ name: name });


    if (station.length > 0 && station[0].status) {

      const error = new Error("ĐÀI ĐÃ CÓ TRONG CƠ SỞ DỮ LIỆU");
      error.statusCode = 400;
      throw error;

    } else if (station.length > 0 && !station[0].status) {

      deleteFile.deleteFile(imageUrl);
      station[0].status = true;
      const result = await station[0].save();

      res.status(200).json({
        content: result,
        statusCode: 200,
        message: "THÊM MỚI THÀNH CÔNG",
      });
    } else {
      const addStation = new Station({
        name: name,
        fullName: fullName,
        open: {
          weekDay: weekDay.split(" - "),
          time: time,
        },
        descriptions: {
          address: address,
          phoneNum: phoneNumber,
          webSite: website,
        },
        imgUrl: imageUrl,
        zoneCode: zoneCode,
        status: true,
      });

      const result = await addStation.save();

      res.status(200).json({
        content: result,
        statusCode: 200,
        message: "THÊM MỚI THÀNH CÔNG",
      });
    }
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.deleteStation = async (req, res, next) => {
  // Xóa Đài từ trang quản trị
  const stationId = req.params.id;

  try {
    const station = await Station.find({ _id: stationId });

    if (station.length < 1) {
      const error = new Error("KHÔNG TÌM THẤY ĐÀI, XÓA THẤT BẠI");
      error.statusCode = 401;
      throw error;
    }

    station[0].status = false;

    await station[0].save();

    res.status(200).json({
      statusCode: 200,
      message: "XÓA THÀNH CÔNG",
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.deleteStations = async (req, res, next) => {
  // Xóa các đài đã chọn từ trang quản trị
  const stations = req.body.stations.split(",");

  try {
    for (const stationId of stations) {
      const station = await Station.find({ _id: stationId });

      if (station.length < 1) {
        const error = new Error("KHÔNG TÌM THẤY ĐÀI, XÓA THẤT BẠI");
        error.statusCode = 401;
        throw error;
      }

      station[0].status = false;

      await station[0].save();
    }

    res.status(200).json({
      statusCode: 200,
      message: "XÓA THÀNH CÔNG",
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.putUpdateStation = async (req, res, next) => {
  // Cập Nhật Thông Tin Của Đài
  const stationId = req.params.id;
  const updateStation = {
    name: req.body.name,
    fullName: req.body.fullName,
    open: {
      weekDay: req.body.weekDay.split(" - "),
      time: req.body.time,
    },
    descriptions: {
      address: req.body.address,
      phoneNum: req.body.phoneNumber,
      webSite: req.body.website,
    },
  };

  try {
    const station = await Station.find({ _id: stationId });

    if (station.length < 1) {
      const error = new Error("KHÔNG TÌM THẤY ĐÀI");
      error.statusCode = 401;
      throw error;
    }

    if (req.file) {
      const imageUrl = req.file.path.replace("\\", "/");

      if (station[0].imgUrl !== undefined) {
        deleteFile.deleteFile(station[0].imgUrl);
      }

      updateStation.imgUrl = imageUrl;
    }

    const filter = { _id: stationId };

    let result = await Station.findOneAndUpdate(filter, updateStation, {
      new: true,
    });

    res.status(200).json({
      statusCode: 200,
      content: result,
      message: "CẬP NHẬT THÀNH CÔNG",
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};
