import './style.css';
import { run as runFF } from './examples/triangle.ff';

//canvas
const stage = document.getElementById('stage')!;

//Creamos el canvas de WebGL
const canvas = document.createElement('canvas');
stage.replaceChildren(canvas);

runFF(canvas);