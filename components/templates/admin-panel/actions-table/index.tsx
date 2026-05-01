"use client";

import { getContentsPage } from "@/app/actions";
import { IconCircleFilled, IconEye, IconPencil, IconRefresh } from "@tabler/icons-react";
import { keepPreviousData, useQuery, useQueryClient } from "@tanstack/react-query";
import { Dropdown, Pagination, type MenuProps } from "antd";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

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
  id: `fallback-item-${index + 1}`,
  label: "عنوان اول زیر مجموعه",
}));

const DEFAULT_PAGE_SIZE = 20;

const ActionsGrid = ({
  categories = defaultCategories,
  onView,
  onEdit,
  onUpdate,
}: ActionsGridProps) => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const initialCategoryId = categories.at(-1)?.id ?? "";
  const [activeCategory, setActiveCategory] = useState(initialCategoryId);
  const [activeItemId, setActiveItemId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [isPageTransitionPending, startPageTransition] = useTransition();

  const contentsQuery = useQuery({
    queryKey: ["admin-contents", page, pageSize],
    queryFn: () => getContentsPage({ page, pageSize }),
    placeholderData: keepPreviousData,
    staleTime: 10_000,
  });

  console.log(contentsQuery.data)

  const pageData = contentsQuery.data?.data;
  const querySuccess = contentsQuery.data?.success ?? false;

  const sourceItems = pageData?.items?.length
    ? pageData.items.map((item) => ({ id: item.id, label: item.title }))
    : !contentsQuery.isPending
      ? []
      : defaultItems;

  const mappedItems = sourceItems.map((item, index) => ({
    ...item,
    id: item.id || `item-${index + 1}`,
  }));

  useEffect(() => {
    if (!pageData?.pagination) {
      return;
    }

    const { currentPage, totalPages } = pageData.pagination;
    if (currentPage >= totalPages) {
      return;
    }

    const nextPage = currentPage + 1;

    queryClient.prefetchQuery({
      queryKey: ["admin-contents", nextPage, pageSize],
      queryFn: () => getContentsPage({ page: nextPage, pageSize }),
      staleTime: 60_000,
    });
  }, [pageData?.pagination, pageSize, queryClient]);

  const handleEditAction = (item: GridItem) => {
    onEdit?.(item);
    router.push(`/p-admin/contents/${encodeURIComponent(item.id)}`);
  };

  const handlePageChange = (nextPage: number, nextPageSize: number) => {
    startPageTransition(() => {
      if (nextPageSize !== pageSize) {
        setPageSize(nextPageSize);
        setPage(1);
        return;
      }

      setPage(nextPage);
    });
  };

  const showEmptyState = !contentsQuery.isPending && mappedItems.length === 0;

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
        {contentsQuery.isError || !querySuccess ? (
          <div className="flex min-h-40 flex-col items-center justify-center gap-3 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 text-center">
            <p className="text-base font-semibold text-[#1E293B]">دریافت لیست با خطا مواجه شد.</p>
            <button
              type="button"
              onClick={() => contentsQuery.refetch()}
              className="rounded-lg bg-[#1D4ED8] px-4 py-2 text-sm font-semibold text-white"
            >
              تلاش مجدد
            </button>
          </div>
        ) : (
          <>
            <div
              className={[
                "overflow-x-auto transition-opacity duration-300",
                contentsQuery.isFetching || isPageTransitionPending ? "opacity-80" : "opacity-100",
              ].join(" ")}
            >
              <div className="grid min-w-[1120px] grid-cols-5 gap-3">
                {showEmptyState ? (
                  <p className="col-span-5 py-10 text-center text-base font-semibold text-[#64748B]">
                    آیتمی برای نمایش وجود ندارد.
                  </p>
                ) : (
                  mappedItems.map((item) => {
                    const active = activeItemId === item.id;
                    const menuItems: MenuProps["items"] = [
                      {
                        key: "view",
                        label: (
                          <span className="flex font-yekanbakh! items-center gap-1 text-lg font-semibold text-[#1A1458]">
                            <IconEye size={16} />
                            مشاهده
                          </span>
                        ),
                      },
                      {
                        key: "edit",
                        label: (
                          <span className="flex font-yekanbakh! items-center gap-1 text-lg font-semibold text-[#1A1458]">
                            <IconPencil size={16} />
                            ویرایش
                          </span>
                        ),
                      },
                      {
                        key: "update",
                        label: (
                          <span className="flex font-yekanbakh! items-center gap-1 text-lg font-semibold text-[#1A1458]">
                            <IconRefresh size={16} />
                            بروزرسانی
                          </span>
                        ),
                      },
                    ];

                    return (
                      <Dropdown
                        key={item.id}
                        trigger={["click"]}
                        open={active}
                        onOpenChange={(open) => {
                          if (!open) {
                            setActiveItemId(null);
                            return;
                          }
                          setActiveItemId(item.id);
                        }}
                        placement="bottomRight"
                        getPopupContainer={(triggerNode) => triggerNode.parentElement ?? triggerNode}
                        overlayClassName="actions-grid-dropdown"
                        menu={{
                          items: menuItems,
                          onClick: ({ key }) => {
                            if (key === "view") {
                              onView?.(item);
                            }
                            if (key === "edit") {
                              handleEditAction(item);
                            }
                            if (key === "update") {
                              onUpdate?.(item);
                            }
                            setActiveItemId(null);
                          },
                        }}
                      >
                        <button
                          type="button"
                          className={[
                            "h-[62px] w-full rounded-none border px-3 text-center",
                            active
                              ? "border-[#78AEE5] bg-[#CEE0EF]"
                              : "border-[#D3D6DC] bg-white hover:bg-[#F8FAFC]",
                          ].join(" ")}
                        >
                          <span className="text-sm! line-clamp-2 leading-5! font-semibold! text-[#121212]">{item.label}</span>
                        </button>
                      </Dropdown>
                    );
                  })
                )}
              </div>
            </div>

            <div className="mt-6 flex justify-center">
              <Pagination
                current={pageData?.pagination.currentPage ?? page}
                pageSize={pageData?.pagination.pageSize ?? pageSize}
                total={pageData?.pagination.totalCount ?? 0}
                showSizeChanger
                pageSizeOptions={[10, 20, 30, 50]}
                onChange={handlePageChange}
                disabled={contentsQuery.isFetching}
              />
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export type { CategoryPill, GridItem, ActionsGridProps };
export default ActionsGrid;
