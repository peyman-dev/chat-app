"use client";

import { ActionIcon } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState } from "react";

type TabSelectorItem = {
  label: string;
  value: string;
};

type TabsSelectorProps = {
  items: TabSelectorItem[];
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
  itemsPerPage?: number;
};

const TabsSelector = ({
  items,
  value,
  onChange,
  className,
  itemsPerPage,
}: TabsSelectorProps) => {
  const isMobile = useMediaQuery("(max-width: 640px)");
  const isTablet = useMediaQuery("(max-width: 1024px)");
  const resolvedItemsPerPage = itemsPerPage ?? (isMobile ? 2 : isTablet ? 4 : 6);

  const [internalValue, setInternalValue] = useState(items[0]?.value ?? "");
  const [manualPage, setManualPage] = useState<number | null>(null);

  const selectedValue =
    value ?? (items.some((item) => item.value === internalValue) ? internalValue : (items[0]?.value ?? ""));

  const totalPages = Math.max(1, Math.ceil(items.length / resolvedItemsPerPage));

  const selectedIndex = items.findIndex((item) => item.value === selectedValue);
  const selectedPage = selectedIndex >= 0 ? Math.floor(selectedIndex / resolvedItemsPerPage) + 1 : 1;

  const activePage = Math.min(
    totalPages,
    Math.max(1, manualPage ?? selectedPage),
  );

  const visibleItems = useMemo(() => {
    const startIndex = (activePage - 1) * resolvedItemsPerPage;
    const endIndex = startIndex + resolvedItemsPerPage;
    return items.slice(startIndex, endIndex);
  }, [activePage, items, resolvedItemsPerPage]);

  const handleChange = (nextValue: string) => {
    const nextIndex = items.findIndex((item) => item.value === nextValue);
    const nextPage = nextIndex >= 0 ? Math.floor(nextIndex / resolvedItemsPerPage) + 1 : activePage;

    setManualPage(nextPage);

    if (value === undefined) {
      setInternalValue(nextValue);
    }

    onChange?.(nextValue);
  };

  if (items.length === 0) {
    return null;
  }

  return (
    <section className={className}>
      <div className="container">
        <div className="flex w-full items-center gap-2 rounded-3xl bg-white/95 p-2 shadow-[0_8px_24px_rgba(0,0,0,0.06)]">
          <ActionIcon
            size="lg"
            variant="subtle"
            color="dark"
            radius="xl"
            onClick={() =>
              setManualPage((current) => {
                const base = current ?? selectedPage;
                return Math.max(1, base - 1);
              })
            }
            disabled={activePage <= 1}
            aria-label="تب‌های قبلی"
          >
            <IconChevronRight size={18} />
          </ActionIcon>

          <div className="min-w-0 flex-1 overflow-hidden">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={activePage}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18 }}
                className="grid grid-cols-2 gap-2 md:grid-cols-4 xl:grid-cols-6"
              >
                {visibleItems.map((item) => {
                  const active = item.value === selectedValue;

                  return (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => handleChange(item.value)}
                      aria-pressed={active}
                      title={item.label}
                      className={[
                        "h-14 rounded-2xl border px-3 text-sm font-semibold transition",
                        "overflow-hidden whitespace-nowrap text-ellipsis",
                        active
                          ? "border-[#0E0056] bg-[#0E0056] text-white!"
                          : "border-[#E4E7EC] bg-[#F8FAFC] text-[#101828] hover:border-[#CBD5E1]",
                      ].join(" ")}
                    >
                      <span className="block w-full overflow-hidden whitespace-nowrap text-ellipsis">
                        {item.label}
                      </span>
                    </button>
                  );
                })}
              </motion.div>
            </AnimatePresence>
          </div>

          <ActionIcon
            size="lg"
            variant="subtle"
            color="dark"
            radius="xl"
            onClick={() =>
              setManualPage((current) => {
                const base = current ?? selectedPage;
                return Math.min(totalPages, base + 1);
              })
            }
            disabled={activePage >= totalPages}
            aria-label="تب‌های بعدی"
          >
            <IconChevronLeft size={18} />
          </ActionIcon>
        </div>
      </div>
    </section>
  );
};

export type { TabSelectorItem, TabsSelectorProps };
export default TabsSelector;
