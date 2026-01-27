# Compound Interest Calculations

## Formula

The compound interest formula is:

```
A = P(1 + r/n)^(nt)
```

Where:

- **A** = final amount
- **P** = principal (initial investment)
- **r** = annual interest rate (as a decimal, e.g., 0.07 for 7%)
- **n** = number of times interest is compounded per year
- **t** = time in years

## JavaScript Example

```javascript
function compoundInterest(principal, annualRate, compoundsPerYear, years) {
    return (
        principal *
        Math.pow(1 + annualRate / compoundsPerYear, compoundsPerYear * years)
    );
}

// Example: $10,000 at 7% annual rate, compounded annually for 10 years
const result = compoundInterest(10000, 0.07, 1, 10);
console.log(result.toFixed(2)); // $19,671.51
```

## Annual Compounding (Simplified)

For annual gains where interest compounds once per year (n=1):

```javascript
function annualCompoundInterest(principal, annualRate, years) {
    return principal * Math.pow(1 + annualRate, years);
}

// $10,000 at 7% for 10 years
annualCompoundInterest(10000, 0.07, 10); // $19,671.51
```

## Adjusting the Formula

### Different Compounding Frequencies

| Frequency     | n value |
| ------------- | ------- |
| Annually      | 1       |
| Semi-annually | 2       |
| Quarterly     | 4       |
| Monthly       | 12      |
| Daily         | 365     |

```javascript
// Monthly compounding: $10,000 at 7% for 10 years
compoundInterest(10000, 0.07, 12, 10); // $20,096.61
```

### Continuous Compounding

For continuous compounding, use the formula `A = Pe^(rt)`:

```javascript
function continuousCompoundInterest(principal, annualRate, years) {
    return principal * Math.exp(annualRate * years);
}

continuousCompoundInterest(10000, 0.07, 10); // $20,137.53
```

### With Regular Contributions

To calculate compound interest with regular deposits:

```javascript
function compoundWithContributions(
    principal,
    monthlyContribution,
    annualRate,
    years,
) {
    const monthlyRate = annualRate / 12;
    const months = years * 12;

    // Future value of initial principal
    const principalFV = principal * Math.pow(1 + monthlyRate, months);

    // Future value of monthly contributions (annuity formula)
    const contributionsFV =
        monthlyContribution *
        ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate);

    return principalFV + contributionsFV;
}

// $10,000 initial + $500/month at 7% for 10 years
compoundWithContributions(10000, 500, 0.07, 10); // $106,657.77
```

### Calculating Required Rate

To find the rate needed to reach a goal:

```javascript
function requiredRate(principal, targetAmount, years) {
    return Math.pow(targetAmount / principal, 1 / years) - 1;
}

// What rate turns $10,000 into $50,000 in 20 years?
requiredRate(10000, 50000, 20); // 0.0838 (8.38%)
```

### Calculating Time to Reach Goal

```javascript
function yearsToGoal(principal, targetAmount, annualRate) {
    return Math.log(targetAmount / principal) / Math.log(1 + annualRate);
}

// How long to double $10,000 at 7%?
yearsToGoal(10000, 20000, 0.07); // 10.24 years
```

### Inflation-Adjusted (Real) Returns

To calculate real purchasing power growth:

```javascript
function realReturn(nominalRate, inflationRate) {
    return (1 + nominalRate) / (1 + inflationRate) - 1;
}

// 7% nominal return with 3% inflation
realReturn(0.07, 0.03); // 0.0388 (3.88% real return)
```

## SvelteKit $lib Alias

In SvelteKit, `$lib` is a built-in alias that maps to `src/lib`. This allows clean imports without relative paths:

```typescript
// Instead of:
import { rebalanceCalc } from "../../lib/rebalance";

// You can write:
import { rebalanceCalc } from "$lib/rebalance";
```

If `src/lib/index.ts` exists and re-exports modules, you can import directly from `$lib`:

