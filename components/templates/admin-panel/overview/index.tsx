import { ChevronDown, RefreshCw, Star } from "lucide-react";
import type { ReactNode } from "react";

type OverviewCardProps = {
  label: string;
  title: string;
  remainingText: string;
  icon: ReactNode;
  showTitleChevron?: boolean;
};

const OverviewCard = ({
  label,
  title,
  remainingText,
  icon,
  showTitleChevron = false,
}: OverviewCardProps) => {
  return (
    <article className="flex min-h-28 flex-1 flex-col items-start justify-between gap-4 rounded-3xl bg-[#F6F6F6] px-5 py-5 shadow-[0_2px_8px_rgba(17,24,39,0.05)] md:flex-row md:items-center md:px-8 md:py-6">
      <div className="flex flex-col items-start gap-1 text-right">
        <p className="text-sm leading-6 font-normal text-[#6B7280] md:text-base">{label}</p>
        {showTitleChevron ? (
          <p className="inline-flex items-center gap-1 text-lg leading-7 font-bold text-[#111827] md:text-xl">
            {title}
            <ChevronDown className="size-4 text-[#1E1B4B]" />
          </p>
        ) : (
          <p className="text-lg leading-7 font-bold text-[#111827] md:text-xl">{title}</p>
        )}
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
          title="هرماه"
          remainingText="تا بروزرسانی بعدی 3 روز باقی مانده"
          icon={<RefreshCw className="size-5" strokeWidth={2.25} />}
          showTitleChevron
        />
      </div>
    </section>
  );
};

export default Overview;
