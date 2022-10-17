/**
 * Der aktuell gültige WebGL Kontext
 * @type {*} Ein WebGL Kontext
 */
var gl = getContext(0.9, 0.9, 0.9, 1);

/**
 * Das Aktuell gültige WebGL Programm
 */
var prog;

/**
 * Die Anzeige für den aktuelle Startgrad
 * @type {HTMLElement} Das definierte span Element
 */
var currentDegree = document.getElementById("value-degree");

/**
 * Die Anzeige für die aktuelle Amplitude
 * @type {HTMLElement} Das definierte span Element
 */
var currentAmplitude = document.getElementById("value-amplitude");

/**
 * Die Anzeige für die aktuelle Auflösung
 * @type {HTMLElement} Das definierte span Element
 */
var currentResolution = document.getElementById("value-resolution");

/**
 * Hält den anfänglichen Startwert der Sinuskurve beim Start
 * @type {number} Der Startwert
 */
var start_val = 0.0; // ==> StartWert

/**
 * Hält den aktuellen Startwert, de im Verlauf der Ausgabe immer weiter
 * anwächst.
 * @type {number} Der aktuelle Startwert
 */
var curentStart_val = 0.0; // ==> StartWert

/**
 * Hält den aktuellen Wert zur Skalierung der Amplitude
 * @type {number} Der Skalierungswert
 */
var y_scale = 100; // ==> Amplitude

/**
 * Hält die aktuelle Auflösung (Wird durch Distanz bestimmt)
 * @type {number} Die Auflösung
 */
var resolution = 4; // ==> Amplitude

/**
 * Array, das die aktuellen Vertices hält
 * @type {Float32Array} Ein neues Float32 Array
 */
vertices = new Float32Array([]);

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
 * Hilfsfunktion, um im Array vertices dynamisch einen neuen Wert
 * hinzuzufügen
 *
 * https://stackoverflow.com/questions/24410418/push-on-float32array
 */
function push() {
    vertices = new Float32Array([...vertices, ...arguments]);
}

/**
 * Setzt den Wert für den der Startwert (float) der Sinuskurve und
 * initiiert das Neuzeichnen
 */
document.getElementById("degree").oninput = () => {
    start_val = parseFloat(document.getElementById("degree").value);
    RefreshWave();
}

/**
 * Setzt den Wert für die Amplitude (float) der Sinuskurve und
 * initiiert das Neuzeichnen
 */
document.getElementById("amplitude").oninput = () => {
    y_scale = parseFloat(document.getElementById("amplitude").value);
    RefreshWave();
}

/**
 * Setzt den Wert für die Auflösung (float) der Sinuskurve und
 * initiiert das Neuzeichnen
 */
document.getElementById("resolution").oninput = () => {
    resolution = parseFloat(document.getElementById("resolution").value);
    RefreshWave();
}

/**
 * Ladet die Seite neu und refreshed die Anwendung
 */
document.getElementById("reset").onclick = () => {
    // Firefox setzt die Werte bei einem einfachen Reload nicht zurück!
    document.getElementById("degree").value = 0;
    document.getElementById("amplitude").value = 100;
    document.getElementById("resolution").value = 4;

    start_val = parseFloat(document.getElementById("degree").value);
    y_scale = parseFloat(document.getElementById("amplitude").value);
    resolution = parseFloat(document.getElementById("resolution").value);
    
    RefreshWave();

    //window.location.reload();
}

/**
 * Baut ein Vertices Array auf Basis der Vorgabewerte
 * @returns {Float32Array|*}
 */
