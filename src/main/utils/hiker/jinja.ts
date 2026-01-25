/*!
 * Jinja Templating for JavaScript v0.1.8
 * https://github.com/sstur/jinja-js
 *
 * This is a slimmed-down Jinja2 implementation [http://jinja.pocoo.org/]
 *
 * In the interest of simplicity, it deviates from Jinja2 as follows:
 * - Line statements, cycle, super, macro tags and block nesting are not implemented
 * - auto escapes html by default (the filter is "html" not "e")
 * - Only "html" and "safe" filters are built in
 * - Filters are not valid in expressions; `foo|length > 1` is not valid
 * - Expression Tests (`if num is odd`) not implemented (`is` translates to `==` and `isnot` to `!=`)
 *
 * Notes:
 * - if property is not found, but method '_get' exists, it will be called with the property name (and cached)
 * - `{% for n in obj %}` iterates the object's keys; get the value with `{% for n in obj %}{{ obj[n] }}{% endfor %}`
 * - subscript notation `a[0]` takes literals or simple variables but not `a[item.key]`
 * - `.2` is not a valid number literal; use `0.2`
 *
 */

const STRINGS = /'(\\.|[^'])*'|"(\\.|[^"'])*"/g;
const IDENTS_AND_NUMS = /([$_a-z][$\w]*)|([+-]?\d+(\.\d+)?)/g;
const NUMBER = /^[+-]?\d+(?:\.\d+)?$/;
// non-primitive literals (array and object literals)
const NON_PRIMITIVES = /\[[@#~](,[@#~])*\]|\[\]|\{([@i]:[@#~])(,[@i]:[@#~])*\}|\{\}/g;
// bare identifiers such as variables and in object literals: {foo: 'value'}
const IDENTIFIERS = /[$_a-z][$\w]*/gi;
const VARIABLES = /i(\.i|\[[@#i]\])*/g;
const ACCESSOR = /(\.i|\[[@#i]\])/g;
const OPERATORS = /(===?|!==?|>=?|<=?|&&|\|\||[+\-*/%])/g;
// extended (english) operators
const EOPS = /(^|[^$\w])(and|or|not|is|isnot)([^$\w]|$)/g;
const LEADING_SPACE = /^\s+/;
const TRAILING_SPACE = /\s+$/;

const START_TOKEN = /\{\{\{|\{\{|\{%|\{#/;
const TAGS: Record<string, RegExp> = {
  '{{{': /^('(\\.|[^'])*'|"(\\.|[^"'])*"|.)+?\}\}\}/,
  '{{': /^('(\\.|[^'])*'|"(\\.|[^"'])*"|.)+?\}\}/,
  '{%': /^('(\\.|[^'])*'|"(\\.|[^"'])*"|.)+?%\}/,
  '{#': /^('(\\.|[^'])*'|"(\\.|[^"'])*"|.)+?#\}/,
};

const delimeters: Record<string, string> = {
  '{%': 'directive',
  '{{': 'output',
  '{#': 'comment',
};

const operators: Record<string, string> = {
  and: '&&',
  or: '||',
  not: '!',
  is: '==',
  isnot: '!=',
};

const constants: Record<string, boolean | null> = {
  true: true,
  false: false,
  null: null,
};

class Parser {
  nest: string[] = [];
  compiled: string[] = [];
  childBlocks: number = 0;
  parentBlocks: number = 0;
  isSilent: boolean = false;

  rawMode: boolean = false;
  isParent: boolean = false;
  hasParent: boolean = false;
  isInclude: boolean = false;

  constructor() {}

  readTemplateFile!: (name: string) => string;

  push(line: string): void {
    if (!this.isSilent) {
      this.compiled.push(line);
    }
  }

  parse(src: string): string[] {
    this.tokenize(src);
    return this.compiled;
  }

  tokenize(src: string): void {
    let lastEnd = 0;
    // eslint-disable-next-line ts/no-this-alias
    const parser = this;
    let trimLeading = false;
    // @ts-expect-error not all code paths return values TS7030
    matchAll(src, START_TOKEN, (open: string, index: number, src: string) => {
      // here we match the rest of the src against a regex for this tag
      const match = src.slice(index + open.length).match(TAGS[open]);
      const matched = match ? match[0] : '';
      // here we sub out strings so we don't get false matches
      const simplified = matched.replace(STRINGS, '@');
      // if we don't have a close tag or there is a nested open tag
      if (!match || ~simplified.indexOf(open)) {
        return index + 1;
      }
      let inner = matched.slice(0, 0 - open.length);
      // check for white-space collapse syntax
      const wsCollapseLeft = inner.charAt(0) === '-';
      const wsCollapseRight = inner.slice(-1) === '-';
      inner = inner.replace(/^-|-$/g, '').trim();
      // if we're in raw mode and we are not looking at an "endraw" tag, move along
      if (parser.rawMode && open + inner !== '{%endraw') {
        return index + 1;
      }
      let text = src.slice(lastEnd, index);
      lastEnd = index + open.length + match.length;
      if (trimLeading) text = trimLeft(text);
      if (wsCollapseLeft) text = trimRight(text);
      if (wsCollapseRight) trimLeading = true;
      if (open === '{{{') {
        // liquid-style: make {{{x}}} => {{x|safe}}
        open = '{{';
        inner += '|safe';
      }
      parser.textHandler(text);
      parser.tokenHandler(open, inner);
    });
    let text = src.slice(lastEnd);
    if (trimLeading) text = trimLeft(text);
    this.textHandler(text);
  }

  textHandler(text: string): void {
    this.push(`write(${JSON.stringify(text)});`);
  }

  tokenHandler(open: string, inner: string): void {
    const type = delimeters[open];
    if (type === 'directive') {
      this.compileTag(inner);
    } else if (type === 'output') {
      const extracted: any = this.extractEnt(inner, STRINGS, '@');
      // replace || operators with ~
      extracted.src = extracted.src.replace(/\|\|/g, '~').split('|');
      // put back || operators
      extracted.src = extracted.src.map(function (part: string) {
        return part.split('~').join('||');
      });
      const parts = this.injectEnt(extracted, '@');
      if (parts.length > 1) {
        const filters = parts.slice(1).map(this.parseFilter.bind(this));
        this.push(`filter(${this.parseExpr(parts[0])},${filters.join(',')});`);
      } else {
        this.push(`filter(${this.parseExpr(parts[0])});`);
      }
    }
  }

  compileTag(str: string): void {
    const directive = str.split(' ')[0];
    const handler = tagHandlers[directive];
    if (!handler) throw new Error(`Invalid tag: ${str}`);
    handler.call(this, str.slice(directive.length).trim());
  }

  parseFilter(src: string): string {
    src = src.trim();
    const match = src.match(/[:(]/);
    const i = (match ? match.index : -1)!;
    if (i < 0) return JSON.stringify([src]);
    const name = src.slice(0, i);
    let args = src.charAt(i) === ':' ? src.slice(i + 1) : src.slice(i + 1, -1);
    args = this.parseExpr(args, { terms: true });
    return `[${JSON.stringify(name)},${args}]`;
  }

  extractEnt(
    src: string,
    regex: RegExp,
    placeholder: string | ((s: string) => string | null),
  ): { src: string; subs: string[] } {
    const subs: string[] = [];
    const isFunc = typeof placeholder === 'function';
    src = src.replace(regex, function (str) {
      const replacement = isFunc ? placeholder(str) : placeholder;
      if (replacement) {
        subs.push(str);
        return replacement;
      }
      return str;
    });
    return { src, subs };
  }

  injectEnt(extracted: { src: string; subs: string[] }, placeholder: string): string[] {
    const { src, subs } = extracted;
    const isArr = Array.isArray(src);
    const arr = isArr ? src : [src];
    const re = new RegExp(`[${placeholder}]`, 'g');
    let i = 0;
    arr.forEach(function (src, index) {
      arr[index] = src.replace(re, function () {
        return subs[i++];
      });
    });
    return isArr ? arr : arr[0];
  }

  // replace complex literals without mistaking subscript notation with array literals
  replaceComplex(s: string): string[] {
    const parsed = this.extractEnt(s, /i(\.i|\[[@#i]\])+/g, 'v');
    parsed.src = parsed.src.replace(NON_PRIMITIVES, '~');
    return this.injectEnt(parsed, 'v');
  }

  // parse expression containing literals (including objects/arrays) and variables (including dot and subscript notation)
  // valid expressions: `a + 1 > b.c or c == null`, `a and b[1] != c`, `(a < b) or (c < d and e)`, 'a || [1]`
  parseExpr(src: string, opts?: { terms?: boolean }): string {
    opts = opts || {};
    // extract string literals -> @
    const parsed1: any = this.extractEnt(src, STRINGS, '@');
    // note: this will catch {not: 1} and a.is; could we replace temporarily and then check adjacent chars?
    parsed1.src = parsed1.src.replace(EOPS, function (s, before, op, after) {
      return op in operators ? before + operators[op] + after : s;
    });
    // sub out non-string literals (numbers/true/false/null) -> #
    // the distinction is necessary because @ can be object identifiers, # cannot
    const parsed2: any = this.extractEnt(parsed1.src, IDENTS_AND_NUMS, function (s) {
      return s in constants || NUMBER.test(s) ? '#' : null;
    });
    // sub out object/variable identifiers -> i
    const parsed3: any = this.extractEnt(parsed2.src, IDENTIFIERS, 'i');
    // remove white-space
    parsed3.src = parsed3.src.replace(/\s+/g, '');

    // the rest of this is simply to boil the expression down and check validity
    let simplified = parsed3.src;
    // sub out complex literals (objects/arrays) -> ~
    // the distinction is necessary because @ and # can be subscripts but ~ cannot
    // while (simplified !== (simplified = this.replaceComplex(simplified)));
    while (true) {
      const vaild = simplified !== (simplified = this.replaceComplex(simplified));
      if (!vaild) break;
    }
    // now @ represents strings, # represents other primitives and ~ represents non-primitives
    // replace complex variables (those with dot/subscript accessors) -> v
    // while (simplified !== (simplified = simplified.replace(/i(\.i|\[[@#i]\])+/, 'v')));
    while (true) {
      const vaild = simplified !== (simplified = simplified.replace(/i(\.i|\[[@#i]\])+/, 'v'));
      if (!vaild) break;
    }
    // empty subscript or complex variables in subscript, are not permitted
    simplified = simplified.replace(/[iv]\[v?\]/g, 'x');
    // sub in "i" for @ and # and ~ and v (now "i" represents all literals, variables and identifiers)
    simplified = simplified.replace(/[@#~v]/g, 'i');
    // sub out operators
    simplified = simplified.replace(OPERATORS, '%');
    // allow 'not' unary operator
    simplified = simplified.replace(/!+i/g, 'i');
    const terms = opts.terms ? simplified.split(',') : [simplified];
    terms.forEach(function (term) {
      // simplify logical grouping
      // while (term !== (term = term.replace(/\(i(%i)*\)/g, 'i')));
      while (true) {
        const vaild = term !== (term = term.replace(/\(i(%i)*\)/g, 'i'));
        if (!vaild) break;
      }
      if (!term.match(/^i(%i)*/)) {
        throw new Error(`Invalid expression: ${src}`);
      }
    });

    parsed3.src = parsed3.src.replace(VARIABLES, this.parseVar.bind(this));
    parsed2.src = this.injectEnt(parsed3, 'i');
    parsed1.src = this.injectEnt(parsed2, '#');
    return this.injectEnt(parsed1, '@') as unknown as string;
  }

  parseVar(src: string, ...rest: any[]): string {
    const args = rest.slice();
    const str = args.pop();
    const index = args.pop();

    // quote bare object identifiers (might be a reserved word like {while: 1})
    if (src === 'i' && str.charAt(index + 1) === ':') {
      return '"i"';
    }
    const parts = ['"i"'];
    src.replace(ACCESSOR, (part): any => {
      if (part === '.i') {
        parts.push('"i"');
      } else if (part === '[i]') {
        parts.push('get("i")');
      } else {
        parts.push(part.slice(1, -1));
      }
    });
    return `get(${parts.join(',')})`;
  }

  // escapes a name to be used as a javascript identifier
  escName(str: string): string {
    return str.replace(/\W/g, function (s) {
      return `$${s.charCodeAt(0).toString(16)}`;
    });
  }

  parseQuoted(str: string): string {
    if (str.charAt(0) === "'") {
      str = str.slice(1, -1).replace(/\\.|"/, function (s) {
        if (s === "\\'") return "'";
        return s.charAt(0) === '\\' ? s : `\\${s}`;
      });
      str = `"${str}"`;
    }
    // todo: try/catch or deal with invalid characters (linebreaks, control characters)
    return JSON.parse(str);
  }
}

interface TagHandlerContext extends Parser {}
// the context 'this' inside tagHandlers is the parser instance
const tagHandlers: { [key: string]: (this: TagHandlerContext, expr: string) => void } = {
  if(expr) {
    this.push(`if (${this.parseExpr(expr)}) {`);
    this.nest.unshift('if');
  },
  else() {
    if (this.nest[0] === 'for') {
      this.push('}, function() {');
    } else {
      this.push('} else {');
    }
  },
  elseif(expr) {
    this.push(`} else if (${this.parseExpr(expr)}) {`);
  },
  endif() {
    this.nest.shift();
    this.push('}');
  },
  for(str) {
    const i = str.indexOf(' in ');
    const name = str.slice(0, i).trim();
    const expr = str.slice(i + 4).trim();
    this.push(`each(${this.parseExpr(expr)},${JSON.stringify(name)},function() {`);
    this.nest.unshift('for');
  },
  endfor() {
    this.nest.shift();
    this.push('});');
  },
  raw() {
    this.rawMode = true;
  },
  endraw() {
    this.rawMode = false;
  },
  set(stmt) {
    const i = stmt.indexOf('=');
    const name = stmt.slice(0, i).trim();
    const expr = stmt.slice(i + 1).trim();
    this.push(`set(${JSON.stringify(name)},${this.parseExpr(expr)});`);
  },
  block(name) {
    if (this.isParent) {
      ++this.parentBlocks;
      const blockName = `block_${this.escName(name) || this.parentBlocks}`;
      this.push(`block(typeof ${blockName} == "function" ? ${blockName} : function() {`);
    } else if (this.hasParent) {
      this.isSilent = false;
      ++this.childBlocks;
      const blockName = `block_${this.escName(name) || this.childBlocks}`;
      this.push(`function ${blockName}() {`);
    }
    this.nest.unshift('block');
  },
  endblock() {
    this.nest.shift();
    if (this.isParent) {
      this.push('});');
    } else if (this.hasParent) {
      this.push('}');
      this.isSilent = true;
    }
  },
  extends(name) {
    name = this.parseQuoted(name);
    const parentSrc = this.readTemplateFile(name);
    this.isParent = true;
    this.tokenize(parentSrc);
    this.isParent = false;
    this.hasParent = true;
    // silence output until we enter a child block
    this.isSilent = true;
  },
  include(name) {
    name = this.parseQuoted(name);
    const incSrc = this.readTemplateFile(name);
    this.isInclude = true;
    this.tokenize(incSrc);
    this.isInclude = false;
  },
};

// liquid style
tagHandlers.assign = tagHandlers.set;
// python/django style
tagHandlers.elif = tagHandlers.elseif;

interface RuntimeOptions {
  autoEscape?: 'toJson';
  filters?: { [key: string]: (...args: any[]) => any };
}

interface Runtime {
  get: (...args: any[]) => any;
  set: (n: string, val: any) => void;
  push: (ctx?: object) => void;
  pop: () => void;
  write: (str: string) => void;
  filter: (val: any, ...filters: any[]) => void;
  each: (obj: any, loopvar: string, fn1: (val: any) => void, fn2?: () => void) => void;
  block: (fn: () => void) => void;
  render: () => string;
}

const getRuntime = function runtime(data: object, opts: RuntimeOptions): Runtime {
  const defaults = { autoEscape: 'toJson' };
  const _toString = Object.prototype.toString;
  const _hasOwnProperty = Object.prototype.hasOwnProperty;
  const getKeys =
    Object.keys ||
    function (obj: object) {
      const keys: string[] = [];
      for (const n in obj) {
        if (_hasOwnProperty.call(obj, n)) keys.push(n);
      }
      return keys;
    };
  const isArray =
    Array.isArray ||
    function (obj: any) {
      return _toString.call(obj) === '[object Array]';
    };
  const create =
    Object.create ||
    function (obj: object) {
      function F() {}
      F.prototype = obj;
      return new (F as any)();
    };
  const toString = function (val: any): string {
    if (val == null) return '';
    return typeof val.toString == 'function' ? val.toString() : _toString.call(val);
  };
  const extend = function (dest: any, src: any) {
    const keys = getKeys(src);
    for (let i = 0, len = keys.length; i < len; i++) {
      const key = keys[i];
      dest[key] = src[key];
    }
    return dest;
  };
  // get a value, lexically, starting in current context; a.b -> get("a","b")
  const get = function () {
    let val: any;
    // eslint-disable-next-line prefer-rest-params
    const n = arguments[0];
    let c = stack.length;
    while (c--) {
      val = stack[c][n];
      if (typeof val != 'undefined') break;
    }
    for (let i = 1, len = arguments.length; i < len; i++) {
      if (val == null) continue;
      // eslint-disable-next-line prefer-rest-params
      const n = arguments[i];
      val = _hasOwnProperty.call(val, n) ? val[n] : typeof val._get == 'function' ? (val[n] = val._get(n)) : null;
    }
    return val === null ? null : val;
  };
  const set = function (n: string, val: any) {
    stack[stack.length - 1][n] = val;
  };
  const push = function (ctx?: object) {
    stack.push(ctx || {});
  };
  const pop = function () {
    stack.pop();
  };
  const write = function (str: string) {
    output.push(str);
  };
  const filter = function (val: any) {
    let name: string = '';
    for (let i = 1, len = arguments.length; i < len; i++) {
      // eslint-disable-next-line prefer-rest-params
      const arr = arguments[i];
      name = arr[0];
      const filter = filters[name];
      if (filter) {
        arr[0] = val;
        // now arr looks like [val, arg1, arg2]
        val = filter.apply(data, arr);
      } else {
        throw new Error(`Invalid filter: ${name}`);
      }
    }
    if (opts.autoEscape && name !== opts.autoEscape && name !== 'safe') {
      // auto escape if not explicitly safe or already escaped
      val = filters[opts.autoEscape].call(data, val);
    }
    output.push(val);
  };
  const each = function (obj: any, loopvar: string, fn1: (val: any) => void, fn2?: () => void) {
    if (obj == null) return;
    const arr = isArray(obj) ? obj : getKeys(obj);
    const len = arr.length;
    const ctx = { loop: { length: len, first: arr[0], last: arr[len - 1] } };
    push(ctx);
    for (let i = 0; i < len; i++) {
      extend(ctx.loop, { index: i + 1, index0: i });
      fn1((ctx[loopvar] = arr[i]));
    }
    if (len === 0 && fn2) fn2();
    pop();
  };
  const block = function (fn: () => void) {
    push();
    fn();
    pop();
  };
  const render = function () {
    return output.join('');
  };
  data = data || {};
  opts = extend(defaults, opts || {});
  const filters = extend(
    {
      html(val: any) {
        return toString(val)
          .split('&')
          .join('&amp;')
          .split('<')
          .join('&lt;')
          .split('>')
          .join('&gt;')
          .split('"')
          .join('&quot;');
      },
      safe(val: any) {
        return val;
      },
      toJson(val: any) {
        if (typeof val === 'object') {
          return JSON.stringify(val);
        }
        return toString(val);
      },
    },
    opts.filters || {},
  );
  const stack: any[] = [create(data || {})];
  const output: string[] = [];
  return { get, set, push, pop, write, filter, each, block, render };
};

let runtime: any;

/*!
 * Helpers
 */

function trimLeft(str: string): string {
  return str.replace(LEADING_SPACE, '');
}

function trimRight(str: string): string {
  return str.replace(TRAILING_SPACE, '');
}

function matchAll(str: string, reg: RegExp, fn: (m: string, i: number, s: string) => number | void): void {
  // copy as global
  reg = new RegExp(reg.source, `g${reg.ignoreCase ? 'i' : ''}${reg.multiline ? 'm' : ''}`);
  let match: RegExpExecArray | null;
  while (true) {
    match = reg.exec(str);
    if (match === null) break;
    const result = fn(match[0], match.index, str);
    if (typeof result == 'number') {
      reg.lastIndex = result;
    }
  }
}

const jinja: Record<string, any> = {
  compile(markup: string, opts?: { runtime?: boolean }): { render: (data: any, options: any) => string } {
    opts = opts || {};
    const parser = new Parser() as Parser;
    parser.readTemplateFile = this.readTemplateFile;
    const code: string[] = [];
    code.push('function render($) {');
    code.push(
      'var get = $.get, set = $.set, push = $.push, pop = $.pop, write = $.write, filter = $.filter, each = $.each, block = $.block;',
    );
    // eslint-disable-next-line prefer-spread
    code.push.apply(code, parser.parse(markup));
    code.push('return $.render();');
    code.push('}');
    const codeString = code.join('\n');
    let fn;
    if (opts.runtime === false) {
      // eslint-disable-next-line no-new-func
      fn = new Function('data', 'options', `return (${codeString})(runtime(data, options))`);
    } else {
      runtime = runtime || (runtime = getRuntime.toString());
      // eslint-disable-next-line no-new-func
      fn = new Function('data', 'options', `return (${codeString})((${runtime})(data, options))`);
    }
    return { render: fn as any };
  },

  render(markup: string, data: any, opts: any): string {
    const tmpl = this.compile(markup);
    return tmpl.render(data, opts);
  },

  templateFiles: {},

  readTemplateFile(name: string): string {
    const templateFiles = this.templateFiles || {};
    const templateFile = templateFiles[name];
    if (templateFile == null) {
      throw new Error(`Template file not found: ${name}`);
    }
    return templateFile;
  },
};

export default jinja;
