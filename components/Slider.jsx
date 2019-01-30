import React, { useState, useEffect } from "react";

export function Slider({ min, max, step, value, text, onChange }) {
  const [state, update] = useState({ editing: false, value });

  function onEsc(event) {
    // Disable editing on pressing ESC
    if (state.editing && event.keyCode === 27) {
      update({ editing: false });
    }
  }

  useEffect(() => {
    document.addEventListener("keydown", onEsc);

    return function cleanup() {
      document.removeEventListener("keydown", onEsc);
    };
  });

  return (
    <form
      onSubmit={e => {
        e.preventDefault();

        update({ editing: false });
        onChange(state.value);
      }}
    >
      <div className="form-group">
        {text}:{" "}
        {state.editing ? (
          <input
            type="number"
            defaultValue={value}
            onChange={e => {
              update({ editing: true, value: e.target.value });
              onChange(e.target.value);
            }}
          />
        ) : (
          <span onClick={() => update({ editing: true })}>{value}</span>
        )}
        <br />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={e => {
            update({ editing: false, value: e.target.value });
            onChange(e.target.value);
          }}
          className="slider form-control"
        />
      </div>
      <style jsx>{`
        .slider {
          -webkit-appearance: none;
          margin-top: 0.5rem;
          width: 270px;
          height: 10px;
          background: #d3d3d3;
          border-radius: 5px;
          outline: none;
          opacity: 0.7;
          -webkit-transition: 0.2s;
          transition: opacity 0.2s;
        }

        .slider:hover {
          opacity: 1;
        }

        .slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 15px;
          height: 15px;
          background: #4caf50;
          border-radius: 5px;
          cursor: pointer;
        }

        .slider::-moz-range-thumb {
          width: 15px;
          height: 15px;
          background: #4caf50;
          border-radius: 5px;
          cursor: pointer;
        }
      `}</style>
    </form>
  );
}
