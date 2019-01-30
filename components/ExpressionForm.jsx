import React from "react";
import { withNamespaces } from "../i18n";

function ExpressionForm({ t, id, onSubmit, label, onChange, value }) {
  return (
    <form onSubmit={onSubmit}>
      <div className="form-group">
        {label && <label htmlFor={`expr-input-${id}`}>{label}</label>}
        <input
          className="form-control"
          id={`expr-input-${id}`}
          aria-describedby="expression-input"
          type="text"
          defaultValue={value}
          onChange={onChange}
        />
      </div>
      <div className="form-group">
        <button className="btn btn-primary" type="submit">
          {t("draw-function")}
        </button>
      </div>
    </form>
  );
}

export default withNamespaces("common")(ExpressionForm);
