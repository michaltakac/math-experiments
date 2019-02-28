import React from "react";
import math from "mathjs";
import Head from "next/head";
import { Checkbox } from "../components/Checkbox";
import { Slider } from "../components/Slider";
import { ExpressionForm } from "../components/ExpressionForm";
import { Mathbox, initMathBox } from "../utils/mathbox";

import { withNamespaces } from "../i18n";
class Page extends React.Component {
  state = {
    xMin: -4,
    xMax: 4,
    yMin: -12,
    yMax: 12,
    zMin: -4,
    zMax: 4,
    rangeXMin: -4,
    rangeXMax: 4,
    rangeYMin: -4,
    rangeYMax: 4,
    gridVisible: true,
    gridWidth: 1,
    fov: 90,
    expression: "x^2 - y^2"
  };

  static async getInitialProps() {
    return {
      namespacesRequired: ["common"]
    };
  }

  componentDidMount() {
    this.parseFn(this.state.expression || "x^2 - y^2");

    const calculateFn = (emit, x, y, i, j) => {
      const computedVal = this.computeFn({ x, y });
      emit(x, computedVal, y);
    };

    // Bootstrap MathBox and Three.js
    const el = document.querySelector("#visualization");
    initMathBox(el, {
      controls: {
        klass: THREE.OrbitControls // NOTE: using keyboard arrows for slides moves camera too
        // klass: THREE.TrackballControls // keyboard arrows doesn't move camera, but harder to navigate
      }
    });

    var three = Mathbox.three;
    three.camera.position.set(2, 1.7, 2.7);
    three.renderer.setClearColor(new THREE.Color(0xffffff), 1.0);

    // Axis colors
    const colors = {
      x: new THREE.Color(0xff4136),
      y: new THREE.Color(0x2ecc40),
      z: new THREE.Color(0x0074d9)
    };

    // Initial time
    let time = 0;

    var view = Mathbox.cartesian({
      range: [[-4, 4], [-12, 12], [-4, 4]],
      scale: [1.5, 1.5, 1.5],
      position: [0, 0, 0]
    });

    view.axis({
      axis: 1,
      color: colors.x
    });
    view.axis({
      axis: 2, // "y" also works
      color: colors.z
    });
    view.axis({
      axis: 3,
      color: colors.y
    });

    Mathbox.select("axis")
      .set("end", true)
      .set("width", 5);

    view.array({
      id: "colors",
      live: false,
      data: [colors.x, colors.z, colors.y].map(function(color) {
        return [color.r, color.g, color.b, 1];
      })
    });

    view.grid({
      axes: [1, 3],
      width: 1,
      color: 0xb0b0b0,
      depth: 0.25
    });

    view
      .array({
        data: [[4.3, 0, 0], [0, 13.2, 0], [0, 0, 4.3]],
        channels: 3, // necessary
        live: true
      })
      .text({
        data: ["x", "z", "y"]
      })
      .label({
        color: 0xffffff,
        colors: "#colors"
      });

    // ----------- Visualization

    view
      .area({
        id: "main-function",
        width: 50,
        height: 50,
        axes: [1, 3],
        live: true,
        rangeX: [-4, 4],
        rangeY: [-4, 4],
        expr: calculateFn,
        channels: 3,
        realtime: true
      })
      .surface({
        lineX: true,
        lineY: true,
        shaded: true,
        color: 0x5090ff,
        width: 2,
        shaded: true
      });
  }

  parseFn(expr) {
    const parsedFn = math.parse(expr || "x^2 - y^2");
    const fn = parsedFn.compile();
    this.setState({
      fn
    });
  }

  computeFn(vars) {
    return this.state.fn.eval(vars);
  }

