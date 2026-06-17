import { View } from "@react-pdf/renderer";

/**
 * Faixa de pista: tracinhos amarelos como elemento gráfico.
 * orientation = "horizontal" (linha de dashes) ou "vertical" (coluna de dashes)
 */
export function RoadStripe({
  orientation = "horizontal",
  color,
  length,
  thickness = 4,
  dashCount = 16,
}: {
  orientation?: "horizontal" | "vertical";
  color: string;
  length?: number; // total length in pt; defaults to 100% of parent
  thickness?: number;
  dashCount?: number;
}) {
  const dashes = Array.from({ length: dashCount });
  if (orientation === "horizontal") {
    return (
      <View
        style={{
          flexDirection: "row",
          width: length ?? "100%",
          height: thickness,
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {dashes.map((_, i) => (
          <View key={i} style={{ flex: 1, height: thickness, marginRight: i === dashes.length - 1 ? 0 : 6, backgroundColor: color }} />
        ))}
      </View>
    );
  }
  return (
    <View
      style={{
        flexDirection: "column",
        height: length ?? "100%",
        width: thickness,
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      {dashes.map((_, i) => (
        <View key={i} style={{ flex: 1, width: thickness, marginBottom: i === dashes.length - 1 ? 0 : 6, backgroundColor: color }} />
      ))}
    </View>
  );
}