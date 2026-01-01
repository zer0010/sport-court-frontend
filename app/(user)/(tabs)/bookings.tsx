import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/Colors";

type BookingFilter = "upcoming" | "past" | "cancelled";

export default function BookingsPage() {
    const [filter, setFilter] = useState<BookingFilter>("upcoming");
    const [refreshing, setRefreshing] = useState(false);

    // TODO: Connect to API in Phase 2
    const bookings: any[] = [];
    const isLoading = false;

    const onRefresh = async () => {
        setRefreshing(true);
        // TODO: Fetch bookings from API
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setRefreshing(false);
    };

    const renderFilterButton = (
        filterType: BookingFilter,
        label: string
    ) => (
        <TouchableOpacity
            style={[
                styles.filterButton,
                filter === filterType && styles.filterButtonActive,
            ]}
            onPress={() => setFilter(filterType)}
        >
            <Text
                style={[
                    styles.filterButtonText,
                    filter === filterType && styles.filterButtonTextActive,
                ]}
            >
                {label}
            </Text>
        </TouchableOpacity>
    );

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.primary} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Filter Tabs */}
            <View style={styles.filterContainer}>
                {renderFilterButton("upcoming", "Upcoming")}
                {renderFilterButton("past", "Past")}
                {renderFilterButton("cancelled", "Cancelled")}
            </View>

            {bookings.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <View style={styles.emptyIconContainer}>
                        <Ionicons name="calendar-outline" size={64} color={Colors.grey} />
                    </View>
                    <Text style={styles.emptyTitle}>
                        No {filter} bookings
                    </Text>
                    <Text style={styles.emptyDescription}>
                        {filter === "upcoming"
                            ? "Book a court to see your upcoming sessions here"
                            : filter === "past"
                                ? "Your completed bookings will appear here"
                                : "Cancelled bookings will be shown here"}
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={bookings}
                    keyExtractor={(item) => item.id}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={[Colors.primary]}
                        />
                    }
                    contentContainerStyle={styles.listContent}
                    renderItem={({ item }) => (
                        // TODO: Create BookingCard component in Phase 2
                        <View style={styles.bookingCard}>
                            <Text>{item.venue_name}</Text>
                        </View>
                    )}
                />
            )}
        </View>
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
    filterContainer: {
        flexDirection: "row",
        paddingHorizontal: 16,
        paddingVertical: 12,
        gap: 12,
        borderBottomWidth: 1,
        borderBottomColor: Colors.lightGrey || "#e0e0e0",
    },
    filterButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: Colors.lightGrey || "#f5f5f5",
    },
    filterButtonActive: {
        backgroundColor: Colors.primary,
    },
    filterButtonText: {
        fontFamily: "mon-sb",
        fontSize: 14,
        color: Colors.dark,
    },
    filterButtonTextActive: {
        color: "#fff",
    },
    listContent: {
        padding: 16,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 32,
    },
    emptyIconContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: Colors.lightGrey || "#f5f5f5",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 24,
    },
    emptyTitle: {
        fontFamily: "mon-sb",
        fontSize: 20,
        color: Colors.dark,
        marginBottom: 8,
    },
    emptyDescription: {
        fontFamily: "mon",
        fontSize: 14,
        color: Colors.grey,
        textAlign: "center",
        lineHeight: 20,
    },
    bookingCard: {
        padding: 16,
        borderRadius: 12,
        backgroundColor: Colors.lightGrey || "#f5f5f5",
        marginBottom: 12,
    },
});
