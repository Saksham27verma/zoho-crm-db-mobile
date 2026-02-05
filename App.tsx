import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StatusBar } from "expo-status-bar";
import { View, ActivityIndicator, StyleSheet, Pressable, Text } from "react-native";
import { Session } from "@supabase/supabase-js";
import { supabase } from "./src/lib/supabase";
import { LoginScreen } from "./src/screens/LoginScreen";
import { VisitorsListScreen, RootStackParamList } from "./src/screens/VisitorsListScreen";
import { VisitorDetailScreen } from "./src/screens/VisitorDetailScreen";

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setLoading(false);
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#18181b" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <StatusBar style="dark" />
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: "#fff" },
          headerTintColor: "#18181b",
          headerShadowVisible: true,
        }}
      >
        {!session ? (
          <Stack.Screen name="Login" options={{ title: "Sign in" }}>
            {() => (
              <LoginScreen
                onLoggedIn={async () => {
                  const { data: { session: s } } = await supabase.auth.getSession();
                  setSession(s);
                }}
              />
            )}
          </Stack.Screen>
        ) : (
          <>
            <Stack.Screen
              name="Visitors"
              component={VisitorsListScreen}
              options={{
                title: "Visitors",
                headerRight: () => (
                  <Pressable
                    onPress={async () => {
                      await supabase.auth.signOut();
                      setSession(null);
                    }}
                    style={styles.logoutBtn}
                  >
                    <Text style={styles.logoutText}>Sign out</Text>
                  </Pressable>
                ),
              }}
            />
            <Stack.Screen
              name="VisitorDetail"
              component={VisitorDetailScreen}
              options={{ title: "Visitor details" }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fafafa",
  },
  logoutBtn: { marginRight: 8, paddingVertical: 6, paddingHorizontal: 10 },
  logoutText: { fontSize: 16, color: "#2563eb", fontWeight: "500" },
});
