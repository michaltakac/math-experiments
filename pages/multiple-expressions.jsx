import React from "react";
import Head from "next/head";
import uuidv4 from "uuid/v4";
import { ListGroup } from "reactstrap";
import { Checkbox } from "../components/Checkbox";
import { Slider } from "../components/Slider";
import SettingsPanel, {
  FunctionSettingsContainer
} from "../components/SettingsPanel";
import { Mathbox, initScene, initMathBox } from "../common/mathbox";

import { i18n, withNamespaces } from "../i18n";

class Page extends React.Component {
  state = {
    xMin: -4,
    xMax: 4,
    yMin: -12,
    yMax: 12,
    zMin: -4,
    zMax: 4,
    gridVisible: true,
    gridWidth: 1,
    fov: 90,
    functions: new Set()
  };

  static async getInitialProps() {
    return {
      namespacesRequired: ["common"]
    };
  }

  componentDidMount() {
    // Bootstrap MathBox
    const el = document.querySelector("#visualization");
    initMathBox(el, {
      controls: {
        klass: THREE.OrbitControls // NOTE: using keyboard arrows for slides moves camera too
        // klass: THREE.TrackballControls // keyboard arrows doesn't move camera, but harder to navigate
      },
      size: {
        height: 800
      }
    });

    // Change camera default settings
    var three = Mathbox.three;
    three.camera.position.set(4, 1, 1.8);
    three.renderer.setClearColor(new THREE.Color(0xffffff), 1.0);

    // Axis colors
    const colors = {
      x: new THREE.Color(0xff4136),
      y: new THREE.Color(0x2ecc40),
      z: new THREE.Color(0x0074d9)
    };

    initScene(colors, { range: [[-10, 10], [-20, 20], [-10, 10]] });
  }

  addFunction = () => {
    const id = uuidv4();

    this.setState(prevState => {
      const functions = prevState.functions;
      functions.add(id);
      return {
        functions
      };
    });
  };

  removeFunction = id => {
    this.setState(prevState => {
      const functions = prevState.functions;
      functions.delete(id);
      return {
        functions
      };
    });
  };