  render() {
    return (
      <div className="container-fluid">
        <Head>
          <title>
            Math Project - Experiments with React, Mathbox and Next.js
          </title>
        </Head>
        <div className="row">
          <div className="col-sm-8">
            <div id="visualization" />
          </div>
          <div className="col-sm-4 mt-4 text-monospace font-weight-light overflow-auto settings-panel">
            <div>
              <ExpressionForm
                value={this.state.expression}
                onChange={e =>
                  this.setState({
                    expression: e.target.value
                  })
                }
                onSubmit={e => {
                  e.preventDefault();

                  this.parseFn(this.state.expression);
                  Mathbox.select("#main-function").set(
                    "expr",
                    (emit, x, y, i, j) => {
                      const computedVal = this.computeFn({ x, y });
                      emit(x, computedVal, y);
                    }
                  );
                }}
              />
              <Checkbox
                text="Zapnúť mriežku?"
                onChange={e => {
                  this.setState({
                    gridVisible: e.target.checked
                  });
                  Mathbox.select("grid").set(
                    "opacity",
                    this.state.gridVisible ? 1 : 0
                  );
                }}
                checked={this.state.gridVisible}
              />
              <Slider
                text="Zorné pole (field of view) [°]"
                min="50"
                max="120"
                value={this.state.fov}
                onChange={e => {
                  this.setState({
                    fov: parseFloat(e.target.value)
                  });
                  Mathbox._context.camera.fov = parseFloat(e.target.value);
                }}
              />
              <Slider
                text="Hrúbka mriežky"
                min="0.1"
                max="4"
                step="0.1"
                value={this.state.gridWidth}
                onChange={e => {
                  this.setState({
                    gridWidth: parseFloat(e.target.value)
                  });
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
                  this.setState({
                    xMin: parseFloat(e.target.value)
                  });
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
                  this.setState({
                    xMax: parseFloat(e.target.value)
                  });
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
                  this.setState({
                    yMin: parseFloat(e.target.value)
                  });
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
                  this.setState({
                    yMax: parseFloat(e.target.value)
                  });
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
                  this.setState({
                    zMin: parseFloat(e.target.value)
                  });
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
                  this.setState({
                    zMax: parseFloat(e.target.value)
                  });
                  Mathbox.select("cartesian").set("range", [
                    [this.state.xMin, this.state.xMax],
                    [this.state.yMin, this.state.yMax],
                    [this.state.zMin, this.state.zMax]
                  ]);
                }}
              />
              <h5>Ohraničená množina vstupných premenných</h5>
              <hr />
              <Slider
                text="X min"
                min="-50"
                max="50"
                step="0.1"
                value={this.state.rangeXMin}
                onChange={e => {
                  this.setState({
                    rangeXMin: parseFloat(e.target.value)
                  });

                  Mathbox.select("#main-function").set("rangeX", [
                    this.state.rangeXMin,
                    this.state.rangeXMax
                  ]);

                  Mathbox.select("#main-function").set(
                    "expr",
                    (emit, x, y, i, j) => {
                      const computedVal = this.computeFn({ x, y });
                      emit(x, computedVal, y);
                    }
                  );
                }}
              />
              <Slider
                text="X max"
                min="-50"
                max="50"
                step="0.1"
                value={this.state.rangeXMax}
                onChange={e => {
                  this.setState({
                    rangeXMax: parseFloat(e.target.value)
                  });

                  Mathbox.select("#main-function").set("rangeX", [
                    this.state.rangeXMin,
                    this.state.rangeXMax
                  ]);

                  Mathbox.select("#main-function").set(
                    "expr",
                    (emit, x, y, i, j) => {
                      const computedVal = this.computeFn({ x, y });
                      emit(x, computedVal, y);
                    }
                  );
                }}
              />
              <Slider
                text="Y min"
                min="-50"
                max="50"
                step="0.1"
                value={this.state.rangeYMin}
                onChange={e => {
                  this.setState({
                    rangeYMin: parseFloat(e.target.value)
                  });

                  Mathbox.select("#main-function").set("rangeY", [
                    this.state.rangeYMin,
                    this.state.rangeYMax
                  ]);

                  Mathbox.select("#main-function").set(
                    "expr",
                    (emit, x, y, i, j) => {
                      const computedVal = this.computeFn({ x, y });
                      emit(x, computedVal, y);
                    }
                  );
                }}
              />
              <Slider
                text="Y max"
                min="-50"
                max="50"
                step="0.1"
                value={this.state.rangeYMax}
                onChange={e => {
                  this.setState({
                    rangeYMax: parseFloat(e.target.value)
                  });

                  Mathbox.select("#main-function").set("rangeY", [
                    this.state.rangeYMin,
                    this.state.rangeYMax
                  ]);

                  Mathbox.select("#main-function").set(
                    "expr",
                    (emit, x, y, i, j) => {
                      const computedVal = this.computeFn({ x, y });
                      emit(x, computedVal, y);
                    }
                  );
                }}
              />
            </div>
          </div>
        </div>
        <style jsx>
          {`
            .settings-panel {
              font-size: 11px;
              height: 600px;
              padding: 30px;
              border: 1px solid #c7c7c7;
            }
          `}
        </style>
      </div>
    );
  }
}

export default withNamespaces("common")(Page);
