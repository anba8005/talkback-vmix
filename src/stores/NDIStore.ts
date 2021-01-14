import { action, makeObservable, observable, runInAction } from 'mobx';
import { NDIInputConfig, NDIService, NDISource } from '../services/NDIService';
import { logger } from '../utils/Logger';

const defaultInputConfig: NDIInputConfig = {
	name: null,
};

export class NDIStore {
	@observable
	public _input: NDIInputConfig = defaultInputConfig;

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
		this._updateInputStream();
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
			this._updateInputStream();
		}
	}

	@action
	private _setNdiSources(sources: NDISource[]) {
		this._sources = sources;
	}

	private _updateInputStream() {
		// TODO
	}
}
