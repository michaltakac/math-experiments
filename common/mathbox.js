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
    depth: 1
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

export const fnCache = new Map();

/**
 * Compiles and calculates given functin expression.
 *
 * @param {string} expr         - function expression
 * @param {Object} rangeZ       - object containing min and max limits on Z exis
 * @param {number} rangeZ.min   - min limit on Z axis
 * @param {number} rangeZ.max   - max limit on Z axis
 * @param {boolean} limitZ      - should take Z axis limit into account?
 * @returns {function} emitToScene
 */
export function calculateFn(expr, rangeZ, limitZ) {
  let node = undefined;
  if (fnCache.has(expr)) {
    node = fnCache.get(expr).node;
  } else {
    const parsedFn = parseFn(expr);
    node = parsedFn.compile();
    fnCache.set(expr, { parsedFn, node });
  }

  return function emitToScene(emit, x, y, i, j) {
    const computedVal = computeFn(node, { x, y, i, j });

    if (computedVal < rangeZ.min) {
      limitZ && emit(x, rangeZ.min, y);
    } else if (computedVal > rangeZ.max) {
      limitZ && emit(x, rangeZ.max, y);
    } else {
      emit(x, computedVal, y);
    }
  };
}

export function parseFn(expr) {
  const parsedFn = math.parse(expr);
  return parsedFn;
}

export function computeFn(fn, vars) {
  return fn.eval(vars);
}

// vars: 'x' | 'y'
export function derivate(fn, vars) {
  return math.derivative(fn, vars);
}

export function toTex(expr) {
  if (!expr) {
    throw new Error(`Expression is undefined`);
  }

  try {
    const node = math.parse(expr);
    return node.toTex();
  } catch (e) {
    // console.warn(e);
    return expr;
  }
}
