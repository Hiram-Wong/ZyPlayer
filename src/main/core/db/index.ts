import Datastore from "lowdb";
import FileSync from "lowdb/adapters/FileSync";
import _ from "lodash";
import { join } from "path";
import LodashId from "lodash-id";
import { app } from "electron";

import { tblSetting } from "./init";
import logger from "../logger";

const STORE_PATH = join(app.getPath("userData"), "database.json");
const adapter = new FileSync(STORE_PATH);   // 初始化lowdb读写的json文件名以及存储路径
const db = Datastore(adapter); // lowdb接管该文件

const init = () => {
  db._.mixin(LodashId); //为每个新增的数据自动加上唯一标识的id字段

  if (!db.read().has("tbl_setting").value()) {
    db.set("tbl_setting", []).write();
    _.forEach(tblSetting, (item) => { 
      db.get("tbl_setting").insert({ key: item.key, value: item.value }).write();
    });
  }
  if (!db.read().has("tbl_site").value()) {
    db.set("tbl_site", []).write();
  }
  if (!db.read().has("tbl_iptv").value()) {
    db.set("tbl_iptv", []).write();
  }
  if (!db.read().has("tbl_channel").value()) {
    db.set("tbl_channel", []).write();
  }
  if (!db.read().has("tbl_star").value()) {
    db.set("tbl_star", []).write();
  }
  if (!db.read().has("tbl_history").value()) {
    db.set("tbl_history", []).write();
  }
  if (!db.read().has("tbl_drive").value()) {
    db.set("tbl_drive", []).write();
  }
  if (!db.read().has("tbl_analyze").value()) {
    db.set("tbl_analyze", []).write();
  }
};

logger.info(`[db] db module initialized; path: ${STORE_PATH}`)

export { db as default, init };