import path from 'path';
import os from 'os';

export function getConfigDir() {
	const variant = process.env.VARIANT;
	return path.resolve(
		os.homedir(),
		'.talkback-vmix' +
			(variant && variant !== 'production' ? '-' + variant : ''),
	);
}
