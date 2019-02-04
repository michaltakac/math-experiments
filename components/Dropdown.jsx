import React from "react";
import { FormGroup, Label, Input } from "reactstrap";
import uuidv4 from "uuid/v4";

export function Dropdown({ label, options, onChange }) {
  const id = uuidv4();

  return (
    <FormGroup>
      <Label for={id}>{label}</Label>
      <Input type="select" name={`select-${id}`} id={id} onChange={onChange}>
        {options.map((option, i) => (
          <option key={i}>{option}</option>
        ))}
      </Input>
    </FormGroup>
  );
}
