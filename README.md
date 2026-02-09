# Markdown Multi-Diff Tool

A web-based tool to compare multiple Markdown documents against a base version.

## Features
- Compare N >= 2 documents simultaneously.
- Select any document as "Base".
- Unified Diff view (text) + Rendered Markdown Preview.
- Pure frontend, no server/database required.
- Deployable to Vercel/Netlify.

## Project Structure

```
src/
├── components/
│   ├── DocumentCard.tsx    # Individual document viewer (Edit/Preview/Diff)
│   └── ...
├── store/
│   └── useDocStore.ts      # Zustand store for document state
├── utils/
│   └── diff.ts             # Diff generation logic (using 'diff' package)
├── App.tsx                 # Main layout
├── types.ts                # TypeScript definitions
└── main.tsx                # Entry point
```

## Local Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start dev server:
   ```bash
   npm run dev
   ```

3. Open `http://localhost:5173`.

## Deployment (Vercel)

This project is optimized for Vercel deployment.

1. Push this code to a Git repository (GitHub/GitLab/Bitbucket).
2. Go to [Vercel](https://vercel.com) and "Add New Project".
3. Import your repository.
4. Vercel will auto-detect Vite.
   - Framework Preset: `Vite`
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. Click **Deploy**.

## Deployment (Netlify)

1. Drag and drop the `dist` folder (after running `npm run build`) to Netlify Drop, or connect via Git.
2. Build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`

## Tech Stack
- React + Vite
- TypeScript
- Tailwind CSS
- Zustand (State Management)
- jsdiff (Diffing)
- react-markdown (Rendering)
