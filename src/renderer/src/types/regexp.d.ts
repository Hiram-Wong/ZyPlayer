// regexp.d.ts
interface RegExp {
  callback(str: string, func: CallbackFunction): string;
}

interface Functions {
  replaceFG: (str: string, m: RegExpExecArray, callback: (m: RegExpExecArray) => string) => string;
}

interface CallbackFunction {
  (match: RegExpExecArray, functions: Functions): string;
}
