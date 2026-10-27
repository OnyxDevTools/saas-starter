<!-- filename: docs/constitutions/zustand.md -->

# Zustand AI Agent Constitution

## Purpose

This constitution defines how an AI coding agent must design, implement, modify, and review Zustand state management in this project.

The goal is to keep global state:

- Minimal
- Predictable
- Strictly typed
- Easy to debug
- Safe in Next.js App Router
- Isolated from server state
- Resistant to unnecessary rerenders
- Easy to extend without creating a monolithic store

---

## 1. Core Principles

### 1.1 Use Zustand only for client-owned state

Zustand is appropriate for shared client-side state such as:

- Selected entities
- UI preferences
- Sidebar state
- Modal state
- Multi-step workflow state
- Draft filters
- Client-side carts
- Unsaved local edits
- Temporary cross-component coordination

Zustand must not be used as the default storage mechanism for:

- Database records
- API response caching
- Server-owned state
- Authentication tokens
- Secrets
- Large datasets
- Data that should be fetched in a Server Component
- Data already managed by TanStack Query

Use this hierarchy:

```text
Local component state → useState or useReducer
Server-rendered data   → Next.js Server Components
Client API cache       → TanStack Query
Shared client state    → Zustand
Form state             → React Hook Form
Runtime validation     → Zod
```

---

## 2. Next.js Requirements

### 2.1 Zustand hooks are client-only

Any component that calls a Zustand React hook must include:

```tsx
"use client";
```

The client boundary should be placed as low in the component tree as practical.

Do not convert entire layouts or pages into Client Components solely to access Zustand.

### 2.2 Never mutate a singleton store from the server

A module-level Zustand store must not be read from or mutated by:

- Server Components
- Route handlers
- Server Actions
- Middleware
- Static generation logic

A singleton store may be shared across server requests and can leak request-specific state.

### 2.3 Use a per-request store for server-provided initialization

When Zustand must be initialized using request-specific server data:

- Create a vanilla Zustand store using `createStore`
- Instantiate it inside a client-side provider
- Expose it through React Context
- Initialize it once per rendered provider instance
- Never use a shared module-level instance

Use this pattern only when server initialization is actually required.

---

## 3. Store Design

### 3.1 Start with small domain stores

Prefer focused stores such as:

```text
src/stores/
  app-store.ts
  booking-store.ts
  property-store.ts
  notification-store.ts
```

Do not create a single global store containing unrelated application domains.

A store should represent one cohesive state boundary.

### 3.2 State and actions must be colocated

Each store must define:

- State fields
- State mutation actions
- Initial state
- Reset behavior when applicable

Components must not reproduce store mutation logic.

Preferred:

```ts
setSelectedPropertyId(propertyId);
```

Avoid:

```ts
useAppStore.setState({
  selectedPropertyId: propertyId,
});
```

Direct `setState` calls outside the store are permitted only for narrowly justified infrastructure code.

### 3.3 Use explicit action names

Actions must describe intent.

Preferred:

```ts
selectProperty;
openSidebar;
closeSidebar;
addCartItem;
removeCartItem;
resetBookingDraft;
```

Avoid vague actions such as:

```ts
setData;
updateState;
changeValue;
handleThing;
```

### 3.4 Keep derived values out of state

Do not store values that can be calculated from existing state.

Avoid:

```ts
type CartState = {
  items: CartItem[];
  itemCount: number;
  total: number;
};
```

Prefer selectors:

```ts
const itemCount = useCartStore((state) =>
  state.items.reduce((count, item) => count + item.quantity, 0),
);
```

Derived state should only be stored when calculation cost is significant and invalidation is explicit and reliable.

---

## 4. TypeScript Standards

### 4.1 All stores must use strict TypeScript

Every store must have explicit types for:

- State
- Actions
- Store slices
- Action parameters
- Persisted state
- External initialization data

Do not use:

```ts
any;
unknown as SomeType;
Record<string, any>;
```

unless required at a validated external boundary.

### 4.2 Separate state and action types when useful

Preferred structure:

```ts
type AppState = {
  sidebarOpen: boolean;
  selectedPropertyId: string | null;
};

type AppActions = {
  openSidebar: () => void;
  closeSidebar: () => void;
  selectProperty: (propertyId: string | null) => void;
  reset: () => void;
};

type AppStore = AppState & AppActions;
```

### 4.3 Define initial state as a reusable typed object

```ts
const initialState: AppState = {
  sidebarOpen: true,
  selectedPropertyId: null,
};
```

Reset actions must reuse the initial state rather than manually recreating it.

---

## 5. Selector Rules

### 5.1 Always subscribe using selectors

Preferred:

