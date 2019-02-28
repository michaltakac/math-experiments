import React, { useState, useContext, useEffect } from "react";
import createContainer from "constate";
import uuidv4 from "uuid/v4";
import { ChromePicker } from "react-color";
import { Collapse, ListGroupItemHeading, ListGroupItem } from "reactstrap";
import { InlineMath } from "react-katex";
import randomColor from "randomcolor";
import {
  Mathbox,
  calculateAreaFn,
  Scene,
  toTex,
  derivate,
  fnCache
} from "../utils/mathbox";
import { draw3DFunction, swizzle } from "../utils/creators";
import { Checkbox } from "./Checkbox";
import { Slider } from "./Slider";
import { TextInput } from "./TextInput";
import ExpressionForm from "./ExpressionForm";
import { Dropdown } from "./Dropdown";

import { FUNCTIONS_SETTINGS_LIST } from "../helpers";
import { withNamespaces } from "../i18n";

const popover = {
  position: "absolute",
  zIndex: "2"
};
const cover = {
  position: "fixed",
  top: "0px",
  right: "0px",
  bottom: "0px",
  left: "0px"
};

export const INITIAL_STATE = {
  rangeXMin: -10,
  rangeXMax: 10,
  rangeYMin: -10,
  rangeYMax: 10,
  rangeZMin: -20,
  rangeZMax: 20,
  limitZ: true,
  lineX: false,
  lineY: false,
  blendingMode: "normal",
  expression: "x^2 + y^2",
  id: `area-${uuidv4()}`,
  label: "",
  color: randomColor(),
  visible: true,
  opacity: 1,
  displayColorPicker: false,
  panelOpen: false,
  infillType: "surface",
  order: "xyzw"
};

function redraw(settings) {
  Mathbox.select(`#${settings.id}`).set(
    "expr",
    calculateAreaFn(
      settings.expression,
      { min: settings.rangeZMin, max: settings.rangeZMax },
      settings.limitZ
    )
  );
}

function autoSave(settings) {
  if (settings && settings.id) {
    console.log(settings);
    FUNCTIONS_SETTINGS_LIST.set(settings.id, {
      settings
    });
    console.log(FUNCTIONS_SETTINGS_LIST);
  }
  return settings;
}

function useFunctionSettings({ initialSettings }) {
  const [settings, updateSettings] = useState({
    ...INITIAL_STATE,
    ...initialSettings
  });

  const update = props =>
    updateSettings(
      autoSave({
        ...settings,
        ...props
      })
    );
  const setColor = ({ hex }) => {
    updateSettings(
      autoSave({
        ...settings,
        color: hex
      })
    );
    Mathbox.select(`#surface-${settings.id}`).set("color", hex);
  };
  const setVisibility = visible => {
    updateSettings(
      autoSave({
        ...settings,
        visible
      })
    );
    Mathbox.select(`#surface-${settings.id}`).set("visible", visible);
  };
  const setOpacity = opacity => {
    updateSettings(
      autoSave({
        ...settings,
        opacity
      })
    );
    Mathbox.select(`#surface-${settings.id}`).set("opacity", opacity);
  };
  const setBlendingMode = blendingMode => {
    updateSettings(
      autoSave({
        ...settings,
        blendingMode
      })
    );
    Mathbox.select(`#surface-${settings.id}`).set("blending", blendingMode);
  };
  const setInfill = infillType => {
    updateSettings(
      autoSave({
        ...settings,
        infillType
      })
    );

    switch (infillType) {
      case "points":
        Mathbox.select(`#surface-${settings.id}`).set("visible", false);
        Mathbox.select(`#points-${settings.id}`).set("visible", true);
        Mathbox.select(`#lines-${settings.id}`).set("visible", false);
        break;

      case "lines":
        Mathbox.select(`#surface-${settings.id}`).set("visible", false);
        Mathbox.select(`#points-${settings.id}`).set("visible", false);
        Mathbox.select(`#lines-${settings.id}`).set("visible", true);
        break;

      default:
        Mathbox.select(`#surface-${settings.id}`).set("visible", true);
        Mathbox.select(`#points-${settings.id}`).set("visible", false);
        Mathbox.select(`#lines-${settings.id}`).set("visible", false);
        break;
    }
  };
  function updateRange(axis) {
    if (typeof axis === "string") {
      Mathbox.select(`#area-${settings.id}`).set(`range${axis}`, [
        settings[`range${axis.toUpperCase()}Min`],
        settings[`range${axis.toUpperCase()}Min`]
      ]);

      redraw(settings);
    }
  }

  const setRangeXMax = val => {
    update(autoSave({ rangeXMax: parseFloat(val) }));

    updateRange("X");
  };
  const setRangeXMin = val => {
    update(autoSave({ rangeXMin: parseFloat(val) }));

    updateRange("X");
  };
  const setRangeYMax = val => {
    update(autoSave({ rangeYMax: parseFloat(val) }));

    updateRange("Y");
  };
  const setRangeYMin = val => {
    update(autoSave({ rangeYMin: parseFloat(val) }));

    updateRange("Y");
  };

  const swizzleFunctionAxes = order => {
    if (
      typeof order === "string" &&
      order.includes("x") &&
      order.includes("y") &&
      order.includes("z")
    ) {
      updateSettings(
        autoSave({
          ...settings,
          order
        })
      );

      Mathbox.select(`#swizzle-${settings.id}`).set("order", order);
    }
  };
  return {
    settings,
    update,
    setColor,
    setVisibility,
    setOpacity,
    setBlendingMode,
    setInfill,
    setRangeXMax,
    setRangeXMin,
    setRangeYMax,
    setRangeYMin,
    swizzleFunctionAxes
  };
}

