# Data Observatory — Design Philosophy

## Chosen Approach: **Minimalist Technical Workspace**

### Design Movement
**Neo-Brutalist Developer Tool** — inspired by Jupyter Notebook, Observable, and modern IDE aesthetics. Clean, functional, no marketing fluff. The interface gets out of the way and lets data speak.

### Core Principles
1. **Functional Minimalism**: Every pixel serves a purpose. No decorative elements, no rounded corners unless they improve usability.
2. **Technical Clarity**: Monospace fonts for code and data, sans-serif for labels. Visual hierarchy through spacing and weight, not color.
3. **Dark-First Design**: Default dark theme because analysts work long hours. Reduces eye strain, feels professional and serious.
4. **Privacy-Forward**: The absence of a backend is a feature, not a limitation. Emphasize that data never leaves the device.

### Color Philosophy
- **Background**: Deep charcoal (`#0f0f0f`) — almost black, reduces eye strain
- **Surface**: Slightly lighter (`#1a1a1a`) for panels and cards
- **Accent**: Cyan/teal (`#06b6d4`) — technical, cool, signals interactivity
- **Text**: Off-white (`#e5e7eb`) for primary, muted gray (`#9ca3af`) for secondary
- **Borders**: Subtle gray (`#2d2d2d`) — barely visible but present

### Layout Paradigm
**3-Panel IDE Layout** (not centered, not symmetric):
- **Left Sidebar (180px)**: Thin, fixed. File list, table selector. Scrollable.
- **Main Area (1fr)**: Flexible. SQL editor on top (40%), data preview + chart below (60%).
- **Responsive**: On mobile, stack vertically; sidebar becomes a drawer.

### Signature Elements
1. **Monospace Code Blocks**: All SQL, data cells, and query results use `JetBrains Mono` or `Fira Code`
2. **Subtle Dividers**: Thin 1px borders in muted gray, not thick shadows
3. **Minimal Icons**: Lucide React icons, 18-20px, used sparingly for clarity

### Interaction Philosophy
- **No Animations for Keyboard Actions**: Command palette, query execution must be instant (0ms).
- **Smooth Transitions for UI State**: Panel resizing, file uploads, chart updates: 150-200ms ease-out.
- **Hover States**: Subtle background shift (1-2% opacity change), no scale transforms.
- **Feedback**: Toast notifications for errors/success, inline validation for SQL.

### Animation Guidelines
- **Button Press**: `transform: scale(0.98)` on `:active`, 100ms ease-out
- **Panel Transitions**: 150ms ease-out for show/hide
- **Data Load**: Skeleton loaders with subtle pulse animation (opacity 0.7 → 1.0, 1.5s loop)
- **Chart Render**: Staggered bar/line entrance, 30ms per item, 200ms total

### Typography System
- **Display/Headings**: `Inter` 600-700 weight, 18-24px (for section titles like "Query", "Result")
- **Body/Labels**: `Inter` 400-500 weight, 13-14px
- **Code/Data**: `JetBrains Mono` or `Fira Code`, 13px, 1.5 line-height
- **Hierarchy**: Weight + size, never color alone

### Brand Essence
**"Your data, your rules, your device."** A private, serious, technical workspace for analysts and developers who value privacy and speed over flashy UIs.

**Personality**: Precise, trustworthy, no-nonsense, technical.

### Brand Voice
- **Headlines**: Direct, action-oriented. "Upload CSV", "Query Results", not "Welcome to Data Observatory"
- **CTAs**: Verb-first. "Execute Query", "Export as PNG", not "Get Started"
- **Microcopy**: Concise, technical. "Column type auto-detected: numeric" not "We've detected your column!"
- **Example lines**:
  - "100% client-side. Your data never leaves your device."
  - "Query with SQL. Visualize instantly."

### Wordmark & Logo
**Logo**: A minimalist database icon (three stacked horizontal lines forming a cylinder shape) in cyan, 32px, no text. Place in top-left corner of header.

### Signature Brand Color
**Cyan (`#06b6d4`)** — technical, cool, signals data flow and interactivity. Used for:
- Active file/table highlight
- Query execute button
- Chart accent color
- Hover states

---

## Implementation Notes
- **Font Import**: Add to `client/index.html`:
  ```html
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
  ```
- **CSS Variables**: Update `index.css` with dark theme colors (charcoal, cyan accents)
- **Component Style**: All panels use `bg-surface-2` with `border-border` (1px), no shadows
- **Spacing**: 12px grid for consistency (8px, 12px, 16px, 24px, 32px)
