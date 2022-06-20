
// shebang is in rollup banner; see bin-rollup.config.js





const fs    = require('fs'),
      path  = require('path');

const sharp = require('sharp'),
      glob  = require('glob'),
      app   = require('commander'),
      a2c   = require('ansi-256-colors');


import { version }           from '../../package.json';
import { file_type }         from './types';

import {
  fsl_to_svg_string,
  fsl_to_dot
} from 'jssm-viz';





const DEFAULT_SCALE = 3;

const rasterFormats = ['png', 'jpg', 'jpeg', 'webp'],
      otherFormats  = ['svg', 'tree', 'dot'],
      imgFormats    = [].concat(rasterFormats, otherFormats),
      dirsOn        = ['inplace', 'todir', 'toinplacedir', 'tosourcenameddir', 'topipe'],
      noise         = ['debug', 'verbose', 'quiet', 'silent'];

type imageFormatsAsTuple = typeof imgFormats; // see https://stackoverflow.com/a/45486495/763127
type imgFormat           = imageFormatsAsTuple[number];





const at      = (s, i)              => parseInt(`${s}`.padStart(3, '0')[i]),
      fg_from = colstr              => (colstr === false)? '' : a2c.fg.getRgb(at(colstr, 0), at(colstr, 1), at(colstr, 2)),
      cx      = (color, text)       => fg_from(color) + text + a2c.reset,
      col     = (num, text)         => app.color? `${cx(num, text)}` : text,
      cols    = (nt_pairs)          => nt_pairs.map( pair => col(pair[0], pair[1]) ).join(''),
      if_text = (label, text, tcol) => text? (label + col(tcol, text)) : '';

const error_text = text => if_text(col(501, 'Error: '), text, 412) + `${col(441, " (see ")}${col(141, "jssm-viz --help")}${col(441, " for details)")}`,
      debug_text = text => if_text(col(113, 'Debug: '), text, 12),
      quiet_text = text => if_text(col(131, 'Quiet: '), text, 21);

let scale, height, width;





const render_message = fname =>
  app.color
    ? `${col(222, ' - ')}${col(123, "Rendering")} ${col(135, fname)}`
    : ` - Rendering ${fname}`;

const render_result = fname =>
  app.color
    ? `${col(222, '   - ')}${col(123, "Output")} ${col(135, fname)}`
    : `   - Output ${fname}`;





const log_if      = (text, clause) => clause? process.stdout.write(text + '\n') : true,

      debug_log   = text => log_if(debug_text(text), ['debug'                    ].includes(app.noise_level)),
      verbose_log = text => log_if(           text , ['debug', 'verbose'         ].includes(app.noise_level)),
      quiet_log   = text => log_if(quiet_text(text), ['debug', 'verbose', 'quiet'].includes(app.noise_level));





function accumulateSource(value, previous) {
  return previous.concat([value]);
}





app

  .version(version)

  .option('-i, --input <glob>',       'the input source file, as a glob, such as foo.fsl or ./**/*.fsl')
  .option('-o, --output <string>',    'the output filename, as a string.  Omit and the input fname will be used')
  .option('-O, --outputDir <string>', 'the output directory, as a string; otherwise predict the filenames as normal')
  .option('-0, --outputCout',         'output to standard output / pipe 0 / cout; implies -q otherwise')
  .option('-N, --nestedDir <string>', 'the output directory, retaining subdir relative to here; otherwise predict')
  .option('-s, --source <string>',    'provide source as a string', undefined, accumulateSource, [])

  .option('-w, --width <integer>',    'set raster render width, in pixels (exclusive of height or scale)')
  .option('-h, --height <integer>',   'set raster render height, in pixels (exclusive of width or scale)')
  .option('-x, --scale <number>',     `set raster scale, in pixels (exclusive of width or height, default ${DEFAULT_SCALE})`)

  .option('-d, --debug',              'log extensively to console')
  .option('-v, --verbose',            'log to console normally (default)')
  .option('-q, --quiet',              'only log to console on error')
  .option('-z, --silent',             'do not log to console at all')

  .option('-c, --color',              'use console color (default)')
  .option('-n, --nocolor',            'do not use console color')

  .option('-S, --svg',                'produce output in SVG format (default if no formats specified)')
  .option('-P, --png',                'produce output in PNG format')
  .option('-J, --jpg',                'produce output in JPEG format, with a .jpg extension')
  .option('-E, --jpeg',               'produce output in JPEG format, with a .jpeg extension')
  .option('-W, --webp',               'produce output in WEBP format')
  .option('-T, --tree',               'produce output in JSSM\'s internal parse tree format, with a .tree extension')
  .option('-D, --dot',                'produce output in GraphViz\'s DOT format')

