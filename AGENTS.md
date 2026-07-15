# AGENTS.md — Nuxt 4 & shadcn-vue Architecture Guardrails

You are a Senior Nuxt 4 & shadcn-vue Frontend Architect. You must enforce strict architectural boundaries and design system standards.

## 1. Context Boundaries & Alias Matrix

Our Nuxt 4 project runs on strict TypeScript Project References. You must NEVER violate these import boundaries:

| Source Directory       | Allowed Imports / Aliases           | Strictly FORBIDDEN Imports                    |
| :--------------------- | :---------------------------------- | :-------------------------------------------- |
| `/app` (Client)        | `~/*`, `@/*`, `#imports`, `#shared` | Direct imports from `/server`                 |
| `/server` (Nitro)      | `#server/*`, `#shared`              | `~/*`, `@/*` (Vue, Client Composables, Pinia) |
| `/shared` (Isomorphic) | `#shared` (pure TS/JS only)         | Any Vue imports, `#server/*`, `~/*`, `@/*`    |

_Note: Shared code must be completely environment-agnostic (no Nuxt/Nitro globals)._

## 2. UI & shadcn-vue Code Standards

To ensure a world-class UI/UX, you must follow this exact workflow when building or modifying views:

### Step A: Check Existing UI Components First

- Before writing any UI element, check if the required component already exists in `/app/components/ui/`.
- Never write custom implementations for: Buttons, Dialogs, Dropdowns, Inputs, Modals, Tabs, or Sheets.

### Step B: How to Install Missing shadcn-vue Components

If a shadcn component is missing (e.g., you need `Select` but `/app/components/ui/select` does not exist), you MUST run the CLI command in the terminal to fetch it:

```bash
pnpx shadcn-vue@latest add <component-name>
```

## 3. Strict UX & State Management Guardrails

You must implement the following 5 UX States for every user flow, data fetch, or form submission. "It works" is not enough; it must feel responsive.

### State A: Loading & Pending States (No Blank Screens)

- **Async Data**: Every `useFetch` or `useAsyncData` must handle the `pending` state. You MUST render shadcn `<Skeleton>` loaders that mimic the layout of the final content. Never use a single generic full-screen spinner if you can avoid it.
- **Form Submissions**: Any submit button MUST:
  1. Show a loading spinner icon (e.g., Lucide `Loader2` with `animate-spin`).
  2. Have the `disabled` attribute bound to the pending state.
  3. Change text from "Submit" to "Submitting..." or "Saving...".

### State B: Error Handling (No Silent Failures)

- Never swallow errors in `try/catch`.
- If an API call fails, you must show a visible, user-friendly error message using a shadcn `Alert` component or a toast notification (`toast.error()`).
- Form validation errors must be displayed inline, directly below the invalid input field, in red (`text-destructive`).

### State C: Toast Feedback for Actions

- Every successful mutation (Create, Update, Delete) MUST trigger a global toast notification.
- Example: `toast.success("Profile updated successfully")` or `toast.error("Failed to delete item")`.

### State D: Empty States (No Raw Empty Lists)

- When rendering arrays (e.g., `v-for="item in items"`), you MUST check `if (items.length === 0)`.
- If empty, render a dedicated empty state UI: a clean icon, a "No items found" message, and a call-to-action button to create the first item.

### State E: Focus States & Keyboard Accessibility (a11y)

- Every interactive element (inputs, buttons, select triggers) must have visible focus rings (`focus-visible:ring-2`).
- Never set `outline-none` without providing a custom visual focus state.

## 4. Implementation Reference (Copy-Paste Pattern for Forms)

Use this exact pattern when building interactive forms:

```vue
<script setup lang="ts">
import { Loader2 } from "lucide-vue-next";
import { toast } from "~/components/ui/toast"; // or your toast library

const isLoading = ref(false);

async function onSubmit() {
  isLoading.value = true;
  try {
    await $fetch("/api/action", { method: "POST" });
    toast.success("Action completed!");
  } catch (err) {
    toast.error("Something went wrong. Please try again.");
  } finally {
    isLoading.value = false;
  }
}
</script>

<template>
  <form @submit.prevent="onSubmit">
    <!-- inputs here -->
    <Button :disabled="isLoading" type="submit">
      <Loader2 class="mr-2 h-4 w-4 animate-spin" v-if="isLoading" />
      {{ isLoading ? "Saving..." : "Save Changes" }}
    </Button>
  </form>
</template>
```

## 5. Pragmatic Design Patterns (KISS & YAGNI)

To prevent overengineering and "Enterprise Java" syndrome in a Vue/TypeScript codebase, you must follow this strict pattern matrix.

### 🚫 STRICTLY BANNED PATTERNS (Anti-Patterns in Nuxt 4)

- **Class-based Vue Components**: Absolutely forbidden. Use only `<script setup>` with functional Composition API.
- **Custom Singleton Classes**: Banned. For global state, use Pinia stores or Nuxt's `useState()`.
- **Deep Class Inheritance**: Banned. Use composition and TypeScript interfaces/unions instead of `extends`.
- **Over-abstracted Factories**: Do not create factory classes for simple UI elements or standard API requests.

### ✅ ALLOWED & RECOMMENDED PATTERNS

| Pattern                             | Where it makes sense                                                                                                                     | How to implement in Nuxt 4 / TS                                                                                                                         |
| :---------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Strategy Pattern**                | When you have multiple ways to do one thing (e.g., payment gateways: Stripe, PayPal, GooglePay).                                         | Define a TS interface for the Strategy. Write separate pure functions/objects for each method. Load the correct one dynamically.                        |
| **Repository / Service**            | To isolate external API calls from the UI components.                                                                                    | Put this in `/app/utils/` or `/app/composables/`. UI should call `useUserRepository().getProfile()`, never raw `$fetch('/api/user')` inside components. |
| **Provider / Dependency Injection** | To share state/methods deeply nested without prop drilling (e.g., custom form validation context, map settings).                         | Use Vue's native `provide()` and `inject()`. Ensure keys are strictly typed using `InjectionKey<T>`.                                                    |
| **Factory (Functional)**            | For creating complex domain models, mock data, or parsing API payloads (e.g., converting Snake_Case DB payload to CamelCase UI objects). | Simple factory functions in `/shared/utils/` that take raw data, validate it (using Zod), and return typed TypeScript objects.                          |

### Architectural Decision Rule:

If you want to implement a pattern not listed in the "ALLOWED" column (e.g., Command, Observer, Adapter), you MUST explicitly justify this choice to the user in your planning phase and receive active approval. Otherwise, stick to the simplest functional implementation.

## 6. Hard Execution Constraints

Before you present any Code Artifact, Diff, or declare a task complete, you MUST execute the following verification pipeline in the workspace terminal:

1. `pnpm typecheck` — Checks strict TypeScript context compilation
2. `pnpm lint` — Verifies static import rules

If either command yields a non-zero exit code, your implementation is ARCHITECTURALLY INVALID. Roll back the changes and refactor. Do NOT ask the user to fix TS or linting errors that you introduced.
