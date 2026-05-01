"use client";

import { getContentsPage } from "@/app/actions";
import TabsSelector from "@/components/templates/admin-panel/tabs-selector";
import type { AdminCategoryNode } from "@/lib/admin-categories";
import {
  ActionIcon,
  Badge,
  Menu,
  Pagination,
  Select,
  Text,
  Tooltip,
} from "@mantine/core";
import { IconDots, IconEye, IconPencil, IconRefresh } from "@tabler/icons-react";
import { keepPreviousData, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";

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

const getPathLabels = (root: AdminCategoryNode | null, pathIds: string[]) => {
  if (!root || pathIds.length === 0) {
    return [] as string[];
  }

  const labels: string[] = [root.name];
  let cursor = root;

  for (let index = 1; index < pathIds.length; index += 1) {
    const next = cursor.children.find((child) => child.id === pathIds[index]);
    if (!next) {
      break;
    }

    labels.push(next.name);
    cursor = next;
  }

  return labels;
};

const ActionsTable = ({ rootCategory, className }: ActionsTableProps) => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [selectedByParent, setSelectedByParent] = useState<Record<string, string>>({});
  const [activeItemId, setActiveItemId] = useState<string | null>(null);
  const [paginationByCategory, setPaginationByCategory] = useState<
    Record<string, { page: number; pageSize: number }>
  >({});
  const [isPageTransitionPending, startPageTransition] = useTransition();

  const branch = useMemo(() => {
    return resolveBranchState(rootCategory, selectedByParent);
  }, [rootCategory, selectedByParent]);

  const activeLeafId = branch.leafNode?.id ?? "";
  const currentPagination = paginationByCategory[activeLeafId] ?? {
    page: 1,
    pageSize: DEFAULT_PAGE_SIZE,
  };

  const contentsQuery = useQuery({
    queryKey: ["admin-contents", activeLeafId || "all", currentPagination.page, currentPagination.pageSize],
    queryFn: () =>
      getContentsPage({
        page: currentPagination.page,
        pageSize: currentPagination.pageSize,
        categoryId: activeLeafId || undefined,
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
    if (!pageData?.pagination || !activeLeafId) {
      return;
    }

    const { currentPage, totalPages } = pageData.pagination;
    if (currentPage >= totalPages) {
      return;
    }

    const nextPage = currentPage + 1;

    queryClient.prefetchQuery({
      queryKey: ["admin-contents", activeLeafId, nextPage, currentPagination.pageSize],
      queryFn: () =>
        getContentsPage({
          page: nextPage,
          pageSize: currentPagination.pageSize,
          categoryId: activeLeafId,
        }),
      staleTime: 60_000,
    });
  }, [activeLeafId, currentPagination.pageSize, pageData?.pagination, queryClient]);

  const handleCategoryLevelChange = (parentId: string, nextValue: string) => {
    setSelectedByParent((current) => ({
      ...current,
      [parentId]: nextValue,
    }));

    setPaginationByCategory((current) => ({
      ...current,
      [nextValue]: {
        page: 1,
        pageSize: current[nextValue]?.pageSize ?? DEFAULT_PAGE_SIZE,
      },
    }));
  };

  const handlePageChange = (nextPage: number) => {
    startPageTransition(() => {
      setPaginationByCategory((current) => ({
        ...current,
        [activeLeafId]: {
          page: nextPage,
          pageSize: current[activeLeafId]?.pageSize ?? currentPagination.pageSize,
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
      setPaginationByCategory((current) => ({
        ...current,
        [activeLeafId]: {
          page: 1,
          pageSize: parsed,
        },
      }));
    });
  };


  const pathLabels = useMemo(() => {
    return getPathLabels(rootCategory, branch.resolvedPathIds);
  }, [branch.resolvedPathIds, rootCategory]);

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
          {/* <div className="mb-4 flex flex-wrap items-center gap-2 rounded-2xl bg-white p-3">
            {pathLabels.map((label, index) => (
              <Badge
                key={`${label}-${index}`}
                variant={index === pathLabels.length - 1 ? "filled" : "light"}
                color={index === pathLabels.length - 1 ? "indigo" : "gray"}
                radius="sm"
                size="lg"
              >
                {label}
              </Badge>
            ))}
          </div> */}

          <div className="space-y-3">
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
                      آیتمی برای نمایش در این زیرشاخه وجود ندارد.
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
