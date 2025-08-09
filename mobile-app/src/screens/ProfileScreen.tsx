/* =================================================================
 * PATH: mobile-app/src/screens/ProfileScreen.tsx
 * ================================================================= */
import React from "react";
import { View, Text, TouchableOpacity, SafeAreaView } from "react-native";
import { useAuth } from "../contexts/AuthContext";

const ProfileScreen: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <View className="p-6">
        <Text className="text-3xl font-bold text-gray-900">My Profile</Text>
        <View className="mt-8 bg-white p-6 rounded-lg shadow-md">
          <Text className="text-lg mb-2">
            Name: {user?.first_name} {user?.last_name}
          </Text>
          <Text className="text-lg">Role: {user?.role_name}</Text>
        </View>
        <TouchableOpacity
          className="mt-8 bg-red-600 py-4 rounded-lg items-center"
          onPress={logout}
        >
          <Text className="text-white font-bold text-base">Sign Out</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default ProfileScreen;
