# ClickUp Pro Aesthetic Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the "ClickUp Pro" design aesthetic (soft shadows, light gray canvas, crisp white cards, geometric fonts, and clean status badges) onto the existing Coral Audit dashboard.

**Architecture:** We will modify the global CSS to add our custom base styles (fonts and canvas colors) and custom utility classes for shadows/hover states. We will then refactor `layout.tsx` and `page.tsx` to use these classes, wrapping the main content in our new UI structure.

**Tech Stack:** Next.js, Tailwind CSS (via utility classes), standard HTML/CSS.

---

### Task 1: Establish Global Styles and Utilities

**Files:**
- Modify: `src/app/globals.css`
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: Import Google Fonts and configure base styles**
  In `src/app/globals.css`, append the font import and base body styles to set the Inter font and light gray canvas.

```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

body {
  font-family: 'Inter', sans-serif;
  background-color: #F8F9FA;
  color: #0F172A;
  -webkit-font-smoothing: antialiased;
}

/* Custom Utilities for ClickUp Pro Aesthetic */
.clickup-card {
  background-color: #FFFFFF;
  border-radius: 8px;
  border: 1px solid #E2E8F0;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}

.clickup-interactive-row {
  transition: background-color 150ms ease-in-out;
}
.clickup-interactive-row:hover {
  background-color: #F1F5F9;
  cursor: pointer;
}

.clickup-btn-press {
  transition: transform 100ms ease, background-color 150ms ease;
}
.clickup-btn-press:active {
  transform: scale(0.98);
}
```

- [ ] **Step 2: Update the Root Layout**
  In `src/app/layout.tsx`, ensure the `body` tag doesn't have hardcoded background colors that override our CSS.

```tsx
import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Coral Audit',
  description: 'AI-driven auditing platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="h-screen flex overflow-hidden text-slate-900 bg-[#F8F9FA]">
        {children}
      </body>
    </html>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add src/app/globals.css src/app/layout.tsx
git commit -m "style: apply base ClickUp Pro canvas styles and custom utilities"
```

✅ Done when:
- [ ] `src/app/globals.css` contains `.clickup-card` and other utility classes.
- [ ] `src/app/layout.tsx` has the flex layout applied to the body.

---

### Task 2: Implement Dashboard Structure & Components

**Files:**
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Wrap page content in the ClickUp Pro Layout**
  Replace the contents of `src/app/page.tsx` with the new sidebar and header layout. (Note: In a real implementation you would migrate the actual logical components here. This step outlines the structural wrapper.)

```tsx
export default function Home() {
  return (
    <div className="flex w-full h-full">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col">
          <div className="h-16 flex items-center px-6 border-b border-slate-200">
              <div className="w-8 h-8 rounded bg-indigo-600 flex items-center justify-center text-white font-bold mr-3">C</div>
              <span className="font-semibold text-lg tracking-tight">Coral Audit</span>
          </div>
          <div className="flex-1 py-6 px-4 space-y-1">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 px-2">Navigation</div>
              <a href="#" className="flex items-center px-2 py-2 text-sm font-medium rounded-md bg-indigo-50 text-indigo-700">
                  Dashboard
              </a>
          </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-auto bg-[#F8F9FA]">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8">
            <h1 className="text-xl font-semibold tracking-tight">Audit Overview</h1>
            <button className="clickup-btn-press bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
                Run New Audit
            </button>
        </header>

        <div className="p-8 max-w-5xl mx-auto space-y-6">
            <div>
                <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Audit Summary</h2>
                <div className="grid grid-cols-3 gap-6">
                    <div className="clickup-card p-5">
                        <div className="text-slate-500 text-sm font-medium mb-1">Passed</div>
                        <div className="text-3xl font-bold text-green-600">128</div>
                    </div>
                    {/* Add more cards here */}
                </div>
            </div>
            
            {/* Table Example */}
            <div className="pt-4">
                <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Evidence Log</h2>
                <div className="clickup-card overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-200 bg-slate-50 text-xs text-slate-500 uppercase tracking-wider">
                                <th className="py-3 px-6 font-medium">Control ID</th>
                                <th className="py-3 px-6 font-medium">Status</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm">
                            <tr className="clickup-interactive-row border-b border-slate-100">
                                <td className="py-3 px-6 font-medium text-slate-900">SOC-101</td>
                                <td className="py-3 px-6">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                        Passed
                                    </span>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
      </main>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat: implement ClickUp Pro layout and components on main page"
```

✅ Done when:
- [ ] `src/app/page.tsx` compiles successfully.
- [ ] The app renders with the new light gray background, white sidebar, and styled cards.
