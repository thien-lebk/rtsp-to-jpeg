import rtsp from "rtsp-ffmpeg";
import { run, runFaceRecognition } from "../face/faceDetection.js";
import puppeteer from'puppeteer';

async function bufferToCanvas(imageBuffer) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // Create a data URL from the image buffer
  const dataUrl = `data:image/png;base64,${imageBuffer.toString('base64')}`;

  await page.setContent(`<img src="${dataUrl}" id="image">`);
  const canvas = await page.evaluate(() => {
    const img = document.getElementById('image');
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
    return canvas;
  });

  await browser.close();
  return canvas;
}
function getCurrentImageStream(uri) {
  let stream = new rtsp.FFMpeg({ input: uri, quality: 100 });
  return new Promise((resolve, reject) => {
    let haveFrame = false;

    stream.on("start", () => {
      // Stream started
    });
    stream.on("stop", () => {
      reject("Stream stopped unexpectedly");
      // Resolve the Promise with the chunk
    });
    stream.on("data", function (chunk) {
      if (haveFrame === false) {
        haveFrame = true;
        const imageBuffer = Buffer.from(chunk);
        resolve(imageBuffer);
      }
    });
  }).then((image) => {
    stream.stop();
    const imageData = run(image).then((data) => {
      return data;
    });
    runFaceRecognition(image).then((data) => {
      console.log(data);
    });
    return imageData;
  });
}

export { getCurrentImageStream };