```ts
const sidebarOpen = useAppStore((state) => state.sidebarOpen);
const openSidebar = useAppStore((state) => state.openSidebar);
```

Avoid:

```ts
const store = useAppStore();
```

Subscribing to the entire store causes unnecessary rerenders.

### 5.2 Use shallow comparison for grouped selections

When selecting multiple values as an object or tuple, use Zustand shallow comparison.

```ts
import { useShallow } from "zustand/react/shallow";

const { sidebarOpen, toggleSidebar } = useAppStore(
  useShallow((state) => ({
    sidebarOpen: state.sidebarOpen,
    toggleSidebar: state.toggleSidebar,
  })),
);
```

Do not use shallow comparison when selecting a single primitive or stable action.

### 5.3 Keep selectors pure

Selectors must not:

- Mutate state
- Trigger side effects
- Perform network requests
- Write to storage
- Dispatch actions
- Depend on unstable external values

Selectors should return data only.

---

## 6. Persistence Rules

### 6.1 Persist only durable client preferences

Appropriate persisted values include:

- Theme preference
- Selected property
- Table column visibility
- Dismissed notices
- User display preferences
- Incomplete local drafts when explicitly desired

Do not persist:

- Authentication tokens
- Session cookies
- Secrets
- Loading flags
- Error objects
- Open dialogs
- Temporary hover state
- Large API payloads
- Server-owned records
- Sensitive personal data

### 6.2 Always use `partialize`

Persist middleware must explicitly define which fields are stored.

```ts
partialize: (state) => ({
  selectedPropertyId: state.selectedPropertyId,
  theme: state.theme,
}),
```

Never persist the entire store by default.

### 6.3 Version persisted data

Persisted stores that may evolve must include:

- A version number
- A migration strategy
- Safe fallback behavior

Breaking state shape changes must not leave the application unusable.

### 6.4 Account for hydration

Persisted state is unavailable during server rendering.

The agent must prevent hydration mismatches by:

- Avoiding server-rendered output that depends directly on local storage
- Rendering a stable fallback before hydration
- Using a hydration flag only when the UI truly requires it
- Avoiding unnecessary client-only rendering of entire pages

---

## 7. Middleware Rules

### 7.1 Use middleware intentionally

Allowed middleware includes:

- `devtools`
- `persist`
- `subscribeWithSelector`
- `immer` when justified

Do not add middleware preemptively.

### 7.2 Devtools must be development-only

```ts
devtools(storeCreator, {
  name: "AppStore",
  enabled: process.env.NODE_ENV === "development",
});
```

### 7.3 Name actions for debugging

When using devtools, mutations should include descriptive action names.

```ts
set({ sidebarOpen: true }, false, "app/openSidebar");
```

### 7.4 Do not use Immer by default

Use standard immutable updates unless nested update complexity clearly justifies Immer.

Prefer normalized, shallow state structures over deeply nested state.

---

## 8. Async Actions

### 8.1 Async actions are allowed but should remain narrow

Zustand actions may perform asynchronous work when the operation is client-owned.

However, prefer TanStack Query for:

- Fetching remote data
- Request deduplication
- Cache invalidation
- Retry behavior
- Pagination
- Background refresh
- Mutation tracking

### 8.2 Model async state explicitly

When an async action belongs in Zustand, define explicit status fields.

```ts
type SaveStatus = "idle" | "saving" | "success" | "error";
```

Do not rely on ambiguous booleans such as:

```ts
isLoading;
isDone;
hasFailed;
```

when states can conflict.

### 8.3 Avoid storing raw error objects

Store a stable typed error representation.

```ts
type StoreError = {
  code: string;
  message: string;
};
```

---

## 9. Store Access Outside React

Use non-hook store access only when necessary.

Allowed examples:

- WebSocket event handlers
- Browser event listeners
- Background client services
- Test setup
- External subscriptions

Use:

```ts
useAppStore.getState();
useAppStore.setState();
useAppStore.subscribe();
```

Do not use hook APIs outside React components.

External subscriptions must always be cleaned up.

```ts
const unsubscribe = useAppStore.subscribe(...);

return () => {
  unsubscribe();
};
```

---

## 10. Reset and Lifecycle Behavior

### 10.1 Stores with user-scoped data must support reset

Any store containing user-specific state must provide a reset action.

Reset user-scoped stores when:

- The user signs out
- The active account changes
- The active tenant changes
- The selected organization changes
- The application enters a new isolated session

### 10.2 Reset must not remove unrelated preferences

Separate user-scoped state from durable device preferences where practical.

For example:

```text
User session state → reset on logout
Theme preference   → remain persisted
```

---

## 11. Testing Requirements

Each non-trivial store should include tests for:

