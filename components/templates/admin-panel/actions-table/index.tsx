"use client";

import { getContentsPage, searchServices } from "@/app/actions";
import SearchFilterPanel from "@/components/templates/admin-panel/shared/search-filter-panel";
import TabsSelector from "@/components/templates/admin-panel/tabs-selector";
import type { AdminCategoryNode } from "@/lib/admin-categories";
import {
  ActionIcon,
  Menu,
  Pagination,
  Select,
  Text,
  Tooltip,
} from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";
import { IconDots, IconEye, IconPencil, IconRefresh } from "@tabler/icons-react";
import { keepPreviousData, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState, useTransition } from "react";

type GridItem = {
  id: string;
  label: string;
};

type ActionsTableProps = {
  rootCategory: AdminCategoryNode | null;
  className?: string;
};

type CategoryLevelState = {
  parentId: string;
  selectedId: string;
  items: AdminCategoryNode[];
};

const DEFAULT_PAGE_SIZE = 20;

const toTabItems = (items: AdminCategoryNode[]) => {
  return items.map((item) => ({ label: item.name, value: item.id }));
};

const resolveBranchState = (
  rootCategory: AdminCategoryNode | null,
  selectedByParent: Record<string, string>,
): {
  levels: CategoryLevelState[];
  resolvedPathIds: string[];
  leafNode: AdminCategoryNode | null;
} => {
  if (!rootCategory) {
    return {
      levels: [],
      resolvedPathIds: [],
      leafNode: null,
    };
  }

  const levels: CategoryLevelState[] = [];
  const resolvedPathIds = [rootCategory.id];

  let cursor: AdminCategoryNode = rootCategory;

  while (cursor.children.length > 0) {
    const selectedFromState = selectedByParent[cursor.id];
    const selectedNode =
      cursor.children.find((child) => child.id === selectedFromState) ?? cursor.children[0];

    levels.push({
      parentId: cursor.id,
      selectedId: selectedNode.id,
      items: cursor.children,
    });

    resolvedPathIds.push(selectedNode.id);
    cursor = selectedNode;
  }

  return {
    levels,
    resolvedPathIds,
    leafNode: cursor,
  };
};

