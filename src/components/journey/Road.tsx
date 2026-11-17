import { useId } from "react";
import { GROUND_Y, MONO, ROAD_H } from "./config";

const G = GROUND_Y;
type Range = readonly [number, number];

type RoadProps = {
  /** Trechos de asfalto (a balsa interrompe a pista). */
  segments: Range[];
  /** Trechos com faixa central tracejada. */
  dashes: Range[];
  /** Trechos de meio-fio (interrompidos no cruzamento). */
  curbs: Range[];
};

/** Pista: asfalto preto, faixa branca tracejada e meio-fio cinza. */
export function Road({ segments, dashes, curbs }: RoadProps) {
  const pid = `lane-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  return (
    <g>
      <defs>
        <pattern id={pid} x={0} y={0} width={120} height={6} patternUnits="userSpaceOnUse">
          <rect width={58} height={5} fill={MONO.paper} />
        </pattern>
      </defs>
      {segments.map(([a, b]) => (
        <g key={`r${a}`}>
          <rect x={a} y={G} width={b - a} height={ROAD_H} fill={MONO.ink} />
          <rect x={a} y={G} width={b - a} height={2} fill={MONO.edge} />
        </g>
      ))}
      {dashes.map(([a, b]) => (
        <rect key={`d${a}`} x={a} y={G + 28} width={b - a} height={5} fill={`url(#${pid})`} />
      ))}
      {curbs.map(([a, b]) => (
        <g key={`c${a}`}>
          <rect x={a} y={G + ROAD_H} width={b - a} height={9} fill={MONO.g3} />
          <rect x={a} y={G + ROAD_H + 9} width={b - a} height={14} fill={MONO.g1} />
        </g>
      ))}
    </g>
  );
}

// ── Mobiliário rodoviário minimalista ─────────────────────────────────────

export type RoadProp =
  | { kind: "lamp"; x: number }
  | { kind: "speed"; x: number; value: string }
  | { kind: "plate"; x: number; text: string; icon?: "ferry" | "warehouse" | "fuel" }
  | { kind: "warning"; x: number };

export function RoadProps({ items }: { items: RoadProp[] }) {
  return (
    <g>
      {items.map((it) => {
        switch (it.kind) {
          case "lamp":
            return <Lamp key={`l${it.x}`} x={it.x} />;
          case "speed":
            return <SpeedSign key={`s${it.x}`} x={it.x} value={it.value} />;
          case "plate":
            return <PlateSign key={`p${it.x}`} x={it.x} text={it.text} icon={it.icon} />;
          case "warning":
            return <WarningSign key={`w${it.x}`} x={it.x} />;
        }
      })}
    </g>
  );
}

function Lamp({ x }: { x: number }) {
  return (
    <g stroke={MONO.g4} strokeLinecap="round" fill="none">
      <line x1={x} y1={G} x2={x} y2={G - 250} strokeWidth={4} />
      <path d={`M${x} ${G - 250} Q${x} ${G - 270} ${x + 22} ${G - 270} H${x + 46}`} strokeWidth={4} />
      <rect x={x + 38} y={G - 274} width={24} height={8} rx={3} fill={MONO.g4} strokeWidth={1} />
    </g>
  );
}

function Post({ x, h }: { x: number; h: number }) {
  return <rect x={x - 2.5} y={G - h} width={5} height={h} fill={MONO.g4} />;
}

function SpeedSign({ x, value }: { x: number; value: string }) {
  return (
    <g>
      <Post x={x} h={140} />
      <circle cx={x} cy={G - 160} r={24} fill={MONO.paper} stroke={MONO.ink} strokeWidth={5} />
      <text x={x} y={G - 152} textAnchor="middle" fontSize={21} fontWeight={800} fill={MONO.ink}>
        {value}
      </text>
    </g>
  );
}

function WarningSign({ x }: { x: number }) {
  return (
    <g>
      <Post x={x} h={130} />
      <path d={`M${x} ${G - 196} L${x + 28} ${G - 146} H${x - 28} Z`} fill={MONO.paper} stroke={MONO.ink} strokeWidth={4} strokeLinejoin="round" />
      <rect x={x - 5.5} y={G - 180} width={11} height={26} rx={3} fill={MONO.ink} />
      <circle cx={x} cy={G - 174} r={2.6} fill={MONO.paper} />
      <circle cx={x} cy={G - 167} r={2.6} fill={MONO.g4} />
      <circle cx={x} cy={G - 160} r={2.6} fill={MONO.g4} />
    </g>
  );
}

function PlateSign({ x, text, icon }: { x: number; text: string; icon?: "ferry" | "warehouse" | "fuel" }) {
  const w = Math.max(120, text.length * 11 + (icon ? 54 : 30));
  const left = x - w / 2;
  const top = G - 206;
  return (
    <g>
      <Post x={x - w / 2 + 14} h={170} />
      <Post x={x + w / 2 - 14} h={170} />
      <rect x={left} y={top} width={w} height={44} rx={5} fill={MONO.ink} stroke={MONO.paper} strokeWidth={2} />
      <rect x={left + 4} y={top + 4} width={w - 8} height={36} rx={3} fill="none" stroke={MONO.paper} strokeWidth={1} opacity={0.5} />
      {icon && <PlateIcon kind={icon} x={left + 26} y={top + 22} />}
      <text
        x={icon ? left + 48 : x}
        y={top + 28}
        textAnchor={icon ? "start" : "middle"}
        fontSize={14}
        fontWeight={800}
        letterSpacing={1.6}
        fill={MONO.paper}
      >
        {text}
      </text>
    </g>
  );
}

function PlateIcon({ kind, x, y }: { kind: "ferry" | "warehouse" | "fuel"; x: number; y: number }) {
  if (kind === "ferry")
    return (
      <g transform={`translate(${x} ${y})`} fill="none" stroke={MONO.paper} strokeWidth={2} strokeLinejoin="round">
        <path d="M-13 1 H13 L9 8 H-9 Z" fill={MONO.paper} />
        <path d="M2 1 V-9 H9 V1" />
        <path d="M-14 13 Q-10 10 -6 13 T2 13 T10 13 T16 13" strokeWidth={1.6} />
      </g>
    );
  if (kind === "fuel")
    return (
      <g transform={`translate(${x} ${y})`} fill={MONO.paper}>
        <rect x={-9} y={-11} width={13} height={22} rx={2} />
        <rect x={-6} y={-8} width={7} height={6} fill={MONO.ink} />
        <path d="M4 -6 H8 V7 Q8 10 11 8 V-3" fill="none" stroke={MONO.paper} strokeWidth={2} />
      </g>
    );
  return (
    <g transform={`translate(${x} ${y})`} fill="none" stroke={MONO.paper} strokeWidth={2} strokeLinejoin="round">
      <path d="M-13 11 V-3 L0 -11 L13 -3 V11 Z" />
      <path d="M-6 11 V2 H6 V11" />
    </g>
  );
}
