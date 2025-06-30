# GPU Memory Leaks Report - Vecto3D

## Critical Memory Leaks Found

### 1. **CRITICAL**: Temporary Geometry Not Disposed in SVGModel Component

**Location**: `components/previews/svg-model.tsx:469-480`

**Issue**:

```typescript
const box = new THREE.Box3();
const tempGroup = new THREE.Group();

geometryData.forEach((shapeItem) => {
  shapeItem.shapes.forEach((shape) => {
    const geometry = new THREE.ShapeGeometry(shape); // ❌ NOT DISPOSED
    const mesh = new THREE.Mesh(geometry); // ❌ NOT DISPOSED
    tempGroup.add(mesh);
  });
});

box.setFromObject(tempGroup);
// ❌ tempGroup and its children are never disposed
```

**Impact**:

- Every time the component re-renders, new temporary geometries and meshes are created
- These are never disposed, causing progressive GPU memory accumulation
- Particularly problematic for complex SVGs with many shapes

**Severity**: HIGH - This runs on every render and accumulates quickly

---

### 2. **MODERATE**: Potential Memory Leak in MaterializedMesh

**Location**: `components/previews/svg-model.tsx:560-591`

**Issue**:

- The `MaterializedMesh` component creates `extrudeGeometry` but relies on React Three Fiber for cleanup
- No explicit disposal of the geometry when component unmounts or props change
- Geometry disposal depends entirely on R3F's internal cleanup

**Impact**:

- May cause memory leaks if R3F doesn't properly dispose geometries
- Risk increases with complex extrude settings and frequent re-renders

**Severity**: MODERATE - Depends on R3F behavior

---

### 3. **MODERATE**: Memory Manager WebGL Context Loss Handling

**Location**: `lib/memory-manager.ts:134-141`

**Issue**:

```typescript
const canvases = document.querySelectorAll("canvas");
canvases.forEach((canvas) => {
  const gl = canvas.getContext("webgl") || canvas.getContext("webgl2");
  if (gl && gl.getExtension("WEBGL_lose_context")) {
    gl.getExtension("WEBGL_lose_context")?.loseContext(); // ❌ Aggressive context loss
  }
});
```

**Impact**:

- Forcing WebGL context loss during low memory situations may not properly clean up resources
- Could cause application instability or rendering issues
- Not handling context restoration

**Severity**: MODERATE - Edge case but problematic

---

### 4. **LOW**: Potential Race Condition in Material Disposal

**Location**: `components/previews/svg-model.tsx:383-388`

**Issue**:

```typescript
setTimeout(() => {
  materialsToDispose.forEach((material) => {
    memoryManager.untrack(material);
    material.dispose();
  });
}, 0);
```

**Impact**:

- Using setTimeout with 0 delay for disposal could create race conditions
- Materials might be accessed after disposal if timing is incorrect
- Not a direct memory leak but could cause errors

**Severity**: LOW - Unlikely to cause major issues

---

### 5. **LOW**: Missing WebGL Context Event Handlers

**Location**: Various Canvas components

**Issue**:

- No explicit handling of `webglcontextlost` and `webglcontextrestored` events
- Canvas components don't implement context recovery strategies

**Impact**:

- If WebGL context is lost (browser/OS level), application may not recover properly
- Resources may not be properly cleaned up on context loss

**Severity**: LOW - Browser handles most cases automatically

---

## Additional Memory Management Concerns

### Environment Map Loading

**Location**: `components/previews/environment-presets.tsx`

- Environment textures are cached but disposal timing could be improved
- Custom environment loading doesn't track textures in memory manager

### Texture Cache Size Limits

**Location**: `lib/texture-cache.ts`

- Cache has 100MB limit but relies on estimation for texture sizes
- Actual GPU memory usage may differ from estimated size

### Export Function Memory Management

**Location**: `lib/exporters.ts`

- Export functions create temporary materials and geometries
- Cleanup is implemented but could be more robust

---

## Recommendations

### Immediate Fixes Required:

1. **Fix Critical Temporary Geometry Leak**:

   ```typescript
   // Add cleanup after box calculation
   box.setFromObject(tempGroup);

   // Dispose temporary objects
   tempGroup.traverse((child) => {
     if (child instanceof THREE.Mesh) {
       if (child.geometry) child.geometry.dispose();
     }
   });
   tempGroup.clear();
   ```

2. **Add Explicit Geometry Disposal in MaterializedMesh**:

   - Track extrudeGeometry instances
   - Add cleanup useEffect

3. **Improve WebGL Context Handling**:
   - Add context lost/restored event listeners
   - Implement graceful context recovery

### Monitoring & Prevention:

1. **Enhanced Memory Tracking**:

   - Add geometry tracking to memory manager
   - Monitor GPU memory usage more accurately

2. **Development Tools**:

   - Add memory usage display in dev mode
   - Implement memory leak detection warnings

3. **Testing**:
   - Add automated tests for memory cleanup
   - Test with complex SVGs and long sessions

---

## Summary

The most critical issue is the temporary geometry creation in the SVGModel component that accumulates on every render. This should be fixed immediately as it can cause significant memory growth over time. Other issues are less severe but should be addressed for overall application stability.

**Priority Order**:

1. Fix temporary geometry disposal (CRITICAL)
2. Improve MaterializedMesh cleanup (MODERATE)
3. Enhance WebGL context handling (MODERATE)
4. Address timing issues in disposal (LOW)
5. Add context event handlers (LOW)
