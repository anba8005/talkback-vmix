import { TallySummary } from 'vmix-js-utils/dist/types/tcp';
import dgram from 'dgram';
import { program } from 'commander';

export class Janus {
	constructor(
		private _debug: boolean,
		private _janusHost: string,
		private _janusPort: number,
	) {}

	public sendTally(data: TallySummary) {
		const client = dgram.createSocket('udp4');
		const tally = JSON.stringify({ tally: this._transformTally(data) });
		client.send(
			tally,
			0,
			tally.length,
			this._janusPort,
			this._janusHost,
			(err) => {
				if (err) {
					console.error(err);
				} else if (this._debug) {
					console.log(tally);
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
