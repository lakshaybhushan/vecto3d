<h1 align="center">Vecto3d</h1>

<p align="center">

<img src ="https://img.shields.io/badge/Next.js-000000.svg?style=for-the-badge&logo=nextdotjs&logoColor=white">
<img src ="https://img.shields.io/badge/Three.js-000000.svg?style=for-the-badge&logo=threedotjs&logoColor=white">
<img src ="https://img.shields.io/badge/v0-000000.svg?style=for-the-badge&logo=v0&logoColor=white">
<img src ="https://img.shields.io/badge/shadcn/ui-000000.svg?style=for-the-badge&logo=shadcn/ui&logoColor=white">
<img src ="https://img.shields.io/badge/TailwindCSS-000000.svg?style=for-the-badge&logo=TailwindCSS&logoColor=white">
<img src ="https://img.shields.io/badge/Vercel-000000.svg?style=for-the-badge&logo=Vercel&logoColor=white">

</p>

![GithubBanner](./app/opengraph-image.png)

A super simple tool to convert your simple SVGs, mostly logos, to 3D models.
Check it out at [https://vecto3d.xyz](https://vecto3d.xyz)

## But why?

So, one day I was bored and decided to open Blender. I loaded up a logo that I designed in Figma (check it out [here](https://x.com/blakssh/status/1895902171788689741)) and then started playing around with the different tools to make it 3D. I knew that you can convert any SVG to 3D models in Blender, but I wanted to make it easier and faster. So I checked out the web and found a few tools, but they were either paid or lacked a 3D model export feature. So I thought, why not make a tool that can do this easily and quickly?

## Project Structure

```
vecto3d/
├── public/                 # Static assets
├── app/                    # Next.js App Router
│   └──edit/                # SVG editor route
├── components/             # React components
│   ├── ui/                 # UI components
│   └── controls/           # Control panel components
├── lib/                    # Libraries and utilities
├── hooks/                  # Custom React hooks
├── styles/                 # Styles CSS
└── ...config files         # e.g., next.config.ts, tsconfig.json, package.json...
```

## What can you do with this?

- Convert your simple SVGs to 3D models.
- Multiple customization options, which include Geometry, Materials, Environment, and Background, with a simple, intuitive UI.
- Customize your 3D models with your desired thickness or bevels.
- Experiment with different colors and materials (Glass, Metal, Plastic, etc.).
- Preview your 3D models in different environments and also add your own custom environment using any image you want.
- Download 3D models in STL, GLB, and GLTF formats.
- Export images in PNG in HD, 2K, and 4K quality.
- Change the background color of the preview panel to see the 3D model in different colors.

## Vibe Mode

Since vibe coding is currently in trend, I thought, why not add a "vibe mode" to this app? So I added a button to toggle this mode. This mode allows you to add a dreamy effect with bloom and soft shadows to your preview panel.

## Acknowledgements

I've used multiple tools to make this app, especially [V0.dev](https://v0.dev) for quick prototyping, [shadcn/ui](https://ui.shadcn.com), and [Magic UI](https://magicui.design/) for the amazing UI components.

## License & Contributing

This project uses the MIT License. See the [LICENSE](LICENSE) file for details. For contributing, please read the [CONTRIBUTING.md](CONTRIBUTING.md) file.


## Sponsors

This project is proudly supported by:

<a href="https://vercel.com/oss">
  <img alt="Vercel OSS Program" src="https://vercel.com/oss/program-badge.svg" />
</a>


## Contact

You can contact me on [X (Twitter)](https://x.com/blakssh) I'll be happy to help you :)
