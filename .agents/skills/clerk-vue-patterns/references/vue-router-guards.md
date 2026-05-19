# Vue Router Guards

For plain Vue (without Nuxt), protect routes using navigation guards.

## Global Before Guard

```ts
// router/index.ts
import { createRouter, createWebHistory } from 'vue-router'
import { useAuth } from '@clerk/vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: Home },
    { path: '/sign-in', component: SignIn },
    { path: '/dashboard', component: Dashboard, meta: { requiresAuth: true } },
  ],
})

// Call composables once after Clerk plugin is installed (not inside each navigation).
const { userId, isLoaded } = useAuth()

router.beforeEach(async (to) => {
  if (!to.meta.requiresAuth) return true

  if (!isLoaded.value) return true

  if (!userId.value) return '/sign-in'
  return true
})
```

## Per-Route Guard with In-Component Guard

```vue
<script setup lang="ts">
import { useAuth } from '@clerk/vue'
import { useRouter } from 'vue-router'
import { watchEffect } from 'vue'

const { isSignedIn, isLoaded } = useAuth()
const router = useRouter()

watchEffect(() => {
  if (isLoaded.value && !isSignedIn.value) {
    router.replace('/sign-in')
  }
})
</script>
```

## Org-Gated Route

```ts
import { useAuth, useOrganization } from '@clerk/vue'

const { userId, isLoaded } = useAuth()
const { organization } = useOrganization()

router.beforeEach(async (to) => {
  if (!to.meta.requiresOrg) return true

  if (!isLoaded.value) return true

  if (!userId.value) return '/sign-in'
  if (!organization.value) return '/select-org'
  return true
})
```

## CRITICAL

- Call composables once at module scope after `app.use(clerkPlugin)` — not inside `beforeEach` on every navigation
- `isLoaded` must be true before trusting `isSignedIn` or `userId` — the guard may fire before Clerk initializes
- For Nuxt, prefer `middleware/` instead of manual router guards
