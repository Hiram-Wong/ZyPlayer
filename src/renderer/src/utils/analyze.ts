import axios from "axios";
import * as cheerio from "cheerio";

const getUrlTitle = async(url:string): Promise<string> => {
  try {
    const res = await axios.get(url, { responseType: "arraybuffer" });
    const html = Buffer.from(res.data).toString('utf-8');
    const $ = cheerio.load(html);
    const title = $("title").text();
    return title;
  } catch (err) {
    throw err;
  }
}

export { getUrlTitle }