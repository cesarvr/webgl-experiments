'use strict';

const _ = require('underscore');

var Buffer = function(gl) {

    var buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);

    function stride(memo, attrib) {
        return attrib.size + memo;
    };

    function wrap_function(attribs){
      var len = attribs.length;
      return function(){
        for(var i=0; i<len; i++)
          attribs[i]();
      };
    };

    function vaptr_wrapper(attr, size, stride, offset) {
        stride *= Float32Array.BYTES_PER_ELEMENT;

        return function() {
            gl.vertexAttribPointer(
                attr,
                size,
                gl.FLOAT,
                false,
                stride,
                offset );
        };
    };

    //
    //  one package is equivalent to one vertex example:
    //
    //            position    texture
    //  vertex = [x, y, z, w]  [u,v]  <= package
    //
    //  attrib pointer size for position is 4
    //  stride for position is 6
    //  offset for position is 0
    //
    //  attrib pointer size for texture is 2
    //  stride for position is 6
    //  offset for position is 4
    //
    //  vertex_data
    //   @attrib: shader vertex attribute pointer.
    //   @size: attribute length
    //   @stride: package size
    //   @offset: position inside the package.

    this.prepare = function(attributes, _padding) {
        var _stride = _.reduce(attributes, stride, 0);
        var attrs = attributes;
        var attrs_batch = [];
        var offset = 0;
        var padding = _padding || ['position', 'colors', 'texture'];

        for (var i = 0; i < padding.length; i++) {
            var key = padding[i];
            var _vc = vaptr_wrapper(attrs[key].value,
                attrs[key].size,
                _stride,
                offset);

            offset += attrs[key].length;
            attrs_batch.push(_vc);
        }

        this.sides = this.len / _stride;
        return wrap_function(attrs_batch);
    };

    // Cache a matrix of floating points in to opengl ARRAY
    this.save = function(vertex) {
        gl.bufferData(
            gl.ARRAY_BUFFER,
            new Float32Array(vertex),
            gl.DYNAMIC_DRAW
        );

        this.len = vertex.length;
        return this;
    };
};



module.exports = Buffer;
