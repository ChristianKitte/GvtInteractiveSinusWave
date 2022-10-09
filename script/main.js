/**
 * Erzeugt einen WebGL Kontext mit dem als RGB übergebenen Farbwert als Hintergrund
 * und gibt diesen zurück. Zusätzlich wird der Ausgabebereich vergrößert
 *
 * http://www.ibesora.me/creating-a-webgl2-canvas/
 *
 * @param redVal Der Rotwert
 * @param greenVal Der Grünwert
 * @param blueVal Der Blauwert
 * @param alphaVal Der Aplhawert
 * @returns {*} Einen WebGL Kontext
 */
function getContext(redVal, greenVal, blueVal, alphaVal) {
    // Get the WebGL context
    var canvas = document.getElementById('canvas');

    var gl = canvas.getContext('webgl2');
    gl.viewportWidth = canvas.width;
    gl.viewportHeight = canvas.height;
    gl.viewport(-600, -100, gl.canvas.width + 400, gl.canvas.height + 200);

    gl.clearColor(0.9, 0.9, 0.9, 1);//RGB der Hintergrundfarbe

    return gl;
}

/**
 * Array, das die aktuellen Punkt hält
 * @type {Float32Array}
 */
vertices = new Float32Array([]);

/**
 * Hilfsfunktion, um im Array vertices dynamisch einen neuen Wert
 * hinzuzufügen
 *
 * https://stackoverflow.com/questions/24410418/push-on-float32array
 */
function push() {
    vertices = new Float32Array([...vertices, ...arguments]);
}

/**
 * Hält den Wert für den Start der Sinuskurve
 * @type {number}
 */
var start_val = 0; // ==> StartWert

/**
 * Setzt den Wert für den der Startwert der
 * @param obj
 */
document.getElementById("degree").oninput = (obj) => {
    start_val = document.getElementById("degree").value;
    drawWave();
}

/**
 * Hält den Wert für die Amplitude
 * @type {number}
 */
var y_scale = 100; // ==> Amplitude

/**
 * Setzt den Wert für die Amplitude
 * @param obj
 */
document.getElementById("amplitude").oninput = (obj) => {
    y_scale = document.getElementById("amplitude").value;
    drawWave();
}

/**
 * Baut ein Vertices Array auf Basis der Vorgabewerte
 * @returns {Float32Array|*}
 */
function getVerticesPointsArray() {
    var distance = 1; // ==> Zoom
    var x_pos = 1;
    var y_pos = 0;

    vertices = new Float32Array([]);

    for (let i = 1.0; i < 361; i++) {
        start_val++;

        let radians = start_val * Math.PI / 180.0;
        y_pos = Math.sin(radians) * y_scale;

        // Add start Point 1th line
        push(x_pos);
        push(0);
        //Add end Point 1th line
        push(x_pos);
        push(y_pos);
        //Add start Point 2th line
        push(x_pos);
        push(y_pos);
        //Add end Point 2th line
        push((x_pos) + distance);
        push(y_pos);

        x_pos = (x_pos) + distance;
    }

    return vertices;
}

/**
 * Seichnet die Sinuskuve mit Hilfe von STRIPES Objekten
 */
function drawWave() {
    var gl = getContext(0.9, 0.9, 0.9, 1);

    // Compile a vertex shader
    var vsSource = '' +
        'attribute vec2 pos;' +
        'void main(){' +
        'gl_Position = vec4(pos, 0, 365);' +
        'gl_PointSize = 1.0; ' +
        '}';

    var vsShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vsShader, vsSource);
    gl.compileShader(vsShader);

    // Compile a fragment shader
    fsSouce =
        'void main() { ' +
        'gl_FragColor = vec4(1,0,0,1); ' +
        '}';

    var fsShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fsShader, fsSouce);
    gl.compileShader(fsShader);

    // Link together into a program
    var prog = gl.createProgram();
    gl.attachShader(prog, vsShader);
    gl.attachShader(prog, fsShader);
    gl.linkProgram(prog);
    gl.useProgram(prog);

    // Aktuelle Punkte berechnen und zurückgeben lassen
    var verticesPointsArray = getVerticesPointsArray();

    // Buffer für die Punkte erzeugen und laden
    var vbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, verticesPointsArray, gl.STATIC_DRAW);

    // Buffer für die Punkte erzeugen und laden
    var posAttrib = gl.getAttribLocation(prog, 'pos');
    gl.vertexAttribPointer(posAttrib, 2, gl.FLOAT, true, 0, 0);
    gl.enableVertexAttribArray(posAttrib);

    // Ausgabe mit drawElements statt drawArray
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.LINES, 0, verticesPointsArray.length);
}

/**
 * Startet die erste Ausgabe der Grafik
 */
drawWave();
