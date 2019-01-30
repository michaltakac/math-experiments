import React, { useState, useContext, useEffect } from "react";
import createContainer from "constate";
import uuidv4 from "uuid/v4";
import { ChromePicker } from "react-color";
import { Collapse, ListGroupItemHeading, ListGroupItem } from "reactstrap";
import { InlineMath } from "react-katex";
import { Mathbox, calculateFn, Scene, toTex } from "../common/mathbox";
import { Checkbox } from "./Checkbox";
import { Slider } from "./Slider";
import { TextInput } from "./TextInput";
import ExpressionForm from "./ExpressionForm";

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
  rangeXMin: -4,
  rangeXMax: 4,
  rangeYMin: -4,
  rangeYMax: 4,
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
  return { settings, update, setColor, setVisibility, setOpacity };
}

export const FunctionSettingsContainer = createContainer(useFunctionSettings);

function SettingsPanel({ functionIds, t, onRemove }) {
  const { settings, update, setColor, setVisibility, setOpacity } = useContext(
    FunctionSettingsContainer.Context
  );
  // Handle componentDidMount and componentDidUnmount (cleanup)
  useEffect(
    () => {
      if (functionIds.has(settings.id) && !cache.has(settings.id)) {
        // Add current function ID to cache
        cache.add(settings.id);
        // Render function
        Scene.area({
          id: settings.id,
          width: 50,
          height: 50,
          axes: [1, 3],
          live: true,
          rangeX: [-4, 4],
          rangeY: [-4, 4],
          expr: calculateFn(settings.expression),
          channels: 3,
          realtime: true
        }).surface({
          id: `surface-${settings.id}`,
          lineX: true,
          lineY: true,
          shaded: true,
          color: settings.color,
          width: 2,
          shaded: true
        });

        return function cleanup() {
          if (cache.has(settings.id) && !functionIds.has(settings.id)) {
            cache.delete(settings.id);
            Mathbox.remove(`#${settings.id}`);
          }
        };
      }
    },
    [functionIds]
  );

  function handleClick() {
    update({ displayColorPicker: !settings.displayColorPicker });
  }

  function handleClose() {
    update({ displayColorPicker: false });
  }

  return (
    <ListGroupItem>
      <ListGroupItemHeading>
        <h3 className="mb-3 float-left">
          {settings.label ? (
            settings.label
          ) : (
            <InlineMath>{toTex(settings.expression)}</InlineMath>
          )}
        </h3>
        <div className="float-right">
          <button
            type="button"
            className="btn btn-primary btn-lg"
            onClick={() => update({ panelOpen: !settings.panelOpen })}
          >
            {settings.panelOpen ? t("hide-panel") : t("show-panel")}
          </button>
          <button
            type="button"
            className="btn btn-danger btn-lg"
            onClick={() => {
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
              calculateFn(settings.expression)
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
          onChange={e => setOpacity(parseFloat(e.target.value))}
        />
        <div>
          <button onClick={handleClick}>Pick Color</button>
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
        <Slider
          text="X min"
          min="-50"
          max="50"
          step="0.1"
          value={settings.rangeXMin}
          onChange={e => {
            update({ rangeXMin: parseFloat(e.target.value) });

            Mathbox.select(`#${settings.id}`).set("rangeX", [
              settings.rangeXMin,
              settings.rangeXMax
            ]);

            Mathbox.select(`#${settings.id}`).set(
              "expr",
              calculateFn(settings.expression)
            );
          }}
        />
        <Slider
          text="X max"
          min="-50"
          max="50"
          step="0.1"
          value={settings.rangeXMax}
          onChange={e => {
            update({ rangeXMax: parseFloat(e.target.value) });

            Mathbox.select(`#${settings.id}`).set("rangeX", [
              settings.rangeXMin,
              settings.rangeXMax
            ]);

            Mathbox.select(`#${settings.id}`).set(
              "expr",
              calculateFn(settings.expression)
            );
          }}
        />
        <Slider
          text="Y min"
          min="-50"
          max="50"
          step="0.1"
          value={settings.rangeYMin}
          onChange={e => {
            update({ rangeYMin: parseFloat(e.target.value) });

            Mathbox.select(`#${settings.id}`).set("rangeY", [
              settings.rangeYMin,
              settings.rangeYMax
            ]);

            Mathbox.select(`#${settings.id}`).set(
              "expr",
              calculateFn(settings.expression)
            );
          }}
        />
        <Slider
          text="Y max"
          min="-50"
          max="50"
          step="0.1"
          value={settings.rangeYMax}
          onChange={e => {
            update({ rangeYMax: parseFloat(e.target.value) });

            Mathbox.select(`#${settings.id}`).set("rangeY", [
              settings.rangeYMin,
              settings.rangeYMax
            ]);

            Mathbox.select(`#${settings.id}`).set(
              "expr",
              calculateFn(settings.expression)
            );
          }}
        />
      </Collapse>
    </ListGroupItem>
  );
}

export default withNamespaces("common")(SettingsPanel);
