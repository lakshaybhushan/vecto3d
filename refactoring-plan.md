# Refactoring Plan

This document outlines the prioritized plan for refactoring the Vecto3D application based on the observations in `improvements.md`.

## Prioritization Legend:

- **P0 (Critical):** Must fix. Issues that are severe security risks, cause critical bugs, or have a very high negative impact on performance/usability.
- **P1 (High Impact):** Highly recommended. Issues that significantly affect performance, maintainability, or robustness.
- **P2 (Medium Impact):** Recommended. Improvements that will enhance code quality, UX, or maintainability.
- **P3 (Low Impact):** Nice to have. Minor cleanups or enhancements.

---

## P0: Critical Issues

### 1. XSS Vulnerability in SVG Preview

- **File(s) Affected:** `components/file-upload.tsx`
- **Issue:** Use of `dangerouslySetInnerHTML` with user-uploaded/selected SVG content poses a significant XSS risk.
- **Specific Changes:**
  1.  **Sanitize SVG Content:** Implement SVG sanitization before rendering.
      - **Option A (Preferred if library available and suitable):** Use a well-tested client-side sanitization library like `DOMPurify`. Check if it can be integrated (`bun add dompurify @types/dompurify`).
      - **Option B (If DOMPurify is not an option):** Explore server-side sanitization if an API endpoint can be used for processing SVG content before it reaches the client for preview. This is more secure but adds complexity.
      - **Option C (Less secure, fallback):** If direct DOM injection is absolutely necessary for styling and no robust library is feasible, implement a stricter custom sanitization logic, but this is highly discouraged due_to_its complexity and potential for errors.
  2.  **Safer Rendering Method (Consider as alternative/addition):** For the raw SVG preview, if complex styling (like `fill="currentColor"` through CSS) is not strictly required for the _preview_ itself, consider rendering the SVG into an `<img>` tag:
      ```html
      <img src={`data:image/svg+xml;utf8,${encodeURIComponent(sanitizedSvgContent)}`} alt="SVG Preview" />
      ```
      This method generally prevents scripts in SVGs from executing. However, direct CSS styling (like `fill`) becomes harder.
- **Potential Challenges:**
  - Finding a lightweight, effective sanitization library that works well with the existing setup.
  - Ensuring sanitization doesn't break valid SVGs or excessively strip features needed for preview.
  - If using `<img>` tag, replicating the "current color" fill might be difficult.

### 2. Overhaul Zustand Store Subscriptions (Performance)

- **File(s) Affected:** `app/edit/page.tsx`, `components/controls/texture-controls.tsx`, `components/controls/geometry-controls.tsx`, `components/controls/material-controls.tsx`, `components/controls/environment-controls.tsx`, `components/controls/background-controls.tsx`.
- **Issue:** Components destructure large parts of the Zustand store, leading to excessive re-renders.
- **Specific Changes:**

  1.  **Identify Minimal State Slices:** For each affected component, meticulously identify the _exact_ pieces of state it directly needs for rendering or its immediate logic.
  2.  **Implement Fine-Grained Selectors:** Refactor store consumption to use inline selectors for each required piece of state.

      - **Example (in `GeometryControls.tsx`):**

        ```typescript
        // Before
        // const { depth, setDepth, bevelEnabled, setBevelEnabled, ... } = useEditorStore();

        // After
        const depth = useEditorStore((state) => state.depth);
        const setDepth = useEditorStore((state) => state.setDepth);
        const bevelEnabled = useEditorStore((state) => state.bevelEnabled);
        const setBevelEnabled = useEditorStore(
          (state) => state.setBevelEnabled,
        );
        // ... and so on for every prop used by this component directly.
        ```

  3.  **Propagate Selectors to Children (if `EditPage` decomposition is deferred):** If `EditPage` is not immediately decomposed, ensure it uses selectors for props it passes down, so it doesn't become a bottleneck itself.

- **Potential Challenges:**
  - This will be a widespread change and requires careful attention to detail in each component.
  - Ensuring that no necessary state subscriptions are missed.

---

## P1: High Impact Issues

### 1. Refactor `app/edit/page.tsx`

