const Station = require("../models/station");
const webScrapping = require("./webScrapping");
const Lottery = require("../models/lottery.js");

const findLotteryByStation = async (station, date) => {
  let url = station.baseUrlAPI;
  try {
    let lottery = await Lottery.findOne({ stationId: station._id, date: date });
    if (!isObjEmpty(lottery)) {
      return lottery;
    } else {
      let data = await webScrapping.getData(url, date);
      let imgUrl = await webScrapping.getImg(
        modifyStationNameToUrl(station.name),
        date
      );

      const scrappingLottery = new Lottery({
        stationId: station._id,
        date: date,
        imgUrl: imgUrl,
        result: { ...data },
      });

      const result = await scrappingLottery.save();

      return result;
    }
  } catch (error) {
    console.log(error);
  }
};

const findStation = async (station) => {
  let stations = await Station.find();
  stations = stations.filter((item) => {
    let baseUrlAPI = item.baseUrlAPI;
    return baseUrlAPI.includes(station);
  });

  return stations;
};

const changeObjToArr = (obj) => {
  let searchArr = [];

  for (let item in obj) {
    if (item.includes("jackpot") || item.includes("Num")) {
      searchArr = searchArr.concat(obj[item]);
    }
  }

  return searchArr;
};

const checkTicket = async (ticket, station, date) => {
  try {
    let search = {};
    let northZone = station.baseUrlAPI.includes("mien-bac");
    let results = await findLotteryByStation(station, date);

    let searchObj = results.result;
    let searchArr = changeObjToArr(searchObj);
    let findArr = [];

    for (let i = 2; i <= ticket.length; i++) {
      let searchStr = ticket.slice(ticket.length - i, ticket.length);
      let searchIndex = searchArr.indexOf(searchStr);
      if (searchIndex > -1) {
        findArr.push(searchIndex);
      }
    }

    for (let i = 0; i <= findArr.length; i++) {
      if (northZone) {
        if (findArr[i] === 0) {
          search.jackpot =
            "👏Chúc mừng Bạn đã trúng thưởng giải Đặc Biệt 😱🥳😍";
        }

        if (findArr[i] === 1) {
          search.firstNum = "👏Chúc mừng Bạn đã trúng thưởng giải 1 😱🥳😍";
        }

        if (findArr[i] === 2 || findArr[i] === 3) {
          search.secondNum = "👏Chúc mừng Bạn đã trúng thưởng giải 2 😱🥳😍";
        }

        if (findArr[i] < 11 && findArr[i] > 3) {
          search.thirdNum = "👏Chúc mừng Bạn đã trúng thưởng giải 3 😱🥳😍";
        }

        if (findArr[i] > 10 && findArr[i] < 15) {
          search.fourthNum = "👏Chúc mừng Bạn đã trúng thưởng giải 4 😱🥳😍";
        }

        if (findArr[i] > 14 && findArr[i] < 21) {
          search.fifthNum = "👏Chúc mừng Bạn đã trúng thưởng giải 5 😱🥳😍";
        }

        if (findArr[i] > 20 && findArr[i] < 24) {
          search.sixthNum = "👏Chúc mừng Bạn đã trúng thưởng giải 6 😱🥳😍";
        }

        if (findArr[i] > 24) {
          search.seventhNum = "👏Chúc mừng Bạn đã trúng thưởng giải 7 😱🥳😍";
        }
      } else {
        if (findArr[i] === 0) {
          search.jackpot =
            "👏Chúc mừng Bạn đã trúng thưởng giải Đặc Biệt 😱🥳😍";
        }

        if (findArr[i] === 1) {
          search.fifthNum = "👏Chúc mừng Bạn đã trúng thưởng giải 1 😱🥳😍";
        }

        if (findArr[i] === 2) {
          search.secondNum = "👏Chúc mừng Bạn đã trúng thưởng giải 2 😱🥳😍";
        }

        if (findArr[i] === 3 || findArr[i] === 4) {
          search.thirdNum = "👏Chúc mừng Bạn đã trúng thưởng giải 3 😱🥳😍";
        }

        if (findArr[i] > 4 && findArr[i] < 12) {
          search.fourthNum = "👏Chúc mừng Bạn đã trúng thưởng giải 4 😱🥳😍";
        }

        if (findArr[i] === 12) {
          search.fifthNum = "👏Chúc mừng Bạn đã trúng thưởng giải 5 😱🥳😍";
        }

        if (findArr[i] > 12 && findArr[i] < 16) {
          search.sixthNum = "👏Chúc mừng Bạn đã trúng thưởng giải 6 😱🥳😍";
        }

        if (findArr[i] === 16) {
          search.seventhNum = "👏Chúc mừng Bạn đã trúng thưởng giải 7 😱🥳😍";
        }

        if (findArr[i] === 17) {
          search.eighthNum = "👏Chúc mừng Bạn đã trúng thưởng giải 8 😱🥳😍";
        }
      }
    }

    if (isObjEmpty(search)) {
      search.fell = "💪Chúc Bạn may mắn lần sau 🙂🙂🙂";
    }

    return {
      search: search,
      id: results.id,
      station: station.name,
      zoneCode: station.zoneCode,
    };
  } catch (error) {
    console.log(error);
  }
};

