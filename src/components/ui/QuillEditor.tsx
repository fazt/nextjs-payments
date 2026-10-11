"use client";

import dynamic from "next/dynamic";
import "react-quill-new/dist/quill.snow.css";

// react-quill dejó de funcionar con React 19 (usaba findDOMNode); react-quill-new
// es el fork mantenido. Se carga solo en el navegador porque Quill necesita `document`.
const ReactQuill = dynamic(() => import("react-quill-new"), {
  ssr: false,
  loading: () => <div className="h-32 rounded-sm bg-slate-200" />,
});

interface Props {
  value?: string;
  onChange?: (value: string) => void;
  onBlur?: () => void;
}

export function QuillEditor({ value, onChange, onBlur }: Props) {
  return (
    <ReactQuill
      theme="snow"
      value={value ?? ""}
      onChange={(html) => onChange?.(html)}
      onBlur={() => onBlur?.()}
    />
  );
}
