import React from "react";

export function Checkbox({ checked, onChange, text }) {
  return (
    <div>
      <p>
        {text}{" "}
        <input type="checkbox" onChange={onChange} defaultChecked={checked} />
      </p>
    </div>
  );
}
