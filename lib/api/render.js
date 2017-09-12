'use strict';

var _ = require('underscore');

/*
  Render(opts, viewport)

  opts
    gl: WebGL browser object,
    shader: vr8/Shader object,

    viewport{
      @top,
      @left,
      @right:  viewport width,
      @bottom: viewport height
    }
*/

var Render = function(opts, viewport) {
    var gl = opts.gl;
    var shader = opts.shader;
    var camera = opts.camera;

    if (_.isUndefined(opts.gl))     throw 'gl library is missing!!.';
    if (_.isUndefined(opts.shader)) throw 'The shader is missing!!.';
    if (_.isUndefined(opts.camera)) throw 'The camera matrix is missing!!.';

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.viewport(viewport.left, viewport.top, viewport.right, viewport.bottom);

    this.clear = function() {
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        return this;
    };

    this.prepare = function(model, loadBuffers) {
        shader.set_value('MV', camera);
        shader.set_value('P', model);

        if (loadBuffers)
          loadBuffers();

        return this;
    };

    /*
      Draw the stuff...
    */
    this.draw = function(type,  sides) {
      gl.drawArrays(gl[type], 0, sides);
    };
};


module.exports = Render;
