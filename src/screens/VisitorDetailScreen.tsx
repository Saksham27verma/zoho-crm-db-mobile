import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { formatValue, pickFirst } from "../lib/format";
import { VISITOR_SECTIONS } from "../lib/visitorFields";
import { supabase, VISITORS_TABLE } from "../lib/supabase";
import type { RootStackParamList } from "./VisitorsListScreen";

const TABLE_CANDIDATES = [
  VISITORS_TABLE,
  "visitors",
  "Visitors",
  "zoho_visitor_table",
];

export function VisitorDetailScreen() {
  const route = useRoute<RouteProp<RootStackParamList, "VisitorDetail">>();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList, "VisitorDetail">>();
  const { id, idCol } = route.params;
  const [row, setRow] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const idValue = /^\d+$/.test(id) ? Number(id) : id;
  const col = idCol ?? "Record_Id";

  const fetchDetail = useCallback(async () => {
    setLoading(true);
    setError(null);
    for (const table of TABLE_CANDIDATES) {
      const { data, error: err } = await supabase
        .from(table)
        .select("*")
        .eq(col, idValue)
        .single();
      if (!err && data) {
        setRow(data as Record<string, unknown>);
        return;
      }
    }
    setError("Visitor not found.");
  }, [idValue, col]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  if (loading && !row) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#18181b" />
      </View>
    );
  }

  if (error || !row) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error ?? "Not found"}</Text>
        <Text style={styles.backLink} onPress={() => navigation.goBack()}>
          Back to visitors
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {VISITOR_SECTIONS.map((section) => (
        <View key={section.title} style={styles.section}>
          <Text style={styles.sectionTitle}>{section.title}</Text>
          {section.fields.map((field) => {
            const val = pickFirst(row, field.keys);
            if (val === undefined || val === "") return null;
            const isPhone = field.label === "Phone" || field.keys.some((k) => /phone|mobile/i.test(k));
            const displayVal = formatValue(val);
            if (isPhone) {
              const valStr = typeof val === "string" ? val : String(val);
              const tel = "tel:" + valStr.replace(/[\s\-\.\(\)]/g, "");
              return (
                <View key={field.label} style={styles.field}>
                  <Text style={styles.fieldLabel}>{field.label}</Text>
                  <Pressable onPress={() => Linking.openURL(tel)}>
                    <Text style={styles.fieldValueLink}>{displayVal}</Text>
                  </Pressable>
                </View>
              );
            }
            return (
              <View key={field.label} style={styles.field}>
                <Text style={styles.fieldLabel}>{field.label}</Text>
                <Text style={styles.fieldValue}>{displayVal}</Text>
              </View>
            );
          })}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fafafa" },
  content: { padding: 16, paddingBottom: 32 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fafafa" },
  errorText: { fontSize: 16, color: "#b91c1c" },
  backLink: { marginTop: 12, fontSize: 16, color: "#2563eb" },
  section: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#18181b",
    marginBottom: 12,
  },
  field: { marginBottom: 12 },
  fieldLabel: { fontSize: 12, color: "#71717a", marginBottom: 2 },
  fieldValue: { fontSize: 15, color: "#18181b" },
  fieldValueLink: { fontSize: 15, color: "#2563eb", fontWeight: "500" },
});
