const canvasSketch = require("canvas-sketch");
const Tweakpane = require("tweakpane");
const math = require("canvas-sketch-util/math");
const random = require("canvas-sketch-util/random");

const settings = {
  dimensions: [2048, 2048],
  animate: true,
};

const params = {
  tickCount: 81,
  tickRadius: 900,
  tickLength: 0.2,
  tickWidth: 0.01,
  tickChance: 0.5,
  animationLength: 5,
  withAnimationOverride: true,

  arcCount: 10,
  arcMinLength: 30,
  arcMaxLength: 270,
  arcWidth: 5,
};

const deg2rad = (deg) => {
  return (deg / 180) * Math.PI;
};

class animatedObject {
  startAnimation() {
    this.animationStart = new Date();
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
}

class Tick extends animatedObject {
  constructor(w, h, angle) {
    super();
    this.setDimension(w, h);
    this.setAngle(angle);
  }

  setDimension(w, h) {
    this.w = w;
    this.h = h;
  }
  setAngle(angle) {
    this.angle = angle;
  }

  draw(context) {
    if (
      (!this.hasAnimation() || params.withAnimationOverride) &&
      random.chance(params.tickChance / params.tickCount)
    ) {
      if (!this.hasAnimation()) {
        this.w *= random.range(0.3, 1);
      }
      this.startAnimation();
    }

    const animationStep = 1 - this.animationElapsedPercent();
    const x = params.tickRadius * animationStep * Math.sin(this.angle);
    const y = params.tickRadius * animationStep * Math.cos(this.angle);

    if (this.hasAnimation()) {
      const w = this.w;
      const h = this.h * animationStep;

      context.save();
      context.translate(x, y);
      context.rotate(-this.angle);
      context.beginPath();
      context.rect(-w * 0.5, -h * 0.5, w * 0.5, h * 0.5);
      context.fill();
      context.restore();

      this.animationClearIfDone();
    }
  }
}

class Arc extends animatedObject {
  constructor() {
    super();
    this.radius = random.range(0.3, 1) * params.tickRadius;
    this.length = random.range(params.arcMinLength * params.arcMaxLength);
    this.start = random.range(0, 360);
    this.toAngle = random.range(-360, 360);
    this.speed = random.range(0.01, 0.09);
  }

  draw(context) {
    const start = this.start;

    if (!this.hasAnimation()) {
      this.startAnimation();
    }
    context.save();
    context.rotate(this.toAngle * this.animationElapsedPercent() * this.speed);
    context.lineWidth = params.arcWidth;
    context.beginPath();
    context.arc(
      0,
      0,
      this.radius,
      this.start,
      deg2rad(this.start + this.length)
    );
    context.stroke();
    context.restore();
  }
}

const sketch = () => {
  let ticks = [];
  let arcs = [];

  return ({ context, width, height }) => {
    context.fillStyle = "rgba(255, 255, 255, 0.2)";
    context.fillRect(0, 0, width, height);

    context.fillStyle = "rgb(100, 100, 100)";

    const currentTime = new Date().getMilliseconds();

    const cx = width * 0.5;
    const cy = height * 0.5;

    const w = width * params.tickWidth;
    const h = height * params.tickLength;

    context.save();
    context.translate(cx, cy);
    // context.rotate(currentTime * 0.001);
    for (let i = 0; i < params.tickCount; i++) {
      const slice = deg2rad(360 / params.tickCount);
      const angle = slice * i;
      if (!ticks[i]) {
        ticks[i] = new Tick(w, h, angle);
      } else {
        ticks[i].setAngle(angle);
      }

      ticks[i].draw(context);
    }
    context.restore();

    context.save();
    context.translate(cx, cy);

    for (let i = 0; i < params.arcCount; i++) {
      if (!arcs[i]) {
        arcs[i] = new Arc();
      }

      arcs[i].draw(context);
    }

    context.restore();
  };
};

const createPane = () => {
  const pane = new Tweakpane.Pane();
  let folder;

  folder = pane.addFolder({ title: "Sketch" });
  folder.addInput(params, "animationLength", { min: 0, max: 10 });

  folder = pane.addFolder({ title: "Tick" });
  folder.addInput(params, "withAnimationOverride", { min: 0, max: 10 });
  folder.addInput(params, "tickCount", { min: 1, max: 100, step: 1 });
  folder.addInput(params, "tickRadius", {
    min: 1,
    max: settings.dimensions[0],
    step: 1,
  });
  folder.addInput(params, "tickLength", { min: 0, max: 1 });
  folder.addInput(params, "tickWidth", { min: 0, max: 1 });
  folder.addInput(params, "tickChance", { min: 0, max: 1 });
  folder = pane.addFolder({ title: "Arc" });
  folder.addInput(params, "arcCount", { min: 0, max: 30 });
  folder.addInput(params, "arcWidth", { min: 0, max: 100 });
  // folder.addInput(params, "arcMinLength", { min: 0, max: 360 });
  // folder.addInput(params, "arcMaxLength", { min: 0, max: 360 });
};

createPane();
canvasSketch(sketch, settings);
