import { View, Text } from "@react-pdf/renderer";
import { TOKENS } from "../tokens";
import { RoadStripe } from "./RoadStripe";

export function AsphaltPlaceholder({ amber, label }: { amber: string; label?: string }) {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: TOKENS.ASPHALT,
        borderRadius: 4,
        overflow: "hidden",
        justifyContent: "center",
        alignItems: "center",
        padding: 12,
      }}
    >
      <RoadStripe color={amber} dashCount={12} thickness={3} />
      {label ? (
        <Text style={{ marginTop: 10, fontSize: 9, color: TOKENS.DIM, textTransform: "uppercase", letterSpacing: 1 }}>
          {label}
        </Text>
      ) : null}
      <View style={{ marginTop: 10, width: "60%" }}>
        <RoadStripe color={amber} dashCount={12} thickness={3} />
      </View>
    </View>
  );
}