const ActionsTable = ({ rootCategory, className }: ActionsTableProps) => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [selectedByParent, setSelectedByParent] = useState<Record<string, string>>({});
  const [activeItemId, setActiveItemId] = useState<string | null>(null);
  const [paginationByBucket, setPaginationByBucket] = useState<
    Record<string, { page: number; pageSize: number }>
  >({});
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery] = useDebouncedValue(searchQuery, 350);
  const [isPageTransitionPending, startPageTransition] = useTransition();

  const branch = useMemo(() => {
    return resolveBranchState(rootCategory, selectedByParent);
  }, [rootCategory, selectedByParent]);

  const activeLeafId = branch.leafNode?.id ?? "";
  const normalizedQuery = debouncedSearchQuery.trim();
  const isSearchMode = normalizedQuery.length > 0;

  const listBucketKey = useMemo(() => {
    return isSearchMode ? `search:global:${normalizedQuery}` : `list:${activeLeafId}`;
  }, [activeLeafId, isSearchMode, normalizedQuery]);

  const currentPagination = paginationByBucket[listBucketKey] ?? {
    page: 1,
    pageSize: DEFAULT_PAGE_SIZE,
  };

  const fetchListData = useCallback(
    ({ page, pageSize }: { page: number; pageSize: number }) => {
      if (isSearchMode) {
        return searchServices({
          q: normalizedQuery || undefined,
          page,
          pageSize,
        });
      }

      return getContentsPage({
        page,
        pageSize,
        categoryId: activeLeafId || undefined,
      });
    },
    [activeLeafId, isSearchMode, normalizedQuery],
  );

  const contentsQuery = useQuery({
    queryKey: ["admin-contents", listBucketKey, currentPagination.page, currentPagination.pageSize],
    queryFn: () =>
      fetchListData({
        page: currentPagination.page,
        pageSize: currentPagination.pageSize,
      }),
    placeholderData: keepPreviousData,
    staleTime: 10_000,
    enabled: Boolean(rootCategory),
  });

  const pageData = contentsQuery.data?.data;
  const querySuccess = contentsQuery.data?.success ?? false;

  const mappedItems: GridItem[] = (pageData?.items ?? []).map((item, index) => ({
    id: item.id || `item-${index + 1}`,
    label: item.title,
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
      queryKey: ["admin-contents", listBucketKey, nextPage, currentPagination.pageSize],
      queryFn: () =>
        fetchListData({
          page: nextPage,
          pageSize: currentPagination.pageSize,
        }),
      staleTime: 60_000,
    });
  }, [currentPagination.pageSize, fetchListData, listBucketKey, pageData?.pagination, queryClient]);

  const handleCategoryLevelChange = (parentId: string, nextValue: string) => {
    setSelectedByParent((current) => ({
      ...current,
      [parentId]: nextValue,
    }));
  };

  const handlePageChange = (nextPage: number) => {
    startPageTransition(() => {
      setPaginationByBucket((current) => ({
        ...current,
        [listBucketKey]: {
          page: nextPage,
          pageSize: current[listBucketKey]?.pageSize ?? currentPagination.pageSize,
        },
      }));
    });
  };

  const handlePageSizeChange = (nextValue: string | null) => {
    const parsed = Number(nextValue);

    if (!Number.isFinite(parsed) || parsed <= 0) {
      return;
    }

    startPageTransition(() => {
      setPaginationByBucket((current) => ({
        ...current,
        [listBucketKey]: {
          page: 1,
          pageSize: parsed,
        },
      }));
    });
  };

  const showEmptyState = !contentsQuery.isPending && mappedItems.length === 0;

  if (!rootCategory) {
    return (
      <section className={className}>
        <div className="container">
          <div className="rounded-3xl bg-[#ECEEF0] p-8 text-center text-[#475467]">
            دسته‌بندی‌ای برای نمایش یافت نشد.
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={className}>
      <div className="container">
        <div className="rounded-3xl bg-[#ECEEF0] p-3 md:p-4">
          <SearchFilterPanel
            value={searchQuery}
            onChange={setSearchQuery}
            resultCount={pageData?.pagination.totalCount ?? mappedItems.length}
            isLoading={contentsQuery.isFetching}
          />

          {!isSearchMode ? (
            <div className="mt-4 space-y-3">
              {branch.levels.map((level, index) => (
                <motion.div
                  key={`${level.parentId}-${index}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className="rounded-2xl bg-[#F7F8FA] p-2"
                >
                  <TabsSelector
                    items={toTabItems(level.items)}
                    value={level.selectedId}
                    onChange={(nextValue) => handleCategoryLevelChange(level.parentId, nextValue)}
                    itemsPerPage={5}
                  />
                </motion.div>
              ))}
            </div>
          ) : null}

          <div className="mt-4 rounded-2xl bg-white p-3 md:p-4">
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
                    "grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
                    contentsQuery.isFetching || isPageTransitionPending ? "opacity-80" : "opacity-100",
                  ].join(" ")}
                >
                  {showEmptyState ? (
                    <p className="col-span-full py-10 text-center text-base font-semibold text-[#64748B]">
                      آیتمی برای نمایش وجود ندارد.
                    </p>
                  ) : (
                    mappedItems.map((item) => {
                      const active = activeItemId === item.id;

                      return (
                        <motion.article
                          key={item.id}
                          layout
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.18 }}
                          className={[
                            "rounded-2xl border p-3",
                            active
                              ? "border-[#78AEE5] bg-[#EEF6FD]"
                              : "border-[#E4E7EC] bg-[#FCFDFF]",
                          ].join(" ")}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <Tooltip label={item.label} multiline w={280}>
                              <Text fw={700} c="#121212" className="line-clamp-2 min-h-12 text-sm leading-6">
                                {item.label}
                              </Text>
                            </Tooltip>

                            <Menu
                              withinPortal={false}
                              position="bottom-end"
                              onOpen={() => setActiveItemId(item.id)}
                              onClose={() => setActiveItemId(null)}
                            >
                              <Menu.Target>
                                <ActionIcon variant="subtle" color="dark" radius="xl" aria-label="اقدامات">
                                  <IconDots size={18} />
                                </ActionIcon>
                              </Menu.Target>

                              <Menu.Dropdown>
                                <Menu.Item
                                  leftSection={<IconEye size={16} />}
                                  onClick={() => router.push(`/p-admin/contents/${encodeURIComponent(item.id)}`)}
                                >
                                  مشاهده
                                </Menu.Item>
                                <Menu.Item
                                  leftSection={<IconPencil size={16} />}
                                  onClick={() => router.push(`/p-admin/contents/${encodeURIComponent(item.id)}`)}
                                >
                                  ویرایش
                                </Menu.Item>
                                <Menu.Item
                                  leftSection={<IconRefresh size={16} />}
                                  onClick={() => contentsQuery.refetch()}
                                >
                                  بروزرسانی لیست
                                </Menu.Item>
                              </Menu.Dropdown>
                            </Menu>
                          </div>
                        </motion.article>
                      );
                    })
                  )}
                </div>

                <div className="mt-6 flex flex-col items-center justify-between gap-4 sm:flex-row">
                  <Pagination
                    total={pageData?.pagination.totalPages ?? 1}
                    value={pageData?.pagination.currentPage ?? currentPagination.page}
                    onChange={handlePageChange}
                    disabled={contentsQuery.isFetching}
                    withEdges
                    size="md"
                  />

                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-[#344054]">تعداد در صفحه:</span>
                    <Select
                      data={[
                        { label: "10", value: "10" },
                        { label: "20", value: "20" },
                        { label: "30", value: "30" },
                        { label: "50", value: "50" },
                      ]}
                      value={String(pageData?.pagination.pageSize ?? currentPagination.pageSize)}
                      onChange={handlePageSizeChange}
                      w={90}
                      size="sm"
                      disabled={contentsQuery.isFetching}
                      allowDeselect={false}
                    />
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export type { GridItem, ActionsTableProps };
export default ActionsTable;
