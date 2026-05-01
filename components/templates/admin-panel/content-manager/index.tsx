"use client";

import ActionsTable from "@/components/templates/admin-panel/actions-table";
import TabsSelector from "@/components/templates/admin-panel/tabs-selector";
import {
  categoryChildrenToTabItems,
  findCategoryById,
  type AdminCategoryNode,
} from "@/lib/admin-categories";
import { useMemo, useState } from "react";

type ContentManagerProps = {
  categories: AdminCategoryNode[];
};

const ContentManager = ({ categories }: ContentManagerProps) => {
  const rootTabs = useMemo(() => categoryChildrenToTabItems(categories), [categories]);

  const [activeRootId, setActiveRootId] = useState(rootTabs[0]?.value ?? "");

  const activeRoot = useMemo(() => {
    if (!activeRootId) {
      return categories[0] ?? null;
    }

    return findCategoryById(categories, activeRootId);
  }, [activeRootId, categories]);

  return (
    <>
      <TabsSelector
        items={rootTabs}
        value={activeRoot?.id ?? ""}
        onChange={setActiveRootId}
        className="mt-8"
      />
      <ActionsTable key={activeRoot?.id ?? "empty"} rootCategory={activeRoot} className="mt-6" />
    </>
  );
};

export default ContentManager;
