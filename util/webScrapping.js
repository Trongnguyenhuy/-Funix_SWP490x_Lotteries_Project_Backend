const cheerio = require("cheerio");
const axios = require("axios");

const getData = async (url, day = "") => {
  let getDataUrl;
  let lotteryResult = {};

  if (day === "") {
    getDataUrl = url + ".html";
  } else if (typeof day === "object") {
    getDataUrl = url + "/" + modifyDateTime(day) + ".html";
  } else {
    getDataUrl = `${url}/${day.split("/").join("-")}.html`;
  }

  

  let northZone = getDataUrl.includes("mien-bac");

  try {
    const result = await axios.get(getDataUrl);
    const html = result.data;
    const $ = cheerio.load(html);

    let title = extract("a", ".title", $, 2);
    lotteryResult.title = title[0];
    lotteryResult.openDay = title[1];
    lotteryResult.jackpot = extract("div", ".giaidb", $);
    lotteryResult.firstNum = extract("div", ".giai1", $);

    if (northZone) {
      lotteryResult.signJackpot = extract("div", ".loai_ves", $);
      lotteryResult.secondNum = extract("div", ".giai2", $, 2);
      lotteryResult.thirdNum = extract("div", ".giai3", $, 6);
      lotteryResult.fourthNum = extract("div", ".giai4", $, 4);
      lotteryResult.fifthNum = extract("div", ".giai5", $, 6);
      lotteryResult.sixthNum = extract("div", ".giai6", $, 3);
      lotteryResult.seventhNum = extract("div", ".giai7", $, 4);
    } else {
      lotteryResult.secondNum = extract("div", ".giai2", $);
      lotteryResult.thirdNum = extract("div", ".giai3", $, 2);
      lotteryResult.fourthNum = extract("div", ".giai4", $, 7);
      lotteryResult.fifthNum = extract("div", ".giai5", $);
      lotteryResult.sixthNum = extract("div", ".giai6", $, 3);
      lotteryResult.seventhNum = extract("div", ".giai7", $);
      lotteryResult.eighthNum = extract("div", ".giai8", $);
    }
  } catch (err) {
    console.log(err);
  }

  return lotteryResult;
};

const modifyDateTime = (day) => {
  let mDay = "";
  let rawDay = "";
  rawDay = day.toLocaleString("vn-VN");
  rawDay = rawDay.split(" ")[1];
  mDay = rawDay.split("/").join("-");
  return mDay;
};

function extract(elementStr, classStr, $, len = 1) {
  // const $ = cheerio.load(html);
  let search = $(classStr);
  let results = [];
  $(elementStr, search).each(function () {
    let item = $(this).text().trim();
    results.push(item);
  });

  if (classStr === ".loai_ves") {
    let sign = [];
    sign = results.slice(0, len)[0];
    return sign.split("-");
  }

  return results.slice(0, len);
}

const getImg = async (stationString, day = "") => {
  let getDataUrl;

  if (stationString === "mien-bac") {
    return "https://www.minhngoc.net.vn/upload/images/veso/mb_06-11-2012.jpg";
  }

  if (day === "") {
    getDataUrl = `https://www.minhchinh.com/ve-so-${stationString}.html`;
  } else {
    getDataUrl = `https://www.minhchinh.com/ve-so-${stationString}/${day
      .split("/")
      .join("-")}.html`;
  }

  try {
    const result = await axios.get(getDataUrl);
    const html = result.data;
    const $ = cheerio.load(html);
    let search = $("div[class=vsimage]");

    let img = $("a", search).attr("href");

    return `https://www.minhchinh.com${img}`;

  } catch (err) {
    console.log(err);
  }
};

module.exports = { getData, getImg, modifyDateTime };
