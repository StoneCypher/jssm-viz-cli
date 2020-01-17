
// shebang is in rollup banner; see bin-rollup.config.js





const fs   = require('fs');

const app  = require('commander'),
      glob = require('glob');

import { version }           from '../../package.json';
import { fsl_to_svg_string } from 'jssm-viz';

import { file_type }         from './types';





app

  .version(version)

  .option('-s, --source <glob>',      'The input source file, as a glob, such as foo.fsl or ./**/*.fsl')

  .option('-w, --width <integer>',    'Set raster render width, in pixels')

  .option('-v, --verbose',            'Log to console normally')
  .option('-q, --quiet',              'Only log to console on error')
  .option('-z, --silent',             'Do not log to console at all')

  .option('--svg',                    'Produce output in SVG format (default if no formats specified)')
  .option('--png',                    'Produce output in PNG format')
  .option('--jpg',                    'Produce output in JPEG format, with a .jpg extension')
  .option('--jpeg',                   'Produce output in JPEG format, with a .jpeg extension')
  .option('--gif',                    'Produce output in GIF format')
  .option('--webp',                   'Produce output in WEBP format')
  .option('--tree',                   'Produce output in JSSM\'s internal parse tree format, with a .tree extension')
  .option('--dot',                    'Produce output in GraphViz\'s DOT format')

  .option('--inplace',                'Output where source was found (default)')
  .option('--todir <dir>',            'Output to a specified directory')
  .option('--toinplacedir <dir>',     'Output a matching tree from source to a specified directory')
  .option('--tosourcenameddir <dir>', 'Output slugged names to a specified directory')
  .option('--topipe',                 'Output to pipe 0 (aka cout, stdout)');

app.parse(process.argv);





async function render(fsl_code: string): Promise<string> {

  const svg_code: string = await fsl_to_svg_string(fsl_code);

  return svg_code;

}





function english_list(list) {

  if (list.length === 0) { return ""; }
  if (list.length === 1) { return `${list[0]}`; }
  if (list.length === 2) { return `${list[0]} and ${list[1]}`; }

  const [ last, ... r_front ] = list.reverse(),
        front                 = r_front.reverse();

  return `${front.join(', ')}, and ${last}`;

}





function validate_args() {

  if (!(app.source)) {
    console.log('Error: must specify a source file or source glob');
    process.exit(1);
  }

  const dirs   = ['inplace', 'todir', 'toinplacedir', 'tosourcenameddir', 'topipe'],
        dirsOn = dirs.filter(d => app[d] !== undefined);

  if (dirsOn.length > 1) {
    console.log(`${english_list(dirsOn)} are mutually exclusive.  Please choose at most one.`);
    process.exit(1);
  }

  const noise = ['verbose', 'quiet', 'silent'];
  if (noise.filter(d => app[d] !== undefined).length > 1) {
    console.log(`${english_list(noise)} are mutually exclusive.  Please choose at most one.`);
    process.exit(1);
  }

  if (dirsOn.length === 0) {
    app.inplace = true;
  }

  const imgFormats = ['png', 'svg', 'jpg', 'jpeg', 'gif', 'webp', 'tree', 'dot'];
  if (imgFormats.filter(d => app[d] !== undefined).length === 0) {
    app.svg = true;
  }

}





async function output({ fname, data }) {

  console.log(` - Rendering ${fname}...`);
  const svg = await render(data);

}





async function run() {

  validate_args();
  const files = glob.sync(app.source)
                    .map(fname => ({fname, data: `${fs.readFileSync(fname)}`}))
                    .map(output);

  await Promise.all(files);
  console.log('... finished');

}





run();





// console.log(await render(`

// machine_name: "Traffic light example";

// Green 'next' => Yellow 'next' => Red 'next' => Green;
// [Red Yellow Green] ~> Off -> Red;

// `));
