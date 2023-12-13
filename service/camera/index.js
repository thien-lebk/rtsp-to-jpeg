import config from'../../config.json' assert { type: 'json' };;

export function getCameraUrlByName(cameraName) {
    return config.streams[cameraName];
}
