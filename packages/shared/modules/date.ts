import { isNumber, isPositiveFiniteNumber } from '@shared/modules/validate';
import type { ConfigType, Dayjs, ManipulateType, UnitType } from 'dayjs';
import dayjs from 'dayjs';

type TimeUnit = 's' | 'ms';

type DateSetObject = Partial<Record<UnitType, number>>;

interface RelativeTimeInfo {
  minute: number;
  hour: number;
  day: number;
  week: number;
  month: number;
  year: number;
}

/**
 * Intelligently process date input, automatically recognize second and millisecond timestamps
 * @param date Date input
 * @returns dayjs object
 */
const smartDayjs = (date?: ConfigType): Dayjs => {
  try {
    if (isPositiveFiniteNumber(date)) {
      const timestamp = Number(date);
      const timestampStr = String(timestamp);

      if (timestampStr.length < 13) {
        const paddingZeros = '0'.repeat(13 - timestampStr.length);
        return dayjs(Number(timestampStr + paddingZeros));
      } else if (timestampStr.length > 13) {
        return dayjs(Number(timestampStr.substring(0, 13)));
      } else {
        return dayjs(timestamp);
      }
    }

    return dayjs(date);
  } catch {
    return Object.assign(dayjs(), { isValid: () => false });
  }
};

/**
 * Convert to Unix timestamp
 * @param unit Time unit, 's' for seconds, 'ms' for milliseconds
 * @param date Date input, can be string, number, Date object, etc.
 * @returns Unix timestamp
 */
export const toUnix = (unit: TimeUnit = 'ms', date?: ConfigType): number => {
  try {
    const dayjsObj = smartDayjs(date);
    if (!dayjsObj.isValid()) {
      return unit === 's' ? dayjs().unix() : dayjs().valueOf();
    }

    switch (unit) {
      case 's':
        return dayjsObj.unix();
      case 'ms':
      default:
        return dayjsObj.valueOf();
    }
  } catch {
    return unit === 's' ? dayjs().unix() : dayjs().valueOf();
  }
};

/**
 * Format to YYYY-MM-DD HH:mm:ss format
 * @param date Date input
 * @returns Formatted date string
 */
export const toYMDHMS = (date?: ConfigType): string => {
  try {
    const dayjsObj = smartDayjs(date);
    return dayjsObj.isValid() ? dayjsObj.format('YYYY-MM-DD HH:mm:ss') : '';
  } catch {
    return '';
  }
};

/**
 * Format to YYYY-MM-DD format
 * @param date Date input
 * @returns Formatted date string
 */
export const toYMD = (date?: ConfigType): string => {
  try {
    const dayjsObj = smartDayjs(date);
    return dayjsObj.isValid() ? dayjsObj.format('YYYY-MM-DD') : '';
  } catch {
    return '';
  }
};

/**
 * Format to HH:mm:ss format
 * @param date Date input
 * @returns Formatted time string
 */
export const toHMS = (date?: ConfigType): string => {
  try {
    const dayjsObj = smartDayjs(date);
    return dayjsObj.isValid() ? dayjsObj.format('HH:mm:ss') : '';
  } catch {
    return '';
  }
};

/**
 * Get year
 * @param date Date input
 * @returns Year string
 */
export const toY = (date?: ConfigType): string => {
  try {
    const dayjsObj = smartDayjs(date);
    return dayjsObj.isValid() ? dayjsObj.format('YYYY') : '';
  } catch {
    return '';
  }
};

/**
 * Get month
 * @param date Date input
 * @returns Month string (01-12)
 */
export const toM = (date?: ConfigType): string => {
  try {
    const dayjsObj = smartDayjs(date);
    return dayjsObj.isValid() ? dayjsObj.format('MM') : '';
  } catch {
    return '';
  }
};

/**
 * Get day
 * @param date Date input
 * @returns Day string (01-31)
 */
export const toD = (date?: ConfigType): string => {
  try {
    const dayjsObj = smartDayjs(date);
    return dayjsObj.isValid() ? dayjsObj.format('DD') : '';
  } catch {
    return '';
  }
};

/**
 * Get day of week
 * @param date Date input
 * @returns Day of week (1-7, where 1 is Monday and 7 is Sunday)
 */
export const toW = (date?: ConfigType): number => {
  try {
    const dayjsObj = smartDayjs(date);
    if (!dayjsObj.isValid()) {
      return -1;
    }
    // dayjs.day() returns 0-6 (0 is Sunday), convert to 1-7 (1 is Monday, 7 is Sunday)
    const dayOfWeek = dayjsObj.day();
    return dayOfWeek === 0 ? 7 : dayOfWeek;
  } catch {
    return -1;
  }
};

/**
 * Calculate time difference from now
 * @param unit Time unit
 * @param date Date to compare
 * @returns Time difference (positive for past, negative for future)
 */
export const toAgoDay = (unit: ManipulateType = 'day', date?: ConfigType): number => {
  try {
    const then = smartDayjs(date);
    const now = dayjs();

    if (!then.isValid()) {
      return 0;
    }

    return now.diff(then, unit);
  } catch {
    return 0;
  }
};

/**
 * Add time to a specified date
 * @param num Amount to add
 * @param unit Time unit
 * @param date Base date
 * @returns Timestamp after addition (milliseconds)
 */
export const toAdd = (num: number, unit: ManipulateType = 'day', date?: ConfigType): number => {
  try {
    const dayjsObj = smartDayjs(date);
    if (!dayjsObj.isValid()) {
      return dayjs().valueOf();
    }

    return dayjsObj.add(num, unit).valueOf();
  } catch {
    return dayjs().valueOf();
  }
};

