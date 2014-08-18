'use strict';

var Grid = function(props) {
    this._props   = props;
    this.element  = this._createElement();
    this._gl      = this._getContext();

    this._initGL(this._generateBaseGridVertices());
    this._setSize()

    this._draw();
};

Grid.prototype = {

    _shaderProgram : null,

    _uniforms      : null,

    _attributes    : null,

    _vertexBuffer  : null,

    _setSize : function() {
        this.element.setAttribute('width', this._props.width);
        this.element.setAttribute('height', this._props.height);
        this._gl.viewport(0, 0, this._props.width, this._props.height);
    },

    _setCellSize : function() {
        this._gl.uniform2f(this._uniforms.uScale, this._props.cellWidth, this._props.cellHeight);
    },

    _setColor : function() {

    },

    _setOffset : function() {
        this._gl.uniform2f(this._uniforms.uOffset, this._props.offsetX, this._props.offsetY);
    },

    _setAlpha : function() {
        this._gl.uniform1f(this._uniforms.uAlpha, this._props.alpha);
    },

    _setLineColor : function() {
        this._gl.uniform4fv(this._uniforms.uLineColor, new Float32Array(this._props.lineColor))
    },

    setProps : function(changeProps) {
        console.log(this)
        for (var changeProp in changeProps) {
            if(this._props.hasOwnProperty(changeProp)) {
                this._props[changeProp] = changeProps[changeProp];
                switch (changeProp) {
                    case 'width'  :
                    case 'height' :
                        this._setSize();
                        break;
                    case 'cellWidth' :
                    case 'cellHeight' :
                        this._setCellSize();
                        break;
                    case 'lineColor':
                    case 'divisionColor':
                        this._setColor();
                        break;
                    case 'offsetX':
                    case 'offsetY':
                        this._setOffset();
                        break;
                    case 'alpha':
                        this._setAlpha();
                        break

                }
            }
        }
    },

    _createElement : function () {
        return document.createElement('canvas');
    },

    _getContext : function() {
        return this.element.getContext('webgl');
    },

    _generateBaseGridVertices : function() {
        var numRows = 100;
        var numCols = 100;

        var rowStep = 2 / numRows;
        var colStep = 2 / numCols;

        var vertices = new Float32Array((numRows + numCols) * 4);
        var vertexIndex = 0;

        var row = 0;
        while (row < numRows) {
            var y = vertices[vertexIndex + 1] = row * rowStep;
            vertices[vertexIndex] = -1;
            vertices[vertexIndex + 1] = y - 1;
            vertices[vertexIndex + 2] = 1;
            vertices[vertexIndex + 3] = y- 1;
            row ++;
            vertexIndex += 4;

        }

        var col = 0;
        while (col < numCols) {
            var x = vertices[vertexIndex + 1] = col * colStep;
            vertices[vertexIndex] = x -1;
            vertices[vertexIndex + 1] = -1;
            vertices[vertexIndex + 2] = x -1;
            vertices[vertexIndex + 3] = 1;
            col ++;
            vertexIndex += 4;
        }
        return vertices;
    },

    _initGL : function(gridVertices) {
        this._shaderProgram = this._loadShaders();
        this._uniforms = this._getUniforms(this._shaderProgram);
        this._attributes = this._getAttributes(this._shaderProgram);
        console.log(this._attributes)
        this._vertexBuffer = this._loadVertexBuffer(gridVertices);
        this._bind();
    },


    _loadShaders : function() {
        var gl = this._gl;
        var fragSource = [
            'precision mediump float;',
            'uniform   float uAlpha;',
            'uniform   vec4 uLineColor;',

            'void main(void) {',
            '  gl_FragColor = uLineColor;',
            '  gl_FragColor.a *= uAlpha;',
            ' int evenRow = int(mod(gl_FragCoord.y / 15.0, 2.0));',
            '  if( int(mod(gl_FragCoord.x / 15.0, 2.0)) == evenRow ){',
            '    gl_FragColor = vec4(1.0,0.0,0.0,1.0);',
            '  }',
            '  else{',
            '    gl_FragColor = vec4(0.0,1.0,1.0,1.0);',
            ' }',
            '}'
        ].join('\n');

        var vertSource = [
            'attribute vec2 aXY;',
            'uniform   vec2 uScale;',
            'uniform   vec2 uOffset;',
            'void main(void) {',
            '   gl_Position = vec4((aXY * uScale) + uOffset, 0, 1.0);',
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

    _getUniforms : function(shaderProgram) {
        return  {
                uAlpha     : this._gl.getUniformLocation(shaderProgram,'uAlpha'),
                uLineColor : this._gl.getUniformLocation(shaderProgram,'uLineColor'),
                uScale     : this._gl.getUniformLocation(shaderProgram,'uScale'),
                uOffset    : this._gl.getUniformLocation(shaderProgram,'uOffset')
            };
    },

    _getAttributes : function(shaderProgram) {
        console.log(shaderProgram)
        return  {
                aXY : this._gl.getAttribLocation(shaderProgram,'aXY')
            };
    },

    _loadVertexBuffer : function(gridVertices) {
        var gl = this._gl;
        var buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, gridVertices, gl.STATIC_DRAW);
        return buffer;
    },

    _bind : function() {
        var gl = this._gl;
        gl.enableVertexAttribArray(this._attributes.aXY);
        gl.bindBuffer(gl.ARRAY_BUFFER, this._vertexBuffer);
        gl.vertexAttribPointer(this._attributes.aXY, 2, gl.FLOAT, false, 0, 0);
        this._setCellSize();
        this._setAlpha();
        this._setLineColor();
        this._setOffset();

        //gl.uniform1f(this._uniforms.uAlpha, this._props.alpha);

    },

    _draw : function() {
        var gl = this._gl;
        gl.clearColor(1,1,1,1);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.drawArrays(gl.LINES, 0, 400);
    }

}

var props = {
    width:800,
    height:800,
    cellWidth:2,
    cellHeight:2,
    lineColor: [0,0,0,1],
    divisionColor: [1,0,0,1],
    alpha:.2,
    offsetX:1,
    offsetY:1
}

var grid = new Grid(props);
document.body.appendChild(grid.element);



