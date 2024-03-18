import createError from "http-errors";
import dayjs from "dayjs";
import "dayjs/locale/th.js";
import buddhistEra from "dayjs/plugin/buddhistEra.js";
import customParseFormat from "dayjs/plugin/customParseFormat.js";
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';

dayjs.extend(customParseFormat);
dayjs.extend(buddhistEra); // ใช้งาน buddhistEra plugin เพื่อแปลงเป็น พ.ศ.
dayjs.extend(utc)
dayjs.extend(timezone);

const customDate = {
  // dateLongTH: (date) => {
  //   dayjs.locale("th");
  //   return dayjs(date).format("DD MMMM BBBB");
  // },
  // dateShortTH: (date) => {
  //   dayjs.locale("th");
  //   return dayjs(date).format("DD MMM BB");
  // },
  // dateLongEN: (date) => {
  //   dayjs.locale("en");
  //   return dayjs(date).format("DD MMMM YYYY");
  // },
  // dateShortEN: (date) => {
  //   dayjs.locale("en");
  //   return dayjs(date).format("DD MMM YY");
  // },
  dateFormat: (yyyymmdd, formatStr, locale) => {
    try {
      dayjs.locale(locale);
      dayjs.tz.setDefault("Asia/Bangkok");
      const paramDate = yyyymmdd === "now" ? dayjs.tz() : dayjs.tz(yyyymmdd);
      return paramDate.format(formatStr);
    } catch (error) {
      console.error("==== dateFormat ====\n", error);
      // throw createError(500, "format date Error");
      throw createError(500);
    }
  },
  isDateValid: (date, formatStr) => {
    try {
      return dayjs(date, formatStr, true).isValid();
    } catch (error) {
      console.error("==== isDateValid ====\n", error);
      // throw createError(500, "validate date Error");
      throw createError(500);
    }
  },
};

export default customDate;
