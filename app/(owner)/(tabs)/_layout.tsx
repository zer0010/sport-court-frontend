import React from "react";
import { Tabs } from "expo-router";
import Colors from "@/constants/Colors";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

export default function OwnerTabLayout() {
    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: Colors.primary,
                tabBarInactiveTintColor: Colors.grey,
                tabBarLabelStyle: {
                    fontFamily: "mon-sb",
                    fontSize: 12,
                },
                tabBarStyle: {
                    backgroundColor: "#fff",
                    borderTopWidth: 1,
                    borderTopColor: Colors.lightGrey || "#e0e0e0",
                    paddingTop: 8,
                    paddingBottom: 8,
                    height: 60,
                },
            }}
        >
            <Tabs.Screen
                name="dashboard"
                options={{
                    tabBarLabel: "Dashboard",
                    headerTitle: "Dashboard",
                    headerTitleStyle: {
                        fontFamily: "mon-sb",
                    },
                    tabBarIcon: ({ color, size }) => (
                        <MaterialCommunityIcons
                            name="view-dashboard-outline"
                            color={color}
                            size={size}
                        />
                    ),
                }}
            />
            <Tabs.Screen
                name="schedule"
                options={{
                    tabBarLabel: "Schedule",
                    headerTitle: "Schedule",
                    headerTitleStyle: {
                        fontFamily: "mon-sb",
                    },
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="calendar-outline" color={color} size={size} />
                    ),
                }}
            />
            <Tabs.Screen
                name="venues"
                options={{
                    tabBarLabel: "Venues",
                    headerTitle: "My Venues",
                    headerTitleStyle: {
                        fontFamily: "mon-sb",
                    },
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="business-outline" color={color} size={size} />
                    ),
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    tabBarLabel: "Profile",
                    headerShown: false,
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="person-circle-outline" color={color} size={size} />
                    ),
                }}
            />
        </Tabs>
    );
}
