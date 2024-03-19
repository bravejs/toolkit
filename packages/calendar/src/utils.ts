import type { DataBase } from './index';

const LAST_DAY_OF_EACH_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

export function isLeapYear (year: number) {
  return 0 === year % 400 || 0 === year % 4 && 0 !== year % 100;
}

export function getLastDayOfMonth (year: number, month: number) {
  return month === 2 && isLeapYear(year) ? 29 : LAST_DAY_OF_EACH_MONTH[month - 1];
}

export function createDate (value: Date | string | number) {
  return new Date(value instanceof Date ? value.getTime() : value);
}

export function parseDate (date: Date) {
  return { year: date.getFullYear(), month: date.getMonth() + 1, date: date.getDate() };
}

export function getStartIndex (date: number, day: number, firstDayOfWeek: number) {
  return date - ((7 - firstDayOfWeek + day) % 7);
}

export function formatDate (value: Partial<DataBase> | Date) {
  const data = value instanceof Date ? parseDate(value) : value;

  return `${data.year}-${data.month}-${data.date}`;
}

export function correctMonth (year: number, month: number) {
  if (month < 1 || month > 12) {
    let value = month;

    value %= 12;

    if (value < 1) {
      value += 12;
    }

    return [year + (month - value) / 12, value];
  }

  return [year, month];
}

export function getDays (firstDayOfWeek: number) {
  const days = [0, 1, 2, 3, 4, 5, 6];

  return days.concat(days.splice(0, firstDayOfWeek));
}