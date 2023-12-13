import * as faceapi from '../lib/face-api.cjs';

import { canvas, faceDetectionNet, faceDetectionOptions, saveFile } from './commons';

const REFERENCE_IMAGE = '../images/bbt1.jpg'
const QUERY_IMAGE = '../images/bbt4.jpg'

async function run() {

  await faceDetectionNet.loadFromDisk('./models')
  await faceapi.nets.faceLandmark68Net.loadFromDisk('./models')
  await faceapi.nets.faceRecognitionNet.loadFromDisk('./models')

  const referenceImage = await canvas.loadImage(REFERENCE_IMAGE)
  const queryImage = await canvas.loadImage(QUERY_IMAGE)

  const resultsRef = await faceapi.detectAllFaces(referenceImage, faceDetectionOptions)
    .withFaceLandmarks()
    .withFaceDescriptors()

  const resultsQuery = await faceapi.detectAllFaces(queryImage, faceDetectionOptions)
    .withFaceLandmarks()
    .withFaceDescriptors()

  const faceMatcher = new faceapi.FaceMatcher(resultsRef)

  const labels = faceMatcher.labeledDescriptors
    .map(ld => ld.label)
  const refDrawBoxes = resultsRef
    .map(res => res.detection.box)
    .map((box, i) => new faceapi.draw.DrawBox(box, { label: labels[i] }))
  const outRef = faceapi.createCanvasFromMedia(referenceImage)
  refDrawBoxes.forEach(drawBox => drawBox.draw(outRef))

  saveFile('referenceImage.jpg', (outRef).toBuffer('image/jpeg'))

  const queryDrawBoxes = resultsQuery.map(res => {
    const bestMatch = faceMatcher.findBestMatch(res.descriptor)
    return new faceapi.draw.DrawBox(res.detection.box, { label: bestMatch.toString() })
  })
  const outQuery = faceapi.createCanvasFromMedia(queryImage)
  queryDrawBoxes.forEach(drawBox => drawBox.draw(outQuery))
  saveFile('queryImage.jpg', (outQuery).toBuffer('image/jpeg'))
  console.log('done, saved results to out/queryImage.jpg')
}

async function detectMembers(imagePath) {
  const image = await canvas.loadImage(imagePath);
  
  await faceDetectionNet.loadFromDisk('./models');
  await faceapi.nets.faceLandmark68Net.loadFromDisk('./models');
  await faceapi.nets.faceRecognitionNet.loadFromDisk('./models');
  
  const results = await faceapi.detectAllFaces(image, faceDetectionOptions)
    .withFaceLandmarks()
    .withFaceDescriptors();
  
  const labels = [];
  const faceMatcher = new faceapi.FaceMatcher(results);
  
  results.forEach(res => {
    const bestMatch = faceMatcher.findBestMatch(res.descriptor);
    labels.push(bestMatch.label);
  });
  
  return labels;
}
