import rtsp from "rtsp-ffmpeg";
import { run, runFaceRecognition } from "../face/faceDetection.js";

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
