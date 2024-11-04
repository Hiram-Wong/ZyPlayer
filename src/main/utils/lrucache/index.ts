class LruCache {
  #cache: Map<any, any> = new Map();
  capacity: number = 3;
  constructor(capacity: number) {
    this.capacity = capacity;
    this.#cache = new Map();
  }
  has(key: string) {
    return this.#cache.has(key);
  }
  get(key: string) {
    if (!this.#cache.has(key)) {
      return;
    }
    const value = this.#cache.get(key);
    this.#cache.delete(key);
    this.#cache.set(key, value);
    return value;
  }
  put(key: string, value: any) {
    if (this.#cache.has(key)) {
      this.#cache.delete(key);
    } else if (this.#cache.size >= this.capacity) {
      this.#cache.delete(this.#cache.keys().next().value);
    }
    this.#cache.set(key, value);
    return value;
  }
  delete(key: string) {
    return this.#cache.delete(key);
  }
}

export default LruCache;
