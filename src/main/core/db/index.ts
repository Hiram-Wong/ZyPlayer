import { app } from "electron";
import _ from "lodash";
import LodashId from "lodash-id";
import Datastore from "lowdb";
import FileSync from "lowdb/adapters/FileSync";
import { join } from "path";

import { tblSetting } from "./init";
import logger from "../logger";
import magrite from "./magrite";

const STORE_PATH = join(app.getPath("userData"), "database.json");
const adapter = new FileSync(STORE_PATH);   // 初始化lowdb读写的json文件名以及存储路径
const db = Datastore(adapter); // lowdb接管该文件

const init = () => {
  db._.mixin(LodashId); //为每个新增的数据自动加上唯一标识的id字段

  const hasTable = (tableName) => db.read().has(tableName).value();
  if (!hasTable("tbl_setting")) {
    db.set("tbl_setting", []).write();
    _.forEach(tblSetting, (item) => { 
      db.get("tbl_setting").insert({ key: item.key, value: item.value }).write();
    });
  }
  // 用空数组初始化其他集合
  const collections = ["tbl_site", "tbl_iptv", "tbl_channel", "tbl_star", "tbl_history", "tbl_drive", "tbl_analyze"];
  for (const collection of collections) {
    if (!hasTable(collection)) {
      db.set(collection, []).write();
    }
  }
};

const setup = () => {
  init();
  magrite();
}

logger.info(`[db] db module initialized; path: ${STORE_PATH}`)

export { db as default, setup };