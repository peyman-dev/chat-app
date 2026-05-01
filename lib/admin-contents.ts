export type AdminContentItem = {
  id: string;
  title: string;
  content: string;
  updatedAt: string | null;
  raw: Record<string, unknown>;
};

export type AdminContentsPagination = {
  currentPage: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
};

export type AdminContentsPageData = {
  items: AdminContentItem[];
  pagination: AdminContentsPagination;
};

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null;
};

const asArray = (value: unknown): unknown[] => {
  return Array.isArray(value) ? value : [];
};

const toStringOrNull = (value: unknown): string | null => {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed ? trimmed : null;
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value);
  }

  return null;
};

const toNumber = (value: unknown): number | null => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) {
      return null;
    }

    const parsed = Number(trimmed);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
};

const firstString = (record: Record<string, unknown>, keys: string[]) => {
  for (const key of keys) {
    const value = toStringOrNull(record[key]);
    if (value) {
      return value;
    }
  }

  return "";
};

const firstId = (record: Record<string, unknown>, fallbackId: string) => {
  return (
    toStringOrNull(record.id) ||
    toStringOrNull(record.content_id) ||
    toStringOrNull(record.service_id) ||
    toStringOrNull(record.pk) ||
    fallbackId
  );
};

const pickListSource = (payload: unknown): unknown[] => {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (!isRecord(payload)) {
    return [];
  }

  const directKeys = ["results", "items", "services", "contents", "list", "data"];

  for (const key of directKeys) {
    const value = payload[key];

    if (Array.isArray(value)) {
      return value;
    }

    if (isRecord(value)) {
      const nestedKeys = ["results", "items", "services", "contents", "list", "data"];
      for (const nestedKey of nestedKeys) {
        const nestedValue = value[nestedKey];
        if (Array.isArray(nestedValue)) {
          return nestedValue;
        }
      }
    }
  }

  return [];
};

const normalizeItem = (value: unknown, index: number): AdminContentItem | null => {
  if (!isRecord(value)) {
    return null;
  }

  const title = firstString(value, ["title", "name", "subject", "label"]);
  const content = firstString(value, [
    "content",
    "full_content",
    "fullContent",
    "description",
    "body",
    "text",
    "details",
  ]);

  const item: AdminContentItem = {
    id: firstId(value, `item-${index + 1}`),
    title: title || "بدون عنوان",
    content,
    updatedAt:
      toStringOrNull(value.updated_at) ||
      toStringOrNull(value.updatedAt) ||
      toStringOrNull(value.modified_at) ||
      toStringOrNull(value.created_at),
    raw: value,
  };

  return item;
};

const normalizeItems = (payload: unknown) => {
  return pickListSource(payload)
    .map((item, index) => normalizeItem(item, index))
    .filter((item): item is AdminContentItem => item !== null);
};

const extractPagination = (
  payload: unknown,
  fallback: { page: number; pageSize: number; totalCount: number },
): AdminContentsPagination => {
  const safePage = fallback.page > 0 ? fallback.page : 1;
  const safePageSize = fallback.pageSize > 0 ? fallback.pageSize : 20;
  const safeTotal = fallback.totalCount >= 0 ? fallback.totalCount : 0;

  if (!isRecord(payload)) {
    return {
      currentPage: safePage,
      pageSize: safePageSize,
      totalCount: safeTotal,
      totalPages: Math.max(1, Math.ceil(safeTotal / safePageSize)),
    };
  }

  const paginationSource = isRecord(payload.pagination)
    ? payload.pagination
    : isRecord(payload.data) && isRecord(payload.data.pagination)
      ? payload.data.pagination
      : null;

  const currentPage =
    (paginationSource && toNumber(paginationSource.current_page)) ||
    (paginationSource && toNumber(paginationSource.page)) ||
    toNumber(payload.current_page) ||
    toNumber(payload.page) ||
    safePage;

  const pageSize =
    (paginationSource && toNumber(paginationSource.page_size)) ||
    (paginationSource && toNumber(paginationSource.limit)) ||
    toNumber(payload.page_size) ||
    toNumber(payload.limit) ||
    safePageSize;

  const totalCount =
    (paginationSource && toNumber(paginationSource.total_count)) ||
    (paginationSource && toNumber(paginationSource.total)) ||
    toNumber(payload.total_count) ||
    toNumber(payload.total) ||
    toNumber(payload.count) ||
    safeTotal;

  const totalPages =
    (paginationSource && toNumber(paginationSource.total_pages)) ||
    toNumber(payload.total_pages) ||
    Math.max(1, Math.ceil(totalCount / Math.max(1, pageSize)));

  return {
    currentPage: Math.max(1, currentPage),
    pageSize: Math.max(1, pageSize),
    totalCount: Math.max(0, totalCount),
    totalPages: Math.max(1, totalPages),
  };
};

export const normalizeContentsPage = (
  payload: unknown,
  fallback: { page: number; pageSize: number },
): AdminContentsPageData => {
  const allItems = normalizeItems(payload);

  const pagination = extractPagination(payload, {
    page: fallback.page,
    pageSize: fallback.pageSize,
    totalCount: allItems.length,
  });

  const hasServerPagination = pagination.totalCount !== allItems.length || pagination.totalPages > 1;

  if (hasServerPagination) {
    return {
      items: allItems,
      pagination,
    };
  }

  const start = (pagination.currentPage - 1) * pagination.pageSize;
  const end = start + pagination.pageSize;

  return {
    items: allItems.slice(start, end),
    pagination: {
      ...pagination,
      totalCount: allItems.length,
      totalPages: Math.max(1, Math.ceil(allItems.length / pagination.pageSize)),
    },
  };
};

export const normalizeSingleContent = (payload: unknown): AdminContentItem | null => {
  if (Array.isArray(payload)) {
    return normalizeItem(payload[0], 0);
  }

  if (isRecord(payload) && isRecord(payload.data)) {
    const direct = normalizeItem(payload.data, 0);
    if (direct) {
      return direct;
    }
  }

  if (isRecord(payload)) {
    const nestedList = asArray(payload.results).length
      ? asArray(payload.results)
      : asArray(payload.items).length
        ? asArray(payload.items)
        : asArray(payload.services).length
          ? asArray(payload.services)
          : asArray(payload.contents);

    if (nestedList.length > 0) {
      return normalizeItem(nestedList[0], 0);
    }

    return normalizeItem(payload, 0);
  }

  return null;
};
