import React from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    RefreshControl,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import Colors from "@/constants/Colors";
import { useAuthStore } from "@/stores/authStore";

export default function DashboardPage() {
    const { user } = useAuthStore();
    const [refreshing, setRefreshing] = React.useState(false);

    // TODO: Fetch from API in Phase 3
    const stats = {
        todayBookings: 0,
        weekEarnings: 0,
        pendingBookings: 0,
        activeVenues: 0,
    };

    const onRefresh = async () => {
        setRefreshing(true);
        // TODO: Fetch dashboard data from API
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setRefreshing(false);
    };

    const StatCard = ({
        icon,
        iconColor,
        title,
        value,
        subtitle,
    }: {
        icon: string;
        iconColor: string;
        title: string;
        value: string | number;
        subtitle?: string;
    }) => (
        <View style={styles.statCard}>
            <View style={[styles.statIconContainer, { backgroundColor: `${iconColor}20` }]}>
                <Ionicons name={icon as any} size={24} color={iconColor} />
            </View>
            <Text style={styles.statValue}>{value}</Text>
            <Text style={styles.statTitle}>{title}</Text>
            {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
        </View>
    );

    return (
        <ScrollView
            style={styles.container}
            showsVerticalScrollIndicator={false}
            refreshControl={
                <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    colors={[Colors.primary]}
                />
            }
        >
            {/* Welcome Header */}
            <View style={styles.welcomeContainer}>
                <Text style={styles.welcomeText}>
                    Welcome back, {user?.name?.split(" ")[0] || "Owner"}!
                </Text>
                <Text style={styles.dateText}>
                    {new Date().toLocaleDateString("en-US", {
                        weekday: "long",
                        month: "long",
                        day: "numeric",
                    })}
                </Text>
            </View>

            {/* Stats Grid */}
            <View style={styles.statsGrid}>
                <StatCard
                    icon="calendar"
                    iconColor="#4CAF50"
                    title="Today's Bookings"
                    value={stats.todayBookings}
                />
                <StatCard
                    icon="cash-outline"
                    iconColor="#2196F3"
                    title="This Week"
                    value={`Rs. ${stats.weekEarnings.toLocaleString()}`}
                />
                <StatCard
                    icon="time-outline"
                    iconColor="#FF9800"
                    title="Pending"
                    value={stats.pendingBookings}
                />
                <StatCard
                    icon="business"
                    iconColor="#9C27B0"
                    title="Active Venues"
                    value={stats.activeVenues}
                />
            </View>

            {/* Quick Actions */}
            <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>Quick Actions</Text>
                <View style={styles.quickActionsGrid}>
                    <TouchableOpacity style={styles.quickActionButton}>
                        <View style={[styles.quickActionIcon, { backgroundColor: "#E3F2FD" }]}>
                            <MaterialCommunityIcons
                                name="walk"
                                size={24}
                                color="#2196F3"
                            />
                        </View>
                        <Text style={styles.quickActionText}>Log Walk-in</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.quickActionButton}>
                        <View style={[styles.quickActionIcon, { backgroundColor: "#FFF3E0" }]}>
                            <Ionicons name="ban-outline" size={24} color="#FF9800" />
                        </View>
                        <Text style={styles.quickActionText}>Block Slot</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.quickActionButton}>
                        <View style={[styles.quickActionIcon, { backgroundColor: "#E8F5E9" }]}>
                            <Ionicons name="add-circle-outline" size={24} color="#4CAF50" />
                        </View>
                        <Text style={styles.quickActionText}>Add Venue</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.quickActionButton}>
                        <View style={[styles.quickActionIcon, { backgroundColor: "#F3E5F5" }]}>
                            <Ionicons name="stats-chart-outline" size={24} color="#9C27B0" />
                        </View>
                        <Text style={styles.quickActionText}>Analytics</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Today's Schedule */}
            <View style={styles.sectionContainer}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Today's Schedule</Text>
                    <TouchableOpacity>
                        <Text style={styles.seeAllText}>See All</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.emptySchedule}>
                    <Ionicons name="calendar-outline" size={48} color={Colors.grey} />
                    <Text style={styles.emptyText}>No bookings for today</Text>
                    <Text style={styles.emptySubtext}>
                        Your upcoming bookings will appear here
                    </Text>
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },
    welcomeContainer: {
        padding: 20,
        backgroundColor: Colors.primary,
    },
    welcomeText: {
        fontFamily: "mon-b",
        fontSize: 24,
        color: "#fff",
        marginBottom: 4,
    },
    dateText: {
        fontFamily: "mon",
        fontSize: 14,
        color: "rgba(255,255,255,0.8)",
    },
    statsGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        padding: 12,
        gap: 12,
    },
    statCard: {
        flex: 1,
        minWidth: "45%",
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: Colors.lightGrey || "#e0e0e0",
    },
    statIconContainer: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 12,
    },
    statValue: {
        fontFamily: "mon-b",
        fontSize: 24,
        color: Colors.dark,
        marginBottom: 4,
    },
    statTitle: {
        fontFamily: "mon",
        fontSize: 12,
        color: Colors.grey,
    },
    statSubtitle: {
        fontFamily: "mon",
        fontSize: 10,
        color: Colors.grey,
        marginTop: 2,
    },
    sectionContainer: {
        padding: 20,
    },
    sectionHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 16,
    },
    sectionTitle: {
        fontFamily: "mon-sb",
        fontSize: 18,
        color: Colors.dark,
        marginBottom: 16,
    },
    seeAllText: {
        fontFamily: "mon-sb",
        fontSize: 14,
        color: Colors.primary,
    },
    quickActionsGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 12,
    },
    quickActionButton: {
        flex: 1,
        minWidth: "45%",
        alignItems: "center",
        padding: 16,
        backgroundColor: Colors.lightGrey || "#f5f5f5",
        borderRadius: 12,
    },
    quickActionIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 8,
    },
    quickActionText: {
        fontFamily: "mon-sb",
        fontSize: 12,
        color: Colors.dark,
    },
    emptySchedule: {
        alignItems: "center",
        padding: 32,
        backgroundColor: Colors.lightGrey || "#f5f5f5",
        borderRadius: 12,
    },
    emptyText: {
        fontFamily: "mon-sb",
        fontSize: 16,
        color: Colors.dark,
        marginTop: 12,
    },
    emptySubtext: {
        fontFamily: "mon",
        fontSize: 12,
        color: Colors.grey,
        marginTop: 4,
    },
});
