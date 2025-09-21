"use client";
import { useState } from "react";

type Props = {
  label?: string;
  placeholder?: string;
  value: string;
  onChange: (next: string) => void;
};

export default function JsonTextarea({ label = "JSON", placeholder, value, onChange }: Props) {
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isValid, setValid] = useState<boolean | null>(null);

  const validate = () => {
    try {
      JSON.parse(value);
      setFeedback("JSON looks valid");
      setValid(true);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown JSON error";
      setFeedback(message);
      setValid(false);
    }
  };

  return (
    <div className="field">
      <div className="json-field__header">
        <label>{label}</label>
        <button type="button" className="ghost-button" onClick={validate}>
          Validate
        </button>
      </div>
      <textarea
        className="json-field__textarea"
        placeholder={placeholder}
        value={value}
        onChange={(event) => {
          onChange(event.target.value);
          setValid(null);
          setFeedback(null);
        }}
      />
      {feedback && (
        <p className={isValid ? "field__hint" : "error-text"}>{feedback}</p>
      )}
    </div>
  );
}
