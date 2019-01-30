import React from "react";
import Head from "next/head";
import uuidv4 from "uuid/v4";
import {
  ListGroup,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter
} from "reactstrap";
import randomColor from "randomcolor";
import { Checkbox } from "../components/Checkbox";
import { Slider } from "../components/Slider";
import SettingsPanel, {
  FunctionSettingsContainer
} from "../components/SettingsPanel";
import { Mathbox, initScene, initMathBox } from "../common/mathbox";

import { i18n, withNamespaces } from "../i18n";
import { TextInput } from "../components/TextInput";

class Page extends React.Component {
  state = {
    xMin: -10,
    xMax: 10,
    yMin: -10,
    yMax: 10,
    zMin: -20,
    zMax: 20,
    gridVisible: true,
    gridWidth: 1,
    fov: 90,
    showXScale: true,
    showYScale: true,
    showZScale: true,
    functions: new Map(),
    expression: ""
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

    initScene(colors, {
      range: [
        [this.state.xMin, this.state.xMax],
        [this.state.zMin, this.state.zMax],
        [this.state.yMin, this.state.yMax]
      ]
    });
  }

  toggleModal = () => {
    this.setState(prevState => ({ modalIsOpen: !prevState.modalIsOpen }));
  };

  addFunction = (expression = "x^2 + y^2") => {
    if (typeof expression !== "string") {
      expression = "x^2 + y^2";
    }

    const id = uuidv4();

    this.setState(prevState => {
      const functions = prevState.functions;
      functions.set(id, expression);
      return {
        functions,
        expression: ""
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
                onChange={() => {
                  this.setState(prevState => {
                    const isChecked = !prevState.gridVisible;
                    Mathbox.select("grid").set("opacity", isChecked ? 1 : 0);
                    return { gridVisible: isChecked };
                  });
                }}
                checked={this.state.gridVisible}
              />
              <Checkbox
                text={t("show-x-scale-numbers")}
                onChange={() => {
                  this.setState(prevState => {
                    const isChecked = !prevState.showXScale;
                    Mathbox.select("#axis-x-label").set(
                      "opacity",
                      isChecked ? 1 : 0
                    );
                    return { showXScale: isChecked };
                  });
                }}
                checked={this.state.showXScale}
              />
              <Checkbox
                text={t("show-y-scale-numbers")}
                onChange={() => {
                  this.setState(prevState => {
                    const isChecked = !prevState.showYScale;
                    Mathbox.select("#axis-y-label").set(
                      "opacity",
                      isChecked ? 1 : 0
                    );
                    return { showYScale: isChecked };
                  });
                }}
                checked={this.state.showYScale}
              />
              <Checkbox
                text={t("show-z-scale-numbers")}
                onChange={() => {
                  this.setState(prevState => {
                    const isChecked = !prevState.showZScale;
                    Mathbox.select("#axis-z-label").set(
                      "opacity",
                      isChecked ? 1 : 0
                    );
                    return { showZScale: isChecked };
                  });
                }}
                checked={this.state.showZScale}
              />
              <Slider
                text={t("fov")}
                min="30"
                max="150"
                value={this.state.fov}
                onChange={val => {
                  this.setState({ fov: parseFloat(val) });
                  Mathbox._context.camera.fov = parseFloat(val);
                }}
              />
              <Slider
                text={t("grid-width")}
                min="0.1"
                max="10"
                step="0.1"
                value={this.state.gridWidth}
                onChange={val => {
                  this.setState({ gridWidth: parseFloat(val) });
                  Mathbox.select("grid").set("width", parseFloat(val));
                }}
              />
              <hr />
              <Slider
                text="X min"
                min="-50"
                max="0"
                step="0.1"
                value={this.state.xMin}
                onChange={val => {
                  this.setState({ xMin: parseFloat(val) });
                  Mathbox.select("cartesian").set("range", [
                    [this.state.xMin, this.state.xMax],
                    [this.state.zMin, this.state.zMax],
                    [this.state.yMin, this.state.yMax]
                  ]);
                  Mathbox.select("grid").set("rangeX", [
                    this.state.xMin,
                    this.state.xMax
                  ]);
                  Mathbox.select("grid").set("rangeY", [
                    this.state.yMin,
                    this.state.yMax
                  ]);
                  Mathbox.select("#axis-x").set("range", [
                    this.state.xMin,
                    this.state.xMax
                  ]);
                  Mathbox.select("#axis-y").set("range", [
                    this.state.yMin,
                    this.state.yMax
                  ]);
                  Mathbox.select("#axis-z").set("range", [
                    this.state.zMin,
                    this.state.zMax
                  ]);
                  Mathbox.select("#axis-labels").set("data", [
                    [this.state.xMax + 0.5, 0, 0],
                    [0, this.state.zMax + 0.5, 0],
                    [0, 0, this.state.yMax + 0.5]
                  ]);
                }}
              />
              <Slider
                text="X max"
                min="0"
                max="100"
                step="0.1"
                value={this.state.xMax}
                onChange={val => {
                  this.setState({ xMax: parseFloat(val) });
                  Mathbox.select("cartesian").set("range", [
                    [this.state.xMin, this.state.xMax],
                    [this.state.zMin, this.state.zMax],
                    [this.state.yMin, this.state.yMax]
                  ]);
                  Mathbox.select("grid").set("rangeX", [
                    this.state.xMin,
                    this.state.xMax
                  ]);
                  Mathbox.select("grid").set("rangeY", [
                    this.state.yMin,
                    this.state.yMax
                  ]);
                  Mathbox.select("#axis-x").set("range", [
                    this.state.xMin,
                    this.state.xMax
                  ]);
                  Mathbox.select("#axis-y").set("range", [
                    this.state.yMin,
                    this.state.yMax
                  ]);
                  Mathbox.select("#axis-z").set("range", [
                    this.state.zMin,
                    this.state.zMax
                  ]);
                  Mathbox.select("#axis-labels").set("data", [
                    [this.state.xMax + 0.5, 0, 0],
                    [0, this.state.zMax + 0.5, 0],
                    [0, 0, this.state.yMax + 0.5]
                  ]);
                }}
              />
              <Slider
                text="Y min"
                min="-100"
                max="0"
                step="0.1"
                value={this.state.yMin}
                onChange={val => {
                  this.setState({ yMin: parseFloat(val) });
                  Mathbox.select("cartesian").set("range", [
                    [this.state.xMin, this.state.xMax],
                    [this.state.zMin, this.state.zMax],
                    [this.state.yMin, this.state.yMax]
                  ]);
                  Mathbox.select("grid").set("rangeX", [
                    this.state.xMin,
                    this.state.xMax
                  ]);
                  Mathbox.select("grid").set("rangeY", [
                    this.state.yMin,
                    this.state.yMax
                  ]);
                  Mathbox.select("#axis-x").set("range", [
                    this.state.xMin,
                    this.state.xMax
                  ]);
                  Mathbox.select("#axis-y").set("range", [
                    this.state.yMin,
                    this.state.yMax
                  ]);
                  Mathbox.select("#axis-z").set("range", [
                    this.state.zMin,
                    this.state.zMax
                  ]);
                  Mathbox.select("#axis-labels").set("data", [
                    [this.state.xMax + 0.5, 0, 0],
                    [0, this.state.zMax + 0.5, 0],
                    [0, 0, this.state.yMax + 0.5]
                  ]);
                }}
              />
              <Slider
                text="Y max"
                min="0"
                max="100"
                step="0.1"
                value={this.state.yMax}
                onChange={val => {
                  this.setState({ yMax: parseFloat(val) });
                  Mathbox.select("cartesian").set("range", [
                    [this.state.xMin, this.state.xMax],
                    [this.state.zMin, this.state.zMax],
                    [this.state.yMin, this.state.yMax]
                  ]);
                  Mathbox.select("grid").set("rangeX", [
                    this.state.xMin,
                    this.state.xMax
                  ]);
                  Mathbox.select("grid").set("rangeY", [
                    this.state.yMin,
                    this.state.yMax
                  ]);
                  Mathbox.select("#axis-x").set("range", [
                    this.state.xMin,
                    this.state.xMax
                  ]);
                  Mathbox.select("#axis-y").set("range", [
                    this.state.yMin,
                    this.state.yMax
                  ]);
                  Mathbox.select("#axis-z").set("range", [
                    this.state.zMin,
                    this.state.zMax
                  ]);
                  Mathbox.select("#axis-labels").set("data", [
                    [this.state.xMax + 0.5, 0, 0],
                    [0, this.state.zMax + 0.5, 0],
                    [0, 0, this.state.yMax + 0.5]
                  ]);
                }}
              />
              <Slider
                text="Z min"
                min="-100"
                max="0"
                step="0.1"
                value={this.state.zMin}
                onChange={val => {
                  this.setState({ zMin: parseFloat(val) });
                  Mathbox.select("cartesian").set("range", [
                    [this.state.xMin, this.state.xMax],
                    [this.state.zMin, this.state.zMax],
                    [this.state.yMin, this.state.yMax]
                  ]);
                  Mathbox.select("grid").set("rangeX", [
                    this.state.xMin,
                    this.state.xMax
                  ]);
                  Mathbox.select("grid").set("rangeY", [
                    this.state.yMin,
                    this.state.yMax
                  ]);
                  Mathbox.select("#axis-x").set("range", [
                    this.state.xMin,
                    this.state.xMax
                  ]);
                  Mathbox.select("#axis-y").set("range", [
                    this.state.yMin,
                    this.state.yMax
                  ]);
                  Mathbox.select("#axis-z").set("range", [
                    this.state.zMin,
                    this.state.zMax
                  ]);
                  Mathbox.select("#axis-labels").set("data", [
                    [this.state.xMax + 0.5, 0, 0],
                    [0, this.state.zMax + 0.5, 0],
                    [0, 0, this.state.yMax + 0.5]
                  ]);
                }}
              />
              <Slider
                text="Z max"
                min="0"
                max="100"
                step="0.1"
                value={this.state.zMax}
                onChange={val => {
                  this.setState({ zMax: parseFloat(val) });
                  Mathbox.select("cartesian").set("range", [
                    [this.state.xMin, this.state.xMax],
                    [this.state.zMin, this.state.zMax],
                    [this.state.yMin, this.state.yMax]
                  ]);
                  Mathbox.select("grid").set("rangeX", [
                    this.state.xMin,
                    this.state.xMax
                  ]);
                  Mathbox.select("grid").set("rangeY", [
                    this.state.yMin,
                    this.state.yMax
                  ]);
                  Mathbox.select("#axis-x").set("range", [
                    this.state.xMin,
                    this.state.xMax
                  ]);
                  Mathbox.select("#axis-y").set("range", [
                    this.state.yMin,
                    this.state.yMax
                  ]);
                  Mathbox.select("#axis-z").set("range", [
                    this.state.zMin,
                    this.state.zMax
                  ]);
                  Mathbox.select("#axis-labels").set("data", [
                    [this.state.xMax + 0.5, 0, 0],
                    [0, this.state.zMax + 0.5, 0],
                    [0, 0, this.state.yMax + 0.5]
                  ]);
                }}
              />
              <hr />
              <ListGroup>
                {Array.from(this.state.functions).map(
                  ([id, expression]) =>
                    id && (
                      <FunctionSettingsContainer.Provider
                        initialSettings={{
                          id,
                          expression,
                          color: randomColor()
                        }}
                        key={`key-${id}`}
                      >
                        <SettingsPanel
                          functionIds={this.state.functions}
                          addFunction={this.addFunction}
                          onRemove={() => this.removeFunction(id)}
                        />
                      </FunctionSettingsContainer.Provider>
                    )
                )}
              </ListGroup>
              <br />
              <button
                className="btn btn-lg btn-outline-primary"
                onClick={() => this.addFunction()}
              >
                <span className="glyphicon glyphicon-plus-sign" />{" "}
                {t("add-function")}
              </button>
              <button
                className="btn btn-lg btn-outline-primary"
                onClick={this.toggleModal}
              >
                <span className="glyphicon glyphicon-plus-sign" />{" "}
                {t("add-custom-entity")}
              </button>
            </div>
          </div>
        </div>
        <Modal isOpen={this.state.modalIsOpen} toggle={this.toggleModal}>
          <ModalBody>
            <TextInput
              text={`${t("expression")}:`}
              placeholder={t("expression-placeholder")}
              onChange={e =>
                this.setState({
                  expression: e.target.value
                })
              }
            />
            <button
              className="btn btn-lg btn-outline-primary"
              onClick={() => {
                this.state.expression &&
                  this.addFunction(this.state.expression);
                this.toggleModal();
              }}
              disabled={!this.state.expression}
            >
              <span className="glyphicon glyphicon-plus-sign" />{" "}
              {t("add-function")}
            </button>
          </ModalBody>
          <ModalFooter>
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={this.toggleModal}
              data-dismiss="modal"
            >
              {t("close")}
            </button>
          </ModalFooter>
        </Modal>

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
