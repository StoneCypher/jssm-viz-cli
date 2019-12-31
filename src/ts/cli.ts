
// shebang is in rollup banner; see bin-rollup.config.js





const app = require('commander');

import { version }           from '../../package.json';
import { fsl_to_svg_string } from 'jssm-viz';

import { file_type }         from './types';





app
  .version(version)
  .option('-s, --source <glob>',      'The input source file, as a glob, such as foo.fsl or ./**/*.fsl')
  .option('--svg <default>',          'Produce output in SVG format (default if no formats specified)')
  .option('--png',                    'Produce output in PNG format')
  .option('--jpg',                    'Produce output in JPEG format, with a .jpg extension')
  .option('--jpeg',                   'Produce output in JPEG format, with a .jpeg extension')
  .option('--gif',                    'Produce output in GIF format')
  .option('--webp',                   'Produce output in WEBP format')
  .option('-w, --width <integer>',    'Set raster render width, in pixels')
  .option('--tree',                   'Produce output in JSSM\'s internal parse tree format, with a .tree extension')
  .option('--dot',                    'Produce output in GraphViz\'s DOT format')
  .option('--inplace <default>',      'Output where source was found')
  .option('--todir <dir>',            'Output to a specified directory')
  .option('--toinplacedir <dir>',     'Output a matching tree from source to a specified directory')
  .option('--tosourcenameddir <dir>', 'Output slugged names to a specified directory');





async function render(fsl_code: string): Promise<string> {

  const svg_code: string = await fsl_to_svg_string(fsl_code);

  return svg_code;

}





async function run() {
  console.log(await render('hi -> hello -> hi_there;'));
}





run();
