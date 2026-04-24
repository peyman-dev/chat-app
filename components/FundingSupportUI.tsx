"use client";

import {
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  Eye,
  Pencil,
  RefreshCcw,
  Undo2,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type ViewState = "list" | "detail" | "edit" | "submit";

interface ContentItem {
  id: string;
  title: string;
  content: string;
  lastUpdated: string;
}

interface Subcategory {
  id: string;
  title: string;
  items: ContentItem[];
}

interface Category {
  id: string;
  title: string;
  subcategories: Subcategory[];
}

interface FundingTab {
  id: string;
  title: string;
  categories: Category[];
}

type SelectionState = {
  tabId: string;
  categoryId: string;
  subcategoryId: string;
  itemId: string;
};

const TAB_TITLES = ["عنوان 1", "عنوان 2", "عنوان 3", "عنوان 4", "عنوان 5"] as const;
const CATEGORY_TITLES = [
  "عنوان اول زیر مجموعه",
  "عنوان دوم زیر مجموعه",
  "عنوان سوم زیر مجموعه",
  "عنوان چهارم زیر مجموعه",
  "عنوان پنجم زیر مجموعه",
] as const;
const SUBCATEGORY_TITLES = ["زیر گروه الف", "زیر گروه ب", "زیر گروه پ", "زیر گروه ت"] as const;

function buildInitialData(): FundingTab[] {
  return TAB_TITLES.map((tabTitle, tabIndex) => ({
    id: `tab-${tabIndex + 1}`,
    title: tabTitle,
    categories: CATEGORY_TITLES.map((categoryTitle, categoryIndex) => ({
      id: `tab-${tabIndex + 1}-category-${categoryIndex + 1}`,
      title: categoryTitle,
      subcategories: SUBCATEGORY_TITLES.map((subcategoryTitle, subcategoryIndex) => ({
        id: `tab-${tabIndex + 1}-category-${categoryIndex + 1}-subcategory-${subcategoryIndex + 1}`,
        title: subcategoryTitle,
        items: Array.from({ length: 20 }).map((_, itemIndex) => {
          const itemTitle =
            itemIndex === 0
              ? "حمایت از تامین مالی جمعی"
              : `خدمت ${itemIndex + 1} - ${subcategoryTitle}`;

          return {
            id: `tab-${tabIndex + 1}-category-${categoryIndex + 1}-subcategory-${subcategoryIndex + 1}-item-${itemIndex + 1}`,
            title: itemTitle,
            content: [
              `به منظور بهره گرفتن از سرمایه‌های خرد برای تامین مالی کسب و کارها، ${itemTitle} در ${categoryTitle} ارائه شده است.`,
              "سازمان بورس و اوراق بهادار کشور اقدام به صدور مجوز برای سکوهای تامین مالی جمعی کرده است و شرکت‌های کوچک و متوسط می‌توانند از طریق مشارکت مردم، منابع مورد نیاز خود را جذب کنند.",
              "صندوق نوآوری و شکوفایی نیز با پوشش بخشی از ریسک سرمایه‌گذاری، امکان استفاده عملیاتی از این مسیر را برای شرکت‌های دانش‌بنیان فراهم می‌کند.",
              `این محتوا مربوط به ${tabTitle}، ${categoryTitle} و ${subcategoryTitle} است و برای نمایش داینامیک جزئیات انتخاب‌شده استفاده می‌شود.`,
            ].join("\n\n"),
            lastUpdated: `1403/05/${String(((itemIndex + tabIndex + categoryIndex) % 28) + 1).padStart(2, "0")} ، 01:${String(
              (itemIndex * 3 + subcategoryIndex * 5) % 60,
            ).padStart(2, "0")}am`,
          };
        }),
      })),
    })),
  }));
}

function getNowLastUpdated(): string {
  const now = new Date();
  const date = now.toLocaleDateString("fa-IR");
  const time = now.toLocaleTimeString("fa-IR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  return `${date} ، ${time}`;
}

function getInitialSelection(data: FundingTab[]): SelectionState {
  const firstTab = data[0];
  const firstCategory = firstTab.categories[0];
  const firstSubcategory = firstCategory.subcategories[0];
  const firstItem = firstSubcategory.items[0];

  return {
    tabId: firstTab.id,
    categoryId: firstCategory.id,
    subcategoryId: firstSubcategory.id,
    itemId: firstItem.id,
  };
}

function findBySelection(data: FundingTab[], selection: SelectionState) {
  const tab = data.find((entry) => entry.id === selection.tabId) ?? data[0];
  const category = tab.categories.find((entry) => entry.id === selection.categoryId) ?? tab.categories[0];
  const subcategory =
    category.subcategories.find((entry) => entry.id === selection.subcategoryId) ?? category.subcategories[0];
  const item = subcategory.items.find((entry) => entry.id === selection.itemId) ?? subcategory.items[0];

  return { tab, category, subcategory, item };
}

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-2 text-base text-[#4b4f5b] transition-colors duration-200 hover:text-[#2f3340]"
    >
      <span>بازگشت</span>
      <Undo2 className="size-4 stroke-[2] text-[#24245f]" />
    </button>
  );
}

function Breadcrumbs({ items }: { items: string[] }) {
  return (
    <div className="hidden items-center gap-2 text-[13px] lg:flex">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <div key={`${item}-${index}`} className="inline-flex items-center gap-2">
            {index > 0 ? <ChevronLeft className="size-4 stroke-[1.75] text-[#c6c8ce]" /> : null}
            <span className={cn("truncate", isLast ? "font-medium text-[#242424]" : "text-[#afb2ba]")}>{item}</span>
          </div>
        );
      })}
    </div>
  );
}

