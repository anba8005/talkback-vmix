import { FFmpeg, FFmpegNDISource } from '../utils/FFmpeg';
import { logger } from '../utils/Logger';

export interface NDISource extends FFmpegNDISource {}

export interface NDIInputConfig {
	name: string | null;
}

export class NDIService {
	constructor(
		private _vmixHost: string,
		private _janusHost: string,
		private _janusVideoPort: number,
		private _janusAudioPort: number,
	) {}

	public async findNDISources() {
		const sources = await FFmpeg.findSources(this._vmixHost);
		return sources;
	}
}
