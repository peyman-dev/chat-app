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
    <article className="flex h-28 flex-1 items-center justify-between rounded-3xl bg-[#F6F6F6] px-8 py-6 shadow-[0_2px_8px_rgba(17,24,39,0.05)]">
      <div className="flex flex-col items-start gap-1 text-right">
        <p className="text-base leading-6 font-normal text-[#6B7280]">{label}</p>
        {showTitleChevron ? (
          <p className="inline-flex items-center gap-1 text-xl leading-7 font-bold text-[#111827]">
            {title}
            <ChevronDown className="size-4 text-[#1E1B4B]" />
          </p>
        ) : (
          <p className="text-xl leading-7 font-bold text-[#111827]">{title}</p>
        )}
      </div>

      <div className="flex items-center gap-4">
        <p className="text-xl leading-7 font-semibold text-[#111827]">{remainingText}</p>
        <div className="flex size-10 items-center justify-center rounded-xl bg-[#C7DEF0] text-[#312E81]">
          {icon}
        </div>
      </div>
    </article>
  );
};

const Overview = () => {
  return (
    <section className="mx-auto flex w-full flex-col gap-4 px-10 md:flex-row" dir="rtl">
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
    </section>
  );
};

export default Overview;