const isObjEmpty = (obj) => {
  for (var x in obj) {
    return false;
  }
  return true;
};

const translateZoneCode = (zone, direction) => {
  const zoneCode = ["mb01", "mt01", "mn01"];
  const zoneName = ["miền bắc", "miền trung", "miền nam"];
  let index;

  const zoneCheck = zone.toLowerCase();

  if (direction === "toCode") {
    index = zoneName.indexOf(zoneCheck);
    return zoneCode[index];
  } else {
    index = zoneCode.indexOf(zoneCheck);
    return zoneName[index];
  }
};

// Hàm Thống Kê Dữ Liệu Theo Tháng Với Đầu Vào Là Một Arry các String Ngày Tháng Năm
const createMonthStaticData = (data) => {
  const monthObj = createInitialMonthStaticData();

  data.forEach((item) => {
    let monthItem = item.split("/")[1];
    monthObj[monthItem] = monthObj[monthItem] + 1;
  });

  return monthObj;
};

// Hàm Khởi Tạo Object
// Chứa Key là Tháng Trong Năm
// Value là 0 tương ứng với số lượng ban đầu là 0
const createInitialMonthStaticData = () => {
  const monthObj = {};

  for (let i = 1; i < 13; i++) {
    let month;

    if (i < 10) {
      month = "0" + i.toString();
    } else {
      month = i.toString();
    }

    monthObj[month] = 0;
  }

  return monthObj;
};

const modifyStationNameToUrl = (name) => {
  const stationNameArr = [
    "bình định",
    "gia lai",
    "khánh hòa",
    "kon tum",
    "ninh thuận",
    "phú yên",
    "quảng bình",
    "quảng nam",
    "quảng ngãi",
    "quảng trị",
    "thừa thiên huế",
    "đà nẵng",
    "đắk lắk",
    "đắk nông",
    "an giang",
    "bình dương",
    "bình phước",
    "bình thuận",
    "bạc liêu",
    "bến tre",
    "cà mau",
    "cần thơ",
    "hậu giang",
    "kiên giang",
    "long an",
    "sóc trăng",
    "tiền giang",
    "tp. hồ chí minh",
    "trà vinh",
    "tây ninh",
    "vĩnh long",
    "vũng tàu",
    "đà lạt",
    "đồng nai",
    "đồng tháp",
    "miền bắc",
  ];
  const stationUrlString = [
    "binh-dinh",
    "gia-lai",
    "khanh-hoa",
    "kon-tum",
    "ninh-thuan",
    "phu-yen",
    "quang-binh",
    "quang-nam",
    "quang-ngai",
    "quang-tri",
    "thua-thien-hue",
    "da-nang",
    "dak-lak",
    "dak-nong",
    "an-giang",
    "binh-duong",
    "binh-phuoc",
    "binh-thuan",
    "bac-lieu",
    "ben-tre",
    "ca-mau",
    "can-tho",
    "hau-giang",
    "kien-giang",
    "long-an",
    "soc-trang",
    "tien-giang",
    "tp-hcm",
    "tra-vinh",
    "tay-ninh",
    "vinh-long",
    "vung-tau",
    "da-lat",
    "dong-nai",
    "dong-thap",
    "mien-bac",
  ];
  let station = name.toLowerCase();

  let index = stationNameArr.indexOf(station);

  return stationUrlString[index];
};

module.exports = {
  findLotteryByStation,
  findStation,
  changeObjToArr,
  checkTicket,
  isObjEmpty,
  translateZoneCode,
  createMonthStaticData,
  createInitialMonthStaticData,
};
