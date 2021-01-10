import program from 'commander';
import { Main } from './Main';

// create options
program
	.option('--vmix-host <host>', 'vMix API host')
	.option('--janus-host <host>', 'Janus server host')
	.option('--janus-port <port>', 'Janus server port', '10000')
	.option('--debug', 'Show debug info', false);

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
if (opts.janusPort && isNaN(Number(opts.janusPort))) {
	console.log('Invalid Janus server port option (--janus-port) - numbers only');
	console.log();
	program.outputHelp();
	process.exit(1);
}

//
const main = new Main(
	opts.debug,
	opts.vmixHost,
	opts.janusHost,
	Number(opts.janusPort),
);
