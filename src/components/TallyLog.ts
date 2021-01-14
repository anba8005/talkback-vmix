import contrib, { Widgets } from 'blessed-contrib';
import { TallyStore } from '../stores/TallyStore';

export class TallyLog {
	private _log: Widgets.LogElement;

	private _lastLine?: string;

	constructor(tally: TallyStore, grid: Widgets.GridElement) {
		//
		this._log = grid.set(0, 1, 1, 1, contrib.log, {
			fg: 'green',
			border: undefined,
			label: 'Tally',
			bufferLength: 1000,
			scrollbar: {
				style: {
					bg: 'blue',
				},
			},
			// alwaysScroll: true,
			scrollable: true,
			// keys: true,
			// vi: true,
			// interactive: true,
			mouse: true,
		});
		//
		tally.setLoggerCallback((line: string) => {
			if (this._lastLine !== line) {
				this._log.log(line);
				this._lastLine = line;
			}
		});
	}
}
