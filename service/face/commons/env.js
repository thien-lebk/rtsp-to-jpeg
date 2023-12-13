// import nodejs bindings to native tensorflow,
// not required, but will speed up things drastically (python required)
// import '@tensorflow/tfjs-node';
// import '@tensorflow/tfjs-node-gpu';

import * as faceapi from '../lib/face-api.cjs';
import canvas from'canvas'

// implements nodejs wrappers for HTMLCanvasElement, HTMLImageElement, ImageData

// patch nodejs environment, we need to provide an implementation of
// HTMLCanvasElement and HTMLImageElement
const { Canvas, Image, ImageData } = canvas
faceapi.env.monkeyPatch({ Canvas, Image, ImageData })

export { canvas }