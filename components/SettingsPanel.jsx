import React, { useState, useContext, useEffect } from "react";
import createContainer from "constate";
import uuidv4 from "uuid/v4";
import { ChromePicker } from "react-color";
import { Collapse, ListGroupItemHeading, ListGroupItem } from "reactstrap";
import { InlineMath } from "react-katex";
import {
  Mathbox,
  calculateFn,
  Scene,
  toTex,
  derivate,
  fnCache
} from "../common/mathbox";
import { Checkbox } from "./Checkbox";
import { Slider } from "./Slider";
import { TextInput } from "./TextInput";
import ExpressionForm from "./ExpressionForm";
import { Dropdown } from "./Dropdown";

import { withNamespaces } from "../i18n";

const cache = new Set();

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
  lineX: false,
  lineY: false,
  blendingMode: "normal",
  expression: "x^2 + y^2",
  id: uuidv4(),
  label: "",
  color: "#509000",
  visible: true,
  opacity: 1,
  displayColorPicker: false,
  panelOpen: false
};

function useFunctionSettings({ initialSettings }) {
  const [settings, updateSettings] = useState({
    ...INITIAL_STATE,
    ...initialSettings
  });
  const update = props => updateSettings({ ...settings, ...props });
  const setColor = ({ hex }) => {
    updateSettings({ ...settings, color: hex });
    Mathbox.select(`#surface-${settings.id}`).set("color", hex);
  };
  const setVisibility = visible => {
    updateSettings({ ...settings, visible });
    Mathbox.select(`#surface-${settings.id}`).set("visible", visible);
  };
  const setOpacity = opacity => {
    updateSettings({ ...settings, opacity });
    Mathbox.select(`#surface-${settings.id}`).set("opacity", opacity);
  };
  const setBlendingMode = blendingMode => {
    updateSettings({ ...settings, blendingMode });
    Mathbox.select(`#surface-${settings.id}`).set("blending", blendingMode);
  };
  return {
    settings,
    update,
    setColor,
    setVisibility,
    setOpacity,
    setBlendingMode
  };
}

export const FunctionSettingsContainer = createContainer(useFunctionSettings);

