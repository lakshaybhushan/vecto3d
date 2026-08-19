"use client";

import { useEditorStore } from "@/lib/store";
import { MATERIAL_PRESETS, ENVIRONMENT_PRESETS } from "@/lib/constants";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";

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
    <div className="text-[14px]">
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
    <Button
      type="button"
      variant="ghost"
      onClick={onToggle}
      className="h-auto w-full justify-between rounded-none border-b border-white/[0.08] px-4 py-3 text-left font-medium text-neutral-300 hover:bg-white/[0.03] hover:text-white active:scale-100">
      <span>{title}</span>
      <ChevronDown
        className={`h-4 w-4 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
      />
    </Button>
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
    <Collapsible open={isOpen}>
      <CollapsibleContent>{children}</CollapsibleContent>
    </Collapsible>
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
        <Slider
          min={min}
          max={max}
          step={step}
          value={[value]}
          onValueChange={([nextValue]) => onChange(nextValue)}
          aria-label={label}
          className="w-24"
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
      <Switch checked={value} onCheckedChange={onChange} aria-label={label} />
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
          <Button
            key={opt.value}
            type="button"
            size="sm"
            variant={value === opt.value ? "default" : "outline"}
            onClick={() => onChange(opt.value)}
            className="h-8 px-2.5 text-[12px]">
            {opt.label}
          </Button>
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
      <SectionHeader title="Geometry" isOpen={isOpen} onToggle={onToggle} />
      <AnimatedSection isOpen={isOpen}>
        <div className="border-b border-white/[0.08] px-4 py-2">
          <SliderRow
            label="Depth"
            value={depth}
            onChange={setDepth}
            min={0.1}
            max={10}
            step={0.1}
          />
          <ToggleRow
            label="Bevel"
            value={bevelEnabled}
            onChange={setBevelEnabled}
          />
          <AnimatedSection isOpen={bevelEnabled}>
            <div className="space-y-0">
              <SliderRow
                label="Thickness"
                value={bevelThickness}
                onChange={setBevelThickness}
                min={0}
                max={5}
                step={0.1}
              />
              <SliderRow
                label="Size"
                value={bevelSize}
                onChange={setBevelSize}
                min={0}
                max={3}
                step={0.1}
              />
              <SliderRow
                label="Smoothness"
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
    label: p.label,
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
      <SectionHeader title="Material" isOpen={isOpen} onToggle={onToggle} />
      <AnimatedSection isOpen={isOpen}>
        <div className="border-b border-white/[0.08] px-4 py-2">
          <SelectRow
            label="Preset"
            value={materialPreset}
            options={presetOptions}
            onChange={handlePresetChange}
          />
          <SliderRow
            label="Roughness"
            value={roughness}
            onChange={setRoughness}
            min={0}
            max={1}
            step={0.01}
          />
          <SliderRow
            label="Metalness"
            value={metalness}
            onChange={setMetalness}
            min={0}
            max={1}
            step={0.01}
          />
          <SliderRow
            label="Clearcoat"
            value={clearcoat}
            onChange={setClearcoat}
            min={0}
            max={1}
            step={0.01}
          />
          <ToggleRow
            label="Custom color"
            value={useCustomColor}
            onChange={setUseCustomColor}
          />
          <AnimatedSection isOpen={useCustomColor}>
            <div className="flex items-center justify-between py-2">
              <span className="text-neutral-500">Color</span>
              <Input
                type="color"
                value={customColor}
                onChange={(e) => setCustomColor(e.target.value)}
                className="h-8 w-16 cursor-pointer rounded-md border border-white/10 bg-transparent"
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
    label: e.label,
  }));

  return (
    <div>
      <SectionHeader title="Environment" isOpen={isOpen} onToggle={onToggle} />
      <AnimatedSection isOpen={isOpen}>
        <div className="border-b border-white/[0.08] px-4 py-2">
          <ToggleRow
            label="Enabled"
            value={useEnvironment}
            onChange={setUseEnvironment}
          />
          <AnimatedSection isOpen={useEnvironment}>
            <div className="space-y-0">
              <SelectRow
                label="Preset"
                value={environmentPreset}
                options={envOptions}
                onChange={setEnvironmentPreset}
              />
              <SliderRow
                label="Intensity"
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
      <SectionHeader title="Display" isOpen={isOpen} onToggle={onToggle} />
      <AnimatedSection isOpen={isOpen}>
        <div className="border-b border-white/[0.08] px-4 py-2">
          <div className="flex items-center justify-between py-2">
            <span className="text-neutral-500">Background</span>
            <Input
              type="color"
              value={backgroundColor}
              onChange={(e) => setBackgroundColor(e.target.value)}
              className="h-8 w-16 cursor-pointer rounded-md border border-white/10 bg-transparent"
            />
          </div>
          <ToggleRow label="Bloom" value={useBloom} onChange={setUseBloom} />
          <AnimatedSection isOpen={useBloom}>
            <SliderRow
              label="Intensity"
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
