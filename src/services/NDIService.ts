import { FFmpeg, FFmpegConfiguration, FFmpegNDISource } from '../utils/FFmpeg';
import { logger } from '../utils/Logger';

export interface NDISource extends FFmpegNDISource {}

export class NDIService {
	private _streamer?: FFmpeg;

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

	public startNDIStream(ndiName: string, config: FFmpegConfiguration) {
		config.extraIps = this._vmixHost;
		config.videoUrl = 'rtp://' + this._janusHost + ':' + this._janusVideoPort;
		config.audioUrl = 'rtp://' + this._janusHost + ':' + this._janusAudioPort;
		this._streamer = new FFmpeg(ndiName, config);
		this._streamer.spawn();
	}

	public stopNDIStream() {
		if (this._streamer) {
			this._streamer.destroy();
		}
	}
}
