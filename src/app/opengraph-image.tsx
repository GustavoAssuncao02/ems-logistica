import { ImageResponse } from "next/og";
import { monogramSvg, svgDataUri } from "@/components/brand/monogramSvg";
import { site } from "@/config/site";

export const dynamic = "force-static";

export const alt = `${site.name} — Do planejamento à estrada. Logística que conecta negócios.`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  const logo = svgDataUri(monogramSvg({ letters: "#FFFFFF", bars: "#AEB4BE", arrow: "#F47C28" }));
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          background: "linear-gradient(135deg, #0b1a38 0%, #162F60 60%, #24427e 100%)",
          color: "#FFFFFF",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logo} width={200} height={80} alt="" />
          <div style={{ display: "flex", height: 48, width: 2, background: "rgba(255,255,255,0.3)" }} />
          <div style={{ display: "flex", fontSize: 22, letterSpacing: 8, color: "rgba(255,255,255,0.8)", fontWeight: 700 }}>LOGÍSTICA</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: 22, letterSpacing: 5, color: "#F47C28", fontWeight: 700 }}>LOGÍSTICA & FRETES</div>
          <div style={{ display: "flex", flexDirection: "column", marginTop: 22, fontSize: 64, fontWeight: 800, lineHeight: 1.08, letterSpacing: -1.5 }}>
            <span>Do planejamento à estrada.</span>
            <span style={{ color: "rgba(255,255,255,0.72)" }}>Logística que conecta negócios.</span>
          </div>
        </div>
        <div style={{ display: "flex", height: 4, width: 120, background: "#F47C28", borderRadius: 2 }} />
      </div>
    ),
    size,
  );
}
