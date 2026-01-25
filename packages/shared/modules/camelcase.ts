import { isStrEmpty } from '@shared/modules/validate';

/**
 * Input validation and cleaning
 * @param str Input string
 * @returns Cleaned string, or empty string if invalid
 */
const validateAndCleanInput = (str: string): string => {
  if (isStrEmpty(str)) {
    return '';
  }
  return str.trim() || '';
};

/**
 * Split string into an array of words
 * @param str Input string
 * @param delimiter Separator, defaults to '-'
 * @returns Array of words
 */
const splitToWords = (str: string, delimiter: string = '-'): string[] => {
  return str.split(delimiter).filter((word) => word.length > 0);
};

/**
 * Convert string to camelCase format
 * @param str Input string
 * @param delimiter Separator, defaults to '-'
 * @param newDelimiter Output separator, defaults to ''
 * @returns camelCase formatted string
 *
 * @example
 * camelCase('hello-world') // 'helloWorld'
 * camelCase('hello_world', '_') // 'helloWorld'
 * camelCase('hello.world', '.') // 'helloWorld'
 * camelCase('hello-world', '-', '-') // 'hello-World'
 */
export const camelCase = (str: string, delimiter: string = '-', newDelimiter: string = ''): string => {
  return transformCase(str, delimiter, newDelimiter, (word, index) => {
    const lowerWord = word.toLowerCase();
    return index === 0 ? lowerWord : lowerWord.charAt(0).toUpperCase() + lowerWord.slice(1);
  });
};

/**
 * Convert string to PascalCase format
 * @param str Input string
 * @param delimiter Separator, defaults to '-'
 * @param newDelimiter Output separator, defaults to ''
 * @returns PascalCase formatted string
 *
 * @example
 * pascalCase('hello-world') // 'HelloWorld'
 * pascalCase('hello_world', '_') // 'HelloWorld'
 * pascalCase('hello.world', '.') // 'HelloWorld'
 * camelCase('hello-world', '-', '-') // 'Hello-World'
 */
export const pascalCase = (str: string, delimiter: string = '-', newDelimiter: string = ''): string => {
  return transformCase(str, delimiter, newDelimiter, (word) => {
    const lowerWord = word.toLowerCase();
    return lowerWord.charAt(0).toUpperCase() + lowerWord.slice(1);
  });
};

/**
 * Convert string to snake_case format
 * @param str Input string
 * @param delimiter Separator, defaults to '-'
 * @returns snake_case formatted string
 *
 * @example
 * snakeCase('hello-world') // 'hello_world'
 * snakeCase('hello.world', '.') // 'hello_world'
 */
export const snakeCase = (str: string, delimiter: string = '-'): string => {
  return transformCase(str, delimiter, '_', (word) => word.toLowerCase());
};

/**
 * Convert string to kebab-case format
 * @param str Input string
 * @param delimiter Separator, defaults to '-'
 * @returns kebab-case formatted string
 *
 * @example
 * kebabCase('hello_world', '_') // 'hello-world'
 * kebabCase('hello.world', '.') // 'hello-world'
 */
export const kebabCase = (str: string, delimiter: string = '-'): string => {
  return transformCase(str, delimiter, '-', (word) => word.toLowerCase());
};

/**
 * Convert string to CONSTANT_CASE format
 * @param str Input string
 * @param delimiter Separator, defaults to '-'
 * @returns CONSTANT_CASE formatted string
 *
 * @example
 * constantCase('hello-world') // 'HELLO_WORLD'
 * constantCase('hello.world', '.') // 'HELLO_WORLD'
 */
export const constantCase = (str: string, delimiter: string = '-'): string => {
  return transformCase(str, delimiter, '_', (word) => word.toUpperCase());
};

/**
 * Convert string to Title Case format
 * @param str Input string
 * @param delimiter Separator, defaults to '-'
 * @returns Title Case formatted string
 *
 * @example
 * titleCase('hello-world') // 'Hello World'
 * titleCase('hello_world', '_') // 'Hello World'
 */
export const titleCase = (str: string, delimiter: string = '-'): string => {
  return transformCase(str, delimiter, ' ', (word) => {
    const lowerWord = word.toLowerCase();
    return lowerWord.charAt(0).toUpperCase() + lowerWord.slice(1);
  });
};

/**
 * Convert string to lowercase with custom delimiter
 * @param str Input string
 * @param delimiter Input separator, defaults to '-'
 * @param newDelimiter Output separator, defaults to '-'
 * @returns Converted string
 *
 * @example
 * delimiterLowerCase('hello-world') // 'hello-world'
 * delimiterLowerCase('hello_world', '_', ' ') // 'hello world'
 * delimiterLowerCase('hello.world', '.', '_') // 'hello_world'
 */
export const delimiterLowerCase = (str: string, delimiter: string = '-', newDelimiter: string = '-'): string => {
  return transformCase(str, delimiter, newDelimiter, (word) => word.toLowerCase());
};

/**
 * Convert string to uppercase with custom delimiter
 * @param str Input string
 * @param delimiter Input separator, defaults to '-'
 * @param newDelimiter Output separator, defaults to '-'
 * @returns Converted string
 *
 * @example
 * delimiterUpperCase('hello-world') // 'HELLO-WORLD'
 * delimiterUpperCase('hello_world', '_', ' ') // 'HELLO WORLD'
 * delimiterUpperCase('hello.world', '.', '_') // 'HELLO_WORLD'
 */
export const delimiterUpperCase = (str: string, delimiter: string = '-', newDelimiter: string = '-'): string => {
  return transformCase(str, delimiter, newDelimiter, (word) => word.toUpperCase());
};

/**
 * Generic string format conversion function
 * @param str Input string
 * @param delimiter Input separator, defaults to '-'
 * @param joiner Joining character, defaults to ''
 * @param transform Word transformation function
 * @returns Converted string
 */
const transformCase = (
  str: string,
  delimiter: string = '-',
  joiner: string = '',
  transform: (word: string, index: number) => string,
): string => {
  const cleanStr = validateAndCleanInput(str);
  if (cleanStr.length === 0) return '';

  const words = splitToWords(cleanStr, delimiter);
  if (words.length === 0) return '';

  return words.map(transform).join(joiner);
};

export default {
  camelCase,
  pascalCase,
  snakeCase,
  kebabCase,
  constantCase,
  titleCase,
  delimiterLowerCase,
  delimiterUpperCase,
  transformCase,
};
