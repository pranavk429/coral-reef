# ClickUp Pro Design Aesthetic Spec

## Overview
This document outlines the design aesthetic mapped to the Coral Audit Dashboard, utilizing the "ClickUp Pro" philosophy. It merges the structure, depth, and micro-interactions of ClickUp with the data-density and refined typography needed for a professional auditing/security tool.

## 1. Color System

### Canvas & Surfaces
- **App Background:** `#F8F9FA` (Cool, light gray for the main canvas)
- **Primary Surfaces (Cards, Tables):** `#FFFFFF` (Crisp white to pop against the canvas)
- **Borders & Dividers:** `#E2E8F0` (Barely visible, structural only)

### Brand & Interactive
- **Primary Action (Buttons, Active States):** `#4F46E5` (Deep Indigo) or `#0F172A` (Slate)
- **Hover States (Row/Item Highlights):** `#F1F5F9`

### Semantic Status Colors (Pill Background / Text)
- **Success / Passed:** `bg-green-100` (`#DCFCE7`) / `text-green-800`
- **Error / Failed:** `bg-red-100` (`#FEE2E2`) / `text-red-800`
- **Warning / Pending:** `bg-amber-100` (`#FEF3C7`) / `text-amber-800`
- **Info / Neutral:** `bg-blue-100` (`#DBEAFE`) / `text-blue-800`

## 2. Typography

- **Font Family:** `Inter`, `sans-serif` (Tightened letter-spacing `tracking-tight` for headings, normal for body).
- **Primary Data Text:** `text-slate-900` (`#0F172A`), `14px` or `15px` for optimal density.
- **Secondary/Helper Text:** `text-slate-500` (`#64748B`), `13px`.
- **Section Headers (Overlines):** `text-xs`, `uppercase`, `tracking-wider`, `font-semibold`, `text-slate-500`. (Used for dashboard sections like "EVIDENCE GATHERER").

## 3. Core Components

### Cards & Panels
- **Border Radius:** `8px` (`rounded-lg` in Tailwind).
- **Shadow:** Minimal and diffuse. `box-shadow: 0 1px 3px rgba(0,0,0,0.05)` or standard Tailwind `shadow-sm`. No heavy drop shadows on static elements.

### Status Badges
- **Shape:** Fully rounded pills (`rounded-full`).
- **Padding:** Tight vertical padding, moderate horizontal padding (e.g., `px-2.5 py-0.5`).
- **Font Size:** `12px` (`text-xs`), `font-medium`.

### Buttons
- **Shape:** `6px` or `8px` radius.
- **Primary:** Solid indigo background, white text.
- **Secondary/Outline:** Transparent background, `1px` border `#E2E8F0`, slate text.

## 4. Motion & Interactions

- **Hover on Interactive Elements (Rows, Cards):**
  - Instantaneous transition (`duration-150`, `ease-in-out`).
  - Background color shifts to `#F1F5F9`.
  - No scaling/bouncing to maintain professional feel.
- **Click/Press States (Buttons):**
  - Active state scales down to `0.98` (`active:scale-[0.98]`) for 100ms.
- **Tooltips:**
  - Appear instantly (`delay-75`).
  - Dark background (`#1E293B`), white text, `4px` radius.

## Implementation Guidelines
- Prioritize padding and structural whitespace over visible lines and borders. 
- Use the status colors generously for all audit results to make scanning the dashboard immediate and intuitive.
- Keep the background canvas `#F8F9FA` and place all components on `#FFFFFF` cards to create natural groupings.