  render() {
    const { t } = this.props;

    return (
      <div className="container-fluid">
        <Head>
          <title>{t("multiple-expression-title")}</title>
        </Head>
        <div className="row">
          <div className="col-sm-8">
            <div id="visualization" />
          </div>
          <div className="col-sm-4 mt-4 text-monospace overflow-auto settings-panel float-right rounded-left">
            <div>
              <h4>{t("language")}: </h4>
              <div
                className="btn-toolbar mb-4"
                role="toolbar"
                aria-label="Language settings"
              >
                <div className="btn-group" role="group">
                  <button
                    type="button"
                    className={`btn btn-lg ${
                      i18n.language === "sk"
                        ? "btn-warning active"
                        : "btn-primary"
                    }`}
                    onClick={() => i18n.changeLanguage("sk")}
                  >
                    SK
                  </button>
                  <button
                    type="button"
                    className={`btn btn-lg ${
                      i18n.language === "en"
                        ? "btn-warning active"
                        : "btn-primary"
                    }`}
                    onClick={() => i18n.changeLanguage("en")}
                  >
                    EN
                  </button>
                </div>
              </div>
              <Checkbox
                text={t("show-grid")}
                onChange={e => {
                  this.setState({ gridVisible: e.target.checked });
                  Mathbox.select("grid").set(
                    "opacity",
                    this.state.gridVisible ? 1 : 0
                  );
                }}
                checked={this.state.gridVisible}
              />
              <Slider
                text={t("fov")}
                min="50"
                max="120"
                value={this.state.fov}
                onChange={e => {
                  this.setState({ fov: parseFloat(e.target.value) });
                  Mathbox._context.camera.fov = parseFloat(e.target.value);
                }}
              />
              <Slider
                text={t("grid-width")}
                min="0.1"
                max="4"
                step="0.1"
                value={this.state.gridWidth}
                onChange={e => {
                  this.setState({ gridWidth: parseFloat(e.target.value) });
                  Mathbox.select("grid").set(
                    "width",
                    parseFloat(e.target.value)
                  );
                }}
              />
              <hr />
              <Slider
                text="X min"
                min="-30"
                max="30"
                step="0.1"
                value={this.state.xMin}
                onChange={e => {
                  this.setState({ xMin: parseFloat(e.target.value) });
                  Mathbox.select("cartesian").set("range", [
                    [this.state.xMin, this.state.xMax],
                    [this.state.yMin, this.state.yMax],
                    [this.state.zMin, this.state.zMax]
                  ]);
                }}
              />
              <Slider
                text="X max"
                min="-30"
                max="30"
                step="0.1"
                value={this.state.xMax}
                onChange={e => {
                  this.setState({ xMax: parseFloat(e.target.value) });
                  Mathbox.select("cartesian").set("range", [
                    [this.state.xMin, this.state.xMax],
                    [this.state.yMin, this.state.yMax],
                    [this.state.zMin, this.state.zMax]
                  ]);
                }}
              />
              <Slider
                text="Y min"
                min="-30"
                max="30"
                step="0.1"
                value={this.state.yMin}
                onChange={e => {
                  this.setState({ yMin: parseFloat(e.target.value) });
                  Mathbox.select("cartesian").set("range", [
                    [this.state.xMin, this.state.xMax],
                    [this.state.yMin, this.state.yMax],
                    [this.state.zMin, this.state.zMax]
                  ]);
                }}
              />
              <Slider
                text="Y max"
                min="-30"
                max="30"
                step="0.1"
                value={this.state.yMax}
                onChange={e => {
                  this.setState({ yMax: parseFloat(e.target.value) });
                  Mathbox.select("cartesian").set("range", [
                    [this.state.xMin, this.state.xMax],
                    [this.state.yMin, this.state.yMax],
                    [this.state.zMin, this.state.zMax]
                  ]);
                }}
              />
              <Slider
                text="Z min"
                min="-30"
                max="30"
                step="0.1"
                value={this.state.zMin}
                onChange={e => {
                  this.setState({ zMin: parseFloat(e.target.value) });
                  Mathbox.select("cartesian").set("range", [
                    [this.state.xMin, this.state.xMax],
                    [this.state.yMin, this.state.yMax],
                    [this.state.zMin, this.state.zMax]
                  ]);
                }}
              />
              <Slider
                text="Z max"
                min="-30"
                max="30"
                step="0.1"
                value={this.state.zMax}
                onChange={e => {
                  this.setState({ zMax: parseFloat(e.target.value) });
                  Mathbox.select("cartesian").set("range", [
                    [this.state.xMin, this.state.xMax],
                    [this.state.yMin, this.state.yMax],
                    [this.state.zMin, this.state.zMax]
                  ]);
                }}
              />
              <hr />
              <ListGroup>
                {Array.from(this.state.functions).map(
                  id =>
                    id && (
                      <FunctionSettingsContainer.Provider
                        initialSettings={{ id }}
                        key={`key-${id}`}
                      >
                        <SettingsPanel
                          functionIds={this.state.functions}
                          onRemove={() => this.removeFunction(id)}
                        />
                      </FunctionSettingsContainer.Provider>
                    )
                )}
              </ListGroup>
              <br />
              <button
                className="btn btn-lg btn-outline-primary"
                onClick={this.addFunction}
              >
                <span className="glyphicon glyphicon-plus-sign" />{" "}
                {t("add-function")}
              </button>
            </div>
          </div>
        </div>
        <style jsx>
          {`
            .settings-panel {
              font-size: 13px;
              height: 800px;
              background: #fff;
              padding: 30px;
              box-shadow: -2px 5px 20px -5px #dfdddd;
            }
          `}
        </style>
      </div>
    );
  }
}

export default withNamespaces("common")(Page);
