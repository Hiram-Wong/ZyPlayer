import { client } from '../common';
import { channel, history, site, star, iptv, drive, analyze, setting } from '.';

export default {
  async drop(doc) {
    let sql = ``;
    for (let i = 0; i < doc.length; i++) {
      sql += `DROP TABLE IF EXISTS ${doc[i]};`;
    }
    await client.exec(sql);
  },
  async all() {
    const res: { [key: string]: any } = {};
    res.tbl_setting = await setting.all();
    res.tbl_site = await site.all();
    res.tbl_analyze = await analyze.all();
    res.tbl_channel = await channel.all();
    res.tbl_iptv = await iptv.all();
    res.tbl_drive = await drive.all();
    res.tbl_history = await history.all();
    res.tbl_star = await star.all();
    return res;
  },
  async source(doc) {
    const tableSetters = {
      site: site.set,
      iptv: iptv.set,
      channel: channel.set,
      analyze: analyze.set,
      drive: drive.set,
      history: history.set,
      star: star.set,
      setting: setting.set,
    };

    for (const key in doc) {
      const prefix = key.substring(4);
      if (tableSetters[prefix]) {
        await tableSetters[prefix](doc[key]);
      }
    }
  },
};
