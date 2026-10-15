import { ATTRIB, createFixedFunction, LIGHTING } from '../vendor/ff/ff';
import { CANVAS_SIZE, CLEAR_COLOR } from './shared';

function getContext(canvas: HTMLCanvasElement): WebGL2RenderingContext {
  const gl = canvas.getContext('webgl2');
  if (!gl) throw new Error('WebGL2 is not available.');
  return gl;
}

function createVertexBuffer(gl: WebGL2RenderingContext, data: Float32Array): WebGLBuffer {
  const buffer = gl.createBuffer()!;
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
  return buffer;
}

function createVAO(gl: WebGL2RenderingContext, buffer: WebGLBuffer): WebGLVertexArrayObject {
  const vao = gl.createVertexArray()!;
  gl.bindVertexArray(vao);
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.enableVertexAttribArray(ATTRIB.POSITION);
  gl.vertexAttribPointer(ATTRIB.POSITION, 3, gl.FLOAT, false, 0, 0);
  gl.bindVertexArray(null);
  return vao;
}

function createIndexBuffer(gl: WebGL2RenderingContext, data: Uint16Array): WebGLBuffer {
  const buffer = gl.createBuffer()!;
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, data, gl.STATIC_DRAW);
  return buffer;
}

function createIndexedVAO(gl: WebGL2RenderingContext, vBuffer: WebGLBuffer, iBuffer: WebGLBuffer): WebGLVertexArrayObject {
  const vao = gl.createVertexArray()!;
  gl.bindVertexArray(vao);
  gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
  gl.enableVertexAttribArray(ATTRIB.POSITION);
  gl.vertexAttribPointer(ATTRIB.POSITION, 3, gl.FLOAT, false, 0, 0);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iBuffer);
  gl.bindVertexArray(null);
  return vao;
}

function setupState(gl: WebGL2RenderingContext, canvas: HTMLCanvasElement): void {
  canvas.width = CANVAS_SIZE;
  canvas.height = CANVAS_SIZE;
  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor(...CLEAR_COLOR);
}


// Genera los vertices en sentido antihorario (CCW) para usar con TRIANGLE_FAN
function generarPoligono(radio: number, segmentos: number): Float32Array {
  const posiciones = [];
  
  // vertice 0: El centro exacto (X=0, Y=0, Z=0)
  posiciones.push(0.0, 0.0, 0.0); 
  
  // Generamos los vertices del borde dando una vuelta
  for (let i = 0; i <= segmentos; i++) {
    const angulo = (i / segmentos) * Math.PI * 2.0;
    posiciones.push(radio * Math.cos(angulo), radio * Math.sin(angulo), 0.0);
  }
  return new Float32Array(posiciones);
}

export function run(canvas: HTMLCanvasElement): void {
  const gl = getContext(canvas);
  const ff = createFixedFunction(gl, { debug: true });
  ff.disable(LIGHTING);
  setupState(gl, canvas);

  // geometria 
  
  //triángulo (3 vértices)
  const geoTriangulo = new Float32Array([
     0.0,  0.5, 0.0, 
    -0.5, -0.5, 0.0, 
     0.5, -0.5, 0.0  
  ]);
  const vaoTriangulo = createVAO(gl, createVertexBuffer(gl, geoTriangulo));

  //cuadrado (4 vértices + 6 índices)
  const geoCuadrado = new Float32Array([
    -0.5,  0.5, 0.0, 
    -0.5, -0.5, 0.0, 
     0.5,  0.5, 0.0, 
     0.5, -0.5, 0.0  
  ]);
  const indicesCuadrado = new Uint16Array([0, 1, 2, 2, 1, 3]);
  const vaoCuadrado = createIndexedVAO(gl, createVertexBuffer(gl, geoCuadrado), createIndexBuffer(gl, indicesCuadrado));

  //hexagono (6 segmentos -> 8 vértices en Abanico)
  const geoHexagono = generarPoligono(0.5, 6);
  const vaoHexagono = createVAO(gl, createVertexBuffer(gl, geoHexagono));

  const SEGMENTS = 64;
  //circulo (64 segmentos -> 66 vértices en Abanico)
  const geoCirculo = generarPoligono(0.5, SEGMENTS);
  const vaoCirculo = createVAO(gl, createVertexBuffer(gl, geoCirculo));
const numVerticesCirculo = geoCirculo.length / 3;
  // estado
  let indiceForma = 0; 
  let indiceColor = 0; 

  const coloresRGB: [number, number, number, number][] = [
    [1.0, 0.0, 0.0, 1.0], // Rojo
    [0.0, 1.0, 0.0, 1.0], // Verde
    [0.0, 0.0, 1.0, 1.0]  // Azul
  ];

  const nombresFormas = ['triangle', 'quad', 'hexagon', 'circle'];
  const nombresColores = ['red', 'green', 'blue'];

  const btnShape = document.getElementById('btnShape') as HTMLButtonElement;
  const btnColor = document.getElementById('btnColor') as HTMLButtonElement;

  // dibujo 
  function drawEscena() {
    gl.clear(gl.COLOR_BUFFER_BIT);
    
    // color
    ff.setColor(coloresRGB[indiceColor]);

    // seleccion del dibujo 
    if (indiceForma === 0) {
      gl.bindVertexArray(vaoTriangulo);
      ff.drawArrays(gl.TRIANGLES, 0, 3);
    } 
    else if (indiceForma === 1) {
      gl.bindVertexArray(vaoCuadrado);
      ff.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0); 
    } 
    else if (indiceForma === 2) {
      gl.bindVertexArray(vaoHexagono);
      // 8 vértices totales para el hexágono
      ff.drawArrays(gl.TRIANGLE_FAN, 0, 8); 
    } 
    else if (indiceForma === 3) {
      gl.bindVertexArray(vaoCirculo);
      // 66 vértices totales para el círculo
      ff.drawArrays(gl.TRIANGLE_FAN, 0, numVerticesCirculo); 
    }
  }

  //botones pagina 
  btnShape.addEventListener('click', () => {
    indiceForma = (indiceForma + 1) % 4; 
    btnShape.innerText = `Shape: ${nombresFormas[indiceForma]}`;
    drawEscena();
  });

  btnColor.addEventListener('click', () => {
    indiceColor = (indiceColor + 1) % 3; 
    btnColor.innerText = `Color: ${nombresColores[indiceColor]}`;
    drawEscena();
  });

  // Render inicial
  drawEscena();
}