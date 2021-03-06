import { Cache } from '@klasa/cache';

import type { Client } from '../../../client/Client';
import type { Structure } from '../../structures/base/Structure';
import type { Constructor } from '../../../util/Extender';

/**
 * The data caches with extra methods unique to each data store
 */
export class DataStore<S extends Structure> extends Cache<string, S> {

	/**
	 * The cache limit of this DataStore
	 */
	#limit: number;

	public constructor(public readonly client: Client, protected readonly Holds: Constructor<S>, limit: number, iterable?: Iterable<S>) {
		super();
		this.#limit = limit;
		if (iterable) for (const item of iterable) this._add(item);
	}

	/**
	 * Resolves data into Structures
	 * @param data The data to resolve
	 */
	public resolve(data: unknown): S | null {
		if (typeof data === 'string') return this.get(data) || null;
		if (data instanceof this.Holds) return data;
		return null;
	}

	/**
	 * Resolves data into ids
	 * @param data The data to resolve
	 */
	public resolveID(data: unknown): string | null {
		if (typeof data === 'string') return data;
		if (data instanceof this.Holds) return data.id;
		return null;
	}

	/**
	 * Sets a value to this DataStore taking into account the cache limit.
	 * @param key The key of the value you are setting
	 * @param value The value for the key you are setting
	 */
	public set(key: string, value: S): this {
		if (this.#limit === 0) return this;
		if (this.size >= this.#limit && !this.has(key)) this.delete(this.firstKey as string);
		return super.set(key, value);
	}

	/**
	 * Adds a new structure to this DataStore
	 * @param data The data packet to add
	 * @param cache If the data should be cached
	 */
	protected _add(data: Record<string, any>): S {
		const existing = this.get(data.id as string);
		// eslint-disable-next-line dot-notation
		if (existing) return existing['_patch'](data);

		const entry = new this.Holds(this.client, data);
		if (this.client.options.cache.enabled) this.set(entry.id, entry);
		return entry;
	}

	/**
	 * Defines the extensibility of DataStores
	 */
	public static get [Symbol.species](): typeof Cache {
		return Cache;
	}

	/**
	 * The JSON representation of this object.
	 */
	public toJSON(): string[] {
		return [...this.keys()];
	}

}
