import { LocalStorage } from 'node-localstorage';
import { NDIService } from '../services/NDIService';
import { TallyService } from '../services/TallyService';
import { getConfigDir } from '../utils/Env';
import { StoreTrunkHelper } from '../utils/StoreTrunkHelper';
import { NDIStore } from './NDIStore';
import { TallyStore } from './TallyStore';
import { AsyncTrunkPretty } from '../utils/AsyncTrunkPretty';

export class RootStore {
	private _ndiStore: NDIStore;
	private _tallyStore: TallyStore;
	private _storeTrunkHelper: StoreTrunkHelper;

	constructor(ndiService: NDIService, tallyService: TallyService) {
		this._ndiStore = new NDIStore(ndiService);
		this._tallyStore = new TallyStore(tallyService);
		//
		const storageDir = getConfigDir();
		const storage = new LocalStorage(storageDir);
		this._storeTrunkHelper = new StoreTrunkHelper(storage, AsyncTrunkPretty);
	}

	public get ndi() {
		return this._ndiStore;
	}

	public get tally() {
		return this._tallyStore;
	}

	public hydrate(): Promise<any> {
		return Promise.all([
			this._storeTrunkHelper.createStoreTrunk(
				{
					input: this._ndiStore._input,
					output: this._ndiStore._output,
				},
				'ndiStore',
			),
		]);
	}

	public destroy() {
		this._ndiStore.destroy();
	}
}

export function createRootStore(
	vmixHost: string,
	janusHost: string,
	janusTallyPort: number,
	janusVideoPort: number,
	janusAudioPort: number,
) {
	const tallyService = new TallyService(vmixHost, janusHost, janusTallyPort);
	const ndiService = new NDIService(
		vmixHost,
		janusHost,
		janusVideoPort,
		janusAudioPort,
	);
	return new RootStore(ndiService, tallyService);
}