function SettingsPanel({ addFunction, functionIds, t, onRemove }) {
  const {
    settings,
    update,
    setColor,
    setVisibility,
    setOpacity,
    setBlendingMode
  } = useContext(FunctionSettingsContainer.Context);
  // Handle componentDidMount and componentDidUnmount (cleanup)
  useEffect(() => {
    if (functionIds.has(settings.id) && !cache.has(settings.id)) {
      // Add current function ID to cache
      cache.add(settings.id);
      // Render function
      Scene.area({
        id: settings.id,
        width: 100,
        height: 100,
        axes: [1, 3],
        live: true,
        rangeX: [-4, 4],
        rangeY: [-4, 4],
        expr: calculateFn(settings.expression, [
          settings.rangeZMin,
          settings.rangeZMax
        ]),
        channels: 3,
        realtime: true
      }).surface({
        id: `surface-${settings.id}`,
        lineX: settings.lineX,
        lineY: settings.lineY,
        color: settings.color,
        width: 2,
        shaded: true,
        zBias: cache.values.length,
        zOrder: cache.values.length,
        blending: settings.blendingMode,
        closed: true
      });

      return function cleanup() {
        if (cache.has(settings.id) && !functionIds.has(settings.id)) {
          cache.delete(settings.id);
          Mathbox.remove(`#${settings.id}`);
        }
      };
    }
  }, [functionIds]);

  function handleClick() {
    update({ displayColorPicker: !settings.displayColorPicker });
  }

  function handleClose() {
    update({ displayColorPicker: false });
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
              window.confirm("Are you sure you wish to delete this item?") &&
                onRemove(settings.id);
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

            Mathbox.select(`#${settings.id}`).set(
              "expr",
              calculateFn(settings.expression, [
                settings.rangeZMin,
                settings.rangeZMax
              ])
            );
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
          label={`${t("blending-mode")}:`}
          options={["normal", "add", "subtract", "multiply", "no"]}
          onChange={e => setBlendingMode(e.target.value)}
        />
        <hr />
        <div>
          <p>{t("derivate")}:</p>
          <button
            className="btn btn-lg btn-outline-primary mr-3"
            onClick={() => {
              const fn = fnCache.get(settings.expression);
              const dt = derivate(fn.parsedFn, "x");
              addFunction(dt.toString());
            }}
          >
            <InlineMath>{String.raw`\frac{\text{df}}{\text{dx}}`}</InlineMath>
          </button>
          <button
            className="btn btn-lg btn-outline-primary"
            onClick={() => {
              const fn = fnCache.get(settings.expression);
              const dt = derivate(fn.parsedFn, "y");
              addFunction(dt.toString());
            }}
          >
            <InlineMath>{String.raw`\frac{\text{df}}{\text{dy}}`}</InlineMath>
          </button>
        </div>
        <hr />
        <Slider
          text="X min"
          min="-100"
          max="0"
          step="0.1"
          value={settings.rangeXMin}
          onChange={val => {
            update({ rangeXMin: parseFloat(val) });

            Mathbox.select(`#${settings.id}`).set("rangeX", [
              settings.rangeXMin,
              settings.rangeXMax
            ]);

            Mathbox.select(`#${settings.id}`).set(
              "expr",
              calculateFn(settings.expression, [
                settings.rangeZMin,
                settings.rangeZMax
              ])
            );
          }}
        />
        <Slider
          text="X max"
          min="0"
          max="100"
          step="0.1"
          value={settings.rangeXMax}
          onChange={val => {
            update({ rangeXMax: parseFloat(val) });

            Mathbox.select(`#${settings.id}`).set("rangeX", [
              settings.rangeXMin,
              settings.rangeXMax
            ]);

            Mathbox.select(`#${settings.id}`).set(
              "expr",
              calculateFn(settings.expression, [
                settings.rangeZMin,
                settings.rangeZMax
              ])
            );
          }}
        />
        <Slider
          text="Y min"
          min="-100"
          max="0"
          step="0.1"
          value={settings.rangeYMin}
          onChange={val => {
            update({ rangeYMin: parseFloat(val) });

            Mathbox.select(`#${settings.id}`).set("rangeY", [
              settings.rangeYMin,
              settings.rangeYMax
            ]);

            Mathbox.select(`#${settings.id}`).set(
              "expr",
              calculateFn(settings.expression, [
                settings.rangeZMin,
                settings.rangeZMax
              ])
            );
          }}
        />
        <Slider
          text="Y max"
          min="0"
          max="100"
          step="0.1"
          value={settings.rangeYMax}
          onChange={val => {
            update({ rangeYMax: parseFloat(val) });

            Mathbox.select(`#${settings.id}`).set("rangeY", [
              settings.rangeYMin,
              settings.rangeYMax
            ]);

            Mathbox.select(`#${settings.id}`).set(
              "expr",
              calculateFn(settings.expression, [
                settings.rangeZMin,
                settings.rangeZMax
              ])
            );
          }}
        />
        <Slider
          text="Z min"
          min="-100"
          max={Math.min(settings.rangeZMax, 100)}
          step="0.1"
          value={settings.rangeZMin}
          onChange={val => {
            update({ rangeZMin: parseFloat(val) });

            Mathbox.select(`#${settings.id}`).set(
              "expr",
              calculateFn(settings.expression, [
                settings.rangeZMin,
                settings.rangeZMax
              ])
            );
          }}
        />
        <Slider
          text="Z max"
          min={Math.max(settings.rangeZMin, -100)}
          max="100"
          step="0.1"
          value={settings.rangeZMax}
          onChange={val => {
            update({ rangeZMax: parseFloat(val) });

            Mathbox.select(`#${settings.id}`).set(
              "expr",
              calculateFn(settings.expression, [
                settings.rangeZMin,
                settings.rangeZMax
              ])
            );
          }}
        />
      </Collapse>
    </ListGroupItem>
  );
}

export default withNamespaces("common")(SettingsPanel);
