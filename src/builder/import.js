'use strict';

import $p from './metadata';

const debug = require('debug')('wb:paper');

import paper from 'paper/dist/paper-core.js';

debug('required');

class Editor extends paper.PaperScope {

  constructor(format = 'png') {

    super();

    /**
     * Собственный излучатель событий для уменьшения утечек памяти
     */
    this.eve = new (Object.getPrototypeOf($p.md.constructor))();

    this._undo = {
      clear() {
      },
      save_snapshot() {
      },
    };

    // уточняем константы
    consts.tune_paper(this.settings);

    // создаём экземпляр проекта Scheme
    this.create_scheme(format);
  }

  set_text() {
  }

  create_scheme(format = 'png') {
    const _canvas = paper.createCanvas(480, 480, format); // собственно, канвас
    _canvas.style.backgroundColor = '#f9fbfa';
    this.setup(_canvas);
    new Scheme(_canvas, this, true);
  }
}

$p.Editor = Editor;