- **File(s) Affected:** `app/edit/page.tsx`
- **Issue:** Monolithic component with too many responsibilities, excessive `useEffect` hooks, fragile SVG analysis, and artificial delays.
- **Specific Changes:**
  1.  **Component Decomposition (Progressive):**
      - **Identify Logical Sections:** Break down the JSX and logic into smaller, self-contained child components. Candidates:
        - `LoadingOverlay` (already suggested in `improvements.md`)
        - `SvgProcessingLogic` (to encapsulate SVG data loading from localStorage, debouncing, initial hollowness check - though this check needs review)
        - `ControlPanelTabs` (could be a container for the `Tabs` component and its `TabsContent` mapping, ensuring it only gets props needed for tab setup).
      - Each new child component should ideally manage its own state subscriptions from Zustand using selectors if it needs global state.
  2.  **Reduce `useEffect` Overload:**
      - **Move Logic to Event Handlers:** Where effects are reacting to state changes to trigger other actions (e.g., toasts), move that logic into the event handlers/Zustand actions that _cause_ the state change in the first place.
      - **Consolidate Toasts:** Instead of multiple `useEffect`s for toasts, centralize toast logic or trigger them directly from relevant actions.
      - **Review `setHasMounted`:** Confirm its necessity or if Next.js offers better hydration management.
  3.  **Remove Artificial Delays:** Delete the 800ms `setTimeout` tied to `debouncedSvgData`. Loading states should reflect actual processing.
  4.  **Address SVG Hollowness Detection:**
      - **Evaluate Necessity:** Determine if this client-side "guess" is critical.
      - **If Critical:** Replace the fragile string-matching with a more robust method. This might involve:
        - A lightweight client-side SVG parsing library (if one exists that can provide path structure info without full rendering).
        - Moving this analysis to `components/svg-model.tsx` where `SVGLoader` already parses paths. `SVGModel` could then expose this information.
      - **If Not Critical/Reliable:** Remove the feature to simplify. The `spread` prop in `SVGModel` might already cover the intended visual outcome.
- **Potential Challenges:**
  - Decomposition can be complex and requires careful thought about component boundaries and prop drilling (though minimized by direct Zustand access in children).
  - Refactoring numerous `useEffect`s requires understanding their original intent.

### 2. Optimize `components/svg-model.tsx`

- **File(s) Affected:** `components/svg-model.tsx`
- **Issue:** Core 3D generation logic with fragile SVG preprocessing, artificial delays, and a potentially very expensive `useMemo` for geometry/material creation.
- **Specific Changes:**
  1.  **Improve SVG Preprocessing:**
      - **Sanitization:** Similar to `file-upload.tsx`, if untrusted SVGs are possible, use a robust sanitization library _before_ `SVGLoader.parse()`. The current string replacements are insufficient.
      - **Remove Artificial Delay:** Delete `setTimeout(() => { onLoadComplete?.(); }, 300);`. Call `onLoadComplete` after actual mesh generation and material setup are complete (likely at the end of the `useMemo` for `shapesWithMaterials` or after it successfully runs).
  2.  **Review and Optimize `applySpread` Function:**
      - **Clarify Purpose:** Understand its exact geometric goal and its relation to the (commented-out) `isHollowSvg` prop.
      - **Performance Profile:** If complex SVGs make this function slow, investigate algorithmic optimizations.
      - **Robustness:** Ensure the geometric math is sound for various SVG path structures.
  3.  **Optimize `shapesWithMaterials` `useMemo`:**
      - **Profile:** Use React DevTools profiler to understand how often it re-runs and how long it takes with different SVGs and interactions.
      - **Reduce Dependency Impact:**
        - **Separate Geometry from Materials:** The biggest win would be to avoid regenerating geometries if only material-related props change (e.g., `roughness`, `customColor`). This might involve:
          - Creating geometries in one `useMemo` (dependent on SVG data and geometry props).
          - Creating/updating materials in a separate `useEffect` or `useMemo` that iterates over existing meshes and updates their `material` property when material props change. This is a significant architectural shift.
        - If full separation is too complex initially, try to minimize re-processing within the existing `useMemo`. For example, if shapes are stable, only update materials.
  4.  **Material System:**
      - Remove the red wireframe for holes if it's debug code: `material = new THREE.MeshBasicMaterial({ color: "red", wireframe: true });`
  5.  **Review `isHollowSvg` Prop Usage:** Since it's commented out in prop destructuring, either remove it fully from props/types or integrate its intended logic clearly, possibly via the `spread` prop.
