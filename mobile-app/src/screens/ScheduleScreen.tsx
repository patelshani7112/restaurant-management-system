/* =================================================================
 * PATH: mobile-app/src/screens/ScheduleScreen.tsx
 * ================================================================= */
import React from "react";
import { View, Text, SafeAreaView } from "react-native";

const ScheduleScreen: React.FC = () => {
  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <View className="p-6">
        <Text className="text-3xl font-bold text-gray-900">My Schedule</Text>
        <Text className="mt-4 text-lg text-gray-600">
          The schedule calendar will be built here.
        </Text>
      </View>
    </SafeAreaView>
  );
};

export default ScheduleScreen;
