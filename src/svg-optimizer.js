const convert = require('xml-js');
const fs = require('fs');
const path = require('path');
const logger = require('../logger');
const TreeUtils = require('./tree-utils');

class SvgOptimizer {
  constructor(props) {
    const opts = { ...SvgOptimizer.defaultOptions, ...props };

    this.file = opts.file;
    this.outputDir = opts.outputDir;
    this.debugEnabled = opts.debugEnabled;

    this.alias = path.basename(this.file).replace(/\.svg$/, '');

    this.initialize();
  }

  initialize() {
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir);
      logger.info('Creating directory');
    }

    const svg = fs.readFileSync(this.file, 'utf8');
    this.json = convert.xml2js(svg);

    if (this.debugEnabled) {
      this.writeAsJson(svg);
    }
  }

  run() {
    const gradientMap = this.createGradientMap();

    TreeUtils.traverse(this.json, (node) => {
      const fill = this.parseFill(node, gradientMap);
      if (fill) {
        // eslint-disable-next-line no-param-reassign
        node.attributes.fill = fill;
      }
    });

    TreeUtils.prune(this.json, { name: 'defs' });

    this.writeAsSvg(this.json);
  }

  // eslint-disable-next-line class-methods-use-this
  parseFill(node, gradientMap) {
    if (node.attributes && node.attributes.fill) {
      const fill = node.attributes.fill.match(/^url\(#(.+)\)/);
      if (fill) {
        return gradientMap.get(fill[1]);
      }
    }
    return null;
  }

  // eslint-disable-next-line class-methods-use-this
  parseColorStop(gradient, gradientMap) {
    const stop = TreeUtils.findBy(gradient, { name: 'stop' });
    if (stop.length) {
      return stop[0].attributes['stop-color'];
    }
    const reference = gradient.attributes['xlink:href'];
    if (reference) {
      return gradientMap.get(reference.replace(/^#/, ''));
    }
    return null;
  }

  createGradientMap() {
    return TreeUtils.findBy(this.json, { name: 'linearGradient' })
      .sort((gradient) => (gradient.elements ? -1 : 1))
      .reduce((gradientMap, gradient) => {
        const color = this.parseColorStop(gradient, gradientMap);
        if (color) {
          gradientMap.set(gradient.attributes.id, color);
        }
        return gradientMap;
      }, new Map());
  }

  writeAsJson(svg) {
    fs.writeFileSync(path.resolve(this.outputDir, `${this.alias}.json`), convert.xml2json(svg, { spaces: 2 }));
  }

  writeAsSvg(json) {
    fs.writeFileSync(path.resolve(this.outputDir, `${this.alias}.svg`), convert.js2xml(json, { spaces: 2 }));
  }
}

SvgOptimizer.defaultOptions = {
  file: '',
  outputDir: '',
  debugEnabled: false,
};

module.exports = SvgOptimizer;
