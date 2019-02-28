import { calculateAreaFn, Scene } from "./mathbox";
import { FUNCTIONS_SETTINGS_LIST } from "../helpers";

export function addLines(settings) {
  Scene.line({
    id: `lines-${settings.id}`,
    color: settings.color,
    zBias: FUNCTIONS_SETTINGS_LIST.values.length,
    zOrder: FUNCTIONS_SETTINGS_LIST.values.length,
    blending: settings.blendingMode,
    visible: settings.infillType === "lines"
  });
}

export function addPoints(settings) {
  Scene.point({
    id: `points-${settings.id}`,
    color: settings.color,
    blending: settings.blendingMode,
    visible: settings.infillType === "points"
  });
}

export function addSurface(settings) {
  Scene.surface({
    id: `surface-${settings.id}`,
    lineX: settings.lineX,
    lineY: settings.lineY,
    color: settings.color,
    width: 2,
    shaded: true,
    zBias: FUNCTIONS_SETTINGS_LIST.values.length,
    zOrder: FUNCTIONS_SETTINGS_LIST.values.length,
    blending: settings.blendingMode,
    closed: true,
    visible: settings.infillType === "surface"
  });
}

export function generateArea(settings) {
  if (settings.expression) {
    Scene.area({
      id: `area-${settings.id}`,
      width: 100,
      height: 100,
      axes: [1, 3],
      live: true,
      rangeX: [-4, 4],
      rangeY: [-4, 4],
      expr: calculateAreaFn(
        settings.expression,
        { min: settings.rangeZMin, max: settings.rangeZMax },
        settings.limitZ
      ),
      channels: 3,
      realtime: true
    });
  }
}

export function generateInterval(settings) {
  if (settings.expression) {
    Scene.interval({
      expr: calculateIntervalFn(
        settings.expression,
        { min: settings.rangeZMin, max: settings.rangeZMax },
        settings.limitZ
      ),
      aligned: settings.aligned || false,
      axis: settings.axis || 1,
      bufferWidth: settings.bufferWidth || 1,
      centered: settings.centered || false,
      channels: settings.channels || 4,
      classes: settings.classes || [],
      data: settings.data || null,
      fps: settings.fps || null,
      history: settings.history || null,
      hurry: settings.hurry || 5,
      id: `interval-${settings.id}` || null,
      items: settings.items || 4,
      limit: settings.limit || 60,
      live: settings.live || true,
      magFilter: settings.magFilter || "nearest",
      minFilter: settings.minFilter || "nearest",
      observe: settings.observe || false,
      padding: settings.padding || 0,
      range: settings.range || [-1, 1],
      realtime: settings.realtime || false,
      type: settings.type || "float",
      width: settings.width || 1
    });
  }
}

export function draw2DFunction(settings) {
  return new Error("Feature not implemented.");
}

export function draw3DFunction(settings) {
  if (settings.expression) {
    generateArea(settings);

    addSurface(settings);
    addPoints(settings);
    addLines(settings);
  }
}

export function draw4DFunction(settings) {
  return new Error("Feature not implemented.");
}

// Operators

export function swizzle(settings) {
  Scene.swizzle({
    classes: settings.classes || [],
    id: settings.id || null,
    order: settings.order || "xyzw",
    source: settings.source || "<"
  });
}
