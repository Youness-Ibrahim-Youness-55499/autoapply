# Project instructions

This repository is used to analyze and independently rebuild the general
functionality and structure of a reference website.

## Working method

Work slowly and in small parts.

Do not build the entire website in one task.

Before writing code:

1. Inspect the relevant screenshot.
2. Describe the page structure.
3. Identify reusable components.
4. List unclear details.
5. Wait for a separate implementation task.

## Coding rules

1. Change only files required for the current task.
2. Keep components small and focused.
3. Avoid duplicated code.
4. Do not copy logos, brand names, protected text, or copyrighted images.
5. Use original code, wording, branding, and assets.
6. Explain which files were changed.
7. Run available tests before completing a coding task.

# Project instructions

This repository independently recreates the general functionality and
structure of reference websites.

Do not copy protected branding, text, logos, or copyrighted assets.
Use original code, wording, branding, and visual assets.

## Frontend stack

Use:

- React
- TypeScript
- Vite
- Tailwind CSS v4
- pnpm

Add libraries only when the current task requires them:

- React Router for multiple application routes
- Lucide React for general interface icons
- Vitest and Testing Library for component behavior
- Playwright for browser, responsive, and screenshot testing

Do not introduce Next.js, another framework, a component library, or a
state-management library without an explicit requirement.

## Working method

Work slowly and in small parts.

Do not build the entire website in one task.

Before writing code:

1. Read the current task.
2. Inspect the relevant screenshot.
3. Describe the visible page structure.
4. Identify reusable components.
5. List unclear details and assumptions.
6. Wait for explicit permission to implement unless the task already
   clearly requests implementation.

## React and TypeScript rules

1. Use function components.
2. Use TypeScript for every source file.
3. Do not use `any` unless there is a documented reason.
4. Keep components small and focused.
5. Prefer props and local state over global state.
6. Extract shared components only after a real reuse case exists.
7. Keep page-specific components close to their page.
8. Use semantic HTML before adding ARIA attributes.

## Styling rules

1. Use Tailwind CSS for layout and styling.
2. Define shared colors, typography, spacing, radii, and shadows as
   design tokens.
3. Avoid unexplained arbitrary values.
4. Use arbitrary values when screenshot accuracy genuinely requires them.
5. Build mobile-first responsive layouts.
6. Do not copy visual assets from the reference website.
7. Preserve visible focus states and sufficient color contrast.

## Component organization

Use this structure when the relevant folders are needed:

src/
  assets/
  components/
    layout/
    sections/
    ui/
  pages/
  styles/
  App.tsx
  main.tsx

- `layout/` contains elements such as Header, Footer, and PageContainer.
- `sections/` contains page sections such as Hero, Pricing, and FAQ.
- `ui/` contains reusable primitives such as Button, Card, and Badge.
- `pages/` assembles sections into complete pages.

Do not create empty folders in advance.

## Screenshot workflow

For screenshot-based work:

1. Record the reference image and target viewport.
2. Implement only the section named in the task.
3. Run the application.
4. Capture the result at the target viewport.
5. Compare structure, spacing, typography, colors, and responsiveness.
6. Correct important
