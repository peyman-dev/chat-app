"use client";

import { ActionIcon, Menu } from "@mantine/core";
import { IconCircleFilled, IconEye, IconPencil, IconRefresh } from "@tabler/icons-react";
import { useMemo, useState } from "react";

type CategoryPill = {
  id: string;
  label: string;
};

type GridItem = {
  id: string;
  label: string;
};

type ActionsGridProps = {
  categories?: CategoryPill[];
  items?: GridItem[];
  onView?: (item: GridItem) => void;
  onEdit?: (item: GridItem) => void;
  onUpdate?: (item: GridItem) => void;
};

const defaultCategories: CategoryPill[] = [
  { id: "cat-1", label: "عنوان اول زیر مجموعه" },
  { id: "cat-2", label: "عنوان اول زیر مجموعه" },
  { id: "cat-3", label: "عنوان اول زیر مجموعه" },
  { id: "cat-4", label: "عنوان اول زیر مجموعه" },
  { id: "cat-5", label: "عنوان اول زیر مجموعه" },
];

const defaultItems: GridItem[] = Array.from({ length: 20 }, (_, index) => ({
  id: `item-${index + 1}`,
  label: "عنوان اول زیر مجموعه",
}));

const ActionsGrid = ({
  categories = defaultCategories,
  items = defaultItems,
  onView,
  onEdit,
  onUpdate,
}: ActionsGridProps) => {
  const initialCategoryId = categories.at(-1)?.id ?? "";
  const [activeCategory, setActiveCategory] = useState(initialCategoryId);
  const [activeItemId, setActiveItemId] = useState<string | null>(null);

  const mappedItems = useMemo(() => {
    return items.map((item, index) => ({
      ...item,
      id: item.id || `item-${index + 1}`,
    }));
  }, [items]);

  return (
    <section className="mx-auto mt-7 w-[96%] rounded-[22px] bg-[#ECEEF0] p-3 sm:p-4">
      <div className="overflow-x-auto">
        <div className="flex min-w-[1120px] gap-4 pb-2">
          {categories.map((category) => {
            const active = category.id === activeCategory;
            return (
              <button
                key={category.id}
                type="button"
                onClick={() => setActiveCategory(category.id)}
                className={[
                  "flex h-[58px] w-[230px] items-center justify-center gap-2 rounded-2xl border bg-[#F2F3F5] px-4",
                  active ? "border-[#7385DB] bg-white" : "border-[#D5D9E0]",
                ].join(" ")}
              >
                <IconCircleFilled size={10} className="text-[#586FC8]" />
                <span className="text-lg leading-none font-semibold text-[#121212]">{category.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-1.5 rounded-[18px] bg-white p-3 sm:p-4">
        <div className="overflow-x-auto">
          <div className="grid min-w-[1120px] grid-cols-5 gap-3">
            {mappedItems.map((item) => {
              const active = activeItemId === item.id;

              return (
                <Menu
                  key={item.id}
                  opened={active}
                  onChange={(opened) => {
                    if (!opened) {
                      setActiveItemId((current) => (current === item.id ? null : current));
                    }
                  }}
                  position="bottom-end"
                  offset={10}
                  shadow="md"
                  withinPortal
                >
                  <Menu.Target>
                    <button
                      type="button"
                      className={[
                        "h-[62px] rounded-none border px-3 text-center",
                        active
                          ? "border-[#78AEE5] bg-[#CEE0EF]"
                          : "border-[#D3D6DC] bg-white hover:bg-[#F8FAFC]",
                      ].join(" ")}
                      onClick={() =>
                        setActiveItemId((current) => {
                          if (current === item.id) {
                            return null;
                          }
                          return item.id;
                        })
                      }
                    >
                      <span className="text-lg leading-none font-semibold text-[#121212]">{item.label}</span>
                    </button>
                  </Menu.Target>

                  <Menu.Dropdown className="rounded-xl border border-[#E4E6EC] bg-white p-2 shadow-[0_8px_24px_rgba(14,0,86,0.12)]">
                    <div className="flex items-center gap-1">
                      <ActionIcon
                        variant="transparent"
                        color="dark"
                        className="h-8 w-auto rounded-lg px-2 text-sm font-semibold text-[#1A1458]"
                        onClick={() => {
                          onView?.(item);
                          setActiveItemId(null);
                        }}
                      >
                        <span className="flex items-center gap-1">
                          <IconEye size={16} />
                          مشاهده
                        </span>
                      </ActionIcon>

                      <ActionIcon
                        variant="transparent"
                        color="dark"
                        className="h-8 w-auto rounded-lg px-2 text-sm font-semibold text-[#1A1458]"
                        onClick={() => {
                          onEdit?.(item);
                          setActiveItemId(null);
                        }}
                      >
                        <span className="flex items-center gap-1">
                          <IconPencil size={16} />
                          ویرایش
                        </span>
                      </ActionIcon>

                      <ActionIcon
                        variant="transparent"
                        color="dark"
                        className="h-8 w-auto rounded-lg px-2 text-sm font-semibold text-[#1A1458]"
                        onClick={() => {
                          onUpdate?.(item);
                          setActiveItemId(null);
                        }}
                      >
                        <span className="flex items-center gap-1">
                          <IconRefresh size={16} />
                          بروزرسانی
                        </span>
                      </ActionIcon>
                    </div>
                  </Menu.Dropdown>
                </Menu>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export type { CategoryPill, GridItem, ActionsGridProps };
export default ActionsGrid;
