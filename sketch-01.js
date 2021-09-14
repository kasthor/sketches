const canvasSketch = require("canvas-sketch");
const Tweakpane = require("tweakpane");

const settings = {
  dimensions: [2048, 2048],
  animate: true,
};

const params = {
  rows: 10,
  cols: 10,
  margin: 0.1,
  gap: 0.01,
  inset: 0.2,
  insetBoxRandomness: 0,
  lineWidth: 2,
  animationLength: 2,
};

class Box {
  constructor(x, y, width, height) {
    this.setPosition(x, y);
    this.setSize(width, height);
  }

  setPosition(x, y) {
    this.x = x;
    this.y = y;
  }
  setSize(width, height) {
    this.width = width;
    this.height = height;
  }

  startAnimation() {
    this.animationStart = new Date();
  }

  hasAnimation() {
    return !!this.animationStart;
  }

  animationElapsed() {
    return new Date() - this.animationStart;
  }

  animationElapsedPercent() {
    return this.animationElapsed() / (params.animationLength * 1000);
  }

  animationClear() {
    this.animationStart = null;
  }

  animationClearIfDone() {
    if (this.animationElapsedPercent() >= 1.0) {
      this.animationClear();
    }
  }

  draw(context) {
    context.save();
    context.translate(this.x, this.y);

    context.beginPath();
    context.rect(0, 0, this.width, this.height);
    context.stroke();

    if (this.hasAnimation()) {
      const inset = params.inset * this.animationElapsedPercent();

      context.beginPath();
      context.rect(
        (inset * this.width) / 2,
        (inset * this.height) / 2,
        this.width - inset * this.width,
        this.height - inset * this.height
      );
      context.stroke();

      this.animationClearIfDone();
    } else {
      if (params.insetBoxRandomness < Math.random()) {
        this.startAnimation();
      }
    }

    context.restore();
  }
}

const sketch = () => {
  let boxes = [];
  return ({ context, width, height }) => {
    context.lineWidth = params.lineWidth;
    context.fillStyle = "white";
    context.fillRect(0, 0, width, height);

    const mw = width * params.margin;
    const mh = height * params.margin;

    const iw = (width - params.gap * width * params.cols - mw) / params.cols;
    const ih = (height - params.gap * height * params.rows - mh) / params.rows;

    for (let i = 0; i < params.cols; i++) {
      for (let j = 0; j < params.rows; j++) {
        const boxIdx = params.cols * i + j;

        const top = (ih + params.gap * height) * j + mh / 2;
        const left = (iw + params.gap * width) * i + mw / 2;

        if (boxes[boxIdx]) {
          boxes[boxIdx].setPosition(left, top);
          boxes[boxIdx].setSize(iw, ih);
        } else {
          boxes[boxIdx] = new Box(left, top, iw, ih);
        }

        boxes[boxIdx].draw(context);
      }
    }
  };
};

const createPane = () => {
  const pane = new Tweakpane.Pane();
  let folder;

  folder = pane.addFolder({ title: "Sketch" });

  folder.addInput(params, "lineWidth", { min: 0.1, max: 20 });
  folder.addInput(params, "rows", { min: 2, max: 20, step: 1 });
  folder.addInput(params, "cols", { min: 2, max: 20, step: 1 });

  folder.addInput(params, "margin", { min: 0.01, max: 0.9 });
  folder.addInput(params, "gap", { min: 0.01, max: 0.9 });
  folder.addInput(params, "inset", { min: 0.01, max: 0.9 });
  folder.addInput(params, "insetBoxRandomness", { min: 0, max: 1 });
  folder.addInput(params, "animationLength", { min: 0, max: 10 });
};

createPane();
canvasSketch(sketch, settings);
