'use strict';

var tmpl = require('../shaders/simple.html');
var Canvas = require('./api/canvas');
var Render = require('./api/render');
var Buffer = require('./api/buffer');
var Shader = require('./api/shader');
var Texture = require('./api/texture');

var canvas = new Canvas({
    fullscreen: true,
    element: document.getElementById('webgl-div')
});

var shader = new Shader(canvas.getWebGL());
var buffer = new Buffer(canvas.getWebGL());

shader.create(tmpl());
