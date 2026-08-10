import { ImageResponse } from "next/og";

type SocialImageSize = Readonly<{
  width: number;
  height: number;
}>;

export function createPortfolioSocialImage(size: SocialImageSize) {
  return new ImageResponse(
    (
      <div
        style={{
          alignItems: "stretch",
          background: "#0d0f17",
          color: "#f2f4f8",
          display: "flex",
          flexDirection: "column",
          fontFamily: "Arial, sans-serif",
          height: "100%",
          justifyContent: "space-between",
          padding: "72px 80px",
          position: "relative",
          width: "100%",
        }}
      >
        <div
          style={{
            background: "#7bf0b3",
            display: "flex",
            height: 2,
            left: 80,
            opacity: 0.72,
            position: "absolute",
            right: 80,
            top: 112,
          }}
        />
        <div
          style={{
            alignItems: "center",
            display: "flex",
            fontSize: 20,
            fontWeight: 700,
            justifyContent: "space-between",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
          }}
        >
          <span>Portfolio / Selected work</span>
          <span style={{ color: "#7bf0b3" }}>Systems across layers</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              color: "#c3a2f5",
              display: "flex",
              fontSize: 24,
              letterSpacing: "0.12em",
              marginBottom: 20,
              textTransform: "uppercase",
            }}
          >
            Computer Engineer
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 76,
              fontWeight: 700,
              letterSpacing: "-0.045em",
              lineHeight: 1,
            }}
          >
            Lakshya Agarwal
          </div>
          <div
            style={{
              color: "#b9bfcb",
              display: "flex",
              fontSize: 28,
              marginTop: 28,
            }}
          >
            Software · AI systems · Embedded devices · Hardware
          </div>
        </div>
        <div
          style={{
            alignItems: "center",
            display: "flex",
            gap: 14,
          }}
        >
          {["#7bf0b3", "#c3a2f5", "#7bf0b3"].map((color, index) => (
            <div
              key={`${color}-${index}`}
              style={{
                background: color,
                borderRadius: 999,
                display: "flex",
                height: index === 1 ? 14 : 8,
                opacity: index === 1 ? 0.9 : 0.55,
                width: index === 1 ? 14 : 8,
              }}
            />
          ))}
          <div
            style={{
              background: "#343946",
              display: "flex",
              height: 1,
              marginLeft: 4,
              width: 240,
            }}
          />
        </div>
      </div>
    ),
    size,
  );
}
