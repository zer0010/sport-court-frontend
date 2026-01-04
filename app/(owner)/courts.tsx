import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    TextInput,
    ActivityIndicator,
    Alert,
    Modal,
} from "react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
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

interface Court {
    id: string;
    name: string;
    sport_type: string;
    base_price: number;
    is_active: boolean;
}

interface CourtFormData {
    name: string;
    sport_type: string;
    base_price: string;
}

export default function CourtsPage() {
    const router = useRouter();
    const { venueId } = useLocalSearchParams<{ venueId: string }>();
    const [courts, setCourts] = useState<Court[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingCourt, setEditingCourt] = useState<Court | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const [formData, setFormData] = useState<CourtFormData>({
        name: "",
        sport_type: "",
        base_price: "",
    });

    useEffect(() => {
        loadCourts();
    }, [venueId]);

    const loadCourts = async () => {
        try {
            setIsLoading(true);
            const response = await apiService.owner.getVenueCourts(venueId);
            const data = response.data.data || response.data.courts || response.data || [];
            setCourts(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Failed to load courts:", getErrorMessage(error));
        } finally {
            setIsLoading(false);
        }
    };

    const openAddModal = () => {
        setEditingCourt(null);
        setFormData({ name: "", sport_type: "", base_price: "" });
        setShowModal(true);
    };

    const openEditModal = (court: Court) => {
        setEditingCourt(court);
        setFormData({
            name: court.name,
            sport_type: court.sport_type,
            base_price: court.base_price.toString(),
        });
        setShowModal(true);
    };

    const handleSave = async () => {
        if (!formData.name.trim()) {
            Alert.alert("Error", "Court name is required");
            return;
        }
        if (!formData.sport_type) {
            Alert.alert("Error", "Please select a sport type");
            return;
        }
        if (!formData.base_price || isNaN(parseFloat(formData.base_price))) {
            Alert.alert("Error", "Please enter a valid hourly rate");
            return;
        }

        try {
            setIsSaving(true);
            const payload = {
                name: formData.name.trim(),
                sport_type: formData.sport_type,
                base_price: parseFloat(formData.base_price),
            };

            if (editingCourt) {
                // Update existing court (API endpoint may vary)
                await apiService.owner.createCourt(venueId, { ...payload, id: editingCourt.id });
            } else {
                await apiService.owner.createCourt(venueId, payload);
            }

            setShowModal(false);
            loadCourts();
            Alert.alert("Success", editingCourt ? "Court updated" : "Court added successfully");
        } catch (error) {
            Alert.alert("Error", getErrorMessage(error));
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = (court: Court) => {
        Alert.alert(
            "Delete Court",
            `Are you sure you want to delete "${court.name}"?`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            // Note: Delete court API may need to be added
                            // await apiService.owner.deleteCourt(court.id);
                            Alert.alert("Note", "Court deletion will be implemented with backend support");
                        } catch (error) {
                            Alert.alert("Error", getErrorMessage(error));
                        }
                    }
                }
            ]
        );
    };

    const renderCourtItem = ({ item }: { item: Court }) => (
        <View style={styles.courtCard}>
            <View style={styles.courtInfo}>
                <Text style={styles.courtName}>{item.name}</Text>
                <View style={styles.courtMeta}>
                    <MaterialCommunityIcons name="tennis" size={14} color={Colors.grey} />
                    <Text style={styles.courtSport}>{item.sport_type}</Text>
                </View>
            </View>
            <View style={styles.courtPriceContainer}>
                <Text style={styles.courtPrice}>Rs. {item.base_price}</Text>
                <Text style={styles.courtPriceUnit}>/hour</Text>
            </View>
            <View style={styles.courtActions}>
                <TouchableOpacity style={styles.actionButton} onPress={() => openEditModal(item)}>
                    <Ionicons name="create-outline" size={20} color={Colors.primary} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton} onPress={() => handleDelete(item)}>
                    <Ionicons name="trash-outline" size={20} color="#FF3B30" />
                </TouchableOpacity>
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
        <>
            <Stack.Screen
                options={{
                    title: "Manage Courts",
                    headerBackTitle: "Back",
                    headerRight: () => (
                        <TouchableOpacity onPress={openAddModal}>
                            <Ionicons name="add-circle" size={28} color={Colors.primary} />
                        </TouchableOpacity>
                    ),
                }}
            />
            <View style={styles.container}>
                {courts.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <View style={styles.emptyIconContainer}>
                            <Ionicons name="tennisball-outline" size={64} color={Colors.grey} />
                        </View>
                        <Text style={styles.emptyTitle}>No courts yet</Text>
                        <Text style={styles.emptyDescription}>
                            Add courts to start receiving bookings
                        </Text>
                        <TouchableOpacity style={styles.emptyButton} onPress={openAddModal}>
                            <Text style={styles.emptyButtonText}>Add Court</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <FlatList
                        data={courts}
                        keyExtractor={(item) => item.id}
                        renderItem={renderCourtItem}
                        contentContainerStyle={styles.listContent}
                        ListHeaderComponent={
                            <TouchableOpacity style={styles.addButton} onPress={openAddModal}>
                                <Ionicons name="add-circle-outline" size={24} color={Colors.primary} />
                                <Text style={styles.addButtonText}>Add Court</Text>
                            </TouchableOpacity>
                        }
                    />
                )}
            </View>

            {/* Add/Edit Modal */}
            <Modal
                visible={showModal}
                animationType="slide"
                presentationStyle="pageSheet"
                onRequestClose={() => setShowModal(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <TouchableOpacity onPress={() => setShowModal(false)}>
                            <Text style={styles.modalCancel}>Cancel</Text>
                        </TouchableOpacity>
                        <Text style={styles.modalTitle}>
                            {editingCourt ? "Edit Court" : "Add Court"}
                        </Text>
                        <TouchableOpacity onPress={handleSave} disabled={isSaving}>
                            {isSaving ? (
                                <ActivityIndicator size="small" color={Colors.primary} />
                            ) : (
                                <Text style={styles.modalSave}>Save</Text>
                            )}
                        </TouchableOpacity>
                    </View>

                    <View style={styles.modalContent}>
                        {/* Court Name */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Court Name *</Text>
                            <TextInput
                                style={styles.input}
                                value={formData.name}
                                onChangeText={(v) => setFormData(prev => ({ ...prev, name: v }))}
                                placeholder="e.g., Court A, Main Field"
                                placeholderTextColor={Colors.grey}
                            />
                        </View>

                        {/* Sport Type */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Sport Type *</Text>
                            <View style={styles.sportTypesGrid}>
                                {SPORT_TYPES.map((sport) => (
                                    <TouchableOpacity
                                        key={sport}
                                        style={[
                                            styles.sportTypeChip,
                                            formData.sport_type === sport && styles.sportTypeChipActive
                                        ]}
                                        onPress={() => setFormData(prev => ({ ...prev, sport_type: sport }))}
                                    >
                                        <Text style={[
                                            styles.sportTypeText,
                                            formData.sport_type === sport && styles.sportTypeTextActive
                                        ]}>
                                            {sport}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        {/* Hourly Rate */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Hourly Rate (Rs.) *</Text>
                            <TextInput
                                style={styles.input}
                                value={formData.base_price}
                                onChangeText={(v) => setFormData(prev => ({ ...prev, base_price: v }))}
                                placeholder="e.g., 2000"
                                placeholderTextColor={Colors.grey}
                                keyboardType="numeric"
                            />
                        </View>
                    </View>
                </View>
            </Modal>
        </>
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
    listContent: {
        padding: 16,
    },
    addButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        marginBottom: 16,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: Colors.primary,
        borderStyle: "dashed",
        gap: 8,
    },
    addButtonText: {
        fontFamily: "mon-sb",
        fontSize: 16,
        color: Colors.primary,
    },
    courtCard: {
        flexDirection: "row",
        alignItems: "center",
        padding: 14,
        backgroundColor: "#fff",
        borderRadius: 12,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: Colors.lightGrey || "#e0e0e0",
    },
    courtInfo: {
        flex: 1,
    },
    courtName: {
        fontFamily: "mon-sb",
        fontSize: 16,
        color: Colors.dark,
        marginBottom: 4,
    },
    courtMeta: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    courtSport: {
        fontFamily: "mon",
        fontSize: 12,
        color: Colors.grey,
    },
    courtPriceContainer: {
        alignItems: "flex-end",
        marginRight: 12,
    },
    courtPrice: {
        fontFamily: "mon-b",
        fontSize: 16,
        color: Colors.primary,
    },
    courtPriceUnit: {
        fontFamily: "mon",
        fontSize: 10,
        color: Colors.grey,
    },
    courtActions: {
        flexDirection: "row",
        gap: 8,
    },
    actionButton: {
        padding: 8,
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
        marginBottom: 24,
    },
    emptyButton: {
        backgroundColor: Colors.primary,
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    emptyButtonText: {
        fontFamily: "mon-sb",
        fontSize: 16,
        color: "#fff",
    },
    // Modal styles
    modalContainer: {
        flex: 1,
        backgroundColor: "#fff",
    },
    modalHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: Colors.lightGrey || "#eee",
    },
    modalTitle: {
        fontFamily: "mon-sb",
        fontSize: 17,
        color: Colors.dark,
    },
    modalCancel: {
        fontFamily: "mon",
        fontSize: 16,
        color: Colors.grey,
    },
    modalSave: {
        fontFamily: "mon-sb",
        fontSize: 16,
        color: Colors.primary,
    },
    modalContent: {
        padding: 16,
    },
    inputGroup: {
        marginBottom: 24,
    },
    label: {
        fontFamily: "mon-sb",
        fontSize: 14,
        color: Colors.dark,
        marginBottom: 10,
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
});
