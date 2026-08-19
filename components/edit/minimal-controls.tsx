"use client";

import { useEditorStore } from "@/lib/store";
import { MATERIAL_PRESETS, ENVIRONMENT_PRESETS } from "@/lib/constants";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";
import { PopoverPicker } from "@/components/ui/color-picker";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

const materialPresetOptions = MATERIAL_PRESETS.map((preset) => ({
  value: preset.name,
  label: preset.label,
}));

const environmentPresetOptions = ENVIRONMENT_PRESETS.map((preset) => ({
  value: preset.name,
  label: preset.label,
}));

const sectionContentClass = "border-b border-white/[0.05] px-3.5 py-2";
const sliderClass =
  "mt-2 w-full [&_[data-slot=slider-track]]:h-1 [&_[data-slot=slider-track]]:bg-white/[0.08] [&_[data-slot=slider-range]]:bg-white [&_[data-slot=slider-thumb]]:size-3.5 [&_[data-slot=slider-thumb]]:border-white/70 [&_[data-slot=slider-thumb]]:bg-[#121212] [&_[data-slot=slider-thumb]]:hover:ring-2";

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
      aria-expanded={isOpen}
      className={cn(
        "h-10 w-full justify-between rounded-none border-b border-white/[0.05] px-3.5 py-0 text-left text-[14px] font-medium text-[#aaa] hover:bg-white/[0.03] hover:text-white active:scale-100",
        isOpen && "bg-white/[0.025] text-white",
      )}>
      <span>{title}</span>
      <ChevronDown
        className={cn(
          "size-3.5 text-[#666] transition-transform duration-150 ease-[cubic-bezier(0.23,1,0.32,1)]",
          isOpen && "rotate-180 text-[#999]",
        )}
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
      <CollapsibleContent className="overflow-hidden">
        {children}
      </CollapsibleContent>
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
  const precision =
    step < 0.001 ? 4 : step < 0.01 ? 3 : step < 0.1 ? 2 : step < 1 ? 1 : 0;

  return (
    <div className="py-2.5">
      <div className="flex items-center justify-between gap-3">
        <span className="text-[#888]">{label}</span>
        <span className="text-[#c8c8c8] tabular-nums">
          {value.toFixed(precision)}
        </span>
      </div>
      <Slider
        min={min}
        max={max}
        step={step}
        value={[value]}
        onValueChange={([nextValue]) => onChange(nextValue)}
        aria-label={label}
        className={sliderClass}
      />
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
    <div className="flex items-center justify-between py-2.5">
      <span className="text-[#888]">{label}</span>
      <Switch
        checked={value}
        onCheckedChange={onChange}
        aria-label={label}
        className="border-white/10 data-[state=checked]:bg-white data-[state=unchecked]:bg-white/10"
      />
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
    <div className="py-2.5">
      <span className="mb-2 block text-[#888]">{label}</span>
      <div className="grid grid-cols-2 gap-1.5">
        {options.map((opt) => (
          <Button
            key={opt.value}
            type="button"
            variant="ghost"
            aria-pressed={value === opt.value}
            onClick={() => onChange(opt.value)}
            className={cn(
              "h-8 justify-start rounded-md border px-2.5 text-[14px] font-normal",
              value === opt.value
                ? "border-white/25 bg-white text-[#101010] hover:bg-[#e8e8e8] hover:text-[#101010]"
                : "border-white/[0.08] bg-white/[0.025] text-[#999] hover:border-white/15 hover:bg-white/[0.05] hover:text-white",
            )}>
            {opt.label}
          </Button>
        ))}
      </div>
    </div>
  );
}

function ColorRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 py-2.5">
      <span className="text-[#888]">{label}</span>
      <span className="flex items-center gap-2">
        <span className="text-[#777] tabular-nums">{value}</span>
        <PopoverPicker color={value} label={label} onChange={onChange} />
      </span>
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
        <div className={sectionContentClass}>
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
  const transmission = useEditorStore((s) => s.transmission);
  const setTransmission = useEditorStore((s) => s.setTransmission);
  const setEnvMapIntensity = useEditorStore((s) => s.setEnvMapIntensity);
  const bevelEnabled = useEditorStore((s) => s.bevelEnabled);
  const setBevelEnabled = useEditorStore((s) => s.setBevelEnabled);
  const setBevelThickness = useEditorStore((s) => s.setBevelThickness);
  const setBevelSize = useEditorStore((s) => s.setBevelSize);
  const setBevelSegments = useEditorStore((s) => s.setBevelSegments);
  const useCustomColor = useEditorStore((s) => s.useCustomColor);
  const setUseCustomColor = useEditorStore((s) => s.setUseCustomColor);
  const customColor = useEditorStore((s) => s.customColor);
  const setCustomColor = useEditorStore((s) => s.setCustomColor);

  const handlePresetChange = (name: string) => {
    setMaterialPreset(name);
    const preset = MATERIAL_PRESETS.find((p) => p.name === name);
    if (preset && name !== "custom") {
      setRoughness(preset.roughness);
      setMetalness(preset.metalness);
      setClearcoat(preset.clearcoat);
      setTransmission(preset.transmission);
      setEnvMapIntensity(preset.envMapIntensity);

      if (name === "glass_smoked" && !bevelEnabled) {
        setBevelEnabled(true);
        setBevelThickness(0.8);
        setBevelSize(0.55);
        setBevelSegments(8);
      }
    }
  };

  return (
    <div>
      <SectionHeader title="Material" isOpen={isOpen} onToggle={onToggle} />
      <AnimatedSection isOpen={isOpen}>
        <div className={sectionContentClass}>
          <SelectRow
            label="Preset"
            value={materialPreset}
            options={materialPresetOptions}
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
          {transmission > 0 || materialPreset === "custom" ? (
            <SliderRow
              label="Transmission"
              value={transmission}
              onChange={setTransmission}
              min={0}
              max={1}
              step={0.01}
            />
          ) : null}
          <ToggleRow
            label="Custom color"
            value={useCustomColor}
            onChange={setUseCustomColor}
          />
          <AnimatedSection isOpen={useCustomColor}>
            <ColorRow
              label="Color"
              value={customColor}
              onChange={setCustomColor}
            />
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

  return (
    <div>
      <SectionHeader title="Environment" isOpen={isOpen} onToggle={onToggle} />
      <AnimatedSection isOpen={isOpen}>
        <div className={sectionContentClass}>
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
                options={environmentPresetOptions}
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
  const useChromaticAberration = useEditorStore(
    (s) => s.useChromaticAberration,
  );
  const setUseChromaticAberration = useEditorStore(
    (s) => s.setUseChromaticAberration,
  );
  const chromaticAberrationIntensity = useEditorStore(
    (s) => s.chromaticAberrationIntensity,
  );
  const setChromaticAberrationIntensity = useEditorStore(
    (s) => s.setChromaticAberrationIntensity,
  );
  const useGrain = useEditorStore((s) => s.useGrain);
  const setUseGrain = useEditorStore((s) => s.setUseGrain);
  const grainIntensity = useEditorStore((s) => s.grainIntensity);
  const setGrainIntensity = useEditorStore((s) => s.setGrainIntensity);
  const useVignette = useEditorStore((s) => s.useVignette);
  const setUseVignette = useEditorStore((s) => s.setUseVignette);
  const vignetteIntensity = useEditorStore((s) => s.vignetteIntensity);
  const setVignetteIntensity = useEditorStore((s) => s.setVignetteIntensity);

  return (
    <div>
      <SectionHeader title="Display" isOpen={isOpen} onToggle={onToggle} />
      <AnimatedSection isOpen={isOpen}>
        <div className={sectionContentClass}>
          <ColorRow
            label="Background"
            value={backgroundColor}
            onChange={setBackgroundColor}
          />
          <ToggleRow label="Bloom" value={useBloom} onChange={setUseBloom} />
          <AnimatedSection isOpen={useBloom}>
            <SliderRow
              label="Intensity"
              value={bloomIntensity}
              onChange={setBloomIntensity}
              min={0}
              max={1.5}
              step={0.05}
            />
          </AnimatedSection>
          <ToggleRow
            label="Chromatic aberration"
            value={useChromaticAberration}
            onChange={setUseChromaticAberration}
          />
          <AnimatedSection isOpen={useChromaticAberration}>
            <SliderRow
              label="Amount"
              value={chromaticAberrationIntensity}
              onChange={setChromaticAberrationIntensity}
              min={0.0005}
              max={0.008}
              step={0.0005}
            />
          </AnimatedSection>
          <ToggleRow label="Grain" value={useGrain} onChange={setUseGrain} />
          <AnimatedSection isOpen={useGrain}>
            <SliderRow
              label="Amount"
              value={grainIntensity}
              onChange={setGrainIntensity}
              min={0.01}
              max={0.25}
              step={0.01}
            />
          </AnimatedSection>
          <ToggleRow
            label="Vignette"
            value={useVignette}
            onChange={setUseVignette}
          />
          <AnimatedSection isOpen={useVignette}>
            <SliderRow
              label="Amount"
              value={vignetteIntensity}
              onChange={setVignetteIntensity}
              min={0.1}
              max={1}
              step={0.05}
            />
          </AnimatedSection>
        </div>
      </AnimatedSection>
    </div>
  );
}
