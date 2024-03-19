import { correctMonth, createDate, formatDate, getDays, getLastDayOfMonth, getStartIndex, parseDate } from './utils';

export interface Options {
  weekly?: boolean
  full?: boolean
  firstDayOfWeek?: number
  plugins?: Readonly<Plugin>[]
}

export interface DataBase {
  pos: -1 | 0 | 1
  year: number
  month: number
  date: number
  day: number
  value: string
}

interface Extends {
  [key: string]: any
}

interface Data extends DataBase {
  extends?: Extends
}

export interface Plugin {
  name: string
  handler: (data: Readonly<DataBase>, index: number) => any
}

class Calendar {
  private readonly _options: Readonly<Options>;
  readonly value: string;
  readonly year: number;
  readonly month: number;
  readonly date: number;
  readonly items: ReadonlyArray<Readonly<Data>>;

  constructor (value: Date | string | number, options: Readonly<Options> = {}) {
    const { plugins, weekly, firstDayOfWeek = 0 } = options;
    const instance = createDate(value);
    const { year, month, date } = parseDate(instance);
    const currentValue = formatDate(instance);
    const [prevYear, prevMonth] = correctMonth(year, month - 1);
    const [nextYear, nextMonth] = correctMonth(year, month + 1);

    if (!weekly) {
      instance.setDate(1);
    }

    const lastDayOfThisMonth = getLastDayOfMonth(year, month);
    const startIndex = getStartIndex(weekly ? date : 1, instance.getDay(), firstDayOfWeek);
    const lastDayOfPrevMonth = startIndex < 1 ? getLastDayOfMonth(prevYear, prevMonth) : 0;
    const size = weekly ? 7 : options.full ? 42 : lastDayOfThisMonth - startIndex < 35 ? 35 : 42;
    const endIndex = size + startIndex;
    const items: Data[] = [];

    function getData (index: number): Partial<Data> {
      if (index < 1) {
        return { pos: -1, year: prevYear, month: prevMonth, date: lastDayOfPrevMonth + index };
      }

      if (index > lastDayOfThisMonth) {
        return { pos: 1, year: nextYear, month: nextMonth, date: index - lastDayOfThisMonth };
      }

      return { pos: 0, year: year, month: month, date: index };
    }

    for (let index = startIndex; index < endIndex; index++) {
      const item = getData(index) as Data;
      const realIndex = index - startIndex;

      item.value = formatDate(item);
      item.day = (realIndex + firstDayOfWeek) % 7;

      if (plugins) {
        const ext: Extends = {};

        plugins.forEach((plugin) => {
          ext[plugin.name] = plugin.handler(item, realIndex);
        });

        item.extends = ext;
      }

      items.push(item);
    }

    this._options = options;
    this.value = currentValue;
    this.year = year;
    this.month = month;
    this.date = date;
    this.items = items;
  }

  move (step: number) {
    const { _options } = this;
    let { year, month, date } = this;
    
    if (_options.weekly) {
      date += (step * 7);
    } else {
      const [newYear, newMonth] = correctMonth(year, month + step);
      const lastDay = getLastDayOfMonth(newYear, newMonth);

      if (date > lastDay) {
        date = lastDay;
      }

      year = newYear;
      month = newMonth;
    }

    return new Calendar(new Date(year, month - 1, date), _options);
  }

  prev () {
    return this.move(-1);
  }

  next () {
    return this.move(1);
  }

  static readonly getDays = getDays;
}

export default Calendar;