import blessed from 'blessed';
import contrib from 'blessed-contrib';
import { Log } from './components/Log';
import { RootStore } from './stores/RootStore';
import { Settings } from './components/Settings';
import { TallyLog } from './components/TallyLog';

export class Main {
	private _screen?: blessed.Widgets.Screen;
	private _grid?: contrib.grid;

	private _log?: Log;
	private _settings?: Settings;
	private _tally?: TallyLog;

	constructor(private _rootStore: RootStore) {}

	public async initialize() {
		// init
		await this._rootStore.hydrate();
		//
		await this._rootStore.ndi.validateSavedInput();
		//
		this._rootStore.tally.connect();
		//
		this._createInterface();
	}

	public waitForExit() {
		this._screen?.key(['q', 'C-c'], (ch, key) => {
			this._rootStore.destroy();
			return process.exit(0);
		});
	}

	private _createInterface() {
		this._screen = blessed.screen({
			// smartCSR: true,
		});
		//
		this._grid = new contrib.grid({ rows: 2, cols: 2, screen: this._screen });
		//
		this._log = new Log(this._grid);
		this._settings = new Settings(this._rootStore, this._grid);
		this._tally = new TallyLog(this._rootStore.tally, this._grid);
		//
		this._screen.render();
	}
}
