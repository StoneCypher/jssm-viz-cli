# jssm-viz-cli
Command line visualizer for [fsl machines](https://fsl.tools/), producing flowcharts in SVG, PNG, DOT, or other formats.

Run the machines with [jssm](https://github.com/StoneCypher/jssm), or visualize within code (instead of at the CLI) with [jssm-viz](https://github.com/StoneCypher/jssm-viz-cli).

[Try it online](https://stonecypher.github.io/jssm-viz-demo/graph_explorer.html)

See the [fsl.tools](https://fsl.tools/) website 😊





<br/><br/>

## Getting started

If you want to use this as a CLI in general, install globally, which creates a command-line wrapper:

```bash
npm install -g jssm-viz-cli
```

And now you can do things like

```bash
jssm-viz -i traffic-light.fsl --png
```

or

```bash
jssm-viz -i traffic-light.fsl --png
```





<br/><br/>

## Scripting

If you'd prefer to use this as a CLI tool in a specific project, install it local to that project instead:

```bash
npm install --save jssm-viz
```

And now you can add things to your scripts block in `package.json` like

```javascript
{
  scripts: {
    "graph-fsl": "jssm-viz -i ./src/fsl/*.fsl --jpeg"
  }
}
```




<br/><br/>

### Install problems with `sharp.js`

The underlying `svg` converter, `sharp.js`,
[only exists for certain platforms](https://sharp.pixelplumbing.com/install#prebuilt-binaries).
This includes most common platforms.

1. If you're on Windows, make sure `node` is 64-bit.
1. On any platform, make sure you're on `node` versions 8, 12, or 13.
1. You'll need [python](https://www.python.org/downloads/)

If any of these are a problem, [the jssm-viz github action](https://github.com/StoneCypher/jssm-viz-action)
can do it for you with no hassle.





<br/><br/>

## Example

Assuming that in the file `traffic-light.fsl` we have the FSL machine

```fsl
machine_name: "Traffic light example";

Green 'next' => Yellow 'next' => Red 'next' => Green;
[Red Yellow Green] ~> Off -> Red;
```

We can run the command

```bash
jssm-viz -s traffic-light.fsl
```

You will produce the following image as SVG, in `traffic-light.svg`:

![](https://github.com/StoneCypher/jssm-viz-cli/blob/master/docs/traffic-light-example.svg)





<br/><br/>

## What if I want a PNG, JPEG, etc?

To write four images and two pieces of source to disk, run

```bash
jssm-viz -s traffic-light.fsl --svg --png --jpeg --webp --dot --tree
```

This will produce `traffic-light.fsl.svg`, `traffic-light.fsl.png`, `traffic-light.fsl.jpeg`, `traffic-light.fsl.webp`, and two special cases: `traffic-light.fsl.dot`, which is the intermediate stage that's run through [graphviz](https://www.graphviz.org/) to produce the final graph, and a parse tree in `jssm`'s internal format, in `json`, and `traffic-light.fsl.tree`, the JSON parsing of the source to the intermediate data state.

If one or more of the format flags are provided, those are the formats which will be produced.  If none are provided, `svg` will be assumed.

There is also a `--jpg`, which produces JPEGs with the extension `.jpg`.  Internally it's treated like a different format, so, if you specify both `--jpg` and `--jpeg`, you'll get two matching images under slightly different filenames.

Images will be placed in the same directory as the source, unless otherwise specified.  This can be relevant if you're using globs to pick up multiple source files, by example.





<br/><br/>

## What if I want to set the render width?

For the non-vector non-source formats, it may be useful to control the render width.  `jssm-viz` will attempt to set a sensible default, but if you prefer to handle it yourself, this would create a 1234 px wide render of the machine `foo`:

```bash
jssm-viz -s foo.fsl --png --width 1234
```





<br/><br/>

## What if I want to render multiple machines?

The source flag `-s` takes a [glob](https://github.com/isaacs/node-glob#glob-primer), which can be a filename, but doesn't have to be.

By example, if you want to render all machines from the current directory downwards into both PNGs and SVGs, try

```bash
jssm-viz -s ./**/*.fsl --png --svg
```

This will produce two images per source file.





<br/><br/>

## What if I want to control where the output goes?

Putting images where the source is isn't always desirable, and when you have a lot of machines, moving them after the render can be tedious.

`jssm-viz-cli` offers three output placement modes:

* In-place
* To directory
* To in-place directory
* To sourcenamed directory




<br/>

### In-place

```bash
jssm-viz -s foo.fsl --inplace
```

`In-place`, the default mode, produces an image with the source's filename and the relevant extension, in the same place that the source was found.





<br/>

### To directory

```bash
jssm-viz -s foo.fsl --todir ./renders
```

`To directory` allows you to specify a single directory that will contain all output. In this example, the directory `renders` would contain output (or be created if it didn't already exist.)

However, sometimes this causes filename conflicts, when different machines in different directories have the same filename.

Two modes help avoid those conflicts:





<br/>

### To in-place directory

```bash
jssm-viz -s foo.fsl --toinplacedir ./renders
```

`To in-place directory` will produce a path tree mimicing the original path tree under the target directory for matching `fsl` files, and place images there.  For example, `a/b/c/foo.fsl` aimed at `renders` will produce `renders/a/b/c/foo.svg`.





<br/>

### To sourcenamed directory

```bash
jssm-viz -s foo.fsl --tosourcenameddir ./renders
```

`To sourcenamed directory` will produce, for `a/b/c/foo.fsl`, `a--b--c--foo.svg`, which allows a flat directory to contain most patterns in a non-colliding easily [slug](https://www.npmjs.com/package/slug)ged way.




<br/><br/>

## What if I want this automated?

Github action coming ***Real Soon Now*** &trade;





<br/><br/>

## What does the SVG code look like?

This is the above example:

```xml
<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN"
 "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">
<!-- Generated by graphviz version 2.40.1 (20161225.0304)
 -->
<!-- Title: G Pages: 1 -->
<svg width="125pt" height="260pt"
 viewBox="0.00 0.00 125.08 260.00" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
<g id="graph0" class="graph" transform="scale(1 1) rotate(0) translate(4 256)">
<title>G</title>
<polygon fill="#eeeeee" stroke="transparent" points="-4,4 -4,-256 121.0798,-256 121.0798,4 -4,4"/>
<!-- n0 -->
<g id="node1" class="node">
<title>n0</title>
<polygon fill="#ffffff" stroke="#000000" points="112.6045,-252 58.6045,-252 58.6045,-216 112.6045,-216 112.6045,-252"/>
<text text-anchor="middle" x="85.6045" y="-229.8" font-family="Times New Roman" font-size="14.00" fill="#000000">Green</text>
</g>
<!-- n1 -->
<g id="node2" class="node">
<title>n1</title>
<polygon fill="#ffffff" stroke="#000000" points="57.3139,-180 -.1049,-180 -.1049,-144 57.3139,-144 57.3139,-180"/>
<text text-anchor="middle" x="28.6045" y="-157.8" font-family="Times New Roman" font-size="14.00" fill="#000000">Yellow</text>
</g>
<!-- n0&#45;&gt;n1 -->
<g id="edge1" class="edge">
<title>n0&#45;&gt;n1</title>
<path fill="none" stroke="#333333" d="M71.221,-215.8314C64.6559,-207.5386 56.7538,-197.557 49.5467,-188.4533"/>
<polygon fill="#333333" stroke="#333333" points="52.1329,-186.0813 43.1817,-180.4133 46.6446,-190.4262 52.1329,-186.0813"/>
<text text-anchor="middle" x="66.0556" y="-210.4314" font-family="Open Sans" font-size="6.00" fill="#000000">next</text>
</g>
<!-- n3 -->
<g id="node4" class="node">
<title>n3</title>
<polygon fill="#ffffff" stroke="#000000" points="102.6045,-36 48.6045,-36 48.6045,0 102.6045,0 102.6045,-36"/>
<text text-anchor="middle" x="75.6045" y="-13.8" font-family="Times New Roman" font-size="14.00" fill="#000000">Off</text>
</g>
<!-- n0&#45;&gt;n3 -->
<g id="edge2" class="edge">
<title>n0&#45;&gt;n3</title>
<path fill="none" stroke="#bbbbbb" d="M93.8171,-215.6609C106.2756,-185.2499 126.9578,-122.7086 111.6045,-72 108.8348,-62.8522 103.9478,-53.8377 98.6509,-45.8725"/>
<polygon fill="none" stroke="#bbbbbb" points="98.6116,-45.818 91.8583,-43.2894 91.595,-36.0831 98.3482,-38.6116 98.6116,-45.818"/>
</g>
<!-- n2 -->
<g id="node3" class="node">
<title>n2</title>
<polygon fill="#ffffff" stroke="#000000" points="102.6045,-108 48.6045,-108 48.6045,-72 102.6045,-72 102.6045,-108"/>
<text text-anchor="middle" x="75.6045" y="-85.8" font-family="Times New Roman" font-size="14.00" fill="#000000">Red</text>
</g>
<!-- n1&#45;&gt;n2 -->
<g id="edge3" class="edge">
<title>n1&#45;&gt;n2</title>
<path fill="none" stroke="#333333" d="M40.4646,-143.8314C45.7674,-135.7079 52.1282,-125.9637 57.9718,-117.0118"/>
<polygon fill="#333333" stroke="#333333" points="61.0493,-118.7003 63.5847,-108.4133 55.1876,-114.8739 61.0493,-118.7003"/>
<text text-anchor="middle" x="35.2992" y="-138.4314" font-family="Open Sans" font-size="6.00" fill="#000000">next</text>
</g>
<!-- n1&#45;&gt;n3 -->
<g id="edge4" class="edge">
<title>n1&#45;&gt;n3</title>
<path fill="none" stroke="#bbbbbb" d="M28.3872,-143.8348C28.7191,-125.2351 30.7999,-95.7649 39.6045,-72 42.925,-63.0375 47.9978,-54.0854 53.2969,-46.121"/>
<polygon fill="none" stroke="#bbbbbb" points="53.3202,-46.0881 53.5306,-38.8801 60.2652,-36.302 60.0547,-43.5101 53.3202,-46.0881"/>
</g>
<!-- n2&#45;&gt;n0 -->
<g id="edge5" class="edge">
<title>n2&#45;&gt;n0</title>
<path fill="none" stroke="#333333" d="M76.8607,-108.0896C78.5609,-132.5727 81.6127,-176.5174 83.6233,-205.4713"/>
<polygon fill="#333333" stroke="#333333" points="80.1535,-206.0288 84.338,-215.7623 87.1367,-205.5438 80.1535,-206.0288"/>
<text text-anchor="middle" x="71.6953" y="-109.8896" font-family="Open Sans" font-size="6.00" fill="#000000">next</text>
</g>
<!-- n2&#45;&gt;n3 -->
<g id="edge6" class="edge">
<title>n2&#45;&gt;n3</title>
<path fill="none" stroke="#cccccc" d="M74.6045,-61.5726C74.6045,-57.3405 74.6045,-52.9622 74.6045,-48.6861"/>
<path fill="none" stroke="#777777" d="M76.6045,-61.5726C76.6045,-57.3405 76.6045,-52.9622 76.6045,-48.6861"/>
<polygon fill="none" stroke="#777777" points="72.1046,-61.8313 75.6045,-71.8314 79.1046,-61.8314 72.1046,-61.8313"/>
<polygon fill="none" stroke="#cccccc" points="75.6046,-48.4133 71.6045,-42.4133 75.6045,-36.4133 79.6045,-42.4132 75.6046,-48.4133"/>
</g>
</g>
</svg>
```

<br/><br/>

Don't mind the mess: this just got started Dec 28 of 2019.  Usable momentarily...
