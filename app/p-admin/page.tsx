import ContentManager from "@/components/templates/admin-panel/content-manager";
import Overview from "@/components/templates/admin-panel/overview";
import { normalizeCategoriesPayload } from "@/lib/admin-categories";
import { getCategories } from "../actions";

export default async function Page() {
  const categoriesResponse = await getCategories();
  const categories = normalizeCategoriesPayload(categoriesResponse);

  return (
    <>
      <Overview />
      <ContentManager categories={categories} />
    </>
  )
}