```typescript
import { rebalanceCalc } from "$lib";
```

The intermediate `index.ts` barrel file is optional—you can import from deeper paths like `$lib/rebalance` if you prefer explicit imports or don't need the top-level barrel.

## SvelteKit Routing

SvelteKit uses file-based routing where the file structure in `src/routes` maps directly to URL paths.

### Basic Pages

Each route is a directory containing a `+page.svelte` file:

```
src/routes/
├── +page.svelte          → /
├── about/
│   └── +page.svelte      → /about
└── portfolio/
    └── +page.svelte      → /portfolio
```

### Layouts

`+layout.svelte` wraps pages and nested layouts. Content renders where `<slot />` appears:

```svelte
<!-- src/routes/+layout.svelte -->
<script>
    import "../app.css";
</script>

<nav>...</nav>
<main>
    <slot />
</main>
<footer>...</footer>
```

Nested layouts inherit from parent layouts:

```
src/routes/
├── +layout.svelte        → wraps everything
└── dashboard/
    ├── +layout.svelte    → wraps dashboard pages (inside root layout)
    └── +page.svelte      → /dashboard
```

### Dynamic Routes

Use `[param]` brackets for dynamic segments:

```
src/routes/
└── portfolio/
    └── [id]/
        └── +page.svelte  → /portfolio/123, /portfolio/abc
```

Access the parameter in the page:

```svelte
<!-- src/routes/portfolio/[id]/+page.svelte -->
<script>
    import { page } from "$app/stores";
    // $page.params.id contains "123" for /portfolio/123
</script>
```

### Loading Data

Use `+page.ts` for universal load functions (runs on server and client):

```typescript
// src/routes/portfolio/[id]/+page.ts
import type { PageLoad } from "./$types";

export const load: PageLoad = ({ params }) => {
    return {
        portfolioId: params.id,
    };
};
```

Use `+page.server.ts` for server-only loading (database access, secrets):

```typescript
// src/routes/portfolio/[id]/+page.server.ts
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ params }) => {
    const portfolio = await db.getPortfolio(params.id);
    return { portfolio };
};
```

Access loaded data in the page:

```svelte
<script>
    export let data; // { portfolio: ... }
</script>
```

### Route Groups

Use `(groupname)` to organize routes without affecting URLs:

```
src/routes/
└── (app)/
    ├── +layout.svelte    → shared layout for app pages
    ├── dashboard/
    │   └── +page.svelte  → /dashboard (not /(app)/dashboard)
    └── settings/
        └── +page.svelte  → /settings
```

### Rest Parameters

Use `[...rest]` to match multiple path segments:

```
src/routes/
└── docs/
    └── [...slug]/
        └── +page.svelte  → /docs/a, /docs/a/b, /docs/a/b/c
```

## CSS Design System (app.css)

The global stylesheet `src/app.css` provides a design system with CSS custom properties and utility classes. Import it in `+layout.svelte`:

```typescript
import "../app.css";
```

### Color Palette

Five color families, each with shades from 50 (lightest) to 900 (darkest):

| Family   | Variable prefix     | Use case                   |
| -------- | ------------------- | -------------------------- |
| Chestnut | `--color-chestnut-` | Primary actions, branding  |
| Cream    | `--color-cream-`    | Backgrounds, text, borders |
| Meadow   | `--color-meadow-`   | Success states, accents    |
| Sage     | `--color-sage-`     | Secondary elements         |
| Sky      | `--color-sky-`      | Info states, highlights    |

```css
/* Using color variables */
.my-element {
    background-color: var(--color-chestnut-100);
    color: var(--color-chestnut-800);
    border: 1px solid var(--color-border);
}
```

### Semantic Color Variables

