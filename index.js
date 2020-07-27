const path = require('path');
const yargs = require('yargs');
const logger = require('./logger');
const SvgOptimizer = require('./src/svg-optimizer');

const { argv } = yargs
  .scriptName('svg-optimizer')
  .usage('$0 -f file')
  .option('f', {
    alias: 'file',
    type: 'string',
    demandOption: 'a filename is required',
    describe: 'an svg file',
  })
  .option('o', {
    alias: 'output',
    default: 'out/',
    type: 'string',
    describe: 'target directory',
  })
  .option('d', {
    alias: 'debug',
    default: false,
    type: 'boolean',
    describe: 'target directory',
  })
  .help();

logger.info(argv);

new SvgOptimizer({
  file: argv.file,
  outputDir: path.resolve(argv.output),
  debugEnabled: argv.debug,
}).run();