function getVerticesPointsArray() {
    var distance = resolution; // legt über distance die Auflösung fest
    var x_zeichenPos = 1; // legt die nächste Ausgabe fest (unabh. vom Startgrad)
    var y_pos = 0;

    var lastAmplitude = 0
    var bridgeToRight = true;

    curentStart_val = start_val;

    vertices = new Float32Array([]);

    currentDegree.innerText = "Aktueller Startwinkel: " + start_val.toString() + " °";
    currentAmplitude.innerText = "Aktuelle Amplitude: " + y_scale.toString();
    currentResolution.innerText = "Aktuelle Auflösung: " + resolution.toString();

    for (let i = 0; i < 91; i++) {
        let radians = curentStart_val * Math.PI / 180.0;
        y_pos = Math.sin(radians) * y_scale;

        let nextRadians = (curentStart_val + distance) * Math.PI / 180.0;
        let nextY_pos = Math.sin(nextRadians) * y_scale;

        /*
        Ausführliche Angabe der nachfolgenden Verzweigung...
        if (y_pos < nextY_pos && y_pos > 0) {
            bridgeToRight = true;
        } else if (y_pos > nextY_pos && y_pos > 0) {
            bridgeToRight = false;
        } else if (y_pos < nextY_pos && y_pos < 0) {
            bridgeToRight = false;
        } else if (y_pos > nextY_pos && y_pos < 0) {
            bridgeToRight = true;
        }
        */

        if ((y_pos < nextY_pos && y_pos > 0) || (y_pos > nextY_pos && y_pos < 0)) {
            bridgeToRight = true;
        } else {
            bridgeToRight = false;
        }

        lastAmplitude = y_pos;

        // Add start Point 1th line
        push(x_zeichenPos);
        push(0);
        //Add end Point 1th line
        push(x_zeichenPos);
        push(y_pos);

        if (bridgeToRight) {
            //Add start Point 2th line
            push(x_zeichenPos);
            push(y_pos);
            //Add end Point 2th line
            push((x_zeichenPos) + distance);
            push(y_pos);
        } else {
            //Add start Point 2th line
            push(x_zeichenPos);
            push(y_pos);
            //Add end Point 2th line
            push((x_zeichenPos) - distance);
            push(y_pos);
        }

        curentStart_val = curentStart_val + distance; // legt den Grad für diee nächste Berechnung fest

        // Wichtiger Sonderfall: Der Graph schneidet die Nulllinie. Für den hier verwendeten
        // Algorithmus darf in diesen Fall die Zeichenposition nicht verändert werden. In allen
        // anderen Fällen muss sie um den Wert von Distance erhöht werden.
        if ((y_pos > 0.0 && nextY_pos < 0.0) || (y_pos < 0.0 && nextY_pos > 0.0) || y_pos === 0) {
            x_zeichenPos = x_zeichenPos;
        } else {
            x_zeichenPos = x_zeichenPos + distance;
        }
    }

    return vertices;
}

/**
 * Initialisiert und konfiguriert die WebGL Anwendung und definiert die Shader und
 * das Programm. Es wird ein gültiger WebGL Kontext erwartet.
 */
function iniWebGLApp() {
    // vertex shader
    var vsSource = '' +
        'attribute vec2 pos;' +
        'void main(){' +
        'gl_Position = vec4(pos, 0, 365);' +
        'gl_PointSize = 1.0; ' +
        '}';

    var vsShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vsShader, vsSource);
    gl.compileShader(vsShader);

    // fragment shader
    fsSouce =
        'void main() { ' +
        'gl_FragColor = vec4(1,0,0,1); ' +
        '}';

    var fsShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fsShader, fsSouce);
    gl.compileShader(fsShader);

    // create program and link shader to program
    prog = gl.createProgram();
    gl.attachShader(prog, vsShader);
    gl.attachShader(prog, fsShader);
    gl.linkProgram(prog);
    gl.useProgram(prog);

    // start drawing
    RefreshWave();
}

/**
 * Belegt den Ausgabebuffer des aktuellen WebGL Programms mit den aktuellen Daten neu und zeichnet die
 * Ausgabe. Das WebGL Programm muss zuvor bereits initialisiert und konfiguriert worden sein.
 */
function RefreshWave() {
    // Aktuelle Punkte berechnen und zurückgeben lassen
    var verticesPointsArray = getVerticesPointsArray();

    // Buffer für die Punkte erzeugen und laden
    var vbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, verticesPointsArray, gl.STATIC_DRAW);

    // posAttrib erzeugen und verwenden
    var posAttrib = gl.getAttribLocation(prog, 'pos');
    gl.vertexAttribPointer(posAttrib, 2, gl.FLOAT, true, 0, 0);
    gl.enableVertexAttribArray(posAttrib);

    // Ausgabe mit drawArray
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.LINES, 0, verticesPointsArray.length / 2);
}

/**
 * Startet die WebGL Anwendung und erste Ausgabe der Grafik
 */
iniWebGLApp();
