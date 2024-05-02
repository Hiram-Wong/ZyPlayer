import joinUrl from 'url';

let a = '/api.php/provide/vod/?ac=detail&t={{rule.homeTid}}#next=123&cate=jki';
let b = 'https://suoniapi.com';
let c = joinUrl.resolve(b, a);
console.log(c);

function resolve(from, to) {
  const resolvedUrl = new URL(to, new URL(from, 'resolve://'));
  if (resolvedUrl.protocol === 'resolve:') {
    // `from` is a relative URL.
    const { pathname, search, hash } = resolvedUrl;
    return pathname + search + hash;
  }
  // return resolvedUrl.toString();
  return resolvedUrl.href;
}

let d = resolve(b, a);
console.log('d:', d);
