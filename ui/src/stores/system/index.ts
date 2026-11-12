import { create } from "zustand";

import useAuthStore from "@stores/auth";

import type { Permission } from "@utils/types/layout";
import type { SystemState } from "@stores/system/types";

export const useSystemStore = create<SystemState>((_set, get) => ({
  getPermissions: () => {
    const user = useAuthStore.getState().user;
    const permissions: Permission[] = user?.superAdmin ? ["super_admin"] : [];
    return permissions;
  },

  hasPermissions: (requiredPermissions = []) => {
    const permissions = get().getPermissions();
    return requiredPermissions.every((permission) => permissions.includes(permission));
  }
}));

export default useSystemStore;
