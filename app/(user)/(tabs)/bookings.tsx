import React, { useState, useCallback } from "react";
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
    Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, router } from "expo-router";
import Colors from "@/constants/Colors";
import { apiService, getErrorMessage } from "@/services/api";
import { Booking } from "@/interfaces/types";
import BookingCard from "@/components/BookingCard";
import ReviewModal from "@/components/ReviewModal";

type BookingFilter = "upcoming" | "past" | "cancelled";

export default function BookingsPage() {
    const [filter, setFilter] = useState<BookingFilter>("upcoming");
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [cancellingId, setCancellingId] = useState<string | null>(null);
    const [reviewBookingId, setReviewBookingId] = useState<string | null>(null);

    const loadBookings = async () => {
        try {
            const response = await apiService.getBookings();
            const data = response.data.data || response.data.bookings || response.data || [];
            const rawBookings = Array.isArray(data) ? data : [];

            // Map Supabase nested structure to flat Booking interface
            const mappedBookings = rawBookings.map((b: any) => ({
                ...b,
                court: b.courts,
                venue: b.courts?.venues,
                // Keep original references just in case, but mapped ones take precedence for UI
            }));

            setBookings(mappedBookings);
        } catch (error) {
            console.error("Failed to load bookings:", getErrorMessage(error));
        } finally {
            setIsLoading(false);
            setRefreshing(false);
        }
    };

    // Load on focus
    useFocusEffect(
        useCallback(() => {
            loadBookings();
        }, [])
    );

    const onRefresh = async () => {
        setRefreshing(true);
        await loadBookings();
    };

    const getFilteredBookings = () => {
        const now = new Date();

        return bookings.filter((booking) => {
            const bookingDate = new Date(`${booking.date}T${booking.end_time}`);

            switch (filter) {
                case "upcoming":
                    return booking.status === "confirmed" && bookingDate > now;
                case "past":
                    return booking.status === "completed" ||
                        (booking.status === "confirmed" && bookingDate <= now);
                case "cancelled":
                    return booking.status === "cancelled";
                default:
                    return true;
            }
        });
    };

    const handleCancelBooking = async (bookingId: string) => {
        Alert.alert(
            "Cancel Booking",
            "Are you sure you want to cancel this booking? You may receive a partial refund based on our cancellation policy.",
            [
                { text: "Keep Booking", style: "cancel" },
                {
                    text: "Cancel Booking",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            setCancellingId(bookingId);
                            await apiService.cancelBooking(bookingId);
                            // Update local state
                            setBookings(prev =>
                                prev.map(b =>
                                    b.id === bookingId
                                        ? { ...b, status: "cancelled" as const }
                                        : b
                                )
                            );
                            Alert.alert("Success", "Your booking has been cancelled.");
                        } catch (error) {
                            Alert.alert("Error", getErrorMessage(error));
                        } finally {
                            setCancellingId(null);
                        }
                    },
                },
            ]
        );
    };

    const handleReview = (bookingId: string) => {
        setReviewBookingId(bookingId);
    };

    const renderFilterButton = (filterType: BookingFilter, label: string) => (
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

    const filteredBookings = getFilteredBookings();

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

            {filteredBookings.length === 0 ? (
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
                    {filter === "upcoming" && (
                        <TouchableOpacity
                            style={styles.exploreButton}
                            onPress={() => router.push("/")}
                        >
                            <Text style={styles.exploreButtonText}>Explore Venues</Text>
                        </TouchableOpacity>
                    )}
                </View>
            ) : (
                <FlatList
                    data={filteredBookings}
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
                        <BookingCard
                            booking={item}
                            onCancel={handleCancelBooking}
                            showCancelButton={filter === "upcoming"}
                            onReview={handleReview}
                            showReviewButton={filter === "past"}
                        />
                    )}
                />
            )}

            {/* Review Modal */}
            <ReviewModal
                visible={!!reviewBookingId}
                onClose={() => setReviewBookingId(null)}
                bookingId={reviewBookingId || ""}
                onReviewSubmitted={loadBookings}
            />

            {/* Loading overlay for cancellation */}
            {cancellingId && (
                <View style={styles.cancellingOverlay}>
                    <ActivityIndicator size="large" color={Colors.primary} />
                    <Text style={styles.cancellingText}>Cancelling...</Text>
                </View>
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
        marginBottom: 24,
    },
    exploreButton: {
        backgroundColor: Colors.primary,
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    exploreButtonText: {
        fontFamily: "mon-sb",
        fontSize: 16,
        color: "#fff",
    },
    cancellingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(255,255,255,0.9)",
        justifyContent: "center",
        alignItems: "center",
    },
    cancellingText: {
        fontFamily: "mon-sb",
        fontSize: 16,
        color: Colors.dark,
        marginTop: 12,
    },
});
