/* =================================================================
 * PATH: mobile-app/src/screens/LoginScreen.tsx
 * ================================================================= */
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useAuth } from "../contexts/AuthContext";
import axiosClient from "../api/axiosClient";
import { supabase } from "../lib/supabaseClient";

const LoginScreen: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async () => {
    setLoading(true);
    try {
      const response = await axiosClient.post("/auth/login", {
        email,
        password,
      });
      const { session, profile } = response.data;
      await supabase.auth.setSession(session);
      login(profile, session.access_token);
    } catch (error) {
      Alert.alert(
        "Login Failed",
        "Please check your credentials and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1 justify-center p-6"
      >
        <View className="bg-white p-8 rounded-2xl shadow-md">
          <Text className="text-3xl font-bold text-center text-gray-900 mb-8">
            Restaurant App
          </Text>
          <TextInput
            className="bg-gray-50 border border-gray-300 text-gray-900 text-base rounded-lg p-4 w-full mb-4"
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            className="bg-gray-50 border border-gray-300 text-gray-900 text-base rounded-lg p-4 w-full mb-6"
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          <TouchableOpacity
            className="bg-indigo-600 py-4 rounded-lg items-center"
            onPress={handleLogin}
            disabled={loading}
          >
            <Text className="text-white font-bold text-base">
              {loading ? "Signing In..." : "Sign In"}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default LoginScreen;
