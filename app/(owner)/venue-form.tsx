import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    Platform,
} from "react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/Colors";
import { apiService, getErrorMessage } from "@/services/api";

const SPORT_TYPES = [
    "Cricket",
    "Football",
    "Badminton",
    "Tennis",
    "Basketball",
    "Volleyball",
    "Table Tennis",
    "Swimming",
];

interface VenueFormData {
    name: string;
    address: string;
    description: string;
    phone: string;
    sport_types: string[];
    latitude: string;
    longitude: string;
    opening_time: string;
    closing_time: string;
}

export default function VenueFormPage() {
    const router = useRouter();
    const { id } = useLocalSearchParams<{ id?: string }>();
    const isEditing = !!id;

    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [formData, setFormData] = useState<VenueFormData>({
        name: "",
        address: "",
        description: "",
        phone: "",
        sport_types: [],
        latitude: "",
        longitude: "",
        opening_time: "06:00",
        closing_time: "22:00",
    });

    useEffect(() => {
        if (isEditing) {
            loadVenue();
        }
    }, [id]);

    const loadVenue = async () => {
        try {
            setIsLoading(true);
            const response = await apiService.getVenueById(id!);
            const venue = response.data.data || response.data;

            setFormData({
                name: venue.name || "",
                address: venue.address || "",
                description: venue.description || "",
                phone: venue.phone || "",
                sport_types: venue.sport_types || [],
                latitude: (venue.lat || venue.latitude || "").toString(),
                longitude: (venue.lng || venue.longitude || "").toString(),
                opening_time: venue.opening_time || "06:00",
                closing_time: venue.closing_time || "22:00",
            });
        } catch (error) {
            Alert.alert("Error", getErrorMessage(error));
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (field: keyof VenueFormData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const toggleSportType = (sport: string) => {
        setFormData(prev => ({
            ...prev,
            sport_types: prev.sport_types.includes(sport)
                ? prev.sport_types.filter(s => s !== sport)
                : [...prev.sport_types, sport]
        }));
    };

    const validateForm = (): boolean => {
        if (!formData.name.trim()) {
            Alert.alert("Validation Error", "Venue name is required");
            return false;
        }
        if (!formData.address.trim()) {
            Alert.alert("Validation Error", "Address is required");
            return false;
        }
        if (formData.sport_types.length === 0) {
            Alert.alert("Validation Error", "Select at least one sport type");
            return false;
        }
        return true;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        try {
            setIsSaving(true);

            const payload = {
                name: formData.name.trim(),
                address: formData.address.trim(),
                description: formData.description.trim(),
                phone: formData.phone.trim(),
                sport_types: formData.sport_types,
                lat: formData.latitude ? parseFloat(formData.latitude) : null,
                lng: formData.longitude ? parseFloat(formData.longitude) : null,
                opening_time: formData.opening_time,
                closing_time: formData.closing_time,
            };

            if (isEditing) {
                await apiService.owner.updateVenue(id!, payload);
                Alert.alert("Success", "Venue updated successfully");
            } else {
                await apiService.owner.createVenue(payload);
                Alert.alert("Success", "Venue created successfully. It will be reviewed by admin.");
            }

            router.back();
        } catch (error) {
            Alert.alert("Error", getErrorMessage(error));
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.primary} />
            </View>
        );
    }

    return (
        <>
            <Stack.Screen
                options={{
                    title: isEditing ? "Edit Venue" : "Add Venue",
                    headerBackTitle: "Back",
                }}
            />
            <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
                {/* Venue Name */}
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Venue Name *</Text>
                    <TextInput
                        style={styles.input}
                        value={formData.name}
                        onChangeText={(v) => handleChange("name", v)}
                        placeholder="e.g., Champion Sports Complex"
                        placeholderTextColor={Colors.grey}
                    />
                </View>

                {/* Address */}
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Address *</Text>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        value={formData.address}
                        onChangeText={(v) => handleChange("address", v)}
                        placeholder="Full address including city"
                        placeholderTextColor={Colors.grey}
                        multiline
                        numberOfLines={2}
                    />
                </View>

                {/* Description */}
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Description</Text>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        value={formData.description}
                        onChangeText={(v) => handleChange("description", v)}
                        placeholder="Describe your venue, facilities, and amenities"
                        placeholderTextColor={Colors.grey}
                        multiline
                        numberOfLines={4}
                    />
                </View>

                {/* Phone */}
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Contact Phone</Text>
                    <TextInput
                        style={styles.input}
                        value={formData.phone}
                        onChangeText={(v) => handleChange("phone", v)}
                        placeholder="e.g., 0300-1234567"
                        placeholderTextColor={Colors.grey}
                        keyboardType="phone-pad"
                    />
                </View>

                {/* Sport Types */}
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Sport Types *</Text>
                    <Text style={styles.helperText}>Select all sports available at this venue</Text>
                    <View style={styles.sportTypesGrid}>
                        {SPORT_TYPES.map((sport) => (
                            <TouchableOpacity
                                key={sport}
                                style={[
                                    styles.sportTypeChip,
                                    formData.sport_types.includes(sport) && styles.sportTypeChipActive
                                ]}
                                onPress={() => toggleSportType(sport)}
                            >
                                <Text style={[
                                    styles.sportTypeText,
                                    formData.sport_types.includes(sport) && styles.sportTypeTextActive
                                ]}>
                                    {sport}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Operating Hours */}
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Operating Hours</Text>
                    <View style={styles.hoursRow}>
                        <View style={styles.hourInput}>
                            <Text style={styles.hourLabel}>Opening</Text>
                            <TextInput
                                style={styles.input}
                                value={formData.opening_time}
                                onChangeText={(v) => handleChange("opening_time", v)}
                                placeholder="06:00"
                                placeholderTextColor={Colors.grey}
                            />
                        </View>
                        <View style={styles.hourInput}>
                            <Text style={styles.hourLabel}>Closing</Text>
                            <TextInput
                                style={styles.input}
                                value={formData.closing_time}
                                onChangeText={(v) => handleChange("closing_time", v)}
                                placeholder="22:00"
                                placeholderTextColor={Colors.grey}
                            />
                        </View>
                    </View>
                </View>

                {/* Location (Optional) */}
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Location Coordinates (Optional)</Text>
                    <Text style={styles.helperText}>For map display - you can add this later</Text>
                    <View style={styles.hoursRow}>
                        <View style={styles.hourInput}>
                            <Text style={styles.hourLabel}>Latitude</Text>
                            <TextInput
                                style={styles.input}
                                value={formData.latitude}
                                onChangeText={(v) => handleChange("latitude", v)}
                                placeholder="e.g., 24.8607"
                                placeholderTextColor={Colors.grey}
                                keyboardType="decimal-pad"
                            />
                        </View>
                        <View style={styles.hourInput}>
                            <Text style={styles.hourLabel}>Longitude</Text>
                            <TextInput
                                style={styles.input}
                                value={formData.longitude}
                                onChangeText={(v) => handleChange("longitude", v)}
                                placeholder="e.g., 67.0011"
                                placeholderTextColor={Colors.grey}
                                keyboardType="decimal-pad"
                            />
                        </View>
                    </View>
                </View>

                {/* Submit Button */}
                <TouchableOpacity
                    style={[styles.submitButton, isSaving && styles.submitButtonDisabled]}
                    onPress={handleSubmit}
                    disabled={isSaving}
                >
                    {isSaving ? (
                        <ActivityIndicator size="small" color="#fff" />
                    ) : (
                        <>
                            <Ionicons
                                name={isEditing ? "save-outline" : "add-circle-outline"}
                                size={20}
                                color="#fff"
                            />
                            <Text style={styles.submitButtonText}>
                                {isEditing ? "Update Venue" : "Create Venue"}
                            </Text>
                        </>
                    )}
                </TouchableOpacity>

                <View style={{ height: 40 }} />
            </ScrollView>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
        padding: 16,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#fff",
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontFamily: "mon-sb",
        fontSize: 14,
        color: Colors.dark,
        marginBottom: 8,
    },
    helperText: {
        fontFamily: "mon",
        fontSize: 12,
        color: Colors.grey,
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
    textArea: {
        minHeight: 80,
        textAlignVertical: "top",
    },
    sportTypesGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 10,
    },
    sportTypeChip: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        backgroundColor: Colors.lightGrey || "#f5f5f5",
        borderWidth: 1,
        borderColor: "transparent",
    },
    sportTypeChipActive: {
        backgroundColor: Colors.primary + "20",
        borderColor: Colors.primary,
    },
    sportTypeText: {
        fontFamily: "mon",
        fontSize: 14,
        color: Colors.dark,
    },
    sportTypeTextActive: {
        fontFamily: "mon-sb",
        color: Colors.primary,
    },
    hoursRow: {
        flexDirection: "row",
        gap: 12,
    },
    hourInput: {
        flex: 1,
    },
    hourLabel: {
        fontFamily: "mon",
        fontSize: 12,
        color: Colors.grey,
        marginBottom: 4,
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
    submitButtonDisabled: {
        opacity: 0.7,
    },
    submitButtonText: {
        fontFamily: "mon-sb",
        fontSize: 16,
        color: "#fff",
    },
});
