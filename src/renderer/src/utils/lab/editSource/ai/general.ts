import { Buffer } from 'node:buffer'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import chalk from 'chalk'

// Log
export const log = console.log
export const logStart = chalk.blueBright
export const logStatistics = chalk.whiteBright
export const logSuccess = chalk.green
export const logError = chalk.red
export const logWarn = chalk.yellow
export const logNumber = chalk.hex('#a57fff')
export const whiteBold = chalk.white.bold

export const isUndefined = (value: unknown): value is undefined =>
  typeof value === 'undefined'

export const isNumber = (value: unknown): value is number =>
  typeof value === 'number'

export const isString = (value: unknown): value is string =>
  typeof value === 'string'

export const isBoolean = (value: unknown): value is string =>
  typeof value === 'boolean'

export const isObject = (value: unknown): value is Record<any, any> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

export const isArray = Array.isArray

export const isFunction = (value: unknown): value is Function =>
  typeof value === 'function'

export const isPromise = (value: any): value is Promise<any> =>
  isObject(value) && isFunction(value.then) && isFunction(value.catch)

export const isBuffer = Buffer.isBuffer

export const dirname = (dirPath?: string) =>
  path.dirname(
    fileURLToPath(
      isUndefined(dirPath) ? import.meta.url : new URL(dirPath, import.meta.url)
    )
  )
export const filename = (dirPath?: string) =>
  fileURLToPath(
    isUndefined(dirPath) ? import.meta.url : new URL(dirPath, import.meta.url)
  )

export function sleep(timeout: number) {
  return new Promise((resolve) => setTimeout(resolve, timeout))
}

export function random(max: number, min = 0) {
  let result = Math.floor(Math.random() * max)

  while (result < min) {
    result = Math.floor(Math.random() * max)
  }

  return result
}

export function mergeSort<T extends any[]>(arr: T): T {
  if (arr.length <= 1) return arr

  const mid = Math.floor(arr.length / 2)
  const newLeftArr = mergeSort(arr.slice(0, mid))
  const newRightArr = mergeSort(arr.slice(mid))

  const newArr = [] as any as T
  let i = 0
  let j = 0
  while (i < newLeftArr.length && j < newRightArr.length) {
    if (newLeftArr[i] <= newRightArr[j]) {
      newArr.push(newLeftArr[i++])
    } else {
      newArr.push(newRightArr[j++])
    }
  }

  if (i < newLeftArr.length) {
    newArr.push(...newLeftArr.slice(i))
  }

  if (j < newRightArr.length) {
    newArr.push(...newRightArr.splice(j))
  }

  return newArr
}
