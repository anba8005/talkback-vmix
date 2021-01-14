import contrib, { Widgets } from 'blessed-contrib';
import { setLoggerCallback } from '../utils/Logger';

export class Log {
	private _log: Widgets.LogElement;

	constructor(grid: Widgets.GridElement) {
		//
		this._log = grid.set(1, 0, 1, 2, contrib.log, {
			fg: 'green',
			border: undefined,
			label: 'Log',
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
		setLoggerCallback((line: string) => {
			this._log.log(line);
		});
	}
}
