"use client";

import { ActionIcon, Badge, TextInput } from "@mantine/core";
import { IconSearch, IconX } from "@tabler/icons-react";
import { motion } from "motion/react";

type SearchFilterPanelProps = {
  value: string;
  onChange: (value: string) => void;
  resultCount: number;
  isLoading: boolean;
};

const SearchFilterPanel = ({
  value,
  onChange,
  resultCount,
  isLoading,
}: SearchFilterPanelProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="relative overflow-hidden rounded-2xl border border-[#D5DEEA] bg-gradient-to-r from-[#ECF4FF] via-[#F7FBFF] to-[#EEF3FF] p-3 sm:p-4"
    >
      <div className="pointer-events-none absolute -top-8 -left-8 h-28 w-28 rounded-full bg-[#7FA6FF]/15 blur-2xl" />
      <div className="pointer-events-none absolute -right-8 -bottom-8 h-28 w-28 rounded-full bg-[#B2F2E5]/20 blur-2xl" />

      <div className="relative z-10 flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-semibold text-[#1E293B]">جستجوی کلی محتوا</p>

          <div className="flex items-center gap-2">
            <Badge variant="light" color="indigo" radius="sm" size="lg">
              {isLoading ? "در حال جستجو..." : `${resultCount} نتیجه`}
            </Badge>
          </div>
        </div>

        <TextInput
          value={value}
          onChange={(event) => onChange(event.currentTarget.value)}
          placeholder="جستجوی کلی در همه محتواها..."
          leftSection={<IconSearch size={16} />}
          className="**:font-yekanbakh!"
          rightSection={
            value ? (
              <ActionIcon
                variant="subtle"
                color="gray"
                radius="xl"
                size="sm"
                onClick={() => onChange("")}
                aria-label="پاک کردن جستجو"
              >
                <IconX size={14} />
              </ActionIcon>
            ) : null
          }
          classNames={{
            input:
              "h-12! rounded-xl border-[#CFD8E3] bg-white/90 text-right font-medium text-[#0F172A] placeholder:text-[#94A3B8]",
          }}
        />
      </div>
    </motion.div>
  );
};

export default SearchFilterPanel;
