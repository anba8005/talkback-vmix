import { RetryWithTimeout } from './RetryWithTimeout';
import Ffmpeg, { FfmpegCommand } from 'fluent-ffmpeg';
import os from 'os';
import { logger } from './Logger';
import {
	getPackagedFFMpegName,
	getTmpFFMpegName,
	isNativeCodePackaged,
} from './NativeCode';

export interface FFmpegNDISource {
	name: string;
	ip: string;
}

export interface FFmpegConfiguration {
	name?: string; // auto-creating from main ndi name if undefined
	videoUrl?: string;
	audioUrl?: string;
	videoOptions?: string[];
	audioOptions?: string[];
	width?: number;
	height?: number;
	extraIps?: string;
}

export const FFMPEG_DEFAULT_CONFIG: FFmpegConfiguration = {
	width: 1280,
	height: 720,
	videoOptions: [
		'-vcodec libx264',
		'-pix_fmt yuv420p',
		'-preset veryfast',
		'-g 25',
		'-b 2M',
		'-tune zerolatency',
	],
	audioOptions: ['-b 64k'],
};

export class FFmpeg {
	private _spawned: boolean = false;
	private _ffmpeg: FfmpegCommand | null = null;
	private _ffmpegRetry: RetryWithTimeout;

	constructor(private _ndiName: string, private _config: FFmpegConfiguration) {
		const defaultConfig = Object.assign({}, FFMPEG_DEFAULT_CONFIG);
		this._config = Object.assign(defaultConfig, _config); // set defaults
		this._ffmpegRetry = new RetryWithTimeout(this._restartFfmpeg);
	}

	public static get ffmpegBinaryName() {
		return isNativeCodePackaged()
			? getTmpFFMpegName()
			: getPackagedFFMpegName();
	}

	public spawn() {
		if (this._spawned) {
			return;
		}
		//
		this._spawned = true;
		logger.info('Starting ffmpeg for ' + this._ndiName);

		// cleanup
		this._ffmpegRetry.reset();
		if (this._ffmpeg) {
			this._ffmpeg.removeAllListeners('error');
			this._ffmpeg.removeAllListeners('end');
			this._ffmpeg = null;
		}

		// create
		this._ffmpeg = Ffmpeg({
			logger: logger,
		});

		// set executable path
		this._ffmpeg.setFfmpegPath(FFmpeg.ffmpegBinaryName);

		// add input
		this._ffmpeg
			.input(this._ndiName)
			.inputFormat('libndi_newtek')
			.inputOptions([
				'-flags +low_delay',
				'-protocol_whitelist file,udp,rtp,http',
				'-fflags +nobuffer',
			]);
		if (this._config.extraIps) {
			this._ffmpeg.addInputOption('-extra_ips ' + this._config.extraIps);
		}

		// add video
		if (this._config.videoUrl) {
			this._ffmpeg
				.output(this._config.videoUrl)
				.addOutputOptions(this._config.videoOptions!)
				.addOutputOption('-threads 4')
				.withNoAudio()
				.outputFormat('rtp')
				.withSize(this._config.width + 'x' + this._config.height);
		}

		// add audio
		if (this._config.audioUrl) {
			this._ffmpeg
				.output(this._config.audioUrl)
				.audioCodec('libopus')
				.withNoVideo()
				.outputFormat('rtp');
		}

		// add event listeners
		this._ffmpeg.addListener('error', this._ffmpegErrorListener);
		this._ffmpeg.addListener('end', this._ffmpegEndListener);
		this._ffmpeg.on('stderr', (line: string) => {
			logger.info(line);
		});

		// logger.info(this._ffmpeg._getArguments());
		try {
			this._ffmpeg.run();
		} catch (e) {
			logger.warn('Error running ffmpeg for ' + this._ndiName);
			logger.warn(e.message);
		}
	}

	public destroy() {
		if (!this._spawned || !this._ffmpeg) {
			return;
		}
		//
		logger.info('Stopping ffmpeg for ' + this._ndiName);
		this._ffmpegRetry.reset();
		this._spawned = false;
		try {
			this._ffmpeg.kill('SIGKILL');
		} catch (e) {
			logger.warn('Error killing ffmpeg for ' + this._ndiName);
			logger.warn(e.message);
		}
	}

	private _ffmpegErrorListener = (e: any) => {
		if (
			e.message.indexOf('ffmpeg was killed with signal SIGKILL') !== -1 &&
			!this._spawned
		) {
			return;
		}
		//
		logger.warn(this._ndiName + ' -> ' + e.message);
		if (this._spawned) {
			this._ffmpegRetry.try();
		}
	};

	private _ffmpegEndListener = () => {
		logger.info(this._ndiName + ' -> ffmpeg exited');
	};

	private _restartFfmpeg = () => {
		if (this._spawned && this._ffmpeg) {
			logger.info(this._ndiName + ' -> restarting ffmpeg');
			try {
				this._ffmpeg.run();
			} catch (e) {
				logger.warn('Error restarting ffmpeg for ' + this._ndiName);
				logger.warn(e.message);
			}
		}
	};

	//
	//
	//

	public static findSources(extraIps?: string): Promise<FFmpegNDISource[]> {
		return new Promise<FFmpegNDISource[]>((resolve, reject) => {
			// create
			const ffmpeg = Ffmpeg({
				logger: logger,
			});

			// set executable path
			ffmpeg.setFfmpegPath(FFmpeg.ffmpegBinaryName);

			// add options
			ffmpeg
				.input('dummy')
				.inputFormat('libndi_newtek')
				.addOutput('/dev/null')
				.inputOptions(['-find_sources 1', '-extra_ips ' + extraIps]);

			//
			const sources: FFmpegNDISource[] = [];

			// add events
			ffmpeg.on('error', (e, stdout, stderr) => {
				if (e.message.indexOf('Immediate exit requested') > -1) {
					logger.info(sources.length + ' sources found');
					resolve(sources);
				} else {
					reject(e);
				}
			});
			ffmpeg.on('stderr', (line: string) => {
				const match = line.match(/'(.+)'.+'(.+)'/);
				if (match && match.length === 3) {
					sources.push({
						name: match[1],
						ip: match[2],
					} as FFmpegNDISource);
				}
			});
			//
			logger.info('Looking for NDI sources ...');
			try {
				ffmpeg.run();
			} catch (e) {
				logger.warn('Error running ffmpeg find sources');
				logger.warn(e.message);
			}
		});
	}
}