- **Potential Challenges:**
  - Refactoring the `shapesWithMaterials` memo is highly complex and risks introducing bugs if not done carefully.
  - Robust SVG sanitization without breaking legitimate SVG features.
  - Performance profiling and identifying specific bottlenecks within `SVGModel` can be time-consuming.

### 3. Refactor `localStorage` for `svgData` Transfer

- **File(s) Affected:** `app/page.tsx`, `app/edit/page.tsx`, `lib/store.ts`
- **Issue:** Using `localStorage` for potentially large `svgData` can exceed quotas or cause performance issues.
- **Specific Changes:**
  1.  **Add `svgData` and `fileName` to Zustand Store (if not already implicitly handled):**
      - The store already has `svgData: string | null;` and `fileName: string;`. Ensure these are the source of truth.
  2.  **Update `app/page.tsx` (`handleContinue`):**
      - Instead of `localStorage.setItem("svgData", svgData);`, call the Zustand action: `setSvgData(svgData);`.
      - Similarly for `fileName`.
  3.  **Update `app/edit/page.tsx` (Initial Data Load `useEffect`):**
      - Remove logic that reads `svgData` and `fileName` from `localStorage`.
      - The component will get these directly from the Zustand store subscription.
      - The redirect `router.push("/");` if `svgData` is null in the store is still valid.
- **Potential Challenges:**
  - Ensuring the state is correctly set in the store before navigation to `/edit`.
  - Managing the initial loading state in `EditPage` which now relies on store hydration/population.

---

## P2: Medium Impact Issues

### 1. Improve Preset Preview Rendering in Control Panels

- **File(s) Affected:** `components/controls/geometry-controls.tsx`, `components/controls/material-controls.tsx`
- **Issue:** Verbose and repetitive CSS/logic for rendering previews of bevel and material presets.
- **Specific Changes:**
  - **`geometry-controls.tsx` (Bevel Previews):**
    1.  **Data-Driven Styles:** Add visual properties (e.g., `previewStyle: { borderRadius: '6px', shadowDetails: '...' }` or specific CSS classes) to the `BEVEL_PRESETS` objects in `lib/constants.ts`.
    2.  **Create `BevelPreview` Component:** A small component that takes these visual properties (or the preset object) and renders the preview dynamically.
    3.  Replace the repetitive conditional rendering blocks with a map over `BEVEL_PRESETS` using this new component.
  - **`material-controls.tsx` (Material Previews):**
    1.  **Encapsulate Logic:** Create a `MaterialPresetPreview` sub-component.
    2.  Move the complex HSL calculations and conditional styling for `reflectionColor`, `baseColor`, `clearcoat`, `transmission` into this sub-component.
    3.  The main component then maps over `MATERIAL_PRESETS` and renders `MaterialPresetPreview` for each.
    4.  **Consider Memoization:** If these previews are still costly and re-render often, memoize the `MaterialPresetPreview` component or the list items.
- **Potential Challenges:**
  - Designing a flexible enough data structure in `BEVEL_PRESETS` for varied CSS previews.
  - Ensuring the HSL calculations in `MaterialPresetPreview` remain accurate.

### 2. Scalable Icon Loading in `components/file-upload.tsx`

- **File(s) Affected:** `components/file-upload.tsx`
- **Issue:** `if-else if` chain for loading example icon SVG strings is not scalable.
- **Specific Changes:**

  1.  **Create SVG Map:** Implement the suggested `iconSvgMap`:

      ```typescript
      import {
        GITHUB_SVG,
        V0_SVG,
        VERCEL_SVG,
        X_SVG,
        CHAT_APP_SVG,
        VECTO3D_SVG,
      } from "@/components/raw-svgs";

      const iconSvgMap: Record<string, string> = {
        GitHub: GITHUB_SVG,
        v0: V0_SVG,
        Vercel: VERCEL_SVG,
        "X/Twitter": X_SVG,
        "AI Chat": CHAT_APP_SVG,
        Vecto3d: VECTO3D_SVG,
      };
      ```

  2.  **Refactor `handleIconSelect`:** Use the map for lookup:
      ```typescript
      // ...
      const svgString = iconSvgMap[iconName];
      if (svgString) {
        onFileUpload(
          svgString,
          `${iconName.toLowerCase().replace(/\W+/g, "-")}.svg`,
        ); // Sanitize filename
        setSvgContent(svgString);
      }
      // ...
      ```