/**
 * Subtract time from a specified date
 * @param num Amount to subtract
 * @param unit Time unit
 * @param date Base date
 * @returns Timestamp after subtraction (milliseconds)
 */
export const toSubtract = (num: number, unit: ManipulateType = 'day', date?: ConfigType): number => {
  try {
    const dayjsObj = smartDayjs(date);
    if (!dayjsObj.isValid()) {
      return dayjs().valueOf();
    }

    return dayjsObj.subtract(num, unit).valueOf();
  } catch {
    return dayjs().valueOf();
  }
};

/**
 * Check if a date is within a specified range
 * @param start Start date
 * @param end End date
 * @param date Date to check
 * @returns Whether the date is within the range
 */
export const isBetween = (start: ConfigType, end: ConfigType, date?: ConfigType): boolean => {
  try {
    const startDate = smartDayjs(start);
    const endDate = smartDayjs(end);
    const checkDate = smartDayjs(date);

    if (!startDate.isValid() || !endDate.isValid() || !checkDate.isValid()) {
      return false;
    }

    return checkDate.isAfter(startDate) && checkDate.isBefore(endDate);
  } catch {
    return false;
  }
};

/**
 * Check if a date is before a specified date
 * @param compare Date to compare against
 * @param date Date to check
 * @returns Whether the date is before the comparison date
 */
export const isBefore = (compare: ConfigType, date?: ConfigType): boolean => {
  try {
    const compareDate = smartDayjs(compare);
    const checkDate = smartDayjs(date);

    if (!compareDate.isValid() || !checkDate.isValid()) {
      return false;
    }

    return checkDate.isBefore(compareDate);
  } catch {
    return false;
  }
};

/**
 * Check if a date is after a specified date
 * @param compare Date to compare against
 * @param date Date to check
 * @returns Whether the date is after the comparison date
 */
export const isAfter = (compare: ConfigType, date?: ConfigType): boolean => {
  try {
    const compareDate = smartDayjs(compare);
    const checkDate = smartDayjs(date);

    if (!compareDate.isValid() || !checkDate.isValid()) {
      return false;
    }

    return checkDate.isAfter(compareDate);
  } catch {
    return false;
  }
};

/**
 * Set specific parts of a date
 * @param setObject Object containing date parts to set
 * @param baseDate Base date, defaults to current time
 * @returns Timestamp after setting (milliseconds)
 */
export const set = (setObject: DateSetObject, baseDate?: ConfigType): number => {
  try {
    let date = smartDayjs(baseDate);

    if (!date.isValid()) {
      date = dayjs();
    }

    Object.entries(setObject).forEach(([key, value]) => {
      if (isNumber(value)) {
        date = date.set(key as UnitType, value);
      }
    });

    return date.valueOf();
  } catch {
    return dayjs().valueOf();
  }
};

/**
 * Custom date formatting
 * @param format Format string
 * @param date Date input
 * @returns Formatted string
 */
export const format = (format: string, date?: ConfigType): string => {
  try {
    const dayjsObj = smartDayjs(date);
    return dayjsObj.isValid() ? dayjsObj.format(format) : '';
  } catch {
    return '';
  }
};

/**
 * Get relative time information object
 * @param date Date input
 * @param baseDate Base date, defaults to current time
 * @returns Object containing time differences in various units
 */
export const fromNow = (date?: ConfigType, baseDate?: ConfigType): RelativeTimeInfo => {
  const defaultRes = { minute: 0, hour: 0, day: 0, week: 0, month: 0, year: 0 };
  try {
    const targetDate = smartDayjs(date);

    if (!targetDate.isValid()) {
      return defaultRes;
    }

    const base = baseDate ? smartDayjs(baseDate) : dayjs();
    if (!base.isValid()) {
      return defaultRes;
    }

    // Calculate time differences in various units
    const minute = base.diff(targetDate, 'minute');
    const hour = base.diff(targetDate, 'hour');
    const day = base.diff(targetDate, 'day');
    const week = base.diff(targetDate, 'week');
    const month = base.diff(targetDate, 'month');
    const year = base.diff(targetDate, 'year');

    return { minute, hour, day, week, month, year };
  } catch {
    return defaultRes;
  }
};

/**
 * Get the number of days in a month
 * @param date Date input
 * @returns Number of days in the month
 */
export const daysInMonth = (date?: ConfigType): number => {
  try {
    const dayjsObj = smartDayjs(date);
    return dayjsObj.isValid() ? dayjsObj.daysInMonth() : 0;
  } catch {
    return 0;
  }
};

/**
 * Check if date is valid
 * @param date Date input
 * @returns Whether the date is valid
 */
export const isValid = (date?: ConfigType): boolean => {
  try {
    return smartDayjs(date).isValid();
  } catch {
    return false;
  }
};

/**
 * Check if date is today
 * @param date Date input
 * @returns Whether the date is today
 */
export const isToday = (date?: ConfigType): boolean => {
  try {
    const checkDate = smartDayjs(date);
    return checkDate.isValid() && checkDate.isSame(dayjs(), 'day');
  } catch {
    return false;
  }
};

export default {
  toUnix,
  toYMDHMS,
  toYMD,
  toHMS,
  toY,
  toM,
  toD,
  toW,
  toAgoDay,
  toAdd,
  toSubtract,
  isBetween,
  isBefore,
  isAfter,
  set,
  format,
  fromNow,
  daysInMonth,
  isValid,
  isToday,
};
