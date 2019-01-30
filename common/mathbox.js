import math from "mathjs";

const defaultSettings = {
  plugins: ["VR", "ui", "controls", "cursor"],
  size: {
    height: 600
  },
  camera: {
    fov: 90 // Field-of-view (degrees)
  }
};

export let Mathbox = null;
export let Scene = null;

export function initMathBox(element, settings) {
  Mathbox = mathBox({
    element,
    ...defaultSettings,
    ...settings
  });
  return Mathbox;
}

export function initScene(colors, opts) {
  //////// Main coordinate system
  const options = Object.assign(
    {
      range: [[-4, 4], [-12, 12], [-4, 4]],
      scale: [1.5, 1.5, 1.5],
      position: [0, 0, 0]
    },
    opts
  );

  Scene = Mathbox.cartesian(options);

  //////// Axis initialization
  Scene.axis({ id: "axis-x", axis: 1, color: colors.x })
    .scale({ axis: 1, divide: 10 })
    .ticks({ width: 3, size: 15, color: colors.x })
    .format({ digits: 3, weight: "normal" })
    .label({
      id: "axis-x-label",
      size: 13,
      blending: "no",
      color: "black"
    });

  Scene.axis({ id: "axis-z", axis: 2, color: colors.z })
    .scale({
      axis: 2,
      divide: 10
    })
    .ticks({
      width: 3,
      size: 15,
      color: colors.z
    })
    .format({
      digits: 3,
      weight: "normal"
    })
    .label({
      id: "axis-z-label",
      size: 13,
      blending: "no",
      color: "black"
    });

  Scene.axis({ id: "axis-y", axis: 3, color: colors.y })
    .scale({
      axis: 3,
      divide: 10
    })
    .ticks({
      width: 3,
      size: 15,
      color: colors.y
    })
    .format({
      digits: 3,
      weight: "normal"
    })
    .label({
      id: "axis-y-label",
      size: 13,
      blending: "no",
      color: "black"
    });

  Mathbox.select("axis")
    .set("end", true)
    .set("width", 5);

  Scene.array({
    id: "colors",
    live: false,
    data: [colors.x, colors.z, colors.y].map(function(color) {
      return [color.r, color.g, color.b, 1];
    })
  });

  ///////// Grid initialization
  Scene.grid({
    axes: [1, 3],
    rangeX: [options.range[0][0], options.range[0][1]],
    rangeY: [options.range[2][0], options.range[2][1]],
    width: 1,
    color: 0xb0b0b0,
    depth: 1,
    endX: false
  });

  Scene.array({
    id: "axis-labels",
    data: [
      [options.range[0][1] + 0.5, 0, 0],
      [0, options.range[1][1] + 0.5, 0],
      [0, 0, options.range[2][1] + 0.5]
    ],
    channels: 3, // necessary
    live: true
  })
    .text({ data: ["x", "z", "y"] })
    .label({ color: 0xffffff, colors: "#colors" });
}

const fnCache = new Map();

export function calculateFn(expr) {
  let parsedFn = undefined;
  if (fnCache.has(expr)) {
    parsedFn = fnCache.get(expr);
  } else {
    parsedFn = parseFn(expr);
    fnCache.set(expr, parsedFn);
  }

  return function(emit, x, y, i, j) {
    const computedVal = computeFn(parsedFn, { x, y, i, j });
    emit(x, computedVal, y);
  };
}

export function parseFn(expr) {
  const parsedFn = math.parse(expr || "x^2 - y^2");
  return parsedFn.compile();
}

export function computeFn(fn, vars) {
  return fn.eval(vars);
}

export function toTex(expr) {
  if (!expr) {
    throw new Error(`Expression is undefined`);
  }

  try {
    const node = math.parse(expr);
    return node.toTex();
  } catch (e) {
    console.warn(e);
    return expr;
  }
}
