export class LruCache<K = string, V = any> {
  readonly cache: Map<K, V>;
  readonly capacity: number;

  constructor(capacity: number = 30) {
    this.capacity = capacity;
    this.cache = new Map<K, V>();
  }

  /**
   * Check if a key exists in the cache
   * @param key Key to check
   * @returns Whether the key exists
   */
  has(key: K): boolean {
    return this.cache.has(key);
  }

  /**
   * Get the value for the specified key
   * If the key exists, it will be moved to the most recently used position
   * @param key Key to retrieve
   * @returns The corresponding value, or undefined if it doesn't exist
   */
  get(key: K): V | undefined {
    if (!this.cache.has(key)) {
      return undefined;
    }

    // Updating the order of use
    const value = this.cache.get(key)!;
    this.cache.delete(key);
    this.cache.set(key, value);

    return value;
  }

  /**
   * Set a key-value pair
   * If the cache is full, the least recently used item will be removed
   * @param key The key
   * @param value The value
   * @returns The set value
   */
  put(key: K, value: V): V {
    if (this.cache.has(key)) {
      // If the key already exists, delete the old entry
      this.cache.delete(key);
    } else if (this.cache.size >= this.capacity) {
      // If the cache is full, delete the oldest entry (first one)
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey!);
    }

    // Add the new entry
    this.cache.set(key, value);
    return value;
  }

  /**
   * Delete a cache item with the specified key
   * @param key Key to delete
   * @returns Whether the deletion was successful
   */
  delete(key: K): boolean {
    this.cache.delete(key);
    return true;
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get the current cache size
   * @returns Number of items in the cache
   */
  size(): number {
    return this.cache.size;
  }

  /**
   * Get the cache capacity
   * @returns Maximum capacity
   */
  getCapacity(): number {
    return this.capacity;
  }

  /**
   * Check if the cache is empty
   * @returns Whether the cache is empty
   */
  isEmpty(): boolean {
    return this.cache.size === 0;
  }

  /**
   * Check if the cache is full
   * @returns Whether the cache is full
   */
  isFull(): boolean {
    return this.cache.size >= this.capacity;
  }

  /**
   * Get an array of all keys
   * Arranged in order of use (most recently used at the end)
   * @returns Array of keys
   */
  keys(): K[] {
    return Array.from(this.cache.keys());
  }

  /**
   * Get an array of all values
   * Arranged in order of use (most recently used at the end)
   * @returns Array of values
   */
  values(): V[] {
    return Array.from(this.cache.values());
  }

  /**
   * Get an array of all key-value pairs
   * Arranged in order of use (most recently used at the end)
   * @returns Array of key-value pairs
   */
  entries(): [K, V][] {
    return Array.from(this.cache.entries());
  }

  /**
   * Get cache statistics
   * @returns Statistics object
   */
  getStats(): {
    size: number;
    capacity: number;
    usage: number;
    isEmpty: boolean;
    isFull: boolean;
  } {
    const size = this.cache.size;
    return {
      size,
      capacity: this.capacity,
      usage: Math.round((size / this.capacity) * 100),
      isEmpty: size === 0,
      isFull: size >= this.capacity,
    };
  }
}

export default LruCache;
