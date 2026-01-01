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
import { useRouter } from "expo-router";

export default function ProfilePage() {
    const router = useRouter();
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
            title: "Personal Information",
            subtitle: "Update your name, email, and phone",
            onPress: () => {
                // TODO: Navigate to edit profile
            },
        },
        {
            icon: "notifications-outline",
            title: "Notifications",
            subtitle: "Manage your notification preferences",
            onPress: () => {
                // TODO: Navigate to notification settings
            },
        },
        {
            icon: "help-circle-outline",
            title: "Help & Support",
            subtitle: "Get help or contact us",
            onPress: () => {
                // TODO: Navigate to help
            },
        },
        {
            icon: "document-text-outline",
            title: "Terms & Privacy",
            subtitle: "Read our terms and privacy policy",
            onPress: () => {
                // TODO: Navigate to terms
            },
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
                            <Ionicons name="person" size={40} color={Colors.grey} />
                        </View>
                    )}
                </View>
                <Text style={styles.name}>{user?.name || "User"}</Text>
                <Text style={styles.email}>{user?.email}</Text>
                <View style={styles.roleBadge}>
                    <Text style={styles.roleText}>Player</Text>
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
            <Text style={styles.version}>Sport Court Booking v1.0.0</Text>
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
        backgroundColor: Colors.lightGrey || "#f5f5f5",
    },
    avatarContainer: {
        marginBottom: 16,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
    },
    avatarPlaceholder: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: "#e0e0e0",
        justifyContent: "center",
        alignItems: "center",
    },
    name: {
        fontFamily: "mon-b",
        fontSize: 24,
        color: Colors.dark,
        marginBottom: 4,
    },
    email: {
        fontFamily: "mon",
        fontSize: 14,
        color: Colors.grey,
        marginBottom: 12,
    },
    roleBadge: {
        backgroundColor: Colors.primary,
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 16,
    },
    roleText: {
        fontFamily: "mon-sb",
        fontSize: 12,
        color: "#fff",
    },
    optionsContainer: {
        padding: 16,
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
