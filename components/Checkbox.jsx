import React from "react";

export function Checkbox({ checked, onChange, text }) {
  return (
    <div>
      <p>
        {text} <input type="checkbox" onChange={onChange} checked={checked} />
      </p>
    </div>
  );
}
