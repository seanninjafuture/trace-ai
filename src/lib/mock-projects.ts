import type { MockProject } from "@/types/project";

export const INITIAL_OWNED_PROJECTS: MockProject[] = [
  {
    id: "owned-payments",
    name: "Payments API Mesh",
    slug: "payments-api-mesh",
    owned: true,
  },
  {
    id: "owned-checkout",
    name: "Checkout Resilience Lab",
    slug: "checkout-resilience-lab",
    owned: true,
  },
];

export const INITIAL_SHARED_PROJECTS: MockProject[] = [
  {
    id: "shared-platform",
    name: "Platform Core Graph",
    slug: "platform-core-graph",
    owned: false,
  },
  {
    id: "shared-observability",
    name: "Observability Fabric",
    slug: "observability-fabric",
    owned: false,
  },
];
