"use client";

import { setSchedule } from "@/app/actions";
import { Loader, Select } from "@mantine/core";
import { useMutation } from "@tanstack/react-query";
import { ChevronDown, RefreshCw, Star } from "lucide-react";
import { type ReactNode, useState } from "react";
import { toast } from "react-toastify";

type ScheduleOptionValue = "daily" | "weekly" | "bi-weekly" | "monthly";

type SchedulePayload = {
  minute: string;
  hour: string;
  day_of_week: string;
  day_of_month: string;
  month_of_year: string;
};

const SCHEDULE_OPTIONS: Array<{ label: string; value: ScheduleOptionValue }> = [
  { label: "هر روز", value: "daily" },
  { label: "هر 7 روز", value: "weekly" },
  { label: "هر 14 روز", value: "bi-weekly" },
  { label: "هرماه", value: "monthly" },
];

const SCHEDULE_PAYLOADS: Record<ScheduleOptionValue, SchedulePayload> = {
  daily: {
    minute: "0",
    hour: "0",
    day_of_week: "",
    day_of_month: "",
    month_of_year: "*",
  },
  weekly: {
    minute: "0",
    hour: "0",
    day_of_week: "0",
    day_of_month: "",
    month_of_year: "",
  },
  "bi-weekly": {
    minute: "0",
    hour: "0",
    day_of_week: "",
    day_of_month: "/14",
    month_of_year: "*",
  },
  monthly: {
    minute: "0",
    hour: "0",
    day_of_week: "",
    day_of_month: "1",
    month_of_year: "",
  },
};

const DEFAULT_SCHEDULE: ScheduleOptionValue = "monthly";

type OverviewCardProps = {
  label: string;
  title?: string;
  titleSlot?: ReactNode;
  remainingText: string;
  icon: ReactNode;
  showTitleChevron?: boolean;
};

const OverviewCard = ({
  label,
  title,
  titleSlot,
  remainingText,
  icon,
  showTitleChevron = false,
}: OverviewCardProps) => {
  const renderTitle = () => {
    if (titleSlot) {
      return titleSlot;
    }

    if (showTitleChevron) {
      return (
        <p className="inline-flex items-center gap-1 text-lg leading-7 font-bold text-[#111827] md:text-xl">
          {title}
          <ChevronDown className="size-4 text-[#1E1B4B]" />
        </p>
      );
    }

    return <p className="text-lg leading-7 font-bold text-[#111827] md:text-xl">{title}</p>;
  };

  return (
    <article className="flex min-h-28 flex-1 flex-col items-start justify-between gap-4 rounded-3xl bg-[#F6F6F6] px-5 py-5 shadow-[0_2px_8px_rgba(17,24,39,0.05)] md:flex-row md:items-center md:px-8 md:py-6">
      <div className="flex flex-col items-start gap-1 text-right">
        <p className="text-sm leading-6 font-normal text-[#6B7280] md:text-base">{label}</p>
        {renderTitle()}
      </div>

      <div className="flex items-center gap-4">
        <p className="text-sm leading-7 font-semibold text-[#111827] md:text-xl">{remainingText}</p>
        <div className="flex size-10 items-center justify-center rounded-xl bg-[#C7DEF0] text-[#312E81]">
          {icon}
        </div>
      </div>
    </article>
  );
};

const UpdateScheduleSelect = () => {
  const [selectedSchedule, setSelectedSchedule] = useState<ScheduleOptionValue>(DEFAULT_SCHEDULE);

  const scheduleMutation = useMutation({
    mutationFn: async (selectedValue: ScheduleOptionValue) => {
      const response = await setSchedule(SCHEDULE_PAYLOADS[selectedValue]);

      if (!response?.success) {
        throw new Error(response?.message || "ثبت زمان بندی ناموفق بود");
      }

      return response;
    },
  });

  const handleScheduleChange = async (value: string | null) => {
    if (!value || scheduleMutation.isPending) {
      return;
    }

    const nextSchedule = value as ScheduleOptionValue;
    if (nextSchedule === selectedSchedule) {
      return;
    }

    const previousSchedule = selectedSchedule;
    setSelectedSchedule(nextSchedule);

    try {
      await toast.promise(scheduleMutation.mutateAsync(nextSchedule), {
        pending: "در حال ثبت زمان بندی...",
        success: "زمان بندی بروزرسانی شد",
        error: {
          render({ data }) {
            if (data instanceof Error && data.message) {
              return data.message;
            }

            return "ثبت زمان بندی ناموفق بود";
          },
        },
      });
    } catch {
      setSelectedSchedule(previousSchedule);
    }
  };

  return (
    <Select
      data={SCHEDULE_OPTIONS}
      value={selectedSchedule}
      onChange={handleScheduleChange}
      allowDeselect={false}
      disabled={scheduleMutation.isPending}
      variant="unstyled"
      className="w-[120px]!"
      comboboxProps={{ withinPortal: false }}
      rightSection={
        scheduleMutation.isPending ? (
          <Loader size={14} color="#1E1B4B" />
        ) : (
          <ChevronDown className="size-4 text-[#1E1B4B]" />
        )
      }
      rightSectionPointerEvents="none"
      classNames={{
        input:
          "h-auto! min-h-0! max-w-max! cursor-pointer! border-0! bg-transparent! p-0!  text-right text-lg leading-7 font-bold text-[#111827] md:text-xl",
        wrapper: "w-fit",
        dropdown: "text-right font-medium",
        option: "text-right",
      }}
    />
  );
};

const Overview = () => {
  return (
    <section className="container" dir="rtl">
      <div className="flex w-full flex-col gap-4 md:flex-row">
        <OverviewCard
          label="اشتراک"
          title="اشتراک 6 ماهه"
          remainingText="تا اتمام اشتراک 123 روز باقی مانده"
          icon={<Star className="size-5" strokeWidth={2.25} />}
          
        />

        <OverviewCard
          label="زمان بندی بروزرسانی"
          titleSlot={<UpdateScheduleSelect />}
          remainingText="تا بروزرسانی بعدی 3 روز باقی مانده"
          icon={<RefreshCw className="size-5" strokeWidth={2.25} />}
        />
      </div>
    </section>
  );
};

export default Overview;
