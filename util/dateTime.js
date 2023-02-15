const convertToUsDateString = (day) => {
  const dateArr = day.split("/");
  const convertString = dateArr[1] +'-'+ dateArr[0] +'-'+ dateArr[2];

  return convertString;
};

const getWeekDay = (day) => {
  let index;

  if (typeof day === "string") {
    const d = new Date(convertToUsDateString(day));
    index = d.getDay();
  } else {
    index = day.getDay();
  }

  let weekDay = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  return weekDay[index];
};

const getTomorrow = (day) => {
  let tomorrow = new Date(day.getTime());
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow;
};

const getHoursDiff = (start, end) => {
  let valueEnd = end.split(":");
  let endTime = new Date();
  endTime.setHours(valueEnd[0], valueEnd[1], 0, 0);

  let timeDiff = endTime - start;
  timeDiff = timeDiff;

  // console.log({start: start, end: endTime, timeDiff: timeDiff});

  return timeDiff;
};

const modifyDay = (day) => {
  let mDay = [];
  let arrDay = day.split("/");
  for (let i = arrDay.length - 1; i >= 0; i--) {
    mDay.push(arrDay[i]);
  }
  return mDay.join("-");
};

const fillArrayLotteryByDay = (arr, weekDay) => {
  let results = arr.filter((item) => {
    let date = modifyDay(item.date);
    let wDay = new Date(date);
    return weekDay === getWeekDay(wDay);
  });
  return results;
};

const translateDay = (Day, lan) => {
  const engDayArr = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const vnDayArr = [
    "Chủ Nhật",
    "Thứ Hai",
    "Thứ Ba",
    "Thứ Tư",
    "Thứ Năm",
    "Thứ Sáu",
    "Thứ Bảy",
  ];

  let indexDay;

  if (lan === "vn") {
    indexDay = engDayArr.indexOf(Day);
    return vnDayArr[indexDay];
  } else if (lan === "en") {
    indexDay = vnDayArr.indexOf(Day);
    return engDayArr[indexDay];
  }
};

module.exports = {
  getWeekDay,
  modifyDay,
  fillArrayLotteryByDay,
  getTomorrow,
  getHoursDiff,
  translateDay,
};
