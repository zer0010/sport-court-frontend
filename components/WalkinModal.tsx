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
    Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/Colors";
import { apiService, getErrorMessage } from "@/services/api";
import DatePicker from "./DatePicker";
import TimeSlotPicker from "./TimeSlotPicker";

interface Court {
    id: string;
    name: string;
    sport_type: string;
    base_price: number;
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

export default function WalkinModal({ visible, onClose, onSuccess, venues = [] }: Props) {
    const [isLoading, setIsLoading] = useState(false);
    const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);
    const [selectedCourt, setSelectedCourt] = useState<Court | null>(null);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
    const [guestName, setGuestName] = useState("");
    const [guestPhone, setGuestPhone] = useState("");
    const [step, setStep] = useState(1); // 1: Court, 2: Time, 3: Guest Info

    useEffect(() => {
        if (visible) {
            // Reset form when modal opens
            setSelectedVenue(venues.length === 1 ? venues[0] : null);
            setSelectedCourt(null);
            setSelectedDate(new Date());
            setSelectedSlots([]);
            setGuestName("");
            setGuestPhone("");
            setStep(1);
        }
    }, [visible, venues]);

    const handleCourtSelect = (court: Court) => {
        setSelectedCourt(court);
        setStep(2);
    };

    const handleTimeConfirm = () => {
        if (selectedSlots.length === 0) {
            Alert.alert("Error", "Please select at least one time slot");
            return;
        }
        setStep(3);
    };