- **Potential Challenges:** Minor, this is a straightforward refactor.

### 3. Address UI/UX and Logic in `app/page.tsx`

- **File(s) Affected:** `app/page.tsx`
- **Issue:** Imperative scrolling, review `will-change` usage.
- **Specific Changes:**
  1.  **Imperative Scrolling:**
      - Replace `document.getElementById("continue-button-section")` and `window.scrollTo` with a React `useRef` attached to the target section.
      - Use `ref.current?.scrollIntoView({ behavior: "smooth", block: "center" });` (or similar options) for scrolling.
      - Remove the `setTimeout(150)` if possible; scrolling can usually be triggered once the ref is available after state updates that reveal the section.
  2.  **Review `will-change: "transform"` Usage:**
      - Systematically review each `motion` component using `style={{ willChange: "transform" }}`.
      - Profile animations with and without `will-change` using browser developer tools to see if it provides a tangible benefit or if Framer Motion's default optimizations are sufficient. Remove where not beneficial.
  3.  **Audio Playback `useEffect`**: Move `audio.play()` logic into `handleContinue` where `setIsLoading(true)` is called.
- **Potential Challenges:**
  - Ensuring smooth scrolling works reliably across different rendering timings.
  - Performance profiling can be nuanced.

---

## P3: Low Impact Issues

### 1. General Code Cleanup

- **File(s) Affected:** Various (as noted in `improvements.md`: `app/edit/page.tsx`, `components/controls/environment-controls.tsx`, `components/export-buttons.tsx`, `components/controls/background-controls.tsx`, `lib/types.ts`)
- **Issue:** Commented-out code, unused variables, unclear "magic numbers".
- **Specific Changes:**
  - Remove all commented-out code blocks that are no longer relevant.
  - Delete any unused imported variables or declared variables.
  - For "magic numbers" (e.g., rotation offset `+1.5` in `geometry-controls.tsx`, `depth * 5` in `ModelPreview`, `spread` scaling factors in `SVGModel`), either:
    - Replace with named constants if their meaning is specific and reusable.
    - Add a brief comment explaining their derivation or purpose if they are context-specific calculations.
  - Clarify the `"m3d"` string in `components/export-buttons.tsx` -> `handlePrint` by using a named constant (e.g., `PRINT_SERVICE_M3D = "m3d"`).
  - Clarify `isHollowSvg` usage in types/props if it's still relevant or remove it.
  - In `components/controls/background-controls.tsx`, ensure `PopoverPicker` `onChange` consistently updates `userSelectedBackground` and `solidColorPreset` to `"custom"`.
- **Potential Challenges:** Ensuring no functional code is accidentally removed.

### 2. Review `lib/constants.ts` Texture Adjustments

- **File(s) Affected:** `lib/constants.ts`, `components/svg-model.tsx`
- **Issue:** Clarity of `roughnessAdjust`, `metalnessAdjust` in `TEXTURE_PRESETS`.
- **Specific Changes:**
  - In `components/svg-model.tsx`, when applying textures, ensure the logic for how `roughnessAdjust` and `metalnessAdjust` modify the base material properties is clear and correct.
  - Add comments in `lib/constants.ts` or `components/svg-model.tsx` to explain how these adjustments are applied (e.g., "adds to base roughness", "multiplies base metalness").
- **Potential Challenges:** Understanding the original intent if not immediately obvious.

### 3. Asset Path Verification (Maintenance Task)

- **File(s) Affected:** `lib/constants.ts` (texture paths, environment EXR paths)
- **Issue:** Potential for broken asset paths as project evolves.
- **Specific Changes:** (This is more of a maintenance strategy than a code refactor)
  - Consider creating a simple script (e.g., a Node.js script) that reads `lib/constants.ts`, extracts all asset paths, and checks if the corresponding files exist in the `public` directory or relevant asset locations.
  - This script could be run manually or as part of a pre-commit/CI check.
- **Potential Challenges:** Setting up the script initially.

---

This plan provides a structured approach to addressing the identified issues. We should tackle P0 items first, followed by P1, and so on. Each item may be broken down into smaller tasks during implementation.
