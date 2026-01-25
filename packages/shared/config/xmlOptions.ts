// @see https://github.com/NaturalIntelligence/fast-xml-parser/blob/master/docs/v6/3.Options.md
export const defaultOptions = {
  ignoreDeclaration: true,
  ignoreAttributes: false,
  attributeNamePrefix: '',
  textNodeName: '$text',
  parseAttributeValue: true, // "true" → true，"123" → 123
  trimValues: true,
};
