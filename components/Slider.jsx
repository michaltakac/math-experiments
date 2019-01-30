import React from "react";

export function Slider({ min, max, step, value, text, onChange }) {
  return (
    <div>
      <div className="form-group">
        {text}: <span>{value}</span>
        <br />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={onChange}
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
    </div>
  );
}
