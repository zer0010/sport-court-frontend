import React from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import Colors from "@/constants/Colors";
import { Booking } from "@/interfaces/types";

interface Props {
    booking: Booking;
    onCancel?: (bookingId: string) => void;
    showCancelButton?: boolean;
    onReview?: (bookingId: string) => void;
    showReviewButton?: boolean;
}

const BookingCard = ({ booking, onCancel, showCancelButton = false, onReview, showReviewButton = false }: Props) => {
    const getStatusColor = (status: string) => {
        switch (status) {
            case "confirmed":
                return "#4CAF50";
            case "completed":
                return Colors.primary;
            case "cancelled":
                return "#F44336";
            default:
                return Colors.grey;
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "confirmed":
                return "checkmark-circle";
            case "completed":
                return "checkmark-done-circle";
            case "cancelled":
                return "close-circle";
            default:
                return "ellipse";
        }
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        const options: Intl.DateTimeFormatOptions = {
            weekday: "short",
            month: "short",
            day: "numeric",
        };
        return date.toLocaleDateString("en-US", options);
    };

    const formatTime = (time: string) => {
        // Convert 24h to 12h format
        const [hours, minutes] = time.split(":");
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? "PM" : "AM";
        const hour12 = hour % 12 || 12;
        return `${hour12}:${minutes} ${ampm}`;
    };

    const isUpcoming = () => {
        if (booking.status !== "confirmed") return false;
        const bookingDate = new Date(`${booking.date}T${booking.start_time}`);
        return bookingDate > new Date();
    };

    const handlePress = () => {
        router.push(`/venue/${booking.venue?.id || booking.court?.venue_id}`);
    };

    return (
        <TouchableOpacity style={styles.container} onPress={handlePress} activeOpacity={0.9}>
            {/* Header: Date & Status */}
            <View style={styles.header}>
                <View style={styles.dateContainer}>
                    <Ionicons name="calendar" size={16} color={Colors.primary} />
                    <Text style={styles.dateText}>{formatDate(booking.date)}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(booking.status) + "20" }]}>
                    <Ionicons
                        name={getStatusIcon(booking.status) as any}
                        size={14}
                        color={getStatusColor(booking.status)}
                    />
                    <Text style={[styles.statusText, { color: getStatusColor(booking.status) }]}>
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </Text>
                </View>
            </View>

            {/* Venue Info */}
            <View style={styles.venueContainer}>
                {booking.venue?.photos?.[0] ? (
                    <Image source={{ uri: booking.venue.photos[0] }} style={styles.venueImage} />
                ) : (
                    <View style={styles.venueImagePlaceholder}>
                        <Ionicons name="business-outline" size={24} color={Colors.grey} />
                    </View>
                )}
                <View style={styles.venueInfo}>
                    <Text style={styles.venueName} numberOfLines={1}>
                        {booking.venue?.name || "Venue"}
                    </Text>
                    <Text style={styles.courtName} numberOfLines={1}>
                        {booking.court?.name || "Court"} • {booking.court?.sport_type || "Sport"}
                    </Text>
                </View>
            </View>

            {/* Time & Price */}
            <View style={styles.detailsRow}>
                <View style={styles.detailItem}>
                    <Ionicons name="time-outline" size={18} color={Colors.grey} />
                    <Text style={styles.detailText}>
                        {formatTime(booking.start_time)} - {formatTime(booking.end_time)}
                    </Text>
                </View>
                <View style={styles.priceContainer}>
                    <Text style={styles.price}>Rs. {booking.final_price}</Text>
                </View>
            </View>

            {/* Cancel Button (for upcoming bookings) */}
            {showCancelButton && isUpcoming() && onCancel && (
                <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => onCancel(booking.id)}
                >
                    <Text style={styles.cancelButtonText}>Cancel Booking</Text>
                </TouchableOpacity>
            )}

            {/* Review Button (for completed bookings) */}
            {showReviewButton && booking.status === "completed" && onReview && (
                <TouchableOpacity
                    style={styles.reviewButton}
                    onPress={() => onReview(booking.id)}
                >
                    <Text style={styles.reviewButtonText}>Leave Review</Text>
                </TouchableOpacity>
            )}

            {/* Source Badge */}
            {booking.source === "walk_in" && (
                <View style={styles.sourceBadge}>
                    <MaterialCommunityIcons name="walk" size={12} color={Colors.grey} />
                    <Text style={styles.sourceText}>Walk-in</Text>
                </View>
            )}
        </TouchableOpacity>
    );
};

export default BookingCard;

const styles = StyleSheet.create({
    container: {
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: Colors.lightGrey || "#e0e0e0",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12,
    },
    dateContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    dateText: {
        fontFamily: "mon-sb",
        fontSize: 14,
        color: Colors.dark,
    },
    statusBadge: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        gap: 4,
    },
    statusText: {
        fontFamily: "mon-sb",
        fontSize: 12,
    },
    venueContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 12,
    },
    venueImage: {
        width: 56,
        height: 56,
        borderRadius: 8,
    },
    venueImagePlaceholder: {
        width: 56,
        height: 56,
        borderRadius: 8,
        backgroundColor: Colors.lightGrey || "#f5f5f5",
        justifyContent: "center",
        alignItems: "center",
    },
    venueInfo: {
        flex: 1,
        marginLeft: 12,
    },
    venueName: {
        fontFamily: "mon-sb",
        fontSize: 16,
        color: Colors.dark,
        marginBottom: 4,
    },
    courtName: {
        fontFamily: "mon",
        fontSize: 14,
        color: Colors.grey,
    },
    detailsRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: Colors.lightGrey || "#e0e0e0",
    },
    detailItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    detailText: {
        fontFamily: "mon",
        fontSize: 14,
        color: Colors.grey,
    },
    priceContainer: {
        backgroundColor: Colors.primary + "10",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
    },
    price: {
        fontFamily: "mon-b",
        fontSize: 14,
        color: Colors.primary,
    },
    cancelButton: {
        marginTop: 12,
        paddingVertical: 10,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#F44336",
        alignItems: "center",
    },
    cancelButtonText: {
        fontFamily: "mon-sb",
        fontSize: 14,
        color: "#F44336",
    },
    reviewButton: {
        marginTop: 12,
        paddingVertical: 10,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: Colors.primary,
        alignItems: "center",
        backgroundColor: Colors.primary + "10",
    },
    reviewButtonText: {
        fontFamily: "mon-sb",
        fontSize: 14,
        color: Colors.primary,
    },
    sourceBadge: {
        position: "absolute",
        top: 12,
        right: 12,
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        backgroundColor: Colors.lightGrey || "#f5f5f5",
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
    },
    sourceText: {
        fontFamily: "mon",
        fontSize: 10,
        color: Colors.grey,
    },
});
