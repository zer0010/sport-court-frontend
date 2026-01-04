import React from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Image,
    Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/Colors";
import { useAuthStore } from "@/stores/authStore";

export default function OwnerProfilePage() {
    const { user, logout, isLoading } = useAuthStore();

    const handleLogout = () => {
        Alert.alert(
            "Logout",
            "Are you sure you want to logout?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Logout",
                    style: "destructive",
                    onPress: async () => {
                        await logout();
                    },
                },
            ]
        );
    };

    const profileOptions = [
        {
            icon: "person-outline",
            title: "Business Information",
            subtitle: "Update your business name and contact",
            onPress: () => { },
        },
        {
            icon: "card-outline",
            title: "Payout Settings",
            subtitle: "Manage your bank account details",
            onPress: () => { },
        },
        {
            icon: "notifications-outline",
            title: "Notifications",
            subtitle: "Booking alerts and reminders",
            onPress: () => { },
        },
        {
            icon: "stats-chart-outline",
            title: "Analytics",
            subtitle: "View detailed insights and reports",
            onPress: () => { },
        },
        {
            icon: "help-circle-outline",
            title: "Help & Support",
            subtitle: "Get help or contact us",
            onPress: () => { },
        },
    ];

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.avatarContainer}>
                    {user?.avatar_url ? (
                        <Image source={{ uri: user.avatar_url }} style={styles.avatar} />
                    ) : (
                        <View style={styles.avatarPlaceholder}>
                            <Ionicons name="business" size={40} color={Colors.grey} />
                        </View>
                    )}
                </View>
                <Text style={styles.name}>{user?.name || "Owner"}</Text>
                <Text style={styles.email}>{user?.email}</Text>
                <View style={styles.roleBadge}>
                    <Ionicons name="star" size={12} color="#fff" />
                    <Text style={styles.roleText}>Venue Owner</Text>
                </View>
            </View>

            {/* Quick Stats */}
            <View style={styles.statsContainer}>
                <View style={styles.statItem}>
                    <Text style={styles.statValue}>0</Text>
                    <Text style={styles.statLabel}>Venues</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                    <Text style={styles.statValue}>0</Text>
                    <Text style={styles.statLabel}>Bookings</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                    <Text style={styles.statValue}>Rs. 0</Text>
                    <Text style={styles.statLabel}>Earnings</Text>
                </View>
            </View>

            {/* Options */}
            <View style={styles.optionsContainer}>
                {profileOptions.map((option, index) => (
                    <TouchableOpacity
                        key={index}
                        style={styles.optionItem}
                        onPress={option.onPress}
                    >
                        <View style={styles.optionIconContainer}>
                            <Ionicons
                                name={option.icon as any}
                                size={24}
                                color={Colors.primary}
                            />
                        </View>
                        <View style={styles.optionContent}>
                            <Text style={styles.optionTitle}>{option.title}</Text>
                            <Text style={styles.optionSubtitle}>{option.subtitle}</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={Colors.grey} />
                    </TouchableOpacity>
                ))}
            </View>

            {/* Logout Button */}
            <TouchableOpacity
                style={styles.logoutButton}
                onPress={handleLogout}
                disabled={isLoading}
            >
                <Ionicons name="log-out-outline" size={24} color="#FF3B30" />
                <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>

            {/* App Version */}
            <Text style={styles.version}>Book a Game v1.0.0 (Owner)</Text>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },
    header: {
        alignItems: "center",
        paddingTop: 60,
        paddingBottom: 24,
        backgroundColor: Colors.primary,
    },
    avatarContainer: {
        marginBottom: 16,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 3,
        borderColor: "#fff",
    },
    avatarPlaceholder: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: "rgba(255,255,255,0.2)",
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 3,
        borderColor: "#fff",
    },
    name: {
        fontFamily: "mon-b",
        fontSize: 24,
        color: "#fff",
        marginBottom: 4,
    },
    email: {
        fontFamily: "mon",
        fontSize: 14,
        color: "rgba(255,255,255,0.8)",
        marginBottom: 12,
    },
    roleBadge: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "rgba(255,255,255,0.2)",
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 16,
        gap: 4,
    },
    roleText: {
        fontFamily: "mon-sb",
        fontSize: 12,
        color: "#fff",
    },
    statsContainer: {
        flexDirection: "row",
        justifyContent: "space-around",
        paddingVertical: 20,
        marginHorizontal: 16,
        marginTop: -20,
        backgroundColor: "#fff",
        borderRadius: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    statItem: {
        alignItems: "center",
    },
    statValue: {
        fontFamily: "mon-b",
        fontSize: 20,
        color: Colors.dark,
        marginBottom: 4,
    },
    statLabel: {
        fontFamily: "mon",
        fontSize: 12,
        color: Colors.grey,
    },
    statDivider: {
        width: 1,
        height: 40,
        backgroundColor: Colors.lightGrey || "#e0e0e0",
    },
    optionsContainer: {
        padding: 16,
        marginTop: 8,
    },
    optionItem: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: Colors.lightGrey || "#e0e0e0",
    },
    optionIconContainer: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: Colors.lightGrey || "#f5f5f5",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 12,
    },
    optionContent: {
        flex: 1,
    },
    optionTitle: {
        fontFamily: "mon-sb",
        fontSize: 16,
        color: Colors.dark,
        marginBottom: 2,
    },
    optionSubtitle: {
        fontFamily: "mon",
        fontSize: 12,
        color: Colors.grey,
    },
    logoutButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        marginHorizontal: 16,
        marginTop: 16,
        paddingVertical: 16,
        borderRadius: 12,
        backgroundColor: "#FFF0F0",
        gap: 8,
    },
    logoutText: {
        fontFamily: "mon-sb",
        fontSize: 16,
        color: "#FF3B30",
    },
    version: {
        fontFamily: "mon",
        fontSize: 12,
        color: Colors.grey,
        textAlign: "center",
        marginTop: 24,
        marginBottom: 32,
    },
});
