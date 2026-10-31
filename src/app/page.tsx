import { PublicHomePage } from "@/modules/footage/public/components/public-home-page";
import {
  loadPublicFootageMock,
  publicFootageFixtures,
} from "@/modules/ui-mock/fixtures/public-footage";
import {
  filterPublicFootage,
  normalizePublicCategory,
  parsePublicBrowseQuery,
} from "@/modules/footage/public/catalog/filter-public-footage";
import {
  UI_MOCK_SCENARIOS,
  type UiMockScenario,
} from "@/modules/ui-mock/scenarios";

export const dynamic = "force-dynamic";

type HomeProps = {
  searchParams: Promise<{ q?: string; category?: string; scenario?: string }>;
};

function parseScenario(value: string | undefined): UiMockScenario {
  return UI_MOCK_SCENARIOS.includes(value as UiMockScenario)
    ? (value as UiMockScenario)
    : "populated";
}

export default async function Home(props: HomeProps) {
  const params = await props.searchParams;
  const { scenario: scenarioParam } = params;
  const scenario = parseScenario(scenarioParam);
  const normalizedScenarioParam = UI_MOCK_SCENARIOS.includes(
    scenarioParam as UiMockScenario,
  )
    ? scenarioParam
    : undefined;
  const result = loadPublicFootageMock(scenario);
  const query = parsePublicBrowseQuery(params);
  const categories = Array.from(
    new Map(
      (result.data ?? publicFootageFixtures).map((item) => [
        item.category.slug,
        item.category.nameFa,
      ]),
    ),
  ).map(([value, labelFa]) => ({ value, labelFa }));
  const category = normalizePublicCategory(query.category, categories);
  const footage = result.data
    ? filterPublicFootage(result.data, { query: query.query, category })
    : [];

  return (
    <PublicHomePage
      footage={footage}
      scenario={scenario}
      query={query.query}
      category={category}
      categories={categories}
      scenarioParam={normalizedScenarioParam}
      messageFa={"messageFa" in result ? result.messageFa : undefined}
    />
  );
}
