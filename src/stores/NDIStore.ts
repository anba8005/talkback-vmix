import { action, makeObservable, observable, runInAction } from 'mobx';
import { NDIService, NDISource } from '../services/NDIService';
import { logger } from '../utils/Logger';
import { FFmpegConfiguration, FFMPEG_DEFAULT_CONFIG } from '../utils/FFmpeg';

export interface InputConfig {
	name: string | null;
}

export interface OutputConfig {
	videoOptions: string[];
	audioOptions: string[];
}

const defaultInputConfig: InputConfig = {
	name: null,
};

const defaultOutputConfig: OutputConfig = {
	videoOptions: FFMPEG_DEFAULT_CONFIG.videoOptions!,
	audioOptions: FFMPEG_DEFAULT_CONFIG.audioOptions!,
};

export class NDIStore {
	@observable
	public _input: InputConfig = defaultInputConfig;

	@observable
	public _output: OutputConfig = defaultOutputConfig;

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

	@action
	public resetToDefaults() {
		// TODO :)
	}

	@action
	public setInputName(name: string | null) {
		this._input.name = name;
		this._updateStream();
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
			this._updateStream();
		}
	}

	@action
	private _setNdiSources(sources: NDISource[]) {
		this._sources = sources;
	}

	private _updateStream() {
		this._ndiService.stopNDIStream();
		if (this._input.name) {
			this._ndiService.startNDIStream(
				this._input.name,
				this._createFFmpegConfig(),
			);
		}
	}

	private _createFFmpegConfig() {
		return {
			videoOptions: this._output.videoOptions,
			audioOptions: this._output.audioOptions,
		} as FFmpegConfiguration;
	}
}
