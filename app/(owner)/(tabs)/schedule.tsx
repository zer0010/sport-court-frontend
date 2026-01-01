import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/Colors";

export default function SchedulePage() {
    const [selectedDate, setSelectedDate] = useState(new Date());

    // Generate dates for the week view
    const generateWeekDates = () => {
        const dates = [];
        const today = new Date();
        for (let i = -2; i < 5; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);
            dates.push(date);
        }
        return dates;
    };

    const weekDates = generateWeekDates();

    // TODO: Fetch from API in Phase 3
    const bookings: any[] = [];
    const blockedSlots: any[] = [];

    const formatDate = (date: Date) => {
        return date.toLocaleDateString("en-US", { weekday: "short" });
    };

    const isToday = (date: Date) => {
        const today = new Date();
        return date.toDateString() === today.toDateString();
    };

    const isSelected = (date: Date) => {
        return date.toDateString() === selectedDate.toDateString();
    };

    return (
        <View style={styles.container}>
            {/* Date Selector */}
            <View style={styles.dateSelector}>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.dateSelectorContent}
                >
                    {weekDates.map((date, index) => (
                        <TouchableOpacity
                            key={index}
                            style={[
                                styles.dateItem,
                                isSelected(date) && styles.dateItemSelected,
                                isToday(date) && styles.dateItemToday,
                            ]}
                            onPress={() => setSelectedDate(date)}
                        >
                            <Text
                                style={[
                                    styles.dayText,
                                    isSelected(date) && styles.dayTextSelected,
                                ]}
                            >
                                {formatDate(date)}
                            </Text>
                            <Text
                                style={[
                                    styles.dateText,
                                    isSelected(date) && styles.dateTextSelected,
                                ]}
                            >
                                {date.getDate()}
                            </Text>
                            {isToday(date) && (
                                <View style={styles.todayDot} />
                            )}
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {/* Selected Date Header */}
            <View style={styles.selectedDateHeader}>
                <Text style={styles.selectedDateText}>
                    {selectedDate.toLocaleDateString("en-US", {
                        weekday: "long",
                        month: "long",
                        day: "numeric",
                    })}
                </Text>
                <TouchableOpacity style={styles.addButton}>
                    <Ionicons name="add" size={20} color="#fff" />
                    <Text style={styles.addButtonText}>Block Slot</Text>
                </TouchableOpacity>
            </View>

            {/* Schedule Content */}
            {bookings.length === 0 && blockedSlots.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <View style={styles.emptyIconContainer}>
                        <Ionicons name="calendar-outline" size={64} color={Colors.grey} />
                    </View>
                    <Text style={styles.emptyTitle}>No schedule for this day</Text>
                    <Text style={styles.emptyDescription}>
                        Bookings and blocked slots will appear here
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={[...bookings, ...blockedSlots]}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContent}
                    renderItem={({ item }) => (
                        <View style={styles.scheduleItem}>
                            <View style={styles.timeColumn}>
                                <Text style={styles.timeText}>{item.start_time}</Text>
                                <Text style={styles.timeSeparator}>-</Text>
                                <Text style={styles.timeText}>{item.end_time}</Text>
                            </View>
                            <View
                                style={[
                                    styles.scheduleCard,
                                    item.type === "blocked" && styles.blockedCard,
                                ]}
                            >
                                <Text style={styles.courtName}>{item.court_name}</Text>
                                {item.type === "booking" ? (
                                    <Text style={styles.bookingInfo}>
                                        {item.user_name} • {item.user_phone}
                                    </Text>
                                ) : (
                                    <Text style={styles.blockedInfo}>Blocked</Text>
                                )}
                            </View>
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
    dateSelector: {
        backgroundColor: Colors.lightGrey || "#f5f5f5",
        paddingVertical: 12,
    },
    dateSelectorContent: {
        paddingHorizontal: 16,
        gap: 8,
    },
    dateItem: {
        width: 56,
        height: 72,
        borderRadius: 12,
        backgroundColor: "#fff",
        justifyContent: "center",
        alignItems: "center",
        marginHorizontal: 4,
    },
    dateItemSelected: {
        backgroundColor: Colors.primary,
    },
    dateItemToday: {
        borderWidth: 2,
        borderColor: Colors.primary,
    },
    dayText: {
        fontFamily: "mon",
        fontSize: 12,
        color: Colors.grey,
        marginBottom: 4,
    },
    dayTextSelected: {
        color: "rgba(255,255,255,0.8)",
    },
    dateText: {
        fontFamily: "mon-b",
        fontSize: 18,
        color: Colors.dark,
    },
    dateTextSelected: {
        color: "#fff",
    },
    todayDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: Colors.primary,
        marginTop: 4,
    },
    selectedDateHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: Colors.lightGrey || "#e0e0e0",
    },
    selectedDateText: {
        fontFamily: "mon-sb",
        fontSize: 16,
        color: Colors.dark,
    },
    addButton: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: Colors.primary,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        gap: 4,
    },
    addButtonText: {
        fontFamily: "mon-sb",
        fontSize: 12,
        color: "#fff",
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
    },
    listContent: {
        padding: 16,
    },
    scheduleItem: {
        flexDirection: "row",
        marginBottom: 12,
    },
    timeColumn: {
        width: 60,
        alignItems: "center",
        paddingTop: 12,
    },
    timeText: {
        fontFamily: "mon-sb",
        fontSize: 12,
        color: Colors.dark,
    },
    timeSeparator: {
        fontFamily: "mon",
        fontSize: 10,
        color: Colors.grey,
    },
    scheduleCard: {
        flex: 1,
        backgroundColor: "#E3F2FD",
        borderRadius: 8,
        padding: 12,
        marginLeft: 8,
    },
    blockedCard: {
        backgroundColor: "#FFEBEE",
    },
    courtName: {
        fontFamily: "mon-sb",
        fontSize: 14,
        color: Colors.dark,
        marginBottom: 4,
    },
    bookingInfo: {
        fontFamily: "mon",
        fontSize: 12,
        color: Colors.grey,
    },
    blockedInfo: {
        fontFamily: "mon",
        fontSize: 12,
        color: "#F44336",
    },
});
