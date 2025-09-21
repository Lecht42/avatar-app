"use client";
import { useCallback, useEffect, useRef, useState } from "react";

type Props = {
  label?: string;
  description?: string;
  value?: string | null;
  onChange: (next: string | null) => void;
};

export default function ImageUpload({ label = "Reference image", description, value, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [preview, setPreview] = useState<string | null>(value ?? null);
  const [isDrag, setIsDrag] = useState(false);

  useEffect(() => {
    setPreview(value ?? null);
  }, [value]);

  const handleFile = useCallback((file: File | null) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setPreview(reader.result);
        onChange(reader.result);
      }
    };
    reader.readAsDataURL(file);
  }, [onChange]);

  return (
    <div className="upload">
      <div className="upload__label">
        <label>{label}</label>
        {description && <p>{description}</p>}
      </div>
      <div
        className={`upload__dropzone ${isDrag ? "upload__dropzone--active" : ""}`}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDrag(true);
        }}
        onDragLeave={() => setIsDrag(false)}
        onDrop={(event) => {
          event.preventDefault();
          setIsDrag(false);
          handleFile(event.dataTransfer?.files?.[0] ?? null);
        }}
        onClick={() => inputRef.current?.click()}
      >
        {preview ? (
          <div className="upload__preview" onClick={(event) => event.stopPropagation()}>
            {}
            <img src={preview} alt="reference" />
            <button
              type="button"
              className="ghost-button"
              onClick={() => {
                setPreview(null);
                onChange(null);
              }}
            >
              Remove
            </button>
          </div>
        ) : (
          <span>Drop an image or click to attach visual context</span>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          hidden
          onChange={(event) => handleFile(event.target.files?.[0] ?? null)}
        />
      </div>
    </div>
  );
}
