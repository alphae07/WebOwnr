"use client";

import { templates, TemplateItem } from "@/lib/templateConfig";
import Image from "next/image";

interface TemplatePickerProps {
  selected: string;
  setSelected: (id: string) => void;
  disabled?: boolean;
}

export default function TemplatePicker({
  selected,
  setSelected,
  disabled = false,
}: TemplatePickerProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {templates.map((template: TemplateItem) => (
        <div
          key={template.id}
          onClick={() => !disabled && setSelected(template.id)}
          className={`border rounded-xl cursor-pointer p-3 shadow-md transition hover:shadow-lg ${
            selected === template.id ? "border-blue-500 ring-2 ring-blue-500" : ""
          } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          <Image
            src={template.preview}
            alt={template.name}
            width={300}
            height={180}
            className="rounded-md object-cover"
          />
          <h3 className="text-lg font-semibold mt-2">{template.name}</h3>
          <p className="text-sm text-gray-600">{template.description}</p>
        </div>
      ))}
    </div>
  );
}
