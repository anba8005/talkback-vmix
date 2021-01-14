import { TallySummary } from 'vmix-js-utils/dist/types/tcp';
import dgram from 'dgram';
import { ConnectionTCP } from 'node-vmix';
import { logger } from '../utils/Logger';

export class TallyService {
	private _vmix?: ConnectionTCP;

	private _logger?: (s: string) => void;

	constructor(
		private _vmixHost: string,
		private _janusHost: string,
		private _janusTallyPort: number,
	) {}

	public connect() {
		this._vmix = new ConnectionTCP(this._vmixHost, {
			autoReconnect: true,
		});
		this._vmix.on('tally', (data: TallySummary) => this._sendTally(data));
		//
		setTimeout(() => {
			// taip reik :) check ConnectionTCP sources
			this._vmix?.send('SUBSCRIBE TALLY');
		}, 0);
	}

	public setLoggerCallback(callback: (s: string) => void) {
		this._logger = callback;
	}

	private _sendTally(data: TallySummary) {
		const client = dgram.createSocket('udp4');
		const tally = JSON.stringify({ tally: this._transformTally(data) });
		client.send(
			tally,
			0,
			tally.length,
			this._janusTallyPort,
			this._janusHost,
			(err) => {
				if (err) {
					logger.error(err);
				} else if (this._logger) {
					this._logger('Tally : PGM -> ' + data.program.join(','));
				}
				client.close();
			},
		);
	}

	private _transformTally(data: TallySummary) {
		return {
			pgm: data.program,
		};
	}
}
