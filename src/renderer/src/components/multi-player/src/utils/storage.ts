class Storage {
  name: string;
  settings: { [key: string]: any };
  constructor(name: string) {
    this.name = name;
    this.settings = {};
  }

  get(key: string) {
    try {
      const storage = JSON.parse(localStorage.getItem(this.name) || '{}');
      return key ? storage[key] : storage;
    } catch (error) {
      console.error(`[Storage][get] Error: ${error}`);
      return key ? this.settings[key] : this.settings;
    }
  }

  set(key: string, value: any) {
    try {
      const storage = Object.assign({}, this.get(''), {
        [key]: value,
      });
      localStorage.setItem(this.name, JSON.stringify(storage));
    } catch (error) {
      console.error(`[Storage][set] Error: ${error}`);
      this.settings[key] = value;
    }
  }

  del(key: string) {
    try {
      const storage = this.get('');
      delete storage[key];
      localStorage.setItem(this.name, JSON.stringify(storage));
    } catch (error) {
      console.error(`[Storage][del] Error: ${error}`);
      delete this.settings[key];
    }
  }

  clear() {
    try {
      localStorage.removeItem(this.name);
    } catch (error) {
      console.error(`[Storage][del] Error: ${error}`);
      this.settings = {};
    }
  }
}

const storage = new Storage('multi-player_setting');

const storageUtil = {
  getKeys() {
    const keys: Array<string> = [];
    const length = localStorage.length;
    for (let i = 0; i < length; i++) {
      const key = localStorage.key(i);
      if (key !== null) {
        keys.push(key);
      }
    }
    return keys;
  },
  delStartWith(match: string) {
    const keys = this.getKeys();
    keys.forEach((key) => {
      if (key && key.startsWith(match)) {
        localStorage.removeItem(key);
      }
    });
  },
};

export { Storage, storage, storageUtil };
export default Storage;