```css
/* Primary actions */
var(--color-primary)        /* Main brand color */
var(--color-primary-hover)  /* Hover state */

/* Status colors */
var(--color-success)  /* Positive outcomes */
var(--color-warning)  /* Caution states */
var(--color-error)    /* Error states */
var(--color-info)     /* Informational */

/* Surfaces */
var(--color-bg)       /* Page background */
var(--color-surface)  /* Card/panel background */

/* Text */
var(--color-text)           /* Primary text */
var(--color-text-secondary) /* Secondary text */
var(--color-text-muted)     /* Subtle text */
```

### Utility Classes

#### Text Colors

```html
<p class="text-primary">Primary colored text</p>
<p class="text-secondary">Secondary text</p>
<p class="text-muted">Muted/subtle text</p>
<p class="text-success">Success message</p>
<p class="text-error">Error message</p>
```

#### Financial Values

```html
<span class="value-positive">+$1,234.56</span>
<!-- Green, for gains/buy -->
<span class="value-negative">-$567.89</span>
<!-- Red, for losses/sell -->
<span class="value-neutral">$0.00</span>
<!-- Gray, no change -->
```

#### Backgrounds

```html
<div class="bg-primary">Primary background</div>
<div class="bg-surface">Card-like surface</div>
<div class="bg-alt">Alternate background</div>
```

### Button Classes

```html
<button class="btn btn-primary">Save Changes</button>
<button class="btn btn-secondary">Cancel</button>
<button class="btn btn-accent">New Portfolio</button>
```

### Card Component

```html
<div class="card">
    <div class="card-header">
        <h3>Portfolio Summary</h3>
    </div>
    <div class="card-body">
        <p>Card content goes here.</p>
    </div>
    <div class="card-footer">
        <button class="btn btn-primary">Rebalance</button>
    </div>
</div>
```

### Spacing Utilities

Tailwind-style utility classes for padding, margin, and gap. Available sizes: 0, 1, 2, 3, 4, 5, 6, 8 (plus 10, 12, 16 for padding).

| Size | Value          |
| ---- | -------------- |
| 0    | 0              |
| 1    | 0.25rem (4px)  |
| 2    | 0.5rem (8px)   |
| 3    | 0.75rem (12px) |
| 4    | 1rem (16px)    |
| 5    | 1.25rem (20px) |
| 6    | 1.5rem (24px)  |
| 8    | 2rem (32px)    |

#### Padding

```html
<div class="p-4">All sides</div>
<div class="px-4">Horizontal (left + right)</div>
<div class="py-2">Vertical (top + bottom)</div>
<div class="pt-4 pb-2">Top and bottom separately</div>
<div class="pl-6 pr-3">Left and right separately</div>
```

#### Margin

```html
<div class="m-4">All sides</div>
<div class="mx-auto">Center horizontally</div>
<div class="my-6">Vertical spacing</div>
<div class="mt-8 mb-4">Top and bottom separately</div>
<div class="ml-2 mr-4">Left and right separately</div>
```

#### Gap (for Flexbox/Grid)

```html
<div style="display: flex;" class="gap-4">
    <div>Item 1</div>
    <div>Item 2</div>
</div>

<div style="display: grid;" class="gap-x-4 gap-y-2">
    <!-- Different horizontal and vertical gaps -->
</div>
```

#### Using Variables Directly

You can also use spacing variables in custom styles:

```css
.my-component {
    padding: var(--space-4);
    margin-bottom: var(--space-6);
    gap: var(--space-2);
}
```

### Typography Variables

```css
/* Font sizes */
var(--text-sm)   /* 0.875rem */
var(--text-base) /* 1rem */
var(--text-lg)   /* 1.125rem */
var(--text-xl)   /* 1.25rem */
var(--text-2xl)  /* 1.5rem */

/* Font families */
var(--font-sans) /* System sans-serif stack */
var(--font-mono) /* Monospace for code/numbers */
```

### Container

```html
<div class="container">
    <!-- Centered, max-width content with responsive padding -->
</div>
```
