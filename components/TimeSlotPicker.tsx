import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    ScrollView,
    Platform,
    Pressable,
    Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/Colors";
import { apiService, getErrorMessage } from "@/services/api";
import { TimeSlot } from "@/interfaces/types";
import * as Haptics from "expo-haptics";

interface Props {
    courtId: string;
    selectedDate: Date;
    onSlotSelect: (slots: { start_time: string; end_time: string }[]) => void;
    minSlots?: number;
    maxSlots?: number;
}

const TimeSlotPicker = ({
    courtId,
    selectedDate,
    onSlotSelect,
    minSlots = 1,
    maxSlots = 4
}: Props) => {
    const [slots, setSlots] = useState<TimeSlot[]>([]);
    const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadSlots();
        setSelectedSlots([]); // Reset selection when date changes
    }, [courtId, selectedDate]);

    const loadSlots = async () => {
        try {
            setIsLoading(true);
            setError(null);
            // Construct local date string YYYY-MM-DD
            const year = selectedDate.getFullYear();
            const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
            const day = String(selectedDate.getDate()).padStart(2, '0');
            const dateStr = `${year}-${month}-${day}`;

            const response = await apiService.getCourtSlots(courtId, dateStr);
            // Backend returns { available_slots: [...] }
            const data = response.data.available_slots || response.data.data || response.data.slots || response.data || [];
            const loadedSlots = Array.isArray(data) ? data : [];
            // Ensure slots are sorted
            loadedSlots.sort((a: TimeSlot, b: TimeSlot) => a.start_time.localeCompare(b.start_time));
            setSlots(loadedSlots);
        } catch (err) {
            setError(getErrorMessage(err));
            setSlots([]);
        } finally {
            setIsLoading(false);
        }
    };

    const isConsecutive = (newSlot: string, currentSelection: string[]): boolean => {
        if (currentSelection.length === 0) return true;

        const allSlots = [...currentSelection, newSlot].sort();
        const slotIndices = allSlots.map(s =>
            slots.findIndex(slot => slot.start_time === s)
        ).sort((a, b) => a - b);

        // Check if all indices are consecutive
        for (let i = 1; i < slotIndices.length; i++) {
            if (slotIndices[i] - slotIndices[i - 1] !== 1) {
                return false;
            }
        }
        return true;
    };

    const handleSlotPress = (slot: TimeSlot) => {
        // Allow selection if status is available or undefined (defensive)
        if (slot.status === "booked" || slot.status === "blocked") return;

        if (Platform.OS !== "web") {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }

        const slotKey = slot.start_time;

        if (selectedSlots.includes(slotKey)) {
            // Deselect
            const newSelection = selectedSlots.filter(s => s !== slotKey);
            // Ensure remaining selection is still consecutive
            if (newSelection.length === 0 || isConsecutive(newSelection[0], newSelection.slice(1))) {
                setSelectedSlots(newSelection);
                updateParent(newSelection);
            }
        } else {
            // Select
            if (selectedSlots.length >= maxSlots) {
                return; // Max reached (4 hours)
            }

            // Check if adding this slot keeps selection consecutive
            if (!isConsecutive(slotKey, selectedSlots)) {
                // Start new selection with just this slot
                setSelectedSlots([slotKey]);
                updateParent([slotKey]);
                return;
            }

            const newSelection = [...selectedSlots, slotKey].sort();
            setSelectedSlots(newSelection);
            updateParent(newSelection);
        }
    };

    const updateParent = (selection: string[]) => {
        if (selection.length === 0) {
            onSlotSelect([]);
            return;
        }

        const sortedSelection = selection.sort();
        const startTime = sortedSelection[0];
        const lastSlotStart = sortedSelection[sortedSelection.length - 1];
        const lastSlot = slots.find(s => s.start_time === lastSlotStart);
        const endTime = lastSlot?.end_time || lastSlotStart;

        onSlotSelect([{ start_time: startTime, end_time: endTime }]);
    };

    const getSlotStyle = (slot: TimeSlot) => {
        const isSelected = selectedSlots.includes(slot.start_time);

        switch (slot.status) {
            case "available":
                return isSelected ? styles.slotSelected : styles.slotAvailable;
            case "booked":
                return styles.slotBooked;
            case "blocked":
                return styles.slotBlocked;
            default:
                return styles.slotAvailable;
        }
    };

    const getSlotTextStyle = (slot: TimeSlot) => {
        const isSelected = selectedSlots.includes(slot.start_time);

        if (isSelected) return styles.slotTextSelected;
        if (slot.status !== "available") return styles.slotTextUnavailable;
        return styles.slotText;
    };

    const formatTime = (time: string) => {
        const [hours, minutes] = time.split(":");
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? "PM" : "AM";
        const hour12 = hour % 12 || 12;
        return `${hour12}:${minutes} ${ampm}`;
    };

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.primary} />
                <Text style={styles.loadingText}>Loading available slots...</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.errorContainer}>
                <Ionicons name="alert-circle-outline" size={48} color={Colors.error} />
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity style={styles.retryButton} onPress={loadSlots}>
                    <Text style={styles.retryButtonText}>Retry</Text>
                </TouchableOpacity>
            </View>
        );
    }

    if (slots.length === 0) {
        return (
            <View style={styles.emptyContainer}>
                <Ionicons name="calendar-outline" size={48} color={Colors.grey} />
                <Text style={styles.emptyText}>No slots available for this date</Text>
            </View>
        );
    }

    const availableCount = slots.filter(s => s.status === "available").length;

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Select Time Slots</Text>
                <Text style={styles.headerSubtitle}>
                    {availableCount} available • Max {maxSlots} consecutive hours
                </Text>
            </View>

            {/* Legend */}
            <View style={styles.legend}>
                <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: Colors.accent || "#CCFF00" }]} />
                    <Text style={styles.legendText}>Available</Text>
                </View>
                <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: Colors.primary }]} />
                    <Text style={styles.legendText}>Selected</Text>
                </View>
                <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: "#E0E0E0" }]} />
                    <Text style={styles.legendText}>Unavailable</Text>
                </View>
            </View>

            {/* Slots Grid */}
            <View style={styles.slotsContainer}>
                {slots.map((slot, index) => (
                    <Pressable
                        key={index}
                        style={({ pressed }) => [
                            styles.slot,
                            getSlotStyle(slot),
                            pressed && { opacity: 0.7 }
                        ]}
                        onPress={() => {
                            // Alert.alert("Debug", `Pressed ${slot.start_time}`);
                            handleSlotPress(slot);
                        }}
                        disabled={slot.status === "booked" || slot.status === "blocked"}
                    >
                        <Text style={getSlotTextStyle(slot)}>
                            {formatTime(slot.start_time)}
                        </Text>
                        <Text style={[getSlotTextStyle(slot), styles.slotEndTime]}>
                            {formatTime(slot.end_time)}
                        </Text>
                        {slot.status === "booked" && (
                            <Ionicons
                                name="lock-closed"
                                size={12}
                                color={Colors.grey}
                                style={styles.slotIcon}
                            />
                        )}
                    </Pressable>
                ))}
            </View>

            {/* Selection Summary */}
            {selectedSlots.length > 0 && (
                <View style={styles.selectionSummary}>
                    <Ionicons name="time" size={20} color={Colors.primary} />
                    <Text style={styles.selectionText}>
                        {selectedSlots.length} hour{selectedSlots.length > 1 ? "s" : ""} selected
                    </Text>
                </View>
            )}
        </View>
    );
};

