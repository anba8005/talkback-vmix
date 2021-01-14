import { TallyService } from '../services/TallyService';

export class TallyStore {
	constructor(private _tallyService: TallyService) {}

	public connect() {
		this._tallyService.connect();
	}

	public setLoggerCallback(callback: (s: string) => void) {
		this._tallyService.setLoggerCallback(callback);
	}
}
