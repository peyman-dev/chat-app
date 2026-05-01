export type AdminCategoryNode = {
  id: string;
  name: string;
  children: AdminCategoryNode[];
};

export type AdminCategoryTabItem = {
  label: string;
  value: string;
};

type CategoryResponseNode = {
  id?: unknown;
  name?: unknown;
  children?: unknown;
};

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null;
};

const toIdString = (value: unknown, fallback: string) => {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed || fallback;
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value);
  }

  return fallback;
};

const toLabelString = (value: unknown, fallback: string) => {
  if (typeof value !== "string") {
    return fallback;
  }

  const trimmed = value.trim();
  return trimmed || fallback;
};

const normalizeNode = (
  input: CategoryResponseNode,
  fallbackIndex: string,
): AdminCategoryNode => {
  const id = toIdString(input.id, fallbackIndex);
  const name = toLabelString(input.name, `دسته ${fallbackIndex}`);

  const normalizedChildren = Array.isArray(input.children)
    ? input.children
        .map((child, index) => {
          if (!isRecord(child)) {
            return null;
          }

          return normalizeNode(child, `${id}-${index + 1}`);
        })
        .filter((child): child is AdminCategoryNode => child !== null)
    : [];

  return {
    id,
    name,
    children: normalizedChildren,
  };
};

const extractRawCategoryList = (payload: unknown): unknown[] => {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (!isRecord(payload)) {
    return [];
  }

  if (Array.isArray(payload.data)) {
    return payload.data;
  }

  if (isRecord(payload.data) && Array.isArray(payload.data.items)) {
    return payload.data.items;
  }

  if (Array.isArray(payload.items)) {
    return payload.items;
  }

  if (Array.isArray(payload.results)) {
    return payload.results;
  }

  return [];
};

export const normalizeCategoriesPayload = (payload: unknown): AdminCategoryNode[] => {
  return extractRawCategoryList(payload)
    .map((item, index) => {
      if (!isRecord(item)) {
        return null;
      }

      return normalizeNode(item, `cat-${index + 1}`);
    })
    .filter((item): item is AdminCategoryNode => item !== null);
};

export const findCategoryById = (
  categories: AdminCategoryNode[],
  targetId: string,
): AdminCategoryNode | null => {
  for (const category of categories) {
    if (category.id === targetId) {
      return category;
    }

    const childMatch = findCategoryById(category.children, targetId);
    if (childMatch) {
      return childMatch;
    }
  }

  return null;
};

export const categoryChildrenToTabItems = (
  categories: AdminCategoryNode[],
): AdminCategoryTabItem[] => {
  return categories.map((category) => ({
    label: category.name,
    value: category.id,
  }));
};

export const getCategoryPath = (
  categories: AdminCategoryNode[],
  targetId: string,
): AdminCategoryNode[] => {
  for (const category of categories) {
    if (category.id === targetId) {
      return [category];
    }

    const childPath = getCategoryPath(category.children, targetId);
    if (childPath.length > 0) {
      return [category, ...childPath];
    }
  }

  return [];
};
