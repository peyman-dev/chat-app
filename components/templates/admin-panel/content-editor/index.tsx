"use client";

import { getContentById, updateService } from "@/app/actions";
import { IconArrowBack, IconPencil, IconRefresh } from "@tabler/icons-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import clsx from "clsx";
import { useParams, useRouter } from "next/navigation";
import { type ReactNode, useMemo, useState } from "react";
import { toast } from "react-toastify";

const urlPattern = /(https?:\/\/[^\s]+)/gi;

type ActionTextButtonProps = {
  label: string;
  tone: "primary" | "warning";
  icon: ReactNode;
  disabled?: boolean;
  onClick: () => void;
};

const ActionTextButton = ({ label, tone, icon, disabled, onClick }: ActionTextButtonProps) => {
  const toneClass = tone === "primary" ? "text-[#117FCA]" : "text-[#EF8D1F]";

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={clsx(`inline-flex items-center gap-1 leading-none font-bold! ${toneClass} disabled:cursor-not-allowed disabled:text-[#A0A4AD]`, tone !== "primary" ? "text-[#F58A25]!" : "text-[#1871AC]!")}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
};

const ContentEditor = () => {
  const params = useParams<{ contentId?: string | string[] }>();
  const router = useRouter();
  const queryClient = useQueryClient();

  const contentId = useMemo(() => {
    const raw = params?.contentId;

    if (Array.isArray(raw)) {
      return raw[0] ?? "";
    }

    return raw ?? "";
  }, [params?.contentId]);

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState("");
  const [fullContent, setFullContent] = useState("");

  const contentQuery = useQuery({
    queryKey: ["admin-content", contentId],
    queryFn: () => getContentById(contentId),
    enabled: Boolean(contentId),
    staleTime: 60_000,
  });

  const fetchedContent = contentQuery.data?.data;

  const updateMutation = useMutation({
    mutationFn: async () => {
      const response = await updateService({
        id: contentId,
        name: name.trim(),
        full_content: fullContent.trim(),
      });

      if (!response.success) {
        throw new Error(response.message || "بروزرسانی محتوا ناموفق بود");
      }

      return response;
    },
  });

  const handleToggleEdit = () => {
    if (!isEditing) {
      setName(fetchedContent?.title || "");
      setFullContent(fetchedContent?.content || "");
      setIsEditing(true);
      return;
    }

    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("عنوان محتوا الزامی است");
      return;
    }

    const savePromise = updateMutation.mutateAsync();

    const response = await toast.promise(savePromise, {
      pending: "در حال بروزرسانی محتوا...",
      success: "محتوا با موفقیت بروزرسانی شد",
      error: {
        render({ data }) {
          if (data instanceof Error && data.message) {
            return data.message;
          }
          return "بروزرسانی محتوا ناموفق بود";
        },
      },
    });

    if (!response?.data) {
      return;
    }

    queryClient.setQueryData(["admin-content", contentId], {
      success: true,
      data: response.data,
    });
    queryClient.invalidateQueries({ queryKey: ["admin-contents"] });

    router.push("/p-admin");
  };

  const renderClickableContent = (value: string) => {
    if (!value.trim()) {
      return <span className="text-[#64748B]">متنی ثبت نشده است.</span>;
    }

    return value.split(/\n+/).map((line, lineIndex) => {
      const segments = line.split(urlPattern);

      return (
        <p key={`${lineIndex}-${line}`} className="text-right leading-[2.2] font-normal text-[#111111]">
          {segments.map((segment, segmentIndex) => {
            const isLink = urlPattern.test(segment);
            urlPattern.lastIndex = 0;

            if (isLink) {
              return (
                <a
                  key={`${segment}-${segmentIndex}`}
                  href={segment}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#1D4ED8] underline underline-offset-4"
                >
                  {segment}
                </a>
              );
            }

            return <span key={`${segment}-${segmentIndex}`}>{segment}</span>;
          })}
        </p>
      );
    });
  };

  return (
    <section className="container">
      <div className="rounded-[22px] bg-[#ECEEF0] px-4 py-6 md:px-6 md:py-8">
        <div className="mb-8 flex items-center justify-between max-md:flex-col-reverse max-md:items-start max-md:gap-4">
          <div className="flex items-center gap-4 text-[30px] leading-none max-md:hidden">
            <span className="text-[#A4A8B1]">عنوان اول</span>
            <span className="text-[#A4A8B1]">‹</span>
            <span className="text-[#A4A8B1]">عنوان اول زیر مجموعه</span>
            <span className="text-[#A4A8B1]">‹</span>
            <span className="font-semibold text-[#151515]">عنوان دوم زیر مجموعه</span>
          </div>

          <button
            type="button"
            onClick={() => router.push("/p-admin")}
            className="inline-flex items-center gap-2 text-[40px] leading-none font-normal text-[#1A1458] max-md:text-2xl"
          >
            <span>بازگشت</span>
            <IconArrowBack size={35} stroke={2} />
          </button>
        </div>

        <div className="relative min-h-[76px] rounded-[12px] bg-white px-8 max-md:flex max-md:flex-col max-md:items-start max-md:gap-3 max-md:px-4 max-md:py-3">
          {/* <p className="absolute right-8 top-1/2 -translate-y-1/2 text-[44px] leading-none text-[#6D7990] max-md:static max-md:translate-y-0 max-md:text-xl">
          آخرین بروزرسانی ثبت نشده
        </p> */}

          <div className="absolute top-1/2 left-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center gap-4 max-md:static max-md:translate-x-0 max-md:translate-y-0 ">
            <ActionTextButton
              label="بروزرسانی"
              tone="primary"
              icon={<IconRefresh size={20} stroke={2.1} />}
              onClick={handleSave}
              disabled={!isEditing || updateMutation.isPending || !name.trim()}
            />

            <ActionTextButton
              label={isEditing ? "انصراف" : "ویرایش"}
              tone="warning"
              icon={<IconPencil size={20} stroke={2.1} />}
              onClick={handleToggleEdit}
              disabled={updateMutation.isPending}
            />
          </div>
        </div>

        <div className="mt-9">
          {contentQuery.isPending ? (
            <div className="space-y-5">
              <div className="h-10 w-1/2 animate-pulse rounded bg-[#D8DEE8]" />
              <div className="h-7 w-full animate-pulse rounded bg-[#D8DEE8]" />
              <div className="h-7 w-full animate-pulse rounded bg-[#D8DEE8]" />
              <div className="h-7 w-3/4 animate-pulse rounded bg-[#D8DEE8]" />
            </div>
          ) : contentQuery.isError || !contentQuery.data?.success ? (
            <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4 text-center">
              <p className="text-base font-semibold text-[#1E293B]">خطا در دریافت جزئیات محتوا</p>
              <button
                type="button"
                onClick={() => contentQuery.refetch()}
                className="mt-4 rounded-lg bg-[#1D4ED8] px-4 py-2 text-sm font-semibold text-white"
              >
                تلاش مجدد
              </button>
            </div>
          ) : (
            <>
              {isEditing ? (
                <div className="space-y-5!">
                  <input
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="عنوان محتوا"
                    className="h-14 w-full rounded-xl border border-[#CBD5E1] bg-white px-4 text-right font-bold text-[#111111] outline-none transition focus:border-[#4F46E5]"
                  />
                  <textarea
                    value={fullContent}
                    onChange={(event) => setFullContent(event.target.value)}
                    placeholder="متن محتوا"
                    className="min-h-[320px] w-full resize-y rounded-xl border border-[#CBD5E1] bg-white p-4 text-right leading-8 font-normal text-[#111111] outline-none transition focus:border-[#4F46E5]"
                  />
                </div>
              ) : (
                <article className="space-y-12">
                  <h1 className="mb-10 text-right text-[36px] leading-[1.5] font-bold text-[#111111]">
                    {fetchedContent?.title || "بدون عنوان"}
                  </h1>
                  <div className="space-y-4 leading-7 font-medium">{renderClickableContent(fetchedContent?.content || "")}</div>
                </article>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
};

export default ContentEditor;