    const handleSubmit = async () => {
        if (!guestName.trim()) {
            Alert.alert("Error", "Please enter guest name");
            return;
        }
        if (!guestPhone.trim()) {
            Alert.alert("Error", "Please enter guest phone");
            return;
        }
        if (!selectedCourt) {
            Alert.alert("Error", "Please select a court");
            return;
        }

        try {
            setIsLoading(true);

            // Calculate start and end time from selected slots
            const sortedSlots = [...selectedSlots].sort();
            const startTime = sortedSlots[0];
            const lastSlot = sortedSlots[sortedSlots.length - 1];
            const [hours, minutes] = lastSlot.split(":").map(Number);
            const endTime = `${String(hours + 1).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;

            const payload = {
                court_id: selectedCourt.id,
                date: selectedDate.toISOString().split("T")[0],
                start_time: startTime,
                end_time: endTime,
                guest_name: guestName.trim(),
                guest_phone: guestPhone.trim(),
            };

            await apiService.owner.createWalkin(payload);
            Alert.alert("Success", "Walk-in booking created successfully");
            onSuccess?.();
            onClose();
        } catch (error) {
            Alert.alert("Error", getErrorMessage(error));
        } finally {
            setIsLoading(false);
        }
    };

    const renderStep1 = () => (
        <ScrollView style={styles.stepContent}>
            <Text style={styles.stepTitle}>Select Court</Text>
            {venues.length > 1 && (
                <View style={styles.venueSection}>
                    <Text style={styles.sectionLabel}>Venue</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        {venues.map((venue) => (
                            <TouchableOpacity
                                key={venue.id}
                                style={[
                                    styles.venueChip,
                                    selectedVenue?.id === venue.id && styles.venueChipActive,
                                ]}
                                onPress={() => setSelectedVenue(venue)}
                            >
                                <Text
                                    style={[
                                        styles.venueChipText,
                                        selectedVenue?.id === venue.id && styles.venueChipTextActive,
                                    ]}
                                >
                                    {venue.name}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            )}

            {selectedVenue && (
                <View style={styles.courtsSection}>
                    <Text style={styles.sectionLabel}>Courts</Text>
                    {selectedVenue.courts.map((court) => (
                        <TouchableOpacity
                            key={court.id}
                            style={styles.courtItem}
                            onPress={() => handleCourtSelect(court)}
                        >
                            <View>
                                <Text style={styles.courtName}>{court.name}</Text>
                                <Text style={styles.courtSport}>{court.sport_type}</Text>
                            </View>
                            <View style={styles.courtPrice}>
                                <Text style={styles.priceText}>Rs. {court.base_price}/hr</Text>
                                <Ionicons name="chevron-forward" size={20} color={Colors.grey} />
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>
            )}
        </ScrollView>
    );

    const renderStep2 = () => (
        <ScrollView style={styles.stepContent}>
            <Text style={styles.stepTitle}>Select Date & Time</Text>
            <Text style={styles.selectedCourt}>{selectedCourt?.name}</Text>

            <DatePicker
                selectedDate={selectedDate}
                onDateSelect={setSelectedDate}
            />

            <View style={styles.timeSlotsContainer}>
                <TimeSlotPicker
                    courtId={selectedCourt?.id || ""}
                    selectedDate={selectedDate}
                    onSlotSelect={(slots) => {
                        setSelectedSlots(slots.map(s => s.start_time));
                    }}
                />
            </View>

            <TouchableOpacity
                style={[styles.nextButton, selectedSlots.length === 0 && styles.buttonDisabled]}
                onPress={handleTimeConfirm}
                disabled={selectedSlots.length === 0}
            >
                <Text style={styles.nextButtonText}>Continue</Text>
            </TouchableOpacity>
        </ScrollView>
    );

    const renderStep3 = () => (
        <ScrollView style={styles.stepContent}>
            <Text style={styles.stepTitle}>Guest Information</Text>

            <View style={styles.summaryCard}>
                <Text style={styles.summaryLabel}>Court:</Text>
                <Text style={styles.summaryValue}>{selectedCourt?.name}</Text>
                <Text style={styles.summaryLabel}>Date:</Text>
                <Text style={styles.summaryValue}>
                    {selectedDate.toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                    })}
                </Text>
                <Text style={styles.summaryLabel}>Time:</Text>
                <Text style={styles.summaryValue}>
                    {selectedSlots.length > 0 &&
                        `${selectedSlots[0]} - ${(() => {
                            const lastSlot = [...selectedSlots].sort()[selectedSlots.length - 1];
                            const [h] = lastSlot.split(":").map(Number);
                            return `${String(h + 1).padStart(2, "0")}:00`;
                        })()}`}
                </Text>
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Guest Name *</Text>
                <TextInput
                    style={styles.input}
                    value={guestName}
                    onChangeText={setGuestName}
                    placeholder="Enter guest name"
                    placeholderTextColor={Colors.grey}
                />
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Phone Number *</Text>
                <TextInput
                    style={styles.input}
                    value={guestPhone}
                    onChangeText={setGuestPhone}
                    placeholder="e.g., 0300-1234567"
                    placeholderTextColor={Colors.grey}
                    keyboardType="phone-pad"
                />
            </View>

            <TouchableOpacity
                style={[styles.submitButton, isLoading && styles.buttonDisabled]}
                onPress={handleSubmit}
                disabled={isLoading}
            >
                {isLoading ? (
                    <ActivityIndicator size="small" color="#fff" />
                ) : (
                    <>
                        <Ionicons name="checkmark-circle" size={20} color="#fff" />
                        <Text style={styles.submitButtonText}>Create Walk-in</Text>
                    </>
                )}
            </TouchableOpacity>
        </ScrollView>
    );

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
                    <TouchableOpacity onPress={step > 1 ? () => setStep(step - 1) : onClose}>
                        <Ionicons
                            name={step > 1 ? "arrow-back" : "close"}
                            size={24}
                            color={Colors.dark}
                        />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Walk-in Booking</Text>
                    <View style={{ width: 24 }} />
                </View>

                {/* Step Indicator */}
                <View style={styles.stepIndicator}>
                    {[1, 2, 3].map((s) => (
                        <View
                            key={s}
                            style={[
                                styles.stepDot,
                                step >= s && styles.stepDotActive,
                            ]}
                        />
                    ))}
                </View>

                {/* Content */}
                {step === 1 && renderStep1()}
                {step === 2 && renderStep2()}
                {step === 3 && renderStep3()}
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
    stepIndicator: {
        flexDirection: "row",
        justifyContent: "center",
        gap: 8,
        paddingVertical: 16,
    },
    stepDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: Colors.lightGrey || "#e0e0e0",
    },
    stepDotActive: {
        backgroundColor: Colors.primary,
        width: 24,
    },
    stepContent: {
        flex: 1,
        padding: 16,
    },
    stepTitle: {
        fontFamily: "mon-b",
        fontSize: 20,
        color: Colors.dark,
        marginBottom: 20,
    },
    venueSection: {
        marginBottom: 20,
    },
    sectionLabel: {
        fontFamily: "mon-sb",
        fontSize: 14,
        color: Colors.grey,
        marginBottom: 10,
    },
    venueChip: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        backgroundColor: Colors.lightGrey || "#f5f5f5",
        marginRight: 10,
    },
    venueChipActive: {
        backgroundColor: Colors.primary,
    },
    venueChipText: {
        fontFamily: "mon",
        fontSize: 14,
        color: Colors.dark,
    },
    venueChipTextActive: {
        color: "#fff",
        fontFamily: "mon-sb",
    },
    courtsSection: {
        gap: 10,
    },
    courtItem: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        padding: 16,
        backgroundColor: "#fff",
        borderRadius: 12,
        borderWidth: 1,
        borderColor: Colors.lightGrey || "#e0e0e0",
    },
    courtName: {
        fontFamily: "mon-sb",
        fontSize: 16,
        color: Colors.dark,
        marginBottom: 4,
    },
    courtSport: {
        fontFamily: "mon",
        fontSize: 12,
        color: Colors.grey,
    },
    courtPrice: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    priceText: {
        fontFamily: "mon-sb",
        fontSize: 14,
        color: Colors.primary,
    },
    selectedCourt: {
        fontFamily: "mon-sb",
        fontSize: 16,
        color: Colors.grey,
        marginBottom: 16,
    },
    timeSlotsContainer: {
        marginTop: 16,
    },
    nextButton: {
        backgroundColor: Colors.primary,
        padding: 16,
        borderRadius: 12,
        alignItems: "center",
        marginTop: 20,
    },
    nextButtonText: {
        fontFamily: "mon-sb",
        fontSize: 16,
        color: "#fff",
    },
    buttonDisabled: {
        opacity: 0.5,
    },
    summaryCard: {
        backgroundColor: Colors.lightGrey || "#f5f5f5",
        borderRadius: 12,
        padding: 16,
        marginBottom: 20,
    },
    summaryLabel: {
        fontFamily: "mon",
        fontSize: 12,
        color: Colors.grey,
        marginTop: 8,
    },
    summaryValue: {
        fontFamily: "mon-sb",
        fontSize: 14,
        color: Colors.dark,
    },
    inputGroup: {
        marginBottom: 16,
    },
    inputLabel: {
        fontFamily: "mon-sb",
        fontSize: 14,
        color: Colors.dark,
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: Colors.lightGrey || "#e0e0e0",
        borderRadius: 10,
        padding: 14,
        fontFamily: "mon",
        fontSize: 16,
        color: Colors.dark,
    },
    submitButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: Colors.primary,
        padding: 16,
        borderRadius: 12,
        gap: 8,
        marginTop: 20,
    },
    submitButtonText: {
        fontFamily: "mon-sb",
        fontSize: 16,
        color: "#fff",
    },
});
