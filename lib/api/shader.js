'use strict';
var _ = require('underscore');

var LINKER_ERROR = "Error linking shaders.";
var SHADER_CREATION_ERROR = "Error while creating the shader.";
var COMPILE_ERROR = "Error while compiling the shader code.";

var Shader = function(gl) {

    let program =  gl.createProgram();
    let attrib =   _.partial(gl.getAttribLocation.bind(gl), program);
    let uniform =  _.partial(gl.getUniformLocation.bind(gl), program);
    let attach =   _.partial(gl.attachShader.bind(gl), program);
    let vertexInfo =  gl.getActiveAttrib.bind(gl);
    let uniformInfo = gl.getActiveUniform.bind(gl);
    let _uniforms =   {};
    let TYPE_MAP =    {};
    let VECTOR_MAP =  {};

    const SHADER_TYPE = {
        "shader": gl.FRAGMENT_SHADER,
        "vertex": gl.VERTEX_SHADER
    };

    TYPE_MAP[gl.FLOAT_MAT4] = function(glvar, matrix) {
        gl.uniformMatrix4fv(glvar, false, matrix);
    };

    TYPE_MAP[gl.FLOAT] = gl.uniform1f.bind(gl);

    VECTOR_MAP[gl.FLOAT_VEC2] = 2;
    VECTOR_MAP[gl.FLOAT_VEC3] = 3;
    VECTOR_MAP[gl.FLOAT_VEC4] = 4;

    // compile the glsl source code.
    function compile(source) {

        var shader = gl.createShader(SHADER_TYPE[source.type]);

        if (!shader) {
            throw SHADER_CREATION_ERROR;
            console.error(SHADER_CREATION_ERROR + JSON.stringify(source));
        }

        gl.shaderSource(shader, source.code);
        gl.compileShader(shader);

        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            throw COMPILE_ERROR;
            console.error(COMPILE_ERROR);
        }

        return shader;
    };

    // fetch code from the dom.
    function fetch_code(template) {
        var d = document.createElement('div');
        d.innerHTML = template;

        return [{
            type: 'shader',
            code: d.querySelector('#fragment-shader').innerHTML.trim()
        }, {
            type: 'vertex',
            code: d.querySelector('#vertex-shader').innerHTML.trim()
        }];
    };

    function link() {
        gl.linkProgram(program);

        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            console.error(LINKER_ERROR)
            throw LINKER_ERROR;
        }
    }

    function vertex_info(memo, webGLActiveInfo) {
        var tmp = memo || {};
        var attr = gl.getAttribLocation(program, webGLActiveInfo.name);
        tmp[webGLActiveInfo.name] = {
            value: attr,
            size: VECTOR_MAP[webGLActiveInfo.type],
            length: VECTOR_MAP[webGLActiveInfo.type] * Float32Array.BYTES_PER_ELEMENT
        };

        gl.enableVertexAttribArray(attr);
        return tmp;
    };

    function map_uniform_to_function(memo, webGLActiveInfo) {
        var _map = {};
        _map[webGLActiveInfo.name] = {
            value: gl.getUniformLocation(program, webGLActiveInfo.name),
            fn: TYPE_MAP[webGLActiveInfo.type] || _.identity
        }

        return _.extend(memo, _map);
    };

    function glsl_variables(retrieveAPI, _glvars, _index) {
        var index = _index || 0;
        var glvars = _glvars || [];
        var active = retrieveAPI(program, index);

        if (active !== null) {
            glvars.push(active);
            return glsl_variables(retrieveAPI, glvars, ++index);
        } else
            return glvars;
    };

    var compileAndAttach = _.compose(attach, compile);

    this.create = function(template) {

        var code = fetch_code(template);

        code.forEach(compileAndAttach);

        link();

        _uniforms = _.reduce(glsl_variables(uniformInfo), map_uniform_to_function, {});
    };

    this.use = function() {
        gl.useProgram(program);
    }

    this.set_value = function(glvar, value) {

        var uniform = _uniforms[glvar];
        uniform.fn(uniform.value, value);
    };

    this.vertex_info = function() {
        return glsl_variables(vertexInfo).reduce(vertex_info, {});
    };

};

module.exports = Shader;