- Initial state
- Every mutation action
- Reset behavior
- Derived selectors
- Persistence filtering
- Migration behavior
- Async success behavior
- Async failure behavior

Tests should use fresh store instances where possible.

Do not allow singleton state to leak between tests.

Preferred pattern:

```ts
const store = createStore<AppStore>()((set) => ({
  ...initialState,
  // actions
}));
```

Tests must assert observable state transitions, not internal implementation details.

---

## 12. Naming and File Structure

Use:

```text
src/stores/app-store.ts
src/stores/booking-store.ts
src/stores/cart-store.ts
```

Hooks must use the format:

```ts
useAppStore;
useBookingStore;
useCartStore;
```

Vanilla store factories must use:

```ts
createAppStore;
createBookingStore;
createCartStore;
```

Provider names must use:

```ts
AppStoreProvider;
BookingStoreProvider;
CartStoreProvider;
```

---

## 13. Anti-Patterns

The AI agent must not:

- Put all application state into one store
- Use Zustand as an API response cache
- Store duplicate derived values
- Subscribe components to an entire store
- Mutate store arrays or objects directly
- Persist the entire store
- Persist credentials or sensitive information
- Access browser storage during server rendering
- Mutate singleton stores from Server Components
- Create deeply nested state without justification
- Add Immer without need
- Add Context around a singleton store without a per-request requirement
- Place every form field in Zustand
- Place transient component state in a global store
- Dispatch network requests from selectors
- Create actions with vague names
- Remove existing store functionality outside the requested scope

---

## 14. Default Store Template

```ts
// src/stores/app-store.ts

import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

type Theme = "light" | "dark" | "system";

type AppState = {
  sidebarOpen: boolean;
  selectedPropertyId: string | null;
  theme: Theme;
};

type AppActions = {
  openSidebar: () => void;
  closeSidebar: () => void;
  toggleSidebar: () => void;
  selectProperty: (propertyId: string | null) => void;
  setTheme: (theme: Theme) => void;
  resetSessionState: () => void;
};

type AppStore = AppState & AppActions;

const initialState: AppState = {
  sidebarOpen: true,
  selectedPropertyId: null,
  theme: "system",
};

export const useAppStore = create<AppStore>()(
  devtools(
    persist(
      (set) => ({
        ...initialState,

        openSidebar: () => set({ sidebarOpen: true }, false, "app/openSidebar"),

        closeSidebar: () =>
          set({ sidebarOpen: false }, false, "app/closeSidebar"),

        toggleSidebar: () =>
          set(
            (state) => ({
              sidebarOpen: !state.sidebarOpen,
            }),
            false,
            "app/toggleSidebar",
          ),

        selectProperty: (selectedPropertyId) =>
          set({ selectedPropertyId }, false, "app/selectProperty"),

        setTheme: (theme) => set({ theme }, false, "app/setTheme"),

        resetSessionState: () =>
          set(
            {
              sidebarOpen: initialState.sidebarOpen,
              selectedPropertyId: initialState.selectedPropertyId,
            },
            false,
            "app/resetSessionState",
          ),
      }),
      {
        name: "app-preferences",
        version: 1,
        partialize: (state) => ({
          selectedPropertyId: state.selectedPropertyId,
          theme: state.theme,
        }),
      },
    ),
    {
      name: "AppStore",
      enabled: process.env.NODE_ENV === "development",
    },
  ),
);
```

---

## 15. AI Agent Decision Checklist

Before adding state to Zustand, the agent must verify:

1. Is the state shared across multiple unrelated components?
2. Is the state owned by the client?
3. Is the state not already handled by a Server Component?
4. Is the state not server-cache data better handled by TanStack Query?
5. Is the state not local form state better handled by React Hook Form?
6. Is the state not local component state better handled by `useState`?
7. Does the state need to survive navigation?
8. Does persistence genuinely improve the user experience?
9. Can the store remain small and domain-specific?
10. Can components subscribe using narrow selectors?

When several answers indicate that Zustand is unnecessary, do not add it.

---

## 16. Change Policy

When modifying an existing Zustand store, the AI agent must:

- Preserve all existing behavior outside the requested scope
- Return complete updated files
- Avoid placeholders
- Maintain strict TypeScript
- Preserve existing exported APIs unless the task requires a breaking change
- Update affected tests
- Maintain persisted-state compatibility
- Add migrations when persisted shapes change
- Avoid silently renaming actions or state fields
- Avoid unrelated refactoring
- Keep the implementation drop-in compatible

---

## Final Rule

Zustand should make state easier to understand than local state, Context, or server-state tools.

When it does not clearly improve ownership, predictability, or reuse, do not use it.
