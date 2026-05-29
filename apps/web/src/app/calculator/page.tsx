import { unstable_noStore as noStore } from "next/cache";
import { getAllRecipes } from "@soap-studio/db/queries/recipes";
import { getAllIngredients } from "@soap-studio/db/queries/ingredients";
import { getAllMolds } from "@soap-studio/db/queries/molds";
import CalculatorView from "@/components/calculator/CalculatorView";

/**
 * @component
 * @description 제작 계산기 페이지. 전체 데이터를 서버에서 조회 후 클라이언트 뷰에 전달
 */
export default async function CalculatorPage() {
  noStore();
  const [recipes, ingredients, molds] = await Promise.all([
    getAllRecipes(),
    getAllIngredients(),
    getAllMolds(),
  ]);

  return (
    <CalculatorView
      recipes={recipes}
      ingredients={ingredients}
      molds={molds}
    />
  );
}
