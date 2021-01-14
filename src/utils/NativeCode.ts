import path from 'path';
import fs from 'fs';
import util from 'util';
import os from 'os';

const tempDirectory = require('temp-dir');

const chmod = util.promisify(fs.chmod);

export const win32 = os.platform() === 'win32';
export const mac = os.platform() === 'darwin';
export const linux = os.platform() === 'linux';

//
//
//

export async function initializeNativeCode() {
	if (!isNativeCodePackaged()) {
		return false;
	}
	//
	const srcPath = getPackagedWorkerPath();
	const dstPath = getTmpWorkerPath();
	await copyFile(
		srcPath + getFFMpegExecutableName(),
		dstPath + getFFMpegExecutableName(),
	);
	//
	/* if (win32) {
		await copyFile(
			srcPath + 'Processing.NDI.Lib.x64.dll',
			dstPath + 'Processing.NDI.Lib.x64.dll',
		);
	} else if (mac) {
		await copyFile(srcPath + 'libndi.4.dylib', dstPath + 'libndi.4.dylib');
	} */
	//
	if (mac || linux) {
		await chmod(dstPath + getFFMpegExecutableName(), 755);
	}
	//
	return true;
}

export function isNativeCodePackaged() {
	// detect if run via pkg (nodejs packager)
	const dir = path.dirname(require.main!.filename);
	if (win32) {
		return dir.indexOf(':\\snapshot\\') > -1;
	} else {
		return dir.startsWith('/snapshot/');
	}
}

function copyFile(source: string, target: string) {
	return new Promise<void>((resolve, reject) => {
		const rd = fs.createReadStream(source);
		rd.on('error', (err) => reject(err));
		const wr = fs.createWriteStream(target);
		wr.on('error', (err) => reject(err));
		wr.on('close', () => resolve());
		rd.pipe(wr);
	});
}

export function getPackagedFFMpegName() {
	return getPackagedWorkerPath() + getFFMpegExecutableName();
}

export function getTmpFFMpegName() {
	return getTmpWorkerPath() + getFFMpegExecutableName();
}

function getFFMpegExecutableName() {
	return 'ffmpeg' + getExecutableExtension();
}

function getExecutableExtension() {
	if (win32) {
		return '.exe';
	} else if (mac) {
		return '.mac';
	} else if (linux) {
		return '.linux';
	} else {
		throw new Error('Invalid architecture ' + os.platform);
	}
}

function getPackagedWorkerPath() {
	let dirname = path.dirname(require.main!.filename);
	dirname = path.join(dirname, '..' + path.sep);
	return path.join(dirname, 'native' + path.sep);
}

function getTmpWorkerPath() {
	return tempDirectory + path.sep;
}
