<div align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="./public/logo_dark.svg">
    <source media="(prefers-color-scheme: light)" srcset="./public/logo_light.svg">
    <img alt="Vecto3d logo" src="./public/logo_light.svg" width="64" height="64">
  </picture>

  <h1>Vecto3d</h1>
  <p>Turn SVGs into 3D objects, directly in your browser.</p>
  <p>
    <a href="https://vecto3d.xyz">Open Vecto3d</a>
    ·
    <a href="https://github.com/lakshaybhushan/vecto3d">GitHub</a>
  </p>

  <a href="https://vercel.com/oss">
    <img alt="Vercel OSS Program" src="https://vercel.com/oss/program-badge.svg" height="32">
  </a>
</div>

Vecto3d is a free, open-source tool for giving flat SVG artwork depth, material, lighting, and motion. There is nothing to install and no account is required. Uploaded files stay in your browser.

## Features

- Upload, drag and drop, or paste an SVG.
- Start quickly with built-in example artwork.
- Adjust depth, bevel thickness, bevel size, and smoothness in real time.
- Choose a material preset or tune roughness, metalness, clearcoat, and color.
- Preview the model in multiple lighting environments and adjust their intensity.
- Set a custom preview background and add a bloom effect.
- Rotate the model directly in the viewport, reset changes, or enter fullscreen.
- Export a still image, an animation, or a production-ready 3D file.
- Use the same compact controls on desktop and mobile.

## Workflow

1. **Add an SVG.** Drop, paste, or select a file on the landing page. You can also choose one of the included examples.
2. **Shape it.** Adjust the model depth and bevel until the geometry feels right.
3. **Finish it.** Choose a material, color, environment, background, and optional bloom.
4. **Export it.** Save the result in the format that fits your workflow.

## Editor controls

| Section     | Controls                                                            |
| ----------- | ------------------------------------------------------------------- |
| Geometry    | Depth, bevel, thickness, size, and smoothness                       |
| Material    | Presets, roughness, metalness, clearcoat, and a custom color picker |
| Environment | Lighting presets and intensity                                      |
| Display     | Background color and bloom intensity                                |
| Export      | Image, 3D model, and recorded animation formats                     |

## Export formats

| Format | Output                                         |
| ------ | ---------------------------------------------- |
| PNG    | High-resolution still image                    |
| MP4    | Recorded model rotation                        |
| GIF    | Short looping model rotation                   |
| STL    | Mesh for 3D printing and fabrication workflows |
| GLB    | Portable binary 3D model                       |
| GLTF   | Portable JSON-based 3D model                   |

MP4 and GIF recording use the live WebGL preview. Turn on auto-rotate in the export panel, then choose the speed and duration before recording.

## Local development

Vecto3d uses [Bun](https://bun.sh) as its package manager.

```bash
git clone https://github.com/lakshaybhushan/vecto3d.git
cd vecto3d
bun install
bun run dev
```

Open [http://localhost:3000](http://localhost:3000).

Run the checks before opening a pull request:

```bash
bun run lint
NODE_ENV=production bun run build
```

## Tech stack

- [Next.js](https://nextjs.org) and [React](https://react.dev)
- [Three.js](https://threejs.org) and [React Three Fiber](https://r3f.docs.pmnd.rs)
- [TypeScript](https://www.typescriptlang.org)
- [Tailwind CSS](https://tailwindcss.com)
- [shadcn/ui](https://ui.shadcn.com) and [Radix UI](https://www.radix-ui.com)
- [Zustand](https://zustand.docs.pmnd.rs) for editor state
- [Framer Motion](https://motion.dev) for interface motion
- [Cuelume](https://cuelume-site.pages.dev) for synthesized interaction sounds
- [react-colorful](https://github.com/omgovich/react-colorful) for the color picker

## Project structure

```text
vecto3d/
├── app/
│   ├── page.tsx                 # Landing and SVG input flow
│   └── edit/page.tsx            # 3D editor
├── components/
│   ├── edit/                    # Editor controls and export panel
│   ├── previews/                # Three.js model and preset previews
│   └── ui/                      # Shared interface primitives
├── hooks/                       # Browser and device hooks
├── lib/
│   ├── exporters.ts             # PNG and 3D export helpers
│   ├── video-recorder.ts        # MP4 and GIF recording
│   ├── store.ts                 # Editor state
│   └── svg-sanitizer.ts         # SVG validation and sanitization
├── public/                      # Logos, workers, and texture assets
└── styles/                      # Global styles
```

## Privacy and browser support

SVG processing and editing happen locally in the browser. The current file is kept in session storage so it can move from the landing page into the editor without being uploaded.

Chrome and Firefox are recommended. Safari can have WebGL rendering and performance issues, so the editor shows a warning before continuing.

## Contributing

Issues and pull requests are welcome. Read [CONTRIBUTING.md](CONTRIBUTING.md) before getting started.

Vecto3d is available under the [MIT License](LICENSE).

## Author

Made by [@blakssh](https://x.com/blakssh).
