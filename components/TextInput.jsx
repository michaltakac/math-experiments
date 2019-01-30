import React from "react";
import uuidv4 from "uuid/v4";

export function TextInput({ value, text, placeholder, onChange }) {
  const id = uuidv4();
  return (
    <div className="form-group">
      <label htmlFor={id}>{text}</label>
      <input
        className="form-control"
        id={id}
        type="text"
        placeholder={placeholder}
        defaultValue={value}
        onChange={onChange}
      />
    </div>
  );
}
