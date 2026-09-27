
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
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

  useEffect(() => {
    const fetchAcademicPressure = async () => {
      try {
        const response = await api.get("/api/academic-pressure");

        const data: AcademicPressureResponse =
          response.data.data;

        setPressureLabel(data.label);
        setPressureLevel(data.level);
      } catch (error) {
        console.error(
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
        return "#4CAF50";

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
        <Text
          style={[
            styles.title,
            {
              color: textPrimary,
            },
          ]}
        >
          Academic Pressure
        </Text>

        <View style={styles.status}>
          <View
            style={[
              styles.dot,
              {
                backgroundColor: pressureColor,
              },
            ]}
          />

          <Text
            style={[
              styles.statusText,
              {
                color: pressureColor,
              },
            ]}
          >
            {pressureLabel}
          </Text>
        </View>
      </View>

      <Feather
        name="chevron-right"
        size={18}
        color={textSecondary}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 52,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  left: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  title: {
    fontSize: 13,
    fontWeight: "700",
    marginRight: 12,
  },

  status: {
    flexDirection: "row",
    alignItems: "center",
  },

  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginRight: 6,
  },

  statusText: {
    fontSize: 12,
    fontWeight: "700",
  },
});