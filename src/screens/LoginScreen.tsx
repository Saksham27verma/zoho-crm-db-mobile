import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { supabase } from "../lib/supabase";

export function LoginScreen({ onLoggedIn }: { onLoggedIn: () => void }) {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"email" | "code">("email");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const normalizedEmail = email.trim().toLowerCase();

  const requestOtp = async () => {
    if (!normalizedEmail) return;
    setLoading(true);
    setError(null);
    try {
      const { error: err } = await supabase.auth.signInWithOtp({
        email: normalizedEmail,
        options: { shouldCreateUser: true },
      });
      if (err) throw err;
      setStep("code");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to send sign-in link.");
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    if (!code.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const { error: err } = await supabase.auth.verifyOtp({
        email: normalizedEmail,
        token: code.trim(),
        type: "email",
      });
      if (err) throw err;
      onLoggedIn();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Invalid code.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <View style={styles.card}>
        <Text style={styles.title}>Sign in</Text>
        <Text style={styles.subtitle}>
          Enter your email and we'll send you a sign-in link or code to access Zoho data.
        </Text>

        {error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="you@company.com"
          placeholderTextColor="#999"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          editable={!loading && step === "email"}
        />

        {step === "code" ? (
          <>
            <Text style={[styles.label, { marginTop: 16 }]}>Code (from email)</Text>
            <TextInput
              style={styles.input}
              value={code}
              onChangeText={setCode}
              placeholder="123456 or paste link token"
              placeholderTextColor="#999"
              keyboardType="default"
              editable={!loading}
            />
          </>
        ) : null}

        {step === "email" ? (
          <Pressable
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={requestOtp}
            disabled={loading || !normalizedEmail}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Send sign-in link</Text>
            )}
          </Pressable>
        ) : (
          <View style={styles.row}>
            <Pressable
              style={[styles.buttonSecondary, loading && styles.buttonDisabled]}
              onPress={() => {
                setStep("email");
                setCode("");
                setError(null);
              }}
              disabled={loading}
            >
              <Text style={styles.buttonSecondaryText}>Back</Text>
            </Pressable>
            <Pressable
              style={[styles.button, styles.buttonFlex, loading && styles.buttonDisabled]}
              onPress={verifyOtp}
              disabled={loading || !code.trim()}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Verify</Text>
              )}
            </Pressable>
          </View>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#fafafa",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    color: "#18181b",
  },
  subtitle: {
    fontSize: 14,
    color: "#71717a",
    marginTop: 8,
    lineHeight: 20,
  },
  errorBox: {
    backgroundColor: "#fef2f2",
    borderWidth: 1,
    borderColor: "#fecaca",
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
  },
  errorText: {
    fontSize: 14,
    color: "#b91c1c",
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#3f3f46",
    marginTop: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: "#d4d4d8",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: "#18181b",
    marginTop: 6,
  },
  button: {
    backgroundColor: "#18181b",
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 24,
  },
  buttonFlex: { flex: 1 },
  buttonDisabled: { opacity: 0.6 },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  buttonSecondary: {
    borderWidth: 1,
    borderColor: "#d4d4d8",
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: "center",
    marginTop: 24,
  },
  buttonSecondaryText: {
    color: "#3f3f46",
    fontSize: 16,
    fontWeight: "600",
  },
  row: {
    flexDirection: "row",
    gap: 12,
    marginTop: 24,
  },
});
