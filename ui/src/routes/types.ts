import type { ComponentType, LazyExoticComponent } from "react";

import type { PageMetadata } from "@utils/types/layout";

export interface RouteItem {
  path: string;
  component: LazyExoticComponent<ComponentType>;
  metadata: PageMetadata;
}
