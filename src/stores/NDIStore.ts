import { action, makeObservable, observable, runInAction } from 'mobx';
import { NDIService, NDISource } from '../services/NDIService';
import { logger } from '../utils/Logger';
import { FFmpegConfiguration, FFMPEG_DEFAULT_CONFIG } from '../utils/FFmpeg';

export interface InputConfig {
	name: string | null;
}

const defaultInputConfig: InputConfig = {
	name: null,
};

export class NDIStore {
	@observable
	public _input: InputConfig = Object.assign({}, defaultInputConfig);

	@observable
	public _output: FFmpegConfiguration = Object.assign(
		{},
		FFMPEG_DEFAULT_CONFIG,
	);

	@observable.ref
	private _sources: NDISource[] = [];

	constructor(private _ndiService: NDIService) {
		makeObservable(this);
	}

	public get sources() {
		return this._sources;
	}

	public get input() {
		return this._input;
	}

	public get output() {
		return this._output;
	}

	@action
	public resetToDefaults() {
		this._output.bitrate = FFMPEG_DEFAULT_CONFIG.bitrate!;
		this._output.width = FFMPEG_DEFAULT_CONFIG.width!;
		this._output.height = FFMPEG_DEFAULT_CONFIG.height!;
		this._restartStream();
	}

	@action
	public setInputName(name: string | null) {
		this._input.name = name;
		this._restartStream();
	}

	@action
	public setBitrate(bitrate: number) {
		this._output.bitrate = bitrate;
		this._restartStream();
	}

	@action
	public setResolution(width: number, height: number) {
		this._output.width = width;
		this._output.height = height;
		this._restartStream();
	}

	public updateNdiSources() {
		this._ndiService
			.findNDISources()
			.then((result) => this._setNdiSources(result))
			.catch((err) => {
				logger.error('Error updating ndi sources - %s', err);
				this._setNdiSources([]);
			});
	}

	public destroy() {
		this._ndiService.stopNDIStream();
	}

	public async validateSavedInput() {
		if (this._input.name) {
			//
			const sources = await this._ndiService.findNDISources();
			const filtered = sources.filter(
				(source) => source.name === this._input.name,
			);
			//
			if (filtered.length === 0) {
				runInAction(() => {
					this._input.name = null;
				});
			}
			//
			this._restartStream();
		}
	}

	@action
	private _setNdiSources(sources: NDISource[]) {
		this._sources = sources;
	}

	private _restartStream() {
		this._ndiService.stopNDIStream();
		if (this._input.name) {
			this._ndiService.startNDIStream(
				this._input.name,
				this._createFFmpegConfig(),
			);
		}
	}

	private _createFFmpegConfig() {
		return { ...this._output };
	}
}
