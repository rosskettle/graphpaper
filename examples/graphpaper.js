var Grid = function(userProps) {
  if (!(this instanceof Grid)){
    return new Grid(userProps);
  }

  this._props = {
    id          : 'grid',
    width       : 600,
    height      : 800,
    cellWidth   : 13,
    cellHeight  : 13,
    minorColor  : [0, 1, 0.0, 0.2],
    majorColor  : [0, 1, 0.0, 0.6],
    majorRows   : 12,
    majorCols   : 12,
    alpha       : 1,
    offsetX     : 10,
    offsetY     : 1
  }

  if (userProps) {
    for (var userProp in userProps) {
      if (this._props.hasOwnProperty(userProp)) {
        this._props[userProp] = userProps[userProp];
      }
    }
  }

  this.element = this._createElement(this._props.id);
  this._gl = this._getContext();

  this._initGL(this._quadVertices());
  this._setSize();
  this.draw();
};

Grid.prototype = {

  draw: function() {
    var gl = this._gl;
    gl.clearColor(1, 1, 1, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  },


  setProps: function(changeProps) {
    for (var changeProp in changeProps) {
      if (this._props.hasOwnProperty(changeProp)) {
        this._props[changeProp] = changeProps[changeProp];
        switch (changeProp) {
          case 'width':
          case 'height':
            this._setSize();
            break;
          case 'cellWidth':
          case 'cellHeight':
            this._setMinor();
            break;
          case 'majorRows':
          case 'majorCols':
            this._setMajor();
            break;
          case 'minorColor':
          case 'majorColor':
            this._setLineColors();
            break;
          case 'offsetX':
          case 'offsetY':
            this._setOffset();
            break;
          case 'alpha':
            this._setAlpha();
            break;
        }
      }
    }
    this.draw();
  },


  _shaderProgram: null,

  _uniforms: null,

  _attributes: null,

  _vertexBuffer: null,

  _setSize: function() {
    this.element.setAttribute('width', this._props.width);
    this.element.setAttribute('height', this._props.height);
    this._gl.viewport(0, 0, this._props.width, this._props.height);
  },

  _setMinor: function() {
    this._gl.uniform2f(this._uniforms.uMinor, this._props.cellWidth, this._props.cellHeight);
    this._setMajor();
  },

  _setOffset: function() {
    this._gl.uniform2f(this._uniforms.uOffset, this._props.offsetX, this._props.offsetY);
  },

  _setAlpha: function() {
    this._gl.uniform1f(this._uniforms.uAlpha, this._props.alpha);
  },

  _setLineColors: function() {
    this._gl.uniform4fv(this._uniforms.uMinorColor, new Float32Array(this._props.minorColor));
    this._gl.uniform4fv(this._uniforms.uMajorColor, new Float32Array(this._props.majorColor));
  },

  _setMajor: function() {
    var major = new Float32Array([this._props.majorCols * this._props.cellWidth, this._props.majorRows * this._props.cellHeight]);
    this._gl.uniform2fv(this._uniforms.uMajor, major);
  },

  _createElement: function(id) {
    var el = document.createElement('canvas');
    el.id = id
    return el

  },

  _getContext: function() {
    return this.element.getContext('webgl');
  },

  _quadVertices: function() {
    return new Float32Array([
      1.0, 1.0, -1.0, 1.0,
      1.0, -1.0, -1.0, -1.0
    ]);
  },

  _initGL: function(gridVertices) {
    this._shaderProgram = this._loadShaders();
    this._uniforms = this._getUniforms(this._shaderProgram);
    this._attributes = this._getAttributes(this._shaderProgram);

    this._vertexBuffer = this._loadVertexBuffer(gridVertices);
    this._bind();
  },


  _loadShaders: function() {
    var gl = this._gl;
    var fragSource = [
      'precision mediump float;',
      'uniform float uAlpha;',
      'uniform vec2 uMinor;',
      'uniform vec2 uMajor;',
      'uniform vec4 uMinorColor;',
      'uniform vec4 uMajorColor;',
      'uniform vec2 uOffset;',

      'void main(void) {',
      '  offsetCoord = gl_FragCoord + uOffset;',
      '  if ((int(mod(gl_FragCoord.x, uMinor.x)) != 0) && (int(mod(gl_FragCoord.y, uMinor.y)) != 0)) {',
      '    discard;',
      '  } else {',
      '    if ((int(mod(gl_FragCoord.x, uMajor.x)) != 0) && (int(mod(gl_FragCoord.y, uMajor.y)) != 0)) {',
      '      gl_FragColor = uMinorColor;',
      '    }  else {',
      '      gl_FragColor = uMajorColor;',
      '    }',
      '  }',
      '  gl_FragColor.a *= uAlpha;',
      '}'
    ].join('\n');

    var vertSource = [
      'attribute vec2 aXY;',
      'void main(void) {',
      '   gl_Position = vec4(aXY, 0, 1.0);',
      '}'
    ].join('\n');

    var vertShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertShader, vertSource);
    gl.compileShader(vertShader);

    if (!gl.getShaderParameter(vertShader, gl.COMPILE_STATUS)) {
      throw new Error('Vertex Shader compilation failed.');
    }

    var fragShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragShader, fragSource);
    gl.compileShader(fragShader);

    if (!gl.getShaderParameter(fragShader, gl.COMPILE_STATUS)) {
      throw new Error('Fragment Shader compilation failed.');
    }

    var shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, fragShader);
    gl.attachShader(shaderProgram, vertShader);
    gl.linkProgram(shaderProgram);
    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
      throw new Error('Shaders failed to link');
    }

    gl.useProgram(shaderProgram);
    return shaderProgram;

  },

  _getUniforms: function(shaderProgram) {
    return {
      uAlpha: this._gl.getUniformLocation(shaderProgram, 'uAlpha'),
      uMinorColor: this._gl.getUniformLocation(shaderProgram, 'uMinorColor'),
      uMajorColor: this._gl.getUniformLocation(shaderProgram, 'uMajorColor'),
      uMajor: this._gl.getUniformLocation(shaderProgram, 'uMajor'),
      uMinor: this._gl.getUniformLocation(shaderProgram, 'uMinor'),
      uOffset: this._gl.getUniformLocation(shaderProgram, 'uOffset')
    };
  },

  _getAttributes: function(shaderProgram) {
    return {
      aXY: this._gl.getAttribLocation(shaderProgram, 'aXY')
    };
  },

  _loadVertexBuffer: function(gridVertices) {
    var gl = this._gl;
    var buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, gridVertices, gl.STATIC_DRAW);
    return buffer;
  },

  _bind: function() {
    var gl = this._gl;
    gl.enableVertexAttribArray(this._attributes.aXY);
    gl.bindBuffer(gl.ARRAY_BUFFER, this._vertexBuffer);
    gl.vertexAttribPointer(this._attributes.aXY, 2, gl.FLOAT, false, 0, 0);
    this._setMinor();
    this._setMajor();
    this._setAlpha();
    this._setLineColors();
    this._setOffset();
  },

};
