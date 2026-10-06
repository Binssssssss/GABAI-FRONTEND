
import { Colors } from "@/constants/theme";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import api from "../../../services/api";

interface AcademicPressureProps {
  cardBg: string;
  borderCol: string;
  textPrimary: string;
  textSecondary: string;
  errorRed: string;
  primaryBrown: string;
}

type PressureLevel = "LOW" | "MEDIUM" | "HIGH";

interface AcademicPressureResponse {
  level: PressureLevel;
  label: string;
  score: number;
  totalTasks: number;
  pendingTasks: number;
  overdueTasks: number;
  urgentTasks: number;
}

export default function AcademicPressure({
  cardBg,
  borderCol,
  textPrimary,
  textSecondary,
  errorRed,
  primaryBrown,
}: AcademicPressureProps) {
  const router = useRouter();

  const [pressureLabel, setPressureLabel] = useState("Loading...");
  const [pressureLevel, setPressureLevel] =
    useState<PressureLevel>("LOW");
  const [pressureScore, setPressureScore] = useState<number | null>(null);

  useEffect(() => {
    const fetchAcademicPressure = async () => {
      try {
        const response = await api.get("/academic-pressure");

        const data: AcademicPressureResponse =
          response.data.data;

        setPressureLabel(data.label);
        setPressureLevel(data.level);
        setPressureScore(data.score);
      } catch (error) {
        console.error (
          "Failed to fetch academic pressure:",
          error,
        );

        setPressureLabel("Unable to load");
      }
    };

    fetchAcademicPressure();
  }, []);

  const getPressureColor = () => {
    switch (pressureLevel) {
      case "HIGH":
        return errorRed;

      case "MEDIUM":
        return primaryBrown;

      case "LOW":
        return textPrimary === Colors.dark.text
          ? Colors.dark.success
          : Colors.light.success;

      default:
        return errorRed;
    }
  };

  const pressureColor = getPressureColor();

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() =>
        router.push("/(tabs)/tasks/task" as any)
      }
      style={[
        styles.container,
        {
          backgroundColor: cardBg,
          borderColor: borderCol,
        },
      ]}
    >
      <View style={styles.left}>
        <View style={styles.heading}>
          <View style={[styles.icon, { backgroundColor: `${primaryBrown}18` }]}>
            <Feather name="activity" size={17} color={primaryBrown} />
          </View>
          <Text style={[styles.eyebrow, { color: textSecondary }]}>ACADEMIC PRESSURE</Text>
        </View>

        <Text style={[styles.statusText, { color: pressureColor }]}>
          {pressureLabel}
        </Text>
        <View style={styles.detailRow}>
          <View style={[styles.dot, { backgroundColor: pressureColor }]} />
          <Text style={[styles.detail, { color: textSecondary }]}>
            {pressureLevel.toLowerCase()} workload
          </Text>
        </View>
      </View>

      <View
        style={[
          styles.radar,
          {
            borderColor: `${pressureColor}90`,
            backgroundColor: `${pressureColor}10`,
          },
        ]}
      >
        <View style={[styles.radarCore, { borderColor: `${pressureColor}55` }]}>
          <Text style={[styles.score, { color: textPrimary }]}>
            {pressureScore ?? '—'}
          </Text>
          <Text style={[styles.scoreLabel, { color: textSecondary }]}>SCORE</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 132,
    paddingHorizontal: 18,
    paddingVertical: 16,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  left: {
    flex: 1,
    paddingRight: 12,
  },
  heading: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  icon: {
    width: 30,
    height: 30,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 9,
  },
  eyebrow: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.8,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
  },
  detail: {
    fontSize: 12,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 7,
  },
  statusText: {
    fontSize: 18,
    fontWeight: "700",
  },
  radar: {
    width: 82,
    height: 82,
    borderRadius: 41,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  radarCore: {
    width: 66,
    height: 66,
    borderRadius: 33,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  score: {
    fontSize: 20,
    fontWeight: "800",
    fontVariant: ["tabular-nums"],
  },
  scoreLabel: {
    fontSize: 8,
    fontWeight: "700",
    letterSpacing: 0.6,
    marginTop: 1,
  },
});