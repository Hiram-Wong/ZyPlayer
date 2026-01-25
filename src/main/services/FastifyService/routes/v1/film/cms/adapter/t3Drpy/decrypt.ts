import { aes, base64, gzip, rsa } from '@shared/modules/crypto';

const removeHeader = (content: string, options: { mode?: string; fileType: string }): string => {
  const { mode = 'header-only', fileType } = options;

  // 文件类型配置
  const COMMENT_CONFIG = {
    '.js': {
      start: '/*',
      end: '*/',
      regex: /^\s*\/\*([\s\S]*?)\*\/\s*/,
      headerRegex: /@header\(([\s\S]*?)\)/,
      // topCommentsRegex: /^(\s*(\/\/[^\n]*\n|\/\*[\s\S]*?\*\/)\s*)+/,
      topCommentsRegex: /^(?:\s|\/\/[^\n]*\n|\/\*[\s\S]*?\*\/)+/,
    },
    '.py': {
      start: '"""',
      end: '"""',
      regex: /^\s*"""([\s\S]*?)"""\s*/,
      headerRegex: /@header\(([\s\S]*?)\)/,
      // topCommentsRegex: /^(\s*(#[^\n]*\n|'''[\s\S]*?'''|"""[\s\S]*?""")\s*)+/,
      topCommentsRegex: /^(?:\s|#[^\n]*\n|'''[\s\S]*?'''|"""[\s\S]*?""")+/,
    },
  };

  // Check required options
  if (!fileType) throw new Error('fileType option is required');

  // Get the file extension
  const ext = fileType.startsWith('.') ? fileType : `.${fileType}`;
  const config = COMMENT_CONFIG[ext];

  // Check supported file type
  if (!config) throw new Error(`Unsupported file type: ${ext}`);

  // Mode1: Remove all consecutive comment blocks at the top
  if (mode === 'top-comments') {
    const match = content.match(config.topCommentsRegex);
    if (match) {
      return content.substring(match[0].length).trim();
    }
    return content.trim();
  }

  // Mode2: Remove only the @header line (default mode)
  const match = content.match(config.regex);
  if (!match) return content.trim();

  let [fullComment, innerContent] = match;

  // Detect and Remove @header
  if (config.headerRegex.test(innerContent)) {
    innerContent = innerContent.replace(config.headerRegex, '');

    // Clean up empty lines and reorganize comments
    const cleanedInner = innerContent
      .split('\n')
      .filter((line) => line.trim().length > 0)
      .join('\n');

    if (!cleanedInner.trim()) {
      // Remove the comment block completely if the comment content is empty
      return content.replace(fullComment, '').trim();
    } else {
      // Preserve non-header comments
      const newComment = `${config.start}${cleanedInner}${config.end}`;
      return content.replace(fullComment, newComment).trim();
    }
  }

  return content.trim();
};

const convertOriginalCode = (code: string): string => {
  // const current_match = /var rule|[\u4E00-\u9FA5]+|function|let |var |const |[()"']/;
  const currentMatch = /var rule|function|let |var |const|class Rule|async|this\./;
  if (currentMatch.test(code)) {
    return code;
  }
  const rawCode = removeHeader(code, { mode: 'top-comments', fileType: '.js' });

  const decodeFns = {
    gzip: (value: string) => {
      try {
        return gzip.decode({ src: value });
      } catch {
        console.log('Not gzip encryption');
        return '';
      }
    },
    base64: (value: string) => {
      try {
        return base64.decode({ src: value });
      } catch {
        console.log('Not base64 encryption');
        return '';
      }
    },
    aes: (value: string) => {
      try {
        const key = '686A64686E780A0A0A0A0A0A0A0A0A0A';
        const iv = '647A797964730A0A0A0A0A0A0A0A0A0A';
        return aes.decode({ src: value, key, iv, keyEncode: 'hex', ivEncode: 'hex' });
      } catch {
        console.log('Not aes encryption');
        return '';
      }
    },
    rsa: (value: string) => {
      try {
        const key = `-----BEGIN RSA PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCqin/jUpqM6+fgYP/oMqj9zcdHMM0mEZXLeTyixIJWP53lzJV2N2E3OP6BBpUmq2O1a9aLnTIbADBaTulTNiOnVGoNG58umBnupnbmmF8iARbDp2mTzdMMeEgLdrfXS6Y3VvazKYALP8EhEQykQVarexR78vRq7ltY3quXx7cgI0ROfZz5Sw3UOLQJ+VoWmwIxu9AMEZLVzFDQN93hzuzs3tNyHK6xspBGB7zGbwCg+TKi0JeqPDrXxYUpAz1cQ/MO+Da0WgvkXnvrry8NQROHejdLVOAslgr6vYthH9bKbsGyNY3H+P12kcxo9RAcVveONnZbcMyxjtF5dWblaernAgMBAAECggEAGdEHlSEPFmAr5PKqKrtoi6tYDHXdyHKHC5tZy4YV+Pp+a6gxxAiUJejx1hRqBcWSPYeKne35BM9dgn5JofgjI5SKzVsuGL6bxl3ayAOu+xXRHWM9f0t8NHoM5fdd0zC3g88dX3fb01geY2QSVtcxSJpEOpNH3twgZe6naT2pgiq1S4okpkpldJPo5GYWGKMCHSLnKGyhwS76gF8bTPLoay9Jxk70uv6BDUMlA4ICENjmsYtd3oirWwLwYMEJbSFMlyJvB7hjOjR/4RpT4FPnlSsIpuRtkCYXD4jdhxGlvpXREw97UF2wwnEUnfgiZJ2FT/MWmvGGoaV/CfboLsLZuQKBgQDTNZdJrs8dbijynHZuuRwvXvwC03GDpEJO6c1tbZ1s9wjRyOZjBbQFRjDgFeWs9/T1aNBLUrgsQL9c9nzgUziXjr1Nmu52I0Mwxi13Km/q3mT+aQfdgNdu6ojsI5apQQHnN/9yMhF6sNHg63YOpH+b+1bGRCtr1XubuLlumKKscwKBgQDOtQ2lQjMtwsqJmyiyRLiUOChtvQ5XI7B2mhKCGi8kZ+WEAbNQcmThPesVzW+puER6D4Ar4hgsh9gCeuTaOzbRfZ+RLn3Aksu2WJEzfs6UrGvm6DU1INn0z/tPYRAwPX7sxoZZGxqML/z+/yQdf2DREoPdClcDa2Lmf1KpHdB+vQKBgBXFCVHz7a8n4pqXG/HvrIMJdEpKRwH9lUQS/zSPPtGzaLpOzchZFyQQBwuh1imM6Te+VPHeldMh3VeUpGxux39/m+160adlnRBS7O7CdgSsZZZ/dusS06HAFNraFDZf1/VgJTk9BeYygX+AZYu+0tReBKSs9BjKSVJUqPBIVUQXAoGBAJcZ7J6oVMcXxHxwqoAeEhtvLcaCU9BJK36XQ/5M67ceJ72mjJC6/plUbNukMAMNyyi62gO6I9exearecRpB/OGIhjNXm99Ar59dAM9228X8gGfryLFMkWcO/fNZzb6lxXmJ6b2LPY3KqpMwqRLTAU/zy+ax30eFoWdDHYa4X6e1AoGAfa8asVGOJ8GL9dlWufEeFkDEDKO9ww5GdnpN+wqLwePWqeJhWCHad7bge6SnlylJp5aZXl1+YaBTtOskC4Whq9TP2J+dNIgxsaF5EFZQJr8Xv+lY9lu0CruYOh9nTNF9x3nubxJgaSid/7yRPfAGnsJRiknB5bsrCvgsFQFjJVs=
-----END RSA PRIVATE KEY-----`;
        return rsa.decode({ src: value, key, long: true });
      } catch {
        console.log('Not rsa encryption');
        return '';
      }
    },
  };

  let decodeContent: string = '';
  for (const func in decodeFns) {
    decodeContent = decodeFns[func](rawCode);
    if (currentMatch.test(decodeContent)) break;
  }

  return decodeContent || rawCode;
};

export { convertOriginalCode };
