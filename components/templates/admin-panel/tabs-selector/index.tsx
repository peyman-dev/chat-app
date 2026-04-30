"use client";

import { useState } from "react";

type TabSelectorItem = {
  label: string;
  value: string;
};

type TabsSelectorProps = {
  items: TabSelectorItem[];
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
};

const TabsSelector = ({ items, value, onChange, className }: TabsSelectorProps) => {
  const [internalValue, setInternalValue] = useState(items[0]?.value ?? "");
  const selectedValue = value ?? (items.some((item) => item.value === internalValue) ? internalValue : (items[0]?.value ?? ""));

  const handleChange = (nextValue: string) => {
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
      <div className="mx-auto w-full md:w-[585px]">
        <div className="h-14.5 w-full overflow-x-auto rounded-[50px] bg-white p-[10px] opacity-100 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex min-w-max items-center gap-[10px]">
            {items.map((item) => {
              const active = item.value === selectedValue;
              return (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => handleChange(item.value)}
                  className={[
                    "flex h-10  px-6! shrink-0 items-center justify-center rounded-[50px] py-[10px] leading-none opacity-100 transition-colors",
                    active ? "bg-[#0E0056] text-white" : "bg-transparent text-[#111111]",
                  ].join(" ")}
                  aria-pressed={active}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export type { TabSelectorItem, TabsSelectorProps };
export default TabsSelector;
