import pkg from '@pkg';

export const print = () => {
  console.log(
    `%c${pkg.name} %c${pkg.version} %c${pkg.homepage}`,
    'color:#ffffff; background:#13987f; padding:4px 0 4px 6px;',
    'color:#581845; background:#cef9ec; padding:4px 0 4px 6px;',
    'color:#0969da; background:transparent; padding:4px 0 4px 6px;',
  );
};
