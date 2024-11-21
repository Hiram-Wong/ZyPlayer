const publicBarrageSend = (url: string, options: any) => {
  const okd = new FormData();
  okd.append('player', options.id);
  okd.append('text', options.text);
  okd.append('time', options.time);
  okd.append('color', options.color);
  okd.append('type', options.type);
  const xhr = new XMLHttpRequest();
  xhr.open('POST', url, true);
  xhr.send(okd);
};

class publicStorage {
  name: string;
  settings: {};
  constructor(name) {
    this.name = name;
    this.settings = {};
  }

  get(key) {
    try {
      const storage = JSON.parse(localStorage.getItem(this.name) || '{}');
      return key ? storage[key] : storage;
    } catch (error) {
      return key ? this.settings[key] : this.settings;
    }
  }

  set(key, value) {
    try {
      const storage = Object.assign({}, this.get(''), {
        [key]: value,
      });
      localStorage.setItem(this.name, JSON.stringify(storage));
    } catch (error) {
      this.settings[key] = value;
    }
  }

  del(key) {
    try {
      const storage = this.get('');
      delete storage[key];
      localStorage.setItem(this.name, JSON.stringify(storage));
    } catch (error) {
      delete this.settings[key];
    }
  }

  clear() {
    try {
      localStorage.removeItem(this.name);
    } catch (error) {
      this.settings = {};
    }
  }
}

const playerStorage = new publicStorage('player_settings');

export { publicBarrageSend, publicStorage, playerStorage };
