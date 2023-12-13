import * as faceapi from './lib/face-api.cjs';
import { canvas, faceDetectionNet, faceDetectionOptions } from './commons/index.js';
import fs from'fs';
import path from'path';


async function run(img) {

  await faceDetectionNet.loadFromDisk('./models')
  const referenceImage = await canvas.loadImage(img)

  // const img = await canvas.loadImage('../images/bbt1.jpg')
  const detections = await faceapi.detectAllFaces(referenceImage, faceDetectionOptions)

  const out = faceapi.createCanvasFromMedia(referenceImage)
  faceapi.draw.drawDetections(out, detections)
  console.log('done, saved results to out/faceDetection.jpg')
  return out.toBuffer('image/jpeg')
}

function loadImageFromLocal(imagePath) {
  const absolutePath = path.resolve(__dirname, imagePath); // Assuming imagePath is a relative path from the current file

  try {
    const imageBuffer = fs.readFileSync(absolutePath);
    // Use the imageBuffer for further processing (e.g., converting to HTMLImageElement or other operations)
    return imageBuffer;
  } catch (error) {
    console.error('Error reading the image file:', error);
    return null;
  }
}
function getFaceImageUri(className, idx) {
  const imagePath = `./service/face/images/${className}/${className}${idx}.jpg`;

  return imagePath
}

function loadLabeledImages() {
  const labels = ['thien']
  const numImagesForTraining = 3;
  return Promise.all(
    labels.map(async label => {
      const descriptions = []
      for (let i = 1; i <= 2; i++) {
        for (let i = 1; i < (numImagesForTraining + 1); i++) {
          // const img = await faceapi.fetchImage(getFaceImageUri(label, i))
          const img = await canvas.loadImage(getFaceImageUri(label, i))

          const detections = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor()
          descriptions.push(detections.descriptor)
        }
      }

      return new faceapi.LabeledFaceDescriptors(label, descriptions)
    })
  )
}

async function runFaceRecognition(img) {
  await faceDetectionNet.loadFromDisk('./models')
  await faceapi.nets.faceLandmark68Net.loadFromDisk('./models')
  await faceapi.nets.faceRecognitionNet.loadFromDisk('./models')

  const referenceImage = await canvas.loadImage(img)
  
  const labeledFaceDescriptors = await loadLabeledImages()
  const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors, 0.6)


  const detections = await faceapi.detectAllFaces(referenceImage)
  const results = detections.map(d => faceMatcher.findBestMatch(d.descriptor))
  console.log(results);
  return results
}



export {
  run,
  runFaceRecognition
};