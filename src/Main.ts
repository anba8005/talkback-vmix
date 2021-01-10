import { ConnectionTCP } from 'node-vmix';
import { Janus } from './Janus';
import { TallySummary } from 'vmix-js-utils/dist/types/tcp';

export class Main {
	private _vmix: ConnectionTCP;

	private _janus: Janus;

	constructor(
		debug: boolean,
		vmixHost: string,
		janusHost: string,
		janusPort: number,
	) {
		this._vmix = new ConnectionTCP(vmixHost, {
			autoReconnect: true,
			debug,
		});
		this._vmix.on('tally', (data: TallySummary) => this._onTally(data));
		//
		this._janus = new Janus(debug, janusHost, janusPort);
		//
		setTimeout(() => {
			// taip reik :) check ConnectionTCP sources
			this._vmix.send('SUBSCRIBE TALLY');
		}, 0);
	}

	private _onTally(data: TallySummary) {
		this._janus.sendTally(data);
	}
}
