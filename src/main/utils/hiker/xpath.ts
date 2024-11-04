import xpathModule from 'xpath';
import xmldom from '@xmldom/xmldom';

const xpath = (html: string, rule: string) => {
  const dom = xmldom.DOMParser;
  const doc = new dom().parseFromString(html, 'text/xml');
  const nodes = xpathModule.select(rule, doc);
};
const xpathArray = (html: string, rule: string) => {};
const xpa = xpathArray;

export { xpath, xpathArray, xpa };
