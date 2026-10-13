import './style.css';
import { run as runFF } from './examples/triangle.ff';

// 1. Agarramos el contenedor donde va a vivir el canvas
const stage = document.getElementById('stage')!;

// 2. Creamos el canvas de WebGL y lo inyectamos en el HTML
const canvas = document.createElement('canvas');
stage.replaceChildren(canvas);

// 3. Arrancamos tu programa principal
runFF(canvas);