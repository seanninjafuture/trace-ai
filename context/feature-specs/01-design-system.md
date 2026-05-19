READ `AGENTS.md` before starting.

We are adding the design system foundation and UI primitive components for Trace AI. All styles must adhere strictly to the dark-only cloud operations dashboard theme.

### Core Setup & Utilities

Install and configure `shadcn/ui` targeting the `src/components/ui/` directory.

Create `src/lib/utils.ts` exporting a reusable `cn()` helper powered by clsx and tailwind-merge for safe conditional class blending.

Configure `tailwind.config.ts` to expose the custom theme tokens (--bg-base, --state-error, etc.) as standard utility classes.

Add these shadcn components:
- Button — For interactive controls and simulation triggers.
- Card — To wrap canvas configuration node properties and data forms.
- Dialog — For project creation and configuration modals.
- Input & Textarea — For typing simulation failure descriptions.
- Tabs — To toggle between node configurations and metrics history.
- ScrollArea — For scrolling within the live simulation telemetry panels.
- Badge — For real-time status indicators (e.g., Healthy, Degraded, Outage).

Do not modify the generated `components/ui/*` files after installation.

### Iconography & Assets

- Install `lucide-react` for consistent stroke-based vector layout icons.

- Ensure all icons strictly adhere to standard sizing (h-4 w-4 for inline text inputs/badges, h-5 w-5 for global header/sidebar buttons).


## Check when done
- All primitive components import into pages without compilation errors.
- The `cn()` helper perfectly merges conflicting Tailwind utility classes.
- No default unstyled light elements appear under any component viewport state.