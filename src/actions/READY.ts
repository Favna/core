import { Action, ClientEvents, extender } from '@klasa/core';

import type { ReadyDispatch } from '@klasa/ws';

export default class CoreAction extends Action {

	/**
	 * Processes the event data from the websocket.
	 * @since 0.0.1
	 * @param data The raw data from {@link Client#ws}
	 */
	public run(data: ReadyDispatch): void {
		for (const guild of data.d.guilds) {
			// eslint-disable-next-line dot-notation
			const created = new (extender.get('Guild'))(this.client, guild, data.shard_id);
			if (this.client.options.cache.enabled) {
				this.client.guilds.set(created.id, created);
			}
		}

		const ClientUser = extender.get('ClientUser');

		this.client.user = new ClientUser(this.client, data.d.user);
		this.client.users.set(this.client.user.id, this.client.user);

		const shard = this.client.ws.shards.get(data.shard_id);
		if (shard) this.client.emit(ClientEvents.ShardReady, shard);
	}

	public check(): null {
		return null;
	}

	public build(): null {
		return null;
	}

	public cache(): void {
		// noop
	}

}
