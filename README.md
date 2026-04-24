# diorame-landing

Static HTML landing page for [Diorame](https://diorame.com) — a free browser-based 2D illustration app with automatic 3D depth, cinematic cameras, and Risograph-inspired filters.

Migrated from Figma Sites to GitHub Pages for full control over hosting, SEO, and localization.

## Structure

```
diorame-landing/
├── en/
│   ├── index.html   # English landing page → diorame.com
│   └── CNAME        # → diorame.com
├── es/
│   ├── index.html   # Spanish landing page → es.diorame.com
│   └── CNAME        # → es.diorame.com
├── assets/
│   ├── logo.png
│   ├── hero-bg.png
│   ├── ipad.png
│   ├── character.png
│   ├── blob-icon.png
│   ├── brush-icon.png
│   ├── dumaker.png
│   ├── view-screen.png
│   ├── arrow.svg
│   ├── favicon.png
│   └── og-image.png
├── .github/
│   └── workflows/
│       └── deploy.yml
├── LICENSE
└── README.md
```

## Deployment

Pushing to `main` triggers two parallel GitHub Actions jobs:

| Branch | Serves | Custom domain |
|--------|--------|---------------|
| `gh-pages-en` | `en/` | `diorame.com` |
| `gh-pages-es` | `es/` | `es.diorame.com` |

Each branch contains a `CNAME` file for GitHub Pages custom domain configuration.

## Tech stack

- Single HTML file per language — no frameworks, no build step
- CSS embedded in each HTML file
- Fonts: [Manrope](https://fonts.google.com/specimen/Manrope) (body) and [Chewy](https://fonts.google.com/specimen/Chewy) (display) via Google Fonts
- Images: all assets downloaded from the original Figma Sites export

## SEO

- Full meta tags: `title`, `description`, `og:*`, `twitter:*`
- `hreflang` alternate links in both versions pointing to `diorame.com` and `es.diorame.com`
- FAQ [Schema.org](https://schema.org/FAQPage) JSON-LD in the English version

## License

[CC BY-NC-SA 4.0](LICENSE) — © 2026 Moisés (Dumaker)
