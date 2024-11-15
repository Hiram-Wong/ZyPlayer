import { createClient } from 'webdav';

class webdev {
  url: string = '';
  username: string = '';
  password: string = '';
  clientWebdev: ReturnType<typeof createClient> | null = null;

  constructor({ url, username, password }) {
    this.url = url;
    this.username = username;
    this.password = password;
  }

  isWebdevConfigValid(url: string, username: string, password: string) {
    const protocolRegex = /^https?:\/\//i;
    const hasValidProtocol = protocolRegex.test(url);
    return Boolean(hasValidProtocol && password && username);
  }

  async initializeWebdavClient() {
    try {
      if (!this.isWebdevConfigValid(this.url, this.username, this.password)) return false;

      this.clientWebdev = await createClient(this.url, { username: this.username, password: this.password });

      const remoteDirectoryExists = await this.clientWebdev.exists('/zyfun');
      if (!remoteDirectoryExists) {
        await this.clientWebdev.createDirectory('/zyfun');
      }
      return true;
    } catch (err) {
      this.clientWebdev = null;
      console.error(`[webdev][initialize][error]${err}`);
      return false;
    }
  }

  async rsyncRemote(doc) {
    try {
      if (!this.clientWebdev) {
        const status = await this.initializeWebdavClient();
        if (!status) return false;
      }
      const formattedJson = JSON.stringify(doc);
      await this.clientWebdev!.putFileContents('/zyfun/config.json', formattedJson, { overwrite: false });
      return true;
    } catch (err) {
      console.error(`[webdev][sync][error]${err}`);
      return false;
    }
  }

  async rsyncLocal() {
    try {
      if (!this.clientWebdev) {
        const status = await this.initializeWebdavClient();
        if (!status) return false;
      }
      const str = (await this.clientWebdev!.getFileContents('/zyfun/config.json', {
        format: 'text',
      })) as unknown as string;
      const formattedJson = JSON.parse(str);
      return formattedJson;
    } catch (err) {
      console.error(`[webdev][sync][error]${err}`);
      return false;
    }
  }
}

export default webdev;
