let storage = null;

export const FUNCTIONS_SETTINGS_LIST = new Map();

// HAVE TO BE CALLED IN _app.js BEFORE USING LOCALSTORAGE
export async function initLocalStorageEngine(ls) {
  try {
    storage = ls;
    return true;
  } catch (e) {
    console.error(e);
    return false;
  }
}

function getSceneData() {
  return JSON.parse(storage.getItem("scene") || "{}");
}

/**
 * Save to localStorage.
 *
 * @param {Object} ls  - localStorage
 * @param {*} key      - key under which the data will be saved in localStorage
 * @param {*} data     - data to save into localStorage
 */
export function saveScene(key, data) {
  const sceneData = getSceneData();
  storage.setItem("scene", JSON.stringify({ ...sceneData, [key]: data }));
}

export function loadScene(key) {
  if (key === "empty" || key === "") {
    return null;
  }

  const sceneData = getSceneData();
  return sceneData[key] || null;
}

export function loadAllScenes() {
  return getSceneData() || null;
}

export function removeScene(key) {
  const sceneData = getSceneData();
  delete sceneData[key];
  storage.setItem("scene", JSON.stringify(sceneData));
}

export function getStoredKeys() {
  console.log(storage);
  if (!storage) return [];

  const scenes = loadAllScenes();

  if (scenes) {
    return Object.keys(scenes);
  }

  return [];
}

export function mapToJson(map) {
  return JSON.stringify([...map]);
}

export function jsonToMap(jsonStr) {
  return new Map(JSON.parse(jsonStr));
}
