import program from 'commander';
import { Main } from './Main';
import { createRootStore } from './stores/RootStore';
import { logger } from './utils/Logger';
import { initializeNativeCode } from './utils/NativeCode';

// create options
program
	.option('--vmix-host <host>', 'vMix API host', '127.0.0.1')
	.option('--janus-host <host>', 'Janus server host', '127.0.0.1')
	.option('--janus-tally-port <port>', 'Janus server tally port', '10000')
	.option('--janus-video-port <port>', 'Janus server vodep port', '10010')
	.option('--janus-audio-port <port>', 'Janus server vodep port', '10012');

// parse
program.parse(process.argv);
const opts = program.opts();

// show help if no options
if (!process.argv.slice(2).length) {
	program.outputHelp();
	process.exit(1);
}

// validate
if (!opts.vmixHost) {
	console.log('vMix API host option (--vmix-host) is mandatory');
	console.log();
	program.outputHelp();
	process.exit(1);
}
if (!opts.janusHost) {
	console.log('Janus server host option (--janus-host) is mandatory');
	console.log();
	program.outputHelp();
	process.exit(1);
}
if (opts.janusTallyPort && isNaN(Number(opts.janusTallyPort))) {
	console.log(
		'Invalid Janus server port option (--janus-tally-port) - numbers only',
	);
	console.log();
	program.outputHelp();
	process.exit(1);
}
if (opts.janusVideoPort && isNaN(Number(opts.janusVideoPort))) {
	console.log(
		'Invalid Janus server port option (--janus-video-port) - numbers only',
	);
	console.log();
	program.outputHelp();
	process.exit(1);
}
if (opts.janusAudioPort && isNaN(Number(opts.janusAudioPort))) {
	console.log(
		'Invalid Janus server port option (--janus-audio-port) - numbers only',
	);
	console.log();
	program.outputHelp();
	process.exit(1);
}

//

const rootStore = createRootStore(
	opts.vmixHost,
	opts.janusHost,
	Number(opts.janusTallyPort),
	Number(opts.janusVideoPort),
	Number(opts.janusAudioPort),
);

const main = new Main(rootStore);
initializeNativeCode()
	.then(() => main.initialize())
	.then(() => {
		main.waitForExit();
	})
	.catch((err) => {
		logger.error(err);
	});
