import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Linking,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { formatDateOnly, pickFirst } from "../lib/format";
import { supabase, VISITORS_TABLE } from "../lib/supabase";

const LIST_SELECT =
  "Record_Id,Visitor_Name,Phone,Center,Date_of_visit,Reference,Hearing_aid_status";
const PAGE_SIZE = 50;

type Row = Record<string, unknown>;

function getDateOfVisit(row: Row): string {
  const v = pickFirst(row, ["Date_of_visit", "date_of_visit"]);
  return v ? formatDateOnly(v) : "—";
}

function getVisitorName(row: Row): string {
  const v = pickFirst(row, ["Visitor_Name", "visitor_name", "name"]);
  return v != null ? String(v) : "—";
}

function getRecordId(row: Row): string {
  const v = pickFirst(row, ["Record_Id", "record_id", "id"]);
  return v != null ? String(v) : "";
}

function getPhone(row: Row): string | null {
  const v = pickFirst(row, ["Phone", "phone", "mobile"]);
  if (v == null || String(v).trim() === "") return null;
  return String(v).trim();
}

function telUrl(raw: string): string {
  const digits = raw.replace(/[\s\-\.\(\)]/g, "");
  return "tel:" + digits;
}

export type RootStackParamList = {
  Login: undefined;
  Visitors: undefined;
  VisitorDetail: { id: string; idCol?: string };
};

export function VisitorsListScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList, "Visitors">>();
  const [rows, setRows] = useState<Row[]>([]);
  const [total, setTotal] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [orderDesc, setOrderDesc] = useState(true);

  const fetchVisitors = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      let query = supabase
        .from(VISITORS_TABLE)
        .select(LIST_SELECT, { count: "exact" })
        .order("Date_of_visit", { ascending: !orderDesc, nullsFirst: false })
        .order("Record_Id", { ascending: true })
        .range(0, PAGE_SIZE - 1);

      if (search.trim()) {
        const term = search.trim();
        query = query.ilike("Visitor_Name", `%${term}%`);
      }

      const { data, count, error: err } = await query;
      if (err) throw err;
      setRows((data as Row[]) ?? []);
      setTotal(count ?? null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load visitors.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [orderDesc, search]);

  useEffect(() => {
    const t = setTimeout(() => fetchVisitors(), search ? 300 : 0);
    return () => clearTimeout(t);
  }, [fetchVisitors, search]);

  const onRefresh = () => fetchVisitors(true);

  const openDetail = (row: Row) => {
    const id = getRecordId(row);
    if (id) navigation.navigate("VisitorDetail", { id });
  };

  if (loading && rows.length === 0) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#18181b" />
        <Text style={styles.loadingText}>Loading visitors…</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.toolbar}>
        <TextInput
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholder="Search name, phone, center…"
          placeholderTextColor="#999"
        />
        <Text
          style={styles.sortHint}
          onPress={() => {
            setOrderDesc((d) => !d);
            setRows([]);
          }}
        >
          Date {orderDesc ? "▼" : "▲"}
        </Text>
      </View>
      {error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}
      <FlatList
        data={rows}
        keyExtractor={(item) => getRecordId(item) || String(Math.random())}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No visitors found.</Text>
          </View>
        }
        renderItem={({ item }) => {
          const phone = getPhone(item);
          return (
            <View style={styles.row}>
              <Text
                style={styles.rowTitle}
                onPress={() => openDetail(item)}
                numberOfLines={1}
              >
                {getVisitorName(item)}
              </Text>
              <Text style={styles.rowMeta}>
                {getDateOfVisit(item)} · {String(pickFirst(item, ["Center", "center"]) ?? "—")}
              </Text>
              {phone ? (
                <Pressable
                  onPress={() => Linking.openURL(telUrl(phone))}
                  style={styles.phoneLink}
                >
                  <Text style={styles.phoneLinkText}>{phone}</Text>
                </Pressable>
              ) : null}
            </View>
          );
        }}
      />
      {total != null && total > 0 ? (
        <Text style={styles.footer}>Showing up to {PAGE_SIZE} of {total}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fafafa" },
  centered: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fafafa" },
  loadingText: { marginTop: 12, fontSize: 14, color: "#71717a" },
  toolbar: { padding: 12, backgroundColor: "#fff", borderBottomWidth: 1, borderBottomColor: "#e4e4e7" },
  searchInput: {
    borderWidth: 1,
    borderColor: "#d4d4d8",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: "#18181b",
  },
  sortHint: { marginTop: 8, fontSize: 12, color: "#71717a" },
  errorBox: { backgroundColor: "#fef2f2", padding: 12, margin: 12 },
  errorText: { color: "#b91c1c", fontSize: 14 },
  row: {
    backgroundColor: "#fff",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e4e4e7",
  },
  rowTitle: { fontSize: 16, fontWeight: "600", color: "#18181b" },
  rowMeta: { fontSize: 13, color: "#71717a", marginTop: 4 },
  phoneLink: { marginTop: 6 },
  phoneLinkText: { fontSize: 14, color: "#2563eb", fontWeight: "500" },
  empty: { padding: 32, alignItems: "center" },
  emptyText: { fontSize: 14, color: "#71717a" },
  footer: { padding: 12, fontSize: 12, color: "#71717a", textAlign: "center" },
});
