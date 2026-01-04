import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    TextInput,
    ScrollView,
    ActivityIndicator,
    Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/Colors";
import { apiService, getErrorMessage } from "@/services/api";
import DatePicker from "./DatePicker";

interface Court {
    id: string;
    name: string;
    sport_type: string;
}

interface Venue {
    id: string;
    name: string;
    courts: Court[];
}

interface Props {
    visible: boolean;
    onClose: () => void;
    onSuccess?: () => void;
    venues?: Venue[];
}

const TIME_OPTIONS = [
    "06:00", "07:00", "08:00", "09:00", "10:00", "11:00",
    "12:00", "13:00", "14:00", "15:00", "16:00", "17:00",
    "18:00", "19:00", "20:00", "21:00", "22:00",
];

export default function BlockSlotModal({ visible, onClose, onSuccess, venues = [] }: Props) {
    const [isLoading, setIsLoading] = useState(false);
    const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);
    const [selectedCourt, setSelectedCourt] = useState<Court | null>(null);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");
    const [reason, setReason] = useState("");
    const [showStartPicker, setShowStartPicker] = useState(false);
    const [showEndPicker, setShowEndPicker] = useState(false);

    useEffect(() => {
        if (visible) {
            setSelectedVenue(venues.length === 1 ? venues[0] : null);
            setSelectedCourt(null);
            setSelectedDate(new Date());
            setStartTime("");
            setEndTime("");
            setReason("");
        }
    }, [visible, venues]);

    const handleSubmit = async () => {
        if (!selectedCourt) {
            Alert.alert("Error", "Please select a court");
            return;
        }
        if (!startTime || !endTime) {
            Alert.alert("Error", "Please select start and end time");
            return;
        }

        const startIdx = TIME_OPTIONS.indexOf(startTime);
        const endIdx = TIME_OPTIONS.indexOf(endTime);
        if (startIdx >= endIdx) {
            Alert.alert("Error", "End time must be after start time");
            return;
        }

        try {
            setIsLoading(true);

            await apiService.owner.createBlockedSlot(selectedCourt.id, {
                date: selectedDate.toISOString().split("T")[0],
                start_time: startTime,
                end_time: endTime,
                reason: reason.trim() || undefined,
            });

            Alert.alert("Success", "Time slot blocked successfully");
            onSuccess?.();
            onClose();
        } catch (error) {
            Alert.alert("Error", getErrorMessage(error));
        } finally {
            setIsLoading(false);
        }
    };

    const formatTime = (time: string) => {
        if (!time) return "Select";
        const [hours] = time.split(":");
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? "PM" : "AM";
        const hour12 = hour % 12 || 12;
        return `${hour12}:00 ${ampm}`;
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={onClose}
        >
            <View style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={onClose}>
                        <Ionicons name="close" size={24} color={Colors.dark} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Block Time Slot</Text>
                    <View style={{ width: 24 }} />
                </View>

                <ScrollView style={styles.content}>
                    {/* Venue Selection (if multiple) */}
                    {venues.length > 1 && (
                        <View style={styles.section}>
                            <Text style={styles.sectionLabel}>Select Venue</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                {venues.map((venue) => (
                                    <TouchableOpacity
                                        key={venue.id}
                                        style={[
                                            styles.chip,
                                            selectedVenue?.id === venue.id && styles.chipActive,
                                        ]}
                                        onPress={() => {
                                            setSelectedVenue(venue);
                                            setSelectedCourt(null);
                                        }}
                                    >
                                        <Text
                                            style={[
                                                styles.chipText,
                                                selectedVenue?.id === venue.id && styles.chipTextActive,
                                            ]}
                                        >
                                            {venue.name}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>
                    )}

                    {/* Court Selection */}
                    {selectedVenue && (
                        <View style={styles.section}>
                            <Text style={styles.sectionLabel}>Select Court *</Text>
                            <View style={styles.courtGrid}>
                                {selectedVenue.courts.map((court) => (
                                    <TouchableOpacity
                                        key={court.id}
                                        style={[
                                            styles.courtChip,
                                            selectedCourt?.id === court.id && styles.courtChipActive,
                                        ]}
                                        onPress={() => setSelectedCourt(court)}
                                    >
                                        <Text
                                            style={[
                                                styles.courtChipText,
                                                selectedCourt?.id === court.id && styles.courtChipTextActive,
                                            ]}
                                        >
                                            {court.name}
                                        </Text>
                                        <Text style={styles.courtSport}>{court.sport_type}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    )}

                    {/* Date Selection */}
                    <View style={styles.section}>
                        <Text style={styles.sectionLabel}>Select Date *</Text>
                        <DatePicker
                            selectedDate={selectedDate}
                            onDateSelect={setSelectedDate}
                        />
                    </View>

                    {/* Time Selection */}
                    <View style={styles.section}>
                        <Text style={styles.sectionLabel}>Time Range *</Text>
                        <View style={styles.timeRow}>
                            <TouchableOpacity
                                style={styles.timeButton}
                                onPress={() => setShowStartPicker(!showStartPicker)}
                            >
                                <Text style={styles.timeLabel}>Start</Text>
                                <Text style={styles.timeValue}>{formatTime(startTime)}</Text>
                            </TouchableOpacity>
                            <Ionicons name="arrow-forward" size={20} color={Colors.grey} />
                            <TouchableOpacity
                                style={styles.timeButton}
                                onPress={() => setShowEndPicker(!showEndPicker)}
                            >
                                <Text style={styles.timeLabel}>End</Text>
                                <Text style={styles.timeValue}>{formatTime(endTime)}</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Time Picker - Start */}
                        {showStartPicker && (
                            <View style={styles.timePicker}>
                                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                    {TIME_OPTIONS.map((time) => (
                                        <TouchableOpacity
                                            key={time}
                                            style={[
                                                styles.timeOption,
                                                startTime === time && styles.timeOptionActive,
                                            ]}
                                            onPress={() => {
                                                setStartTime(time);
                                                setShowStartPicker(false);
                                            }}
                                        >
                                            <Text
                                                style={[
                                                    styles.timeOptionText,
                                                    startTime === time && styles.timeOptionTextActive,
                                                ]}
                                            >
                                                {formatTime(time)}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>
                            </View>
                        )}

                        {/* Time Picker - End */}
                        {showEndPicker && (
                            <View style={styles.timePicker}>
                                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                    {TIME_OPTIONS.filter((t) => {
                                        if (!startTime) return true;
                                        return TIME_OPTIONS.indexOf(t) > TIME_OPTIONS.indexOf(startTime);
                                    }).map((time) => (
                                        <TouchableOpacity
                                            key={time}
                                            style={[
                                                styles.timeOption,
                                                endTime === time && styles.timeOptionActive,
                                            ]}
                                            onPress={() => {
                                                setEndTime(time);
                                                setShowEndPicker(false);
                                            }}
                                        >
                                            <Text
                                                style={[
                                                    styles.timeOptionText,
                                                    endTime === time && styles.timeOptionTextActive,
                                                ]}
                                            >
                                                {formatTime(time)}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>
                            </View>
                        )}
                    </View>

                    {/* Reason (Optional) */}
                    <View style={styles.section}>
                        <Text style={styles.sectionLabel}>Reason (Optional)</Text>
                        <TextInput
                            style={styles.input}
                            value={reason}
                            onChangeText={setReason}
                            placeholder="e.g., Maintenance, Private event"
                            placeholderTextColor={Colors.grey}
                            multiline
                            numberOfLines={2}
                        />
                    </View>

                    {/* Submit Button */}
                    <TouchableOpacity
                        style={[
                            styles.submitButton,
                            (!selectedCourt || !startTime || !endTime || isLoading) && styles.buttonDisabled,
                        ]}
                        onPress={handleSubmit}
                        disabled={!selectedCourt || !startTime || !endTime || isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator size="small" color="#fff" />
                        ) : (
                            <>
                                <Ionicons name="ban" size={20} color="#fff" />
                                <Text style={styles.submitButtonText}>Block Slot</Text>
                            </>
                        )}
                    </TouchableOpacity>

                    <View style={{ height: 40 }} />
                </ScrollView>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: Colors.lightGrey || "#eee",
    },
    headerTitle: {
        fontFamily: "mon-sb",
        fontSize: 17,
        color: Colors.dark,
    },
    content: {
        flex: 1,
        padding: 16,
    },
    section: {
        marginBottom: 24,
    },
    sectionLabel: {
        fontFamily: "mon-sb",
        fontSize: 14,
        color: Colors.dark,
        marginBottom: 12,
    },
    chip: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        backgroundColor: Colors.lightGrey || "#f5f5f5",
        marginRight: 10,
    },
    chipActive: {
        backgroundColor: Colors.primary,
    },
    chipText: {
        fontFamily: "mon",
        fontSize: 14,
        color: Colors.dark,
    },
    chipTextActive: {
        color: "#fff",
        fontFamily: "mon-sb",
    },
    courtGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 10,
    },
    courtChip: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 12,
        backgroundColor: Colors.lightGrey || "#f5f5f5",
        borderWidth: 1,
        borderColor: "transparent",
    },
    courtChipActive: {
        backgroundColor: Colors.primary + "20",
        borderColor: Colors.primary,
    },
    courtChipText: {
        fontFamily: "mon-sb",
        fontSize: 14,
        color: Colors.dark,
    },
    courtChipTextActive: {
        color: Colors.primary,
    },
    courtSport: {
        fontFamily: "mon",
        fontSize: 11,
        color: Colors.grey,
        marginTop: 2,
    },
    timeRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
    },
    timeButton: {
        flex: 1,
        padding: 14,
        borderRadius: 12,
        backgroundColor: Colors.lightGrey || "#f5f5f5",
        alignItems: "center",
    },
    timeLabel: {
        fontFamily: "mon",
        fontSize: 12,
        color: Colors.grey,
        marginBottom: 4,
    },
    timeValue: {
        fontFamily: "mon-sb",
        fontSize: 16,
        color: Colors.dark,
    },
    timePicker: {
        marginTop: 12,
        paddingVertical: 8,
    },
    timeOption: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        backgroundColor: Colors.lightGrey || "#f5f5f5",
        marginRight: 8,
    },
    timeOptionActive: {
        backgroundColor: Colors.primary,
    },
    timeOptionText: {
        fontFamily: "mon",
        fontSize: 14,
        color: Colors.dark,
    },
    timeOptionTextActive: {
        color: "#fff",
        fontFamily: "mon-sb",
    },
    input: {
        borderWidth: 1,
        borderColor: Colors.lightGrey || "#e0e0e0",
        borderRadius: 12,
        padding: 14,
        fontFamily: "mon",
        fontSize: 16,
        color: Colors.dark,
        minHeight: 60,
        textAlignVertical: "top",
    },
    submitButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#FF6B6B",
        padding: 16,
        borderRadius: 12,
        gap: 8,
        marginTop: 10,
    },
    submitButtonText: {
        fontFamily: "mon-sb",
        fontSize: 16,
        color: "#fff",
    },
    buttonDisabled: {
        opacity: 0.5,
    },
});
