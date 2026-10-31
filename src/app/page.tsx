import { preparePublicHomeCatalog } from "@/modules/footage/public/catalog/prepare-public-home";
import { HomeExploration } from "@/modules/footage/public/home-exploration/home-exploration";
import {
  UI_MOCK_SCENARIOS,
  type UiMockScenario,
} from "@/modules/ui-mock/scenarios";

export const dynamic = "force-dynamic";

type HomeProps = {
  searchParams: Promise<{
    q?: string;
    category?: string;
    scenario?: string;
    page?: string;
  }>;
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
  const catalog = preparePublicHomeCatalog(scenario, params);

  return (
    <HomeExploration
      variant="balanced"
      footage={catalog.footage}
      query={catalog.query}
      category={catalog.category}
      categories={catalog.categories}
      scenario={scenario}
      scenarioParam={normalizedScenarioParam}
      messageFa={catalog.messageFa}
      requestedPage={Number.parseInt(params.page ?? "1", 10) || 1}
    />
  );
}
