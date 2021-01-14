import { createLogger, format, transports, Logger } from 'winston';
import { LoggerInterface } from './CommonLogger';
import util from 'util';
import path from 'path';
import { Transform } from 'stream';
import tempDirectory from 'temp-dir';

const PROJECT_ROOT = path.join(__dirname, '..');

//
//
///

let loggerCallback: (s: string) => void;
export function setLoggerCallback(callback: (s: string) => void) {
	loggerCallback = callback;
}

const stream = new Transform();
stream._transform = (chunk, encoding, end) => {
	const lines = (chunk as Buffer).toString().split(/\r\n|\r|\n/);
	lines.forEach((line) => {
		if (line.length > 0) {
			if (loggerCallback) {
				loggerCallback(line);
			} else {
				console.log(line);
			}
		}
	});
	end();
};

//
//
//

const winston = createLogger({
	level: 'info',
	format: format.combine(
		// format.colorize(),
		format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
		format.printf(
			(info) =>
				`${info.timestamp} ${info.level} [${info.label}]: ${info.message}`,
		),
	),
	transports: [
		new transports.Stream({
			stream,
		}),
		new transports.File({
			filename: tempDirectory + path.sep + 'talkback-vmix.log',
			maxsize: 10 * 1024 * 1024,
			maxFiles: 5,
			tailable: true,
		}),
	],
});

//

export const logger: LoggerInterface = {
	debug: (...args: any[]) => {
		logToWinston('debug', ...args);
	},
	info: (...args: any[]) => {
		logToWinston('info', ...args);
	},
	warn: (...args: any[]) => {
		logToWinston('warn', ...args);
	},
	error: (...args: any[]) => {
		logToWinston('error', ...args);
	},
};

function logToWinston(level: string, ...args: any[]) {
	let label = '';
	//
	const stackInfo = getStackInfo(1);
	if (stackInfo) {
		label = stackInfo.file + ':' + stackInfo.line;
	}
	//
	const fmt = args.shift();
	//
	winston.log({
		level,
		message: util.format(fmt, ...args),
		label,
	});
}

function getStackInfo(stackIndex: number) {
	// get call stack, and analyze it
	// get all file, method, and line numbers
	const stacklist = new Error().stack!.split('\n').slice(3);

	// stack trace format:
	// http://code.google.com/p/v8/wiki/JavaScriptStackTraceApi
	// do not remove the regex expresses to outside of this method (due to a BUG in node.js)
	const stackReg = /at\s+(.*)\s+\((.*):(\d*):(\d*)\)/gi;
	const stackReg2 = /at\s+()(.*):(\d*):(\d*)/gi;

	const s = stacklist[stackIndex] || stacklist[0];
	const sp = stackReg.exec(s) || stackReg2.exec(s);

	if (sp && sp.length === 5) {
		return {
			method: sp[1],
			relativePath: path.relative(PROJECT_ROOT, sp[2]),
			line: sp[3],
			pos: sp[4],
			file: path.basename(sp[2]),
			stack: stacklist.join('\n'),
		};
	}
}
