eruda.init();

const video = document.getElementById("video");

const startVideo = () => {
  if (
    navigator.mediaDevices.getUserMedia ||
    navigator.mediaDevices.webkitGetUserMedia
  ) {
    const webcamPromise = navigator.mediaDevices
      .getUserMedia({ video: true, audio: false })
      .then(
        (stream) => {
          return mediaVideo(stream);
        },
        (error) => {
          console.log(error);
        }
      );

    const loadModelPromise = cocoSsd.load();

    Promise.all([loadModelPromise, webcamPromise])
      .then((values) => {
        detectFromVideoFrame(values[0], video);
      })
      .catch((err) => console.error(err));
  }
};

function detectFromVideoFrame(model, video) {
  model.detect(video).then(
    (predictions) => {
      showDetections(predictions);

      requestAnimationFrame(() => {
        detectFromVideoFrame(model, video);
      });
    },
    (error) => {
      console.log("Tidak bisa memulai kamera");
      console.log(error);
    }
  );
}

function showDetections(predictions) {
  const ctx = document.getElementById("canvas").getContext("2d");
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  const font = "24px arial";
  ctx.font = font;
  ctx.textBaseline = "top";

  predictions.forEach((prediction) => {
    const x = prediction.bbox[0],
      y = prediction.bbox[1],
      width = prediction.bbox[2],
      height = prediction.bbox[3];

    ctx.strokeStyle = "#2f6";
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, width, height);

    ctx.fillStyle = "#2f6";
    const textWidth = ctx.measureText(prediction.class).width;
    const textHeight = parseInt(font, 10);

    //kiri atas line
    ctx.fillRect(x, y, textWidth + 10, textHeight + 10);
    //line kanan bawah
    ctx.fillRect(x, y + height - textHeight, textWidth + 15, textHeight + 10);

    ctx.fillStyle = "#000";
    ctx.fillText(prediction.class, x, y);
    ctx.fillText(
      Math.round(prediction.score * 100) + "%",
      x,
      y + height - textHeight
    );
  });
}

function mediaVideo(stream) {
  window.stream = stream;
  video.srcObject = stream;

  return new Promise((resolve) => {
    video.onloadedmetadata = () => {
      resolve();
    };
  });
}

startVideo();