app.parse(process.argv);





function english_list(list) {

  if (list.length === 0) { return ""; }
  if (list.length === 1) { return `${list[0]}`; }
  if (list.length === 2) { return `${list[0]} and ${list[1]}`; }

  const [ last, ... r_front ] = list.reverse(),
        front                 = r_front.reverse();

  return `${front.join(', ')}, and ${last}`;

}





const present_on_app = (test_items) =>
  test_items.filter(ti => app[ti] !== undefined);





function validate_args() {

  const colors = present_on_app(['color', 'nocolor']);
  if (colors.length > 1) {
    console.log(error_text(`${english_list(['color', 'nocolor'])} are mutually exclusive.  Please choose at most one.`));
    process.exit(1);
  }
  if (colors.length === 0) {
    app.color = true;
  }

  const sizes = present_on_app(['height', 'width', 'scale']);
  if (sizes.length > 1) {
    console.log(error_text(`${english_list(['height', 'width', 'scale'])} are mutually exclusive.  Please choose at most one.`));
    process.exit(1);
  }

  if (sizes.length === 0) { scale  = DEFAULT_SCALE; }
  if (app.scale)          { scale  = app.scale;     }
  if (app.height)         { height = app.height;    }
  if (app.width)          { width  = app.width;     }

  const noises = present_on_app(noise);
  if (noises.length > 1) {
    console.log(`${english_list(noises)} are mutually exclusive.  Please choose at most one.`);
    process.exit(1);
  } else if (noises.length === 1) {
    app.noise_level = noises[0];
    debug_log(`Noise level: ${app.noise_level}`);
  } else {
    debug_log(`No noise level specified; defaulting to verbose`);
    app.noise_level = 'verbose';
  }

  const if_colored = colorer => app.color? colorer : ( x => x );

  if (!(app.source)) {
    console.log(error_text("must specify a source file or source glob"));
    process.exit(1);
  }

  const uDirsOn = present_on_app(dirsOn);
  if (uDirsOn.length > 1) {
    console.log(error_text(`${english_list(dirsOn)} are mutually exclusive.  Please choose at most one.`));
    process.exit(1);
  }

  if (uDirsOn.length === 0) {
    debug_log(`No directory strategy specified; defaulting to inplace`);
    app.inplace = true;
  } else {
    debug_log(`Directory strategy: ${uDirsOn[0]}`);
  }

  if (present_on_app(imgFormats).length === 0) {
    debug_log(`No image format(s) specified; defaulting to svg`);
    app.svg = true;
  }

  debug_log(''); // on debug only emit a newline before the work output

}





function outputTarget(origFname, kind) {
  return origFname + '.' + kind; // lol TODO FIXME
}





function pull_size_from_svg(svg: string) {

  const inter      = `${svg}`.split('<svg width="'),
        after      = inter[1].split('pt" height="'),
        final      = after[1].split('pt"'),

        svg_width  = Number(after[0]),
        svg_height = Number(final[0]);

  return { svg_width, svg_height };

}





async function sharp_raster(sbuf, target_fmt: string, options?: object | undefined) {

  process.env.FONTCONFIG_PATH= `/c/Users/john/projects/jssm-viz-cli/src/fonts`;
//process.env.FONTCONFIG_PATH= `${__filename}/fonts`;

  const u_opt = (options === undefined)
                  ? {}
                  : options;

  if (!( imgFormats.includes(target_fmt) )) {
    throw new TypeError(`unknown format: ${target_fmt}`);
  }

  if (['dot', 'tree', 'svg'].includes(target_fmt)) {
    throw new TypeError(`not a raster format: ${target_fmt}`);
  }

  const { svg_width, svg_height } = pull_size_from_svg(sbuf);

  let final_width  = svg_width,
      final_height = svg_height;

  if (scale !== undefined) {
    final_height = Math.ceil(final_height * scale);
    final_width  = Math.ceil(final_width  * scale);
  } else if (height !== undefined) {
    final_height = Math.ceil(height);
    final_width  = Math.ceil((height / svg_height) * width);
  } else if (width !== undefined) {
    final_width  = Math.ceil(width);
    final_height = Math.ceil((width / svg_width) * height);
  }

  const ufmt      = (target_fmt === 'jpg')? 'jpeg' : target_fmt,
        sharp_buf = await sharp(sbuf)
                            .resize({
                              width  : final_width,
                              height : final_height,
                              fit    : 'contain'
                            });

  const buf       = sharp_buf[ufmt]().toBuffer();

  return buf;

}





// const to_inject = `
//   <style type="text/css">
//     @font-face {
//       font-family : Open Sans;
//       src         : '${__dirname}/fonts/OpenSans-Regular.ttf';
//     }
//   </style>
// `;

