import { AsyncTrunk, AsyncTrunkOptions } from 'mobx-sync';

export class AsyncTrunkPretty extends AsyncTrunk {
	private _storage: any;

	private _store: any;

	constructor(
		store: any,
		{ storage, storageKey, delay = 0 }: AsyncTrunkOptions = {},
	) {
		super(store, { storage, storageKey, delay });
		this._storage = storage;
		this._store = store;
	}

	public async persist(): Promise<void> {
		try {
			await this._storage.setItem(
				this.storageKey,
				JSON.stringify(this._store, null, '    '),
			);
		} catch {
			// TODO report error
			console.error('cycle reference occurred');
		}
	}
}
