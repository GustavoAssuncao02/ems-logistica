import { useId } from "react";
import { CloudLayer, FarLayer, MidLayer } from "./Backdrop";
import { GROUND_Y, JOURNEY, MONO, TRUCK } from "./config";
import { Ferry, River } from "./Ferry";
import { FuelPump, FuelStationBack } from "./FuelStation";
import { IntroLogo } from "./IntroLogo";
import type { JourneyPlan } from "./plan";
import { Road, RoadProps, type RoadProp } from "./Road";
import { TollBooth } from "./TollBooth";
import { CityBlock, TrafficLight } from "./TrafficLight";
import { Truck } from "./Truck";
import { WAREHOUSE, WarehouseBack, WarehouseFront } from "./Warehouse";

/**
 * Composição completa da jornada, em ordem de profundidade:
 * fundo → parallax → (mundo: cenários de fundo, pista, balsa, caminhão,
 * água, primeiro plano) → abertura com a marca.
 */
export function JourneyScene({ plan }: { plan: JourneyPlan }) {
  const P = plan.pos;
  const irisId = `iris-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const W2 = WAREHOUSE.wall;
  const startScreen = TRUCK.anchorX + JOURNEY.startDrift;

  const roadSegments = [
    [P.originLeft, P.bankLeft],
    [P.bankRight, P.worldEnd],
  ] as const;
  const dashes = [
    [P.originDoor + W2 + 30, P.stopLine - 12],
    [P.stopLine + 352, P.bankLeft - 40],
    [P.bankRight + 40, P.destDoor - 30],
  ] as const;
  const curbs = [
    [P.originLeft, P.stopLine + 150],
    [P.stopLine + 340, P.bankLeft - 30],
    [P.bankRight + 30, P.worldEnd],
  ] as const;

  const props = buildRoadProps(plan);

  return (
    <>
      <defs>
        <clipPath id={irisId}>
          <circle data-j="iris" cx={startScreen + TRUCK.logo.cx} cy={GROUND_Y + TRUCK.logo.cy} r={0} />
        </clipPath>
      </defs>
      <rect x={-400} y={-200} width={2400} height={1040} fill={MONO.bg} />

      <g data-j="scene" clipPath={`url(#${irisId})`}>
        <CloudLayer />
        <FarLayer />
        <MidLayer />

        <g data-j="world">
          {/* cenários de fundo (atrás do caminhão) */}
          <CityBlock x={P.lightPole} />
          <RoadProps items={props} />
          <WarehouseBack variant="origin" wallL={P.originLeft} wallR={P.originDoor} truckX={plan.start.x} />
          <TollBooth pivot={P.tollPivot} />
          <TrafficLight stopLine={P.stopLine} pole={P.lightPole} />
          <FuelStationBack pump={P.pump} />
          <WarehouseBack variant="destination" wallL={P.destDoor} wallR={P.destRight} truckX={P.destTruck} />

          <Road segments={roadSegments.map((r) => [...r] as const)} dashes={dashes.map((r) => [...r] as const)} curbs={curbs.map((r) => [...r] as const)} />

          <Ferry deckStart={P.deckStart} />

          <g data-j="truck-pos" transform={`translate(${plan.start.x} ${GROUND_Y})`}>
            <Truck />
          </g>

          <River bankLeft={P.bankLeft} bankRight={P.bankRight} />

          {/* primeiro plano */}
          <FuelPump pump={P.pump} />
          <WarehouseFront variant="origin" wallL={P.originLeft} wallR={P.originDoor} />
          <WarehouseFront variant="destination" wallL={P.destDoor} wallR={P.destRight} />
        </g>
      </g>

      <IntroLogo />
    </>
  );
}

/** Postes e placas distribuídos nos trechos livres entre as cenas. */
function buildRoadProps(plan: JourneyPlan): RoadProp[] {
  const P = plan.pos;
  const signs: RoadProp[] = [
    { kind: "speed", x: P.tollPivot - 860, value: "60" },
    { kind: "warning", x: P.lightPole - 700 },
    { kind: "plate", x: P.bankLeft - 360, text: "BALSA", icon: "ferry" },
    { kind: "plate", x: P.destDoor - 330, text: "CENTRO LOGÍSTICO", icon: "warehouse" },
  ];
  const free: [number, number][] = [
    [P.originDoor + 200, P.tollPivot - 760],
    [P.tollPivot + 420, P.lightPole - 620],
    [P.lightPole + 640, P.bankLeft - 160],
    [P.bankRight + 180, P.pump - 600],
    [P.pump + 1150, P.destDoor - 140],
  ];
  const lamps: RoadProp[] = [];
  for (const [a, b] of free) {
    for (let x = a + 60; x < b; x += 640) {
      if (signs.some((s) => Math.abs(s.x - x) < 170)) continue;
      lamps.push({ kind: "lamp", x });
    }
  }
  return [...lamps, ...signs];
}
