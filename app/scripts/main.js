'use strict';

var gridElement = document.createElement('canvas');
gridElement.id = 'grid';
gridElement.setAttribute('width', '500');
gridElement.setAttribute('height', '500');
document.body.appendChild(gridElement);


var gl = gridElement.getContext('webgl');



gl.viewport(0, 0, 500, 500);

var loadShaders = function() {

    var fragSource = [
        'precision mediump float;',
        'uniform float uAlpha;',
        'void main(void) {',
        '  gl_FragColor = vec4(0.0,0.0,0.0,uAlpha);',
        '}'
    ].join('\n');

    var vertSource = [
            'attribute vec2 aXY;',
            'void main(void) {',
            '   gl_Position = vec4(aXY,0,1.0);',
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

};



var getUniforms = function(shaderProgram) {
    var uniforms =
    {
        uAlpha : gl.getUniformLocation(shaderProgram,'uAlpha')
    };
    return uniforms;
};

var getAttributes = function(shaderProgram) {
    var attributes =
    {
        aXY : gl.getAttribLocation(shaderProgram,'aXY')
    };
    return attributes;
};

var generateBaseGrid = function() {
    var numRows = 40;
    var numCols = 40;

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
    console.log(vertexIndex,vertices.length);
    return vertices;
};

var loadVertexBuffer = function(vertices) {
    var buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    return buffer;
};

var bind = function() {
    gl.enableVertexAttribArray(attributes.aXY);
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.vertexAttribPointer(attributes.aXY, 2, gl.FLOAT, false, 0, 0);
    gl.uniform1f(uniforms.uAlpha, 0.1);

};

var draw = function() {
    gl.clearColor(1,1,1,1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.LINES, 0, 160);
};


var shaderProgram = loadShaders();
var uniforms = getUniforms(shaderProgram);
var attributes = getAttributes(shaderProgram);
var gridVertices = generateBaseGrid();
var vertexBuffer = loadVertexBuffer(gridVertices);


function step() {
    bind();
    draw();
    window.requestAnimationFrame(step);

}

step();
