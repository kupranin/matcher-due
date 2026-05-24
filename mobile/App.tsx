import { StatusBar } from "expo-status-bar";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

type Role = "CANDIDATE" | "EMPLOYER";
type AuthMode = "login" | "register";

const apiBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL?.trim() || "";

export default function App() {
  const [mode, setMode] = useState<AuthMode>("login");
  const [role, setRole] = useState<Role>("CANDIDATE");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const endpoint = useMemo(() => {
    if (!apiBaseUrl) return "";
    return `${apiBaseUrl}/api/auth/${mode}`;
  }, [mode]);

  const submit = async () => {
    if (!apiBaseUrl) {
      Alert.alert(
        "Missing API URL",
        "Set EXPO_PUBLIC_API_BASE_URL in mobile/.env, then restart Expo."
      );
      return;
    }

    if (!email.trim()) {
      Alert.alert("Email required", "Please enter your email.");
      return;
    }
    if (!password.trim()) {
      Alert.alert("Password required", "Please enter your password.");
      return;
    }

    setLoading(true);
    setMessage("");
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
          role,
        }),
      });

      const json = (await res.json().catch(() => ({}))) as {
        error?: string;
        userId?: string;
        email?: string;
        role?: string;
      };

      if (!res.ok) {
        setMessage(json.error || "Request failed.");
        return;
      }

      if (json.error) {
        setMessage(json.error);
        return;
      }

      if (mode === "register") {
        setMessage("Registration successful. You can now switch to login.");
      } else {
        setMessage(`Logged in as ${json.email || email.trim().toLowerCase()} (${json.role || role})`);
      }
    } catch (error) {
      const text = error instanceof Error ? error.message : "Network request failed.";
      setMessage(text);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Matcher Mobile</Text>
        <Text style={styles.subtitle}>Mobile client for your existing backend</Text>

        <View style={styles.segment}>
          <ModeButton label="Login" active={mode === "login"} onPress={() => setMode("login")} />
          <ModeButton label="Register" active={mode === "register"} onPress={() => setMode("register")} />
        </View>

        <View style={styles.segment}>
          <ModeButton label="Candidate" active={role === "CANDIDATE"} onPress={() => setRole("CANDIDATE")} />
          <ModeButton label="Employer" active={role === "EMPLOYER"} onPress={() => setRole("EMPLOYER")} />
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>API Base URL</Text>
          <Text style={styles.apiText}>
            {apiBaseUrl || "Not set. Configure EXPO_PUBLIC_API_BASE_URL in mobile/.env"}
          </Text>

          <Text style={styles.label}>Email</Text>
          <TextInput
            value={email}
            autoCapitalize="none"
            keyboardType="email-address"
            onChangeText={setEmail}
            placeholder="you@example.com"
            placeholderTextColor="#7a8595"
            style={styles.input}
          />

          <Text style={styles.label}>Password</Text>
          <TextInput
            value={password}
            secureTextEntry
            onChangeText={setPassword}
            placeholder="********"
            placeholderTextColor="#7a8595"
            style={styles.input}
          />

          <Pressable disabled={loading} style={styles.submitButton} onPress={submit}>
            {loading ? <ActivityIndicator color="#0b1220" /> : <Text style={styles.submitText}>{mode === "login" ? "Login" : "Create account"}</Text>}
          </Pressable>

          {!!message && <Text style={styles.message}>{message}</Text>}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function ModeButton({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable style={[styles.modeButton, active && styles.modeButtonActive]} onPress={onPress}>
      <Text style={[styles.modeText, active && styles.modeTextActive]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#0b1220",
  },
  container: {
    flexGrow: 1,
    padding: 20,
    justifyContent: "center",
    gap: 12,
  },
  title: {
    color: "#f8fafc",
    fontSize: 28,
    fontWeight: "700",
  },
  subtitle: {
    color: "#94a3b8",
    marginBottom: 8,
  },
  segment: {
    flexDirection: "row",
    gap: 10,
  },
  modeButton: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#334155",
    paddingVertical: 10,
    alignItems: "center",
  },
  modeButtonActive: {
    backgroundColor: "#2563eb",
    borderColor: "#2563eb",
  },
  modeText: {
    color: "#cbd5e1",
    fontWeight: "600",
  },
  modeTextActive: {
    color: "#e2e8f0",
  },
  card: {
    marginTop: 8,
    backgroundColor: "#111827",
    borderRadius: 14,
    borderColor: "#1f2937",
    borderWidth: 1,
    padding: 16,
    gap: 8,
  },
  label: {
    color: "#cbd5e1",
    fontWeight: "600",
  },
  apiText: {
    color: "#94a3b8",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#334155",
    borderRadius: 10,
    color: "#f8fafc",
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 6,
  },
  submitButton: {
    marginTop: 8,
    backgroundColor: "#22d3ee",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
  },
  submitText: {
    color: "#0f172a",
    fontWeight: "700",
  },
  message: {
    marginTop: 10,
    color: "#f8fafc",
    lineHeight: 20,
  },
});