export default TimeSlotPicker;

const styles = StyleSheet.create({
    container: {
        width: '100%',
    },
    loadingContainer: {
        padding: 32,
        alignItems: "center",
    },
    loadingText: {
        fontFamily: "mon",
        fontSize: 14,
        color: Colors.grey,
        marginTop: 12,
    },
    errorContainer: {
        padding: 32,
        alignItems: "center",
    },
    errorText: {
        fontFamily: "mon",
        fontSize: 14,
        color: Colors.error,
        textAlign: "center",
        marginTop: 12,
        marginBottom: 16,
    },
    retryButton: {
        backgroundColor: Colors.primary,
        paddingHorizontal: 24,
        paddingVertical: 10,
        borderRadius: 8,
    },
    retryButtonText: {
        fontFamily: "mon-sb",
        fontSize: 14,
        color: "#fff",
    },
    emptyContainer: {
        padding: 32,
        alignItems: "center",
    },
    emptyText: {
        fontFamily: "mon",
        fontSize: 14,
        color: Colors.grey,
        marginTop: 12,
    },
    header: {
        marginBottom: 16,
    },
    headerTitle: {
        fontFamily: "mon-sb",
        fontSize: 18,
        color: Colors.dark,
        marginBottom: 4,
    },
    headerSubtitle: {
        fontFamily: "mon",
        fontSize: 14,
        color: Colors.grey,
    },
    legend: {
        flexDirection: "row",
        justifyContent: "center",
        gap: 20,
        marginBottom: 16,
        paddingVertical: 12,
        backgroundColor: Colors.lightGrey || "#f5f5f5",
        borderRadius: 8,
    },
    legendItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    legendDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
    },
    legendText: {
        fontFamily: "mon",
        fontSize: 12,
        color: Colors.grey,
    },

    slotsContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
        paddingBottom: 16,
    },
    slot: {
        width: "31%",
        paddingVertical: 12,
        paddingHorizontal: 8,
        borderRadius: 10,
        alignItems: "center",
        borderWidth: 1,
    },
    slotAvailable: {
        backgroundColor: (Colors.accent || "#CCFF00") + "30",
        borderColor: Colors.accent || "#CCFF00",
    },
    slotSelected: {
        backgroundColor: Colors.primary,
        borderColor: Colors.primary,
    },
    slotBooked: {
        backgroundColor: "#F5F5F5",
        borderColor: "#E0E0E0",
    },
    slotBlocked: {
        backgroundColor: "#F5F5F5",
        borderColor: "#E0E0E0",
    },
    slotText: {
        fontFamily: "mon-sb",
        fontSize: 13,
        color: Colors.dark,
    },
    slotTextSelected: {
        fontFamily: "mon-sb",
        fontSize: 13,
        color: "#fff",
    },
    slotTextUnavailable: {
        fontFamily: "mon",
        fontSize: 13,
        color: Colors.grey,
    },
    slotEndTime: {
        fontSize: 11,
        marginTop: 2,
    },
    slotIcon: {
        position: "absolute",
        top: 6,
        right: 6,
    },
    selectionSummary: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        paddingVertical: 12,
        backgroundColor: Colors.primary + "10",
        borderRadius: 8,
        marginTop: 8,
    },
    selectionText: {
        fontFamily: "mon-sb",
        fontSize: 14,
        color: Colors.primary,
    },
});
