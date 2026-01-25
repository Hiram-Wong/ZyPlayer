import { describe, expect, it } from 'vitest';

import {
  camelCase,
  constantCase,
  delimiterLowerCase,
  delimiterUpperCase,
  kebabCase,
  pascalCase,
  snakeCase,
  titleCase,
} from '../camelcase';

describe('camelcase', () => {
  it('validateAndCleanInput should trim and handle empty strings', () => {
    expect(camelCase('  hello-world  ')).toBe('helloWorld');
    expect(camelCase('')).toBe('');
    expect(camelCase('   ')).toBe('');
  });

  it('camelCase should convert strings correctly', () => {
    expect(camelCase('hello-world')).toBe('helloWorld');
    expect(camelCase('hello_world', '_')).toBe('helloWorld');
    expect(camelCase('hello.world', '.')).toBe('helloWorld');
    expect(camelCase('hello-world', '-', '-')).toBe('hello-World');
  });

  it('pascalCase should convert strings correctly', () => {
    expect(pascalCase('hello-world')).toBe('HelloWorld');
    expect(pascalCase('hello_world', '_')).toBe('HelloWorld');
    expect(pascalCase('hello.world', '.')).toBe('HelloWorld');
    expect(pascalCase('hello-world', '-', '-')).toBe('Hello-World');
  });

  it('snakeCase should convert strings correctly', () => {
    expect(snakeCase('hello-world')).toBe('hello_world');
    expect(snakeCase('hello.world', '.')).toBe('hello_world');
  });

  it('kebabCase should convert strings correctly', () => {
    expect(kebabCase('hello_world', '_')).toBe('hello-world');
    expect(kebabCase('hello.world', '.')).toBe('hello-world');
  });

  it('constantCase should convert strings correctly', () => {
    expect(constantCase('hello-world')).toBe('HELLO_WORLD');
    expect(constantCase('hello.world', '.')).toBe('HELLO_WORLD');
  });

  it('titleCase should convert strings correctly', () => {
    expect(titleCase('hello-world')).toBe('Hello World');
    expect(titleCase('hello_world', '_')).toBe('Hello World');
  });

  it('delimiterLowerCase should convert strings correctly', () => {
    expect(delimiterLowerCase('hello-world')).toBe('hello-world');
    expect(delimiterLowerCase('hello_world', '_', ' ')).toBe('hello world');
    expect(delimiterLowerCase('hello.world', '.', '_')).toBe('hello_world');
  });

  it('delimiterUpperCase should convert strings correctly', () => {
    expect(delimiterUpperCase('hello-world')).toBe('HELLO-WORLD');
    expect(delimiterUpperCase('hello_world', '_', ' ')).toBe('HELLO WORLD');
    expect(delimiterUpperCase('hello.world', '.', '_')).toBe('HELLO_WORLD');
  });

  it('should handle empty or invalid input', () => {
    expect(camelCase('')).toBe('');
    expect(pascalCase('')).toBe('');
    expect(snakeCase('')).toBe('');
    expect(kebabCase('')).toBe('');
    expect(constantCase('')).toBe('');
    expect(titleCase('')).toBe('');
  });
});