// const to_inject = `
//   <style type="text/css">
//     @font-face {
//       font-family : 'Open Sans';
//       src         : url('../../dist/js/fonts/OpenSans-Regular.ttf');
//     }
//   </style>
// `;

// const to_inject = `
//   <style type="text/css">
//     @font-face {
//       font-family : 'Open Sans';
//       src         : url('${path.normalize(__dirname).replace(/\\/g,'\\\\')}/fonts/OpenSans-Regular.ttf');
//     }
//   </style>
// `;

// const to_inject = `
//   <style type="text/css">
//     @font-face {
//       font-family : 'Open Sans';
//       src         : url('C:\\Users\\john\\projects\\jssm-viz-cli\\dist\\js\\fonts\\OpenSans-Regular.ttf');
//     }
//   </style>
// `;

// const to_inject = `
//   <style type="text/css">
//     @font-face {
//       font-family : Open Sans;
//       src         : url('../../dist/js/fonts/OpenSans-Regular.ttf');
//     }
//   </style>
// `;

// const to_inject = `
//   <style type="text/css">
//     @font-face {
//       font-family : Open Sans;
//       src         : url('./OpenSans-Regular.ttf');
//     }
//   </style>
// `;

// const to_inject = `
//   <style type="text/css">
//     @font-face {
//       font-family : Open Sans;
//       src         : url('.\\\\OpenSans-Regular.ttf');
//     }
//   </style>
// `;

// const to_inject = `
//   <style type="text/css">
//     @font-face {
//       font-family : Open Sans;
//       src         : url('OpenSans-Regular.ttf');
//     }
//   </style>
// `;

// const to_inject = `
//   <style type="text/css">
//     @font-face {
//       font-family : Open Sans;
//       src         : OpenSans-Regular.ttf;
//     }
//   </style>
// `;

const to_inject = `
  <style type="text/css">
    @font-face {
      font-family : Bonk;
      src         : url('./Impact.ttf');
    }
  </style>
`;


const font_split_token = 'http://www.w3.org/1999/xlink">';

function inject_css(svg_str) {

  const parts = svg_str.split(font_split_token);
  parts[1]    = to_inject + parts[1];
  const whole = parts.join(font_split_token);

//  return whole;
//  return whole.replace(/font-family="Open Sans"/g, `font-family="'Open Sans'"`);
  // return whole.replace(/font-family="Open Sans"/g, `font-family="Impact"`);
  return whole.replace(/font-family="Open Sans"/g, `font-family="Open Sans, Helvetica Neue, Helvetica, Arial, sans-serif"`);

}





// TODO typeify the formats
async function write_sharp_raster(fname: string, svg_str: string, fmt: string) {

  const buf = await sharp_raster( Buffer.from( svg_str ), fmt );
  fs.writeFileSync(outputTarget(fname, fmt), buf);
  verbose_log(render_result(outputTarget(fname, fmt)));

}





async function output({ fname, data }) {

  verbose_log(render_message(fname));

  const svgo = await fsl_to_svg_string(data),
        svg  = inject_css(svgo),
        dot  = await fsl_to_dot(data),
        sbuf = Buffer.from(svg);

  let written = 0;

  if (app.svg) {
    fs.writeFileSync(outputTarget(fname, 'svg'), svg);
    verbose_log(render_result(outputTarget(fname, 'svg')));
    ++written;
  }

  if (app.dot) {
    fs.writeFileSync(outputTarget(fname, 'dot'), dot);
    verbose_log(render_result(outputTarget(fname, 'dot')));
    ++written;
  }

  // TODO handle tree

  const handles = rasterFormats.map( async thisFmt => {

    if (app[thisFmt]) {
      await write_sharp_raster( fname, svg, thisFmt );
      ++written;
    }

  } );

  await Promise.all(handles);

  if (written === 0) {
    // TODO FIXME there should be error handling here once the actual features
    // are filled out
  }

}





async function run() {

  validate_args();
  console.log(`${col(12, 'jssm-viz cli ')}${col(111, `version ${version}`)}`);

  console.log('');
  verbose_log(`${col(345, "jssm-viz: ")}${col(135, 'targetting ')}${col(24, english_list(present_on_app(imgFormats)))}`);

  const files = glob.sync(app.source);

  if (files.length === 0) {
    console.log(error_text(`no files found matching source glob ${col(441, app.source)}`))
  }

  const o_promises = files.map(fname => ({fname, data: `${fs.readFileSync(fname)}`}))
                          .map(output);

  await Promise.all(o_promises);

  console.log('');
  verbose_log(`${col(345, "jssm-viz: ")}${col(135, `finished successfully`)}`);

}





run();