export const FunctionSettingsContainer = createContainer(useFunctionSettings);

function SettingsPanel({ onAdd, onInitialUpdate, onRemove, functionsList, t }) {
  const {
    settings,
    update,
    setColor,
    setVisibility,
    setOpacity,
    setBlendingMode,
    setInfill,
    setRangeXMax,
    setRangeXMin,
    setRangeYMax,
    setRangeYMin,
    swizzleFunctionAxes
  } = useContext(FunctionSettingsContainer.Context);
  // Handle componentDidMount and componentDidUnmount (cleanup)
  useEffect(() => {
    if (
      settings &&
      settings.id &&
      FUNCTIONS_SETTINGS_LIST.has(settings.id) &&
      !FUNCTIONS_SETTINGS_LIST.get(settings.id).settings.isRendered
    ) {
      console.log("is it working?");
      onInitialUpdate(settings.id, { ...settings, isRendered: true });

      draw3DFunction(settings);
      swizzle({
        id: `swizzle-${settings.id}`,
        order: "xyzw",
        source: `#area-${settings.id}`
      });

      Mathbox.print();

      return function cleanup() {
        if (
          FUNCTIONS_SETTINGS_LIST.has(settings.id) &&
          FUNCTIONS_SETTINGS_LIST.get(settings.id).settings.isRendered
        ) {
          console.log(functionsList.size);
          FUNCTIONS_SETTINGS_LIST.delete(settings.id);
          Mathbox.remove(`#area-${settings.id}`);
          Mathbox.remove(`#surface-${settings.id}`);
          Mathbox.remove(`#points-${settings.id}`);
          Mathbox.remove(`#lines-${settings.id}`);
          Mathbox.remove(`#swizzle-${settings.id}`);
        }
      };
    }
  }, [functionsList.size]);

  function handleClick() {
    update({ displayColorPicker: !settings.displayColorPicker });
  }

  function handleClose() {
    update({ displayColorPicker: false });
  }

  if (!settings || !settings.id) {
    return "";
  }

  return (
    <ListGroupItem>
      <ListGroupItemHeading>
        <span
          className="mb-3 font-weight-bold float-left"
          style={{ color: settings.visible ? "black" : "#c7c7c7" }}
        >
          <span
            className="glyphicon glyphicon-tint mr-2"
            style={{ color: settings.visible ? settings.color : "#c7c7c7" }}
          />
          {settings.label ? (
            settings.label
          ) : (
            <InlineMath>
              {settings.expression && toTex(settings.expression)}
            </InlineMath>
          )}
        </span>
        <div className="float-right">
          <button
            className="btn btn-primary"
            onClick={() =>
              update({
                panelOpen: !settings.panelOpen
              })
            }
          >
            <span
              className={`glyphicon ${
                settings.panelOpen
                  ? "glyphicon-chevron-up"
                  : "glyphicon-chevron-down"
              }`}
            />
          </button>
          <button
            className="btn btn-warning"
            onClick={() => setVisibility(!settings.visible)}
          >
            <span
              className={`glyphicon ${
                settings.visible
                  ? "glyphicon glyphicon-eye-close"
                  : "glyphicon glyphicon-eye-open"
              }`}
            />
          </button>
          <button
            className="btn btn-danger"
            onClick={() => {
              if (
                window.confirm("Are you sure you wish to delete this item?")
              ) {
                onRemove(settings.id);
                Mathbox.remove(`#${settings.id}`);
              }
            }}
          >
            <span className="glyphicon glyphicon-remove" />
          </button>
        </div>
      </ListGroupItemHeading>
      <Collapse isOpen={settings.panelOpen}>
        <ExpressionForm
          value={settings.expression}
          onChange={e =>
            update({
              expression: e.target.value
            })
          }
          onSubmit={e => {
            e.preventDefault();
            redraw(settings);
          }}
        />
        <TextInput
          text={`${t("label")}:`}
          value={settings.label}
          placeholder={t("label-placeholder")}
          onChange={e =>
            update({
              label: e.target.value
            })
          }
        />
        <Checkbox
          text={`${t("visible")}?`}
          onChange={e => setVisibility(e.target.checked)}
          checked={settings.visible}
        />
        <Slider
          text={t("opacity")}
          min="0"
          max="1"
          step="0.1"
          value={settings.opacity}
          onChange={val => setOpacity(parseFloat(val))}
        />
        <div>
          <button className="btn btn-primary" onClick={handleClick}>
            {t("pick-color")}
          </button>
          {settings.displayColorPicker ? (
            <div style={popover}>
              <div style={cover} onClick={handleClose} />
              <ChromePicker
                color={settings.color}
                onChangeComplete={setColor}
                disableAlpha
              />
            </div>
          ) : null}
        </div>
        <hr />
        <Dropdown
          label={`${t("infill")}:`}
          options={["surface", "points", "lines"]}
          onChange={e => setInfill(e.target.value)}
        />
        <Dropdown
          label={`${t("blending-mode")}:`}
          options={["normal", "add", "subtract", "multiply", "no"]}
          onChange={e => setBlendingMode(e.target.value)}
        />
        <Dropdown
          label={`${t("swizzle-axis")}:`}
          options={["xyzw", "xzyw"]}
          onChange={e => swizzleFunctionAxes(e.target.value)}
        />
        <hr />
        <div>
          <p>{t("derivate")}:</p>
          <button
            className="btn btn-lg btn-outline-primary mr-3"
            onClick={() => {
              const fn = fnCache.get(settings.expression);
              const dt = derivate(fn.parsedFn, "x");
              onAdd(dt.toString());
            }}
          >
            <InlineMath>{String.raw`\frac{\partial f(x, y)}{\partial x}`}</InlineMath>
          </button>
          <button
            className="btn btn-lg btn-outline-primary"
            onClick={() => {
              const fn = fnCache.get(settings.expression);
              const dt = derivate(fn.parsedFn, "y");
              onAdd(dt.toString());
            }}
          >
            <InlineMath>{String.raw`\frac{\partial f(x, y)}{\partial y}`}</InlineMath>
          </button>
        </div>
        <hr />
        <Slider
          text="X min"
          min="-100"
          max="0"
          step="0.1"
          value={settings.rangeXMin}
          onChange={setRangeXMin}
        />
        <Slider
          text="X max"
          min="0"
          max="100"
          step="0.1"
          value={settings.rangeXMax}
          onChange={setRangeXMax}
        />
        <Slider
          text="Y min"
          min="-100"
          max="0"
          step="0.1"
          value={settings.rangeYMin}
          onChange={setRangeYMin}
        />
        <Slider
          text="Y max"
          min="0"
          max="100"
          step="0.1"
          value={settings.rangeYMax}
          onChange={setRangeYMax}
        />
        <Checkbox
          text={`${t("limit-z")}?`}
          onChange={e => {
            update({ limitZ: e.target.checked });

            redraw(settings);
          }}
          checked={settings.limitZ}
        />
        <Slider
          text="Z min"
          min="-100"
          max={Math.min(settings.rangeZMax, 100)}
          step="0.1"
          value={settings.rangeZMin}
          onChange={val => {
            update(autoSave({ rangeZMin: parseFloat(val) }));
            redraw(settings);
          }}
        />
        <Slider
          text="Z max"
          min={Math.max(settings.rangeZMin, -100)}
          max="100"
          step="0.1"
          value={settings.rangeZMax}
          onChange={val => {
            update(autoSave({ rangeZMax: parseFloat(val) }));
            redraw(settings);
          }}
        />
      </Collapse>
    </ListGroupItem>
  );
}

export default withNamespaces("common")(SettingsPanel);
