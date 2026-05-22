import { cache } from "react";

import { listProjectSpecSummaries } from "@/lib/specs-api";

export const listProjectSpecsForProject = cache(listProjectSpecSummaries);