function TabsNav({
  tabs,
  activeTabId,
  onTabChange,
}: {
  tabs: FundingTab[];
  activeTabId: string;
  onTabChange: (tabId: string) => void;
}) {
  return (
    <div className="mb-10 flex justify-center md:mb-12">
      <div className="inline-flex max-w-full items-center gap-1 rounded-full bg-[#f7f7f8] p-1.5 shadow-[inset_0_0_0_1px_#ececf0]">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTabId;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "rounded-full px-4 py-2 text-sm leading-none whitespace-nowrap transition-all duration-200 md:px-5",
                isActive
                  ? "bg-[#14056f] font-medium text-white"
                  : "text-[#2f3237] hover:bg-[#eceef6] hover:text-[#12141a]",
              )}
            >
              {tab.title}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function CategoryDropdown({
  category,
  isSelected,
  isOpen,
  selectedSubcategoryId,
  onToggle,
  onSelectCategory,
  onSelectSubcategory,
}: {
  category: Category;
  isSelected: boolean;
  isOpen: boolean;
  selectedSubcategoryId: string;
  onToggle: (categoryId: string) => void;
  onSelectCategory: (categoryId: string) => void;
  onSelectSubcategory: (categoryId: string, subcategoryId: string) => void;
}) {
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => {
          onSelectCategory(category.id);
          onToggle(category.id);
        }}
        className={cn(
          "group flex h-[56px] w-full items-center justify-between rounded-[16px] border bg-white px-4 text-right",
          "transition-all duration-200",
          isSelected
            ? "border-[#5a63c1] bg-[#f3f8ff]"
            : "border-[#d8dae0] hover:border-[#5ea8df] hover:bg-[#f8fbff]",
        )}
      >
        <span className="line-clamp-2 flex-1 text-sm font-semibold text-[#1c1f25] md:text-base">{category.title}</span>
        <div className="mr-2 inline-flex items-center gap-1.5">
          <ChevronDown
            className={cn(
              "size-4 text-[#6e74a6] transition-transform duration-200",
              isOpen ? "rotate-180" : "rotate-0",
            )}
          />
          <span className="size-2.5 rounded-full bg-[#6176bf]" />
        </div>
      </button>

      <div
        className={cn(
          "absolute right-0 z-30 mt-2 w-full rounded-[12px] border border-[#dce2ef] bg-white p-1.5 shadow-[0_8px_22px_rgba(40,58,96,0.16)]",
          "transition-all duration-200",
          isOpen ? "visible translate-y-0 opacity-100" : "invisible -translate-y-1 opacity-0",
        )}
      >
        {category.subcategories.map((subcategory) => {
          const isSubSelected = selectedSubcategoryId === subcategory.id;

          return (
            <button
              key={subcategory.id}
              type="button"
              onClick={() => onSelectSubcategory(category.id, subcategory.id)}
              className={cn(
                "mb-1 flex w-full items-center justify-between rounded-[10px] border px-3 py-2 text-sm transition-all duration-200 last:mb-0",
                isSubSelected
                  ? "border-[#5ea8df] bg-[#d8ebfa] text-[#163553]"
                  : "border-transparent text-[#2d3240] hover:border-[#5ea8df] hover:bg-[#f2f9ff]",
              )}
            >
              <span className="truncate">{subcategory.title}</span>
              <span className="size-2 rounded-full bg-[#92a6d8]" />
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ActionDropdown({
  open,
  onView,
  onEdit,
  onUpdate,
}: {
  open: boolean;
  onView: () => void;
  onEdit: () => void;
  onUpdate: () => void;
}) {
  return (
    <div
      className={cn(
        "absolute right-0 top-[calc(100%+8px)] z-30 max-w-[min(92vw,360px)] rounded-[10px] border border-[#e4e4e8] bg-white px-2 py-2 shadow-[0_3px_7px_rgba(0,0,0,0.18)]",
        "transition-all duration-200",
        open ? "visible translate-y-0 opacity-100" : "invisible -translate-y-1 opacity-0",
      )}
      role="menu"
      aria-hidden={!open}
    >
      <div className="flex flex-wrap items-center">
        <button
          type="button"
          onClick={onView}
          className="inline-flex items-center gap-1.5 border-l border-[#eaebee] px-3 py-0.5 text-base font-semibold text-[#1f1a63] transition-colors duration-200 hover:text-[#3d34a6]"
        >
          <span>مشاهده</span>
          <Eye className="size-4 stroke-[2.2]" />
        </button>
        <button
          type="button"
          onClick={onEdit}
          className="inline-flex items-center gap-1.5 border-l border-[#eaebee] px-3 py-0.5 text-base font-semibold text-[#1f1a63] transition-colors duration-200 hover:text-[#3d34a6]"
        >
          <span>ویرایش</span>
          <Pencil className="size-4 stroke-[2.2]" />
        </button>
        <button
          type="button"
          onClick={onUpdate}
          className="inline-flex items-center gap-1.5 px-3 py-0.5 text-base font-semibold text-[#1f1a63] transition-colors duration-200 hover:text-[#3d34a6]"
        >
          <span>بروزرسانی</span>
          <RefreshCcw className="size-4 stroke-[2.1]" />
        </button>
      </div>
    </div>
  );
}

function SubcategoryGrid({
  items,
  selectedItemId,
  openActionItemId,
  onItemSelect,
  onActionToggle,
  onView,
  onEdit,
  onUpdate,
}: {
  items: ContentItem[];
  selectedItemId: string;
  openActionItemId: string | null;
  onItemSelect: (itemId: string) => void;
  onActionToggle: (itemId: string) => void;
  onView: () => void;
  onEdit: () => void;
  onUpdate: () => void;
}) {
  return (
    <div className="rounded-[18px] bg-[#f6f6f7] p-2.5 md:p-3">
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 md:gap-3">
        {items.map((item) => {
          const isSelected = item.id === selectedItemId;
          const isActionOpen = openActionItemId === item.id;

          return (
            <div key={item.id} className="relative">
              <button
                type="button"
                onClick={() => {
                  onItemSelect(item.id);
                  onActionToggle(item.id);
                }}
                className={cn(
                  "flex h-[56px] w-full items-center justify-center border px-2 text-center text-sm font-semibold transition-all duration-200 md:text-base",
                  "border-[#d6d8dc] bg-[#f7f7f8] text-[#111111] hover:border-[#5ea8df]",
                  "focus-visible:border-[#5ea8df] focus-visible:outline-none",
                  isSelected && "border-[#5ea8df] bg-[#c5d5e2]",
                )}
              >
                <span className="line-clamp-2">{item.title}</span>
              </button>

              <ActionDropdown
                open={isActionOpen}
                onView={onView}
                onEdit={onEdit}
                onUpdate={onUpdate}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

function DetailToolbar({
  lastUpdated,
  onEdit,
  onUpdate,
}: {
  lastUpdated: string;
  onEdit: () => void;
  onUpdate: () => void;
}) {
  return (
    <div className="relative mb-6 flex min-h-[34px] items-center rounded-[8px] bg-[#f7f7f8] px-4 md:px-6">
      <div className="absolute left-1/2 flex -translate-x-1/2 items-center gap-4 md:gap-6">
        <button
          type="button"
          onClick={onEdit}
          className="inline-flex items-center gap-1 text-sm font-semibold text-[#f28c2f] transition-colors duration-200 hover:text-[#d8731a] md:text-lg"
        >
          <span>ویرایش</span>
          <Pencil className="size-4 stroke-[2.25]" />
        </button>
        <button
          type="button"
          onClick={onUpdate}
          className="inline-flex items-center gap-1 text-sm font-semibold text-[#157fcb] transition-colors duration-200 hover:text-[#0f67a4] md:text-lg"
        >
          <span>بروزرسانی</span>
          <RefreshCcw className="size-4 stroke-[2.25]" />
        </button>
      </div>

      <p className="text-xs text-[#676a71] md:text-sm">آخرین بروزرسانی : {lastUpdated}</p>
    </div>
  );
}

function DetailView({
  item,
  onEdit,
  onUpdate,
}: {
  item: ContentItem;
  onEdit: () => void;
  onUpdate: () => void;
}) {
  return (
    <div>
      <DetailToolbar lastUpdated={item.lastUpdated} onEdit={onEdit} onUpdate={onUpdate} />

      <h1 className="mb-5 text-right text-2xl font-bold leading-snug text-[#131313] md:mb-6 md:text-3xl">
        {item.title}
      </h1>

      <div className="space-y-4 text-right text-base leading-8 text-[#111111] whitespace-pre-line md:text-lg md:leading-9">
        {item.content}
      </div>
    </div>
  );
}

function EditView({
  title,
  content,
  onTitleChange,
  onContentChange,
  onGoToSubmit,
}: {
  title: string;
  content: string;
  onTitleChange: (value: string) => void;
  onContentChange: (value: string) => void;
  onGoToSubmit: () => void;
}) {
  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 rounded-[16px] border border-[#4f9fe1] p-3 md:flex-row md:items-center md:justify-between md:px-4 md:py-4">
        <input
          value={title}
          onChange={(event) => onTitleChange(event.target.value)}
          className="w-full border border-[#d7dbe4] bg-white px-3 py-2 text-xl font-bold text-[#111111] outline-none transition-colors duration-200 focus:border-[#4f9fe1] md:border-l md:border-r-0 md:border-t-0 md:border-b-0 md:bg-transparent md:px-0 md:py-0 md:pr-0 md:pl-6 md:text-2xl"
        />
        <button
          type="button"
          onClick={onGoToSubmit}
          className="rounded-[8px] bg-[#1f78b8] px-4 py-2 text-sm font-semibold text-white transition-colors duration-200 hover:bg-[#176ea9] md:px-5 md:py-3 md:text-base"
        >
          بروزرسانی
        </button>
      </div>

      <textarea
        value={content}
        onChange={(event) => onContentChange(event.target.value)}
        className="min-h-[300px] w-full resize-y rounded-[12px] border border-[#d1d6df] bg-white p-4 text-right text-sm leading-8 text-[#111111] outline-none transition-colors duration-200 focus:border-[#4f9fe1] md:min-h-[360px] md:text-base"
      />
    </div>
  );
}

function SubmitView({
  title,
  content,
  onConfirm,
}: {
  title: string;
  content: string;
  onConfirm: () => void;
}) {
  return (
    <div>
      <div className="mb-5 flex h-[34px] items-center justify-center rounded-[8px] bg-[#f7f7f8]">
        <span className="inline-flex items-center gap-1 text-lg font-semibold text-[#03bdb3]">
          <span>ثبت</span>
          <CheckCircle2 className="size-4 stroke-[2.4]" />
        </span>
      </div>

      <div className="mb-6 flex flex-col gap-3 rounded-[16px] border border-[#4f9fe1] p-3 md:flex-row md:items-center md:justify-between md:px-4 md:py-4">
        <h1 className="w-full border border-[#d7dbe4] bg-white px-3 py-2 text-xl font-bold text-[#111111] md:border-l md:border-r-0 md:border-t-0 md:border-b-0 md:bg-transparent md:px-0 md:py-0 md:pr-0 md:pl-6 md:text-3xl">
          {title}
        </h1>
        <button
          type="button"
          onClick={onConfirm}
          className="rounded-[8px] bg-[#1f78b8] px-4 py-2 text-sm font-semibold text-white transition-colors duration-200 hover:bg-[#176ea9] md:px-5 md:py-3 md:text-base"
        >
          تایید
        </button>
      </div>

      <div className="space-y-4 text-right text-base leading-8 text-[#111111] whitespace-pre-line md:text-lg md:leading-9">
        {content}
      </div>
    </div>
  );
}

export default function FundingSupportUI() {
  const [data, setData] = useState<FundingTab[]>(() => buildInitialData());
  const [selection, setSelection] = useState<SelectionState>(() => getInitialSelection(buildInitialData()));
  const [view, setView] = useState<ViewState>("list");
  const [openCategoryId, setOpenCategoryId] = useState<string | null>(null);
  const [openActionItemId, setOpenActionItemId] = useState<string | null>(null);
  const [draftTitle, setDraftTitle] = useState("");
  const [draftContent, setDraftContent] = useState("");
  const listAreaRef = useRef<HTMLDivElement | null>(null);

  const { tab, category, subcategory, item } = useMemo(() => findBySelection(data, selection), [data, selection]);

  const breadcrumbItems = useMemo(() => {
    const finalTitle = view === "edit" || view === "submit" ? draftTitle || item.title : item.title;

    return [tab.title, category.title, subcategory.title, finalTitle];
  }, [category.title, draftTitle, item.title, subcategory.title, tab.title, view]);

  useEffect(() => {
    const closeMenusOnOutsideClick = (event: PointerEvent) => {
      const targetNode = event.target as Node;
      if (!listAreaRef.current?.contains(targetNode)) {
        setOpenCategoryId(null);
        setOpenActionItemId(null);
      }
    };

    document.addEventListener("pointerdown", closeMenusOnOutsideClick);
    return () => {
      document.removeEventListener("pointerdown", closeMenusOnOutsideClick);
    };
  }, []);

  const handleTabChange = (tabId: string) => {
    const nextTab = data.find((entry) => entry.id === tabId);
    if (!nextTab) return;

    const firstCategory = nextTab.categories[0];
    const firstSubcategory = firstCategory.subcategories[0];
    const firstItem = firstSubcategory.items[0];

    setSelection({
      tabId: nextTab.id,
      categoryId: firstCategory.id,
      subcategoryId: firstSubcategory.id,
      itemId: firstItem.id,
    });
    setOpenCategoryId(null);
    setOpenActionItemId(null);
  };

  const handleCategorySelect = (categoryId: string) => {
    const nextCategory = tab.categories.find((entry) => entry.id === categoryId);
    if (!nextCategory) return;

    const nextSubcategory =
      nextCategory.subcategories.find((entry) => entry.id === selection.subcategoryId) ?? nextCategory.subcategories[0];
    const nextItem = nextSubcategory.items[0];

    setSelection((current) => ({
      ...current,
      categoryId: nextCategory.id,
      subcategoryId: nextSubcategory.id,
      itemId: nextItem.id,
    }));
    setOpenActionItemId(null);
  };

  const handleSubcategorySelect = (categoryId: string, subcategoryId: string) => {
    const nextCategory = tab.categories.find((entry) => entry.id === categoryId);
    if (!nextCategory) return;

    const nextSubcategory = nextCategory.subcategories.find((entry) => entry.id === subcategoryId);
    if (!nextSubcategory) return;

    setSelection((current) => ({
      ...current,
      categoryId: nextCategory.id,
      subcategoryId: nextSubcategory.id,
      itemId: nextSubcategory.items[0].id,
    }));
    setOpenCategoryId(null);
    setOpenActionItemId(null);
  };

  const handleItemSelect = (itemId: string) => {
    setSelection((current) => ({
      ...current,
      itemId,
    }));
  };

  const handleOpenDetail = () => {
    setOpenActionItemId(null);
    setView("detail");
  };

  const handleOpenEdit = () => {
    setDraftTitle(item.title);
    setDraftContent(item.content);
    setOpenActionItemId(null);
    setView("edit");
  };

  const handleOpenSubmit = () => {
    if (view !== "edit") {
      setDraftTitle(item.title);
      setDraftContent(item.content);
    }

    setOpenActionItemId(null);
    setView("submit");
  };

  const handleConfirmSubmit = () => {
    const normalizedTitle = draftTitle.trim() || item.title;
    const normalizedContent = draftContent.trim() || item.content;

    setData((currentData) =>
      currentData.map((tabEntry) => {
        if (tabEntry.id !== selection.tabId) return tabEntry;

        return {
          ...tabEntry,
          categories: tabEntry.categories.map((categoryEntry) => {
            if (categoryEntry.id !== selection.categoryId) return categoryEntry;

            return {
              ...categoryEntry,
              subcategories: categoryEntry.subcategories.map((subcategoryEntry) => {
                if (subcategoryEntry.id !== selection.subcategoryId) return subcategoryEntry;

                return {
                  ...subcategoryEntry,
                  items: subcategoryEntry.items.map((itemEntry) =>
                    itemEntry.id === selection.itemId
                      ? {
                          ...itemEntry,
                          title: normalizedTitle,
                          content: normalizedContent,
                          lastUpdated: getNowLastUpdated(),
                        }
                      : itemEntry,
                  ),
                };
              }),
            };
          }),
        };
      }),
    );

    setView("detail");
  };

  const shouldShowBreadcrumb = view !== "list";
  const currentItems = subcategory.items;

  return (
    <main className="min-h-screen bg-[#e9ebef] pb-10 md:pb-12">
      <section className="mx-auto w-full max-w-[1160px] px-4 pt-9 md:px-6 md:pt-12">
        <header className="mb-7 flex items-center justify-between md:mb-10">
          <BackButton onClick={() => setView("list")} />
          {shouldShowBreadcrumb ? <Breadcrumbs items={breadcrumbItems} /> : <div />}
        </header>

        {view === "list" ? (
          <div ref={listAreaRef}>
            <TabsNav tabs={data} activeTabId={selection.tabId} onTabChange={handleTabChange} />

            <div className="rounded-[20px] bg-[#f5f5f6] p-3 md:p-4">
              <div className="mb-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 md:gap-4">
                {tab.categories.map((entry) => (
                  <CategoryDropdown
                    key={entry.id}
                    category={entry}
                    isSelected={entry.id === selection.categoryId}
                    isOpen={openCategoryId === entry.id}
                    selectedSubcategoryId={selection.subcategoryId}
                    onToggle={(categoryId) =>
                      setOpenCategoryId((current) => (current === categoryId ? null : categoryId))
                    }
                    onSelectCategory={handleCategorySelect}
                    onSelectSubcategory={handleSubcategorySelect}
                  />
                ))}
              </div>

              <SubcategoryGrid
                items={currentItems}
                selectedItemId={selection.itemId}
                openActionItemId={openActionItemId}
                onItemSelect={handleItemSelect}
                onActionToggle={(itemId) =>
                  setOpenActionItemId((current) => (current === itemId ? null : itemId))
                }
                onView={handleOpenDetail}
                onEdit={handleOpenEdit}
                onUpdate={handleOpenSubmit}
              />
            </div>
          </div>
        ) : null}

        {view === "detail" ? (
          <DetailView
            item={item}
            onEdit={handleOpenEdit}
            onUpdate={handleOpenSubmit}
          />
        ) : null}

        {view === "edit" ? (
          <EditView
            title={draftTitle}
            content={draftContent}
            onTitleChange={setDraftTitle}
            onContentChange={setDraftContent}
            onGoToSubmit={handleOpenSubmit}
          />
        ) : null}

        {view === "submit" ? (
          <SubmitView
            title={draftTitle}
            content={draftContent}
            onConfirm={handleConfirmSubmit}
          />
        ) : null}
      </section>
    </main>
  );
}
