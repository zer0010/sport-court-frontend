import React, { useState, useCallback } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    RefreshControl,
    ActivityIndicator,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import Colors from "@/constants/Colors";
import { useAuthStore } from "@/stores/authStore";
import { apiService, getErrorMessage } from "@/services/api";
import { Booking } from "@/interfaces/types";
import WalkinModal from "@/components/WalkinModal";
import BlockSlotModal from "@/components/BlockSlotModal";

interface DashboardStats {
    todayBookings: number;
    weekEarnings: number;
    pendingBookings: number;
    activeVenues: number;
    monthEarnings?: number;
}

export default function DashboardPage() {
    const router = useRouter();
    const { user } = useAuthStore();
    const [refreshing, setRefreshing] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [stats, setStats] = useState<DashboardStats>({
        todayBookings: 0,
        weekEarnings: 0,
        pendingBookings: 0,
        activeVenues: 0,
    });
    const [todaySchedule, setTodaySchedule] = useState<Booking[]>([]);
    const [venues, setVenues] = useState<any[]>([]);
    const [showWalkinModal, setShowWalkinModal] = useState(false);
    const [showBlockSlotModal, setShowBlockSlotModal] = useState(false);

    const loadDashboardData = async () => {
        try {
            // Fetch stats
            const statsResponse = await apiService.owner.getEarningsSummary();
            const statsData = statsResponse.data.data || statsResponse.data;

            setStats({
                todayBookings: statsData.today_bookings || statsData.todayBookings || 0,
                weekEarnings: statsData.week_earnings || statsData.weekEarnings || 0,
                pendingBookings: statsData.pending_bookings || statsData.pendingBookings || 0,
                activeVenues: statsData.active_venues || statsData.activeVenues || 0,
                monthEarnings: statsData.month_earnings || statsData.monthEarnings || 0,
            });

            // Fetch today's bookings
            const today = new Date().toISOString().split("T")[0];
            const bookingsResponse = await apiService.owner.getBookings({ date: today });
            const bookingsData = bookingsResponse.data.data || bookingsResponse.data.bookings || bookingsResponse.data || [];
            setTodaySchedule(Array.isArray(bookingsData) ? bookingsData : []);

            // Fetch venues for modals
            try {
                const venuesResponse = await apiService.owner.getVenues();
                const venuesData = venuesResponse.data.data || venuesResponse.data.venues || venuesResponse.data || [];
                setVenues(Array.isArray(venuesData) ? venuesData : []);
            } catch (e) {
                console.error("Failed to load venues for modals");
            }
        } catch (error) {
            console.error("Failed to load dashboard:", getErrorMessage(error));
        } finally {
            setIsLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadDashboardData();
        }, [])
    );

    const onRefresh = async () => {
        setRefreshing(true);
        await loadDashboardData();
    };

    const formatTime = (time: string) => {
        if (!time) return "";
        const [hours, minutes] = time.split(":");
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? "PM" : "AM";
        const hour12 = hour % 12 || 12;
        return `${hour12}:${minutes} ${ampm}`;
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

    const ScheduleItem = ({ booking }: { booking: Booking }) => (
        <View style={styles.scheduleItem}>
            <View style={styles.scheduleTime}>
                <Text style={styles.scheduleTimeText}>{formatTime(booking.start_time)}</Text>
                <Text style={styles.scheduleTimeDash}>-</Text>
                <Text style={styles.scheduleTimeText}>{formatTime(booking.end_time)}</Text>
            </View>
            <View style={styles.scheduleInfo}>
                <Text style={styles.scheduleTitle}>{booking.court?.name || "Court"}</Text>
                <Text style={styles.scheduleSubtitle}>
                    {booking.user?.name || "Guest"} • Rs. {booking.final_price}
                </Text>
            </View>
            <View style={[
                styles.scheduleStatus,
                { backgroundColor: booking.status === "confirmed" ? "#E8F5E9" : "#FFF3E0" }
            ]}>
                <Text style={[
                    styles.scheduleStatusText,
                    { color: booking.status === "confirmed" ? "#4CAF50" : "#FF9800" }
                ]}>
                    {booking.status}
                </Text>
            </View>
        </View>
    );

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.primary} />
            </View>
        );
    }

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
                    <TouchableOpacity
                        style={styles.quickActionButton}
                        onPress={() => {
                            // TODO: Open walk-in modal
                        }}
                    >
                        <View style={[styles.quickActionIcon, { backgroundColor: "#E3F2FD" }]}>
                            <MaterialCommunityIcons
                                name="walk"
                                size={24}
                                color="#2196F3"
                            />
                        </View>
                        <Text style={styles.quickActionText}>Log Walk-in</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.quickActionButton}
                        onPress={() => {
                            // TODO: Open block slot modal
                        }}
                    >
                        <View style={[styles.quickActionIcon, { backgroundColor: "#FFF3E0" }]}>
                            <Ionicons name="ban-outline" size={24} color="#FF9800" />
                        </View>
                        <Text style={styles.quickActionText}>Block Slot</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.quickActionButton}
                        onPress={() => router.push("/(owner)/(tabs)/venues")}
                    >
                        <View style={[styles.quickActionIcon, { backgroundColor: "#E8F5E9" }]}>
                            <Ionicons name="add-circle-outline" size={24} color="#4CAF50" />
                        </View>
                        <Text style={styles.quickActionText}>Add Venue</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.quickActionButton}
                        onPress={() => {
                            // TODO: Navigate to analytics
                        }}
                    >
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
                    <TouchableOpacity onPress={() => router.push("/(owner)/(tabs)/schedule")}>
                        <Text style={styles.seeAllText}>See All</Text>
                    </TouchableOpacity>
                </View>

                {todaySchedule.length === 0 ? (
                    <View style={styles.emptySchedule}>
                        <Ionicons name="calendar-outline" size={48} color={Colors.grey} />
                        <Text style={styles.emptyText}>No bookings for today</Text>
                        <Text style={styles.emptySubtext}>
                            Your upcoming bookings will appear here
                        </Text>
                    </View>
                ) : (
                    <View style={styles.scheduleList}>
                        {todaySchedule.slice(0, 5).map((booking) => (
                            <ScheduleItem key={booking.id} booking={booking} />
                        ))}
                        {todaySchedule.length > 5 && (
                            <TouchableOpacity
                                style={styles.viewMoreButton}
                                onPress={() => router.push("/(owner)/(tabs)/schedule")}
                            >
                                <Text style={styles.viewMoreText}>
                                    View {todaySchedule.length - 5} more bookings
                                </Text>
                            </TouchableOpacity>
                        )}
                    </View>
                )}
            </View>

            {/* Walk-in Modal */}
            <WalkinModal
                visible={showWalkinModal}
                onClose={() => setShowWalkinModal(false)}
                onSuccess={loadDashboardData}
                venues={venues}
            />

            {/* Block Slot Modal */}
            <BlockSlotModal
                visible={showBlockSlotModal}
                onClose={() => setShowBlockSlotModal(false)}
                onSuccess={loadDashboardData}
                venues={venues}
            />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
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
    scheduleList: {
        gap: 12,
    },
    scheduleItem: {
        flexDirection: "row",
        alignItems: "center",
        padding: 12,
        backgroundColor: "#fff",
        borderRadius: 12,
        borderWidth: 1,
        borderColor: Colors.lightGrey || "#e0e0e0",
    },
    scheduleTime: {
        alignItems: "center",
        marginRight: 12,
        minWidth: 60,
    },
    scheduleTimeText: {
        fontFamily: "mon-sb",
        fontSize: 12,
        color: Colors.dark,
    },
    scheduleTimeDash: {
        fontFamily: "mon",
        fontSize: 10,
        color: Colors.grey,
    },
    scheduleInfo: {
        flex: 1,
    },
    scheduleTitle: {
        fontFamily: "mon-sb",
        fontSize: 14,
        color: Colors.dark,
        marginBottom: 2,
    },
    scheduleSubtitle: {
        fontFamily: "mon",
        fontSize: 12,
        color: Colors.grey,
    },
    scheduleStatus: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    scheduleStatusText: {
        fontFamily: "mon-sb",
        fontSize: 10,
        textTransform: "capitalize",
    },
    viewMoreButton: {
        alignItems: "center",
        padding: 12,
    },
    viewMoreText: {
        fontFamily: "mon-sb",
        fontSize: 14,
        color: Colors.primary,
    },
});
