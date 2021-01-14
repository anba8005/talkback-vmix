import { AsyncTrunk } from 'mobx-sync';
import { commonLogger } from './CommonLogger';

export class StoreTrunkHelper {
	private _storeTrunks: AsyncTrunk[] = [];

	private _classCtr: any;

	constructor(private _storage?: any, classCtr: any = AsyncTrunk) {
		this._classCtr = classCtr;
	}

	public createStoreTrunk(store: any, storageKey: string, delay?: number) {
		const trunk = new this._classCtr(store, {
			storage: this._storage,
			storageKey,
			delay,
		});
		return trunk
			.init()
			.then(() => {
				commonLogger.info('Initialized ' + storageKey);
				this._storeTrunks.push(trunk);
			})
			.catch((e: any) => {
				commonLogger.error('Error initializing ' + storageKey + ' -> ' + e);
			});
	}
}
