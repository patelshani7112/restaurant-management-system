/* =================================================================
 * PATH: mobile-app/src/navigation/MainTabNavigator.tsx
 * ================================================================= */
import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import ScheduleScreen from "../screens/ScheduleScreen";
import ProfileScreen from "../screens/ProfileScreen";

const Tab = createBottomTabNavigator();

const MainTabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false, // We will build a custom header later
      }}
    >
      <Tab.Screen name="Schedule" component={ScheduleScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

export default MainTabNavigator;
