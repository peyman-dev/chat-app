import ActionsTable from "@/components/templates/admin-panel/actions-table";
import Overview from "@/components/templates/admin-panel/overview";
import TabsSelector from "@/components/templates/admin-panel/tabs-selector";
import { getCategories } from "../actions";

export default async function Page() {
  const kir = await getCategories();
  console.log(kir)
  const tabItems = [
    { label: "عنوان 1", value: "title-1" },
    { label: "عنوان 2", value: "title-2" },
    { label: "عنوان 3", value: "title-3" },
    { label: "عنوان 4", value: "title-4" },
    { label: "عنوان 5", value: "title-5" },
  ];

  return (
    <>
      <Overview />
      <TabsSelector items={tabItems} className="mt-16 px-4 md:px-0" />
      <ActionsTable />
    </>
  )
}
