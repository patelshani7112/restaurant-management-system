/* =================================================================
 * PATH: mobile-app/src/navigation/AppNavigator.tsx
 * ================================================================= */
import React from "react";
import { useAuth } from "../contexts/AuthContext";
import LoginScreen from "../screens/LoginScreen";
import MainTabNavigator from "./MainTabNavigator";
import { View, ActivityIndicator } from "react-native";

const AppNavigator: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return user ? <MainTabNavigator /> : <LoginScreen />;
};

export default AppNavigator;
