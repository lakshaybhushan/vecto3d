"use client";

import { useEditorStore } from "@/lib/store";
import {
  MATERIAL_PRESETS,
  ENVIRONMENT_PRESETS,
  BEVEL_PRESETS,
} from "@/lib/constants";
import { ChevronDown } from "lucide-react";

interface MinimalControlsProps {
  activeSection: string | null;
  onSectionChange: (section: string | null) => void;
}

export function MinimalControls({
  activeSection,
  onSectionChange,
}: MinimalControlsProps) {
  const toggleSection = (section: string) => {
    onSectionChange(activeSection === section ? null : section);
  };

  return (
    <div className="font-mono text-[14px] tracking-wide uppercase">
      <GeometrySection
        isOpen={activeSection === "geometry"}
        onToggle={() => toggleSection("geometry")}
      />
      <MaterialSection
        isOpen={activeSection === "material"}
        onToggle={() => toggleSection("material")}
      />
      <EnvironmentSection
        isOpen={activeSection === "environment"}
        onToggle={() => toggleSection("environment")}
      />
      <DisplaySection
        isOpen={activeSection === "display"}
        onToggle={() => toggleSection("display")}
      />
    </div>
  );
}

function SectionHeader({
  title,
  isOpen,
  onToggle,
}: {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      className="flex w-full items-center justify-between border-b border-neutral-800 px-4 py-3 text-left text-neutral-400 transition-colors hover:text-white">
      <span>{title}</span>
      <ChevronDown
        className={`h-4 w-4 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
      />
    </button>
  );
}

function AnimatedSection({
  isOpen,
  children,
}: {
  isOpen: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`grid transition-all duration-200 ease-out ${
        isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
      }`}>
      <div className="overflow-hidden">{children}</div>
    </div>
  );
}

function SliderRow({
  label,
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
}) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-neutral-500">{label}</span>
      <div className="flex items-center gap-3">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="h-1 w-24 cursor-pointer appearance-none bg-neutral-800 accent-white [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-none [&::-webkit-slider-thumb]:bg-white"
        />
        <span className="w-12 text-right text-neutral-400">
          {typeof value === "number" ? value.toFixed(step < 1 ? 1 : 0) : value}
        </span>
      </div>
    </div>
  );
}

function ToggleRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-neutral-500">{label}</span>
      <button
        onClick={() => onChange(!value)}
        className={`relative h-5 w-10 border transition-colors ${value ? "border-white bg-white" : "border-neutral-700 bg-neutral-900"}`}>
        <div
          className={`absolute top-0 h-full w-1/2 transition-all ${value ? "left-1/2 bg-black" : "left-0 bg-neutral-600"}`}
        />
      </button>
    </div>
  );
}

function SelectRow({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
}) {
  return (
    <div className="py-2">
      <span className="mb-2 block text-neutral-500">{label}</span>
      <div className="flex flex-wrap gap-1">
        {options.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`border px-2 py-1 text-[12px] transition-colors ${
              value === opt.value
                ? "border-white bg-white text-black"
                : "border-neutral-700 text-neutral-400 hover:border-neutral-500"
            }`}>
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function GeometrySection({
  isOpen,
  onToggle,
}: {
  isOpen: boolean;
  onToggle: () => void;
}) {
  const depth = useEditorStore((s) => s.depth);
  const setDepth = useEditorStore((s) => s.setDepth);
  const bevelEnabled = useEditorStore((s) => s.bevelEnabled);
  const setBevelEnabled = useEditorStore((s) => s.setBevelEnabled);
  const bevelThickness = useEditorStore((s) => s.bevelThickness);
  const setBevelThickness = useEditorStore((s) => s.setBevelThickness);
  const bevelSize = useEditorStore((s) => s.bevelSize);
  const setBevelSize = useEditorStore((s) => s.setBevelSize);
  const bevelSegments = useEditorStore((s) => s.bevelSegments);
  const setBevelSegments = useEditorStore((s) => s.setBevelSegments);

  return (
    <div>
      <SectionHeader title="GEOMETRY" isOpen={isOpen} onToggle={onToggle} />
      <AnimatedSection isOpen={isOpen}>
        <div className="border-b border-neutral-800 px-4 py-2">
          <SliderRow
            label="DEPTH"
            value={depth}
            onChange={setDepth}
            min={0.1}
            max={10}
            step={0.1}
          />
          <ToggleRow
            label="BEVEL"
            value={bevelEnabled}
            onChange={setBevelEnabled}
          />
          <AnimatedSection isOpen={bevelEnabled}>
            <div className="space-y-0">
              <SliderRow
                label="THICKNESS"
                value={bevelThickness}
                onChange={setBevelThickness}
                min={0}
                max={5}
                step={0.1}
              />
              <SliderRow
                label="SIZE"
                value={bevelSize}
                onChange={setBevelSize}
                min={0}
                max={3}
                step={0.1}
              />
              <SliderRow
                label="SMOOTHNESS"
                value={bevelSegments}
                onChange={setBevelSegments}
                min={1}
                max={64}
                step={1}
              />
            </div>
          </AnimatedSection>
        </div>
      </AnimatedSection>
    </div>
  );
}

function MaterialSection({
  isOpen,
  onToggle,
}: {
  isOpen: boolean;
  onToggle: () => void;
}) {
  const materialPreset = useEditorStore((s) => s.materialPreset);
  const setMaterialPreset = useEditorStore((s) => s.setMaterialPreset);
  const roughness = useEditorStore((s) => s.roughness);
  const setRoughness = useEditorStore((s) => s.setRoughness);
  const metalness = useEditorStore((s) => s.metalness);
  const setMetalness = useEditorStore((s) => s.setMetalness);
  const clearcoat = useEditorStore((s) => s.clearcoat);
  const setClearcoat = useEditorStore((s) => s.setClearcoat);
  const useCustomColor = useEditorStore((s) => s.useCustomColor);
  const setUseCustomColor = useEditorStore((s) => s.setUseCustomColor);
  const customColor = useEditorStore((s) => s.customColor);
  const setCustomColor = useEditorStore((s) => s.setCustomColor);

  const presetOptions = MATERIAL_PRESETS.map((p) => ({
    value: p.name,
    label: p.label.toUpperCase(),
  }));

  const handlePresetChange = (name: string) => {
    setMaterialPreset(name);
    const preset = MATERIAL_PRESETS.find((p) => p.name === name);
    if (preset && name !== "custom") {
      setRoughness(preset.roughness);
      setMetalness(preset.metalness);
      setClearcoat(preset.clearcoat);
    }
  };

  return (
    <div>
      <SectionHeader title="MATERIAL" isOpen={isOpen} onToggle={onToggle} />
      <AnimatedSection isOpen={isOpen}>
        <div className="border-b border-neutral-800 px-4 py-2">
          <SelectRow
            label="PRESET"
            value={materialPreset}
            options={presetOptions}
            onChange={handlePresetChange}
          />
          <SliderRow
            label="ROUGHNESS"
            value={roughness}
            onChange={setRoughness}
            min={0}
            max={1}
            step={0.01}
          />
          <SliderRow
            label="METALNESS"
            value={metalness}
            onChange={setMetalness}
            min={0}
            max={1}
            step={0.01}
          />
          <SliderRow
            label="CLEARCOAT"
            value={clearcoat}
            onChange={setClearcoat}
            min={0}
            max={1}
            step={0.01}
          />
          <ToggleRow
            label="CUSTOM COLOR"
            value={useCustomColor}
            onChange={setUseCustomColor}
          />
          <AnimatedSection isOpen={useCustomColor}>
            <div className="flex items-center justify-between py-2">
              <span className="text-neutral-500">COLOR</span>
              <input
                type="color"
                value={customColor}
                onChange={(e) => setCustomColor(e.target.value)}
                className="h-8 w-16 cursor-pointer border border-neutral-700 bg-transparent"
              />
            </div>
          </AnimatedSection>
        </div>
      </AnimatedSection>
    </div>
  );
}

function EnvironmentSection({
  isOpen,
  onToggle,
}: {
  isOpen: boolean;
  onToggle: () => void;
}) {
  const useEnvironment = useEditorStore((s) => s.useEnvironment);
  const setUseEnvironment = useEditorStore((s) => s.setUseEnvironment);
  const environmentPreset = useEditorStore((s) => s.environmentPreset);
  const setEnvironmentPreset = useEditorStore((s) => s.setEnvironmentPreset);
  const envMapIntensity = useEditorStore((s) => s.envMapIntensity);
  const setEnvMapIntensity = useEditorStore((s) => s.setEnvMapIntensity);

  const envOptions = ENVIRONMENT_PRESETS.map((e) => ({
    value: e.name,
    label: e.label.toUpperCase(),
  }));

  return (
    <div>
      <SectionHeader title="ENVIRONMENT" isOpen={isOpen} onToggle={onToggle} />
      <AnimatedSection isOpen={isOpen}>
        <div className="border-b border-neutral-800 px-4 py-2">
          <ToggleRow
            label="ENABLED"
            value={useEnvironment}
            onChange={setUseEnvironment}
          />
          <AnimatedSection isOpen={useEnvironment}>
            <div className="space-y-0">
              <SelectRow
                label="PRESET"
                value={environmentPreset}
                options={envOptions}
                onChange={setEnvironmentPreset}
              />
              <SliderRow
                label="INTENSITY"
                value={envMapIntensity}
                onChange={setEnvMapIntensity}
                min={0}
                max={3}
                step={0.1}
              />
            </div>
          </AnimatedSection>
        </div>
      </AnimatedSection>
    </div>
  );
}

function DisplaySection({
  isOpen,
  onToggle,
}: {
  isOpen: boolean;
  onToggle: () => void;
}) {
  const backgroundColor = useEditorStore((s) => s.backgroundColor);
  const setBackgroundColor = useEditorStore((s) => s.setBackgroundColor);
  const useBloom = useEditorStore((s) => s.useBloom);
  const setUseBloom = useEditorStore((s) => s.setUseBloom);
  const bloomIntensity = useEditorStore((s) => s.bloomIntensity);
  const setBloomIntensity = useEditorStore((s) => s.setBloomIntensity);

  return (
    <div>
      <SectionHeader title="DISPLAY" isOpen={isOpen} onToggle={onToggle} />
      <AnimatedSection isOpen={isOpen}>
        <div className="border-b border-neutral-800 px-4 py-2">
          <div className="flex items-center justify-between py-2">
            <span className="text-neutral-500">BACKGROUND</span>
            <input
              type="color"
              value={backgroundColor}
              onChange={(e) => setBackgroundColor(e.target.value)}
              className="h-8 w-16 cursor-pointer border border-neutral-700 bg-transparent"
            />
          </div>
          <ToggleRow label="BLOOM" value={useBloom} onChange={setUseBloom} />
          <AnimatedSection isOpen={useBloom}>
            <SliderRow
              label="INTENSITY"
              value={bloomIntensity}
              onChange={setBloomIntensity}
              min={0}
              max={3}
              step={0.1}
            />
          </AnimatedSection>
        </div>
      </AnimatedSection>
    </div>
  );
}
