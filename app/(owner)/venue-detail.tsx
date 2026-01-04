import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    ActivityIndicator,
    Alert,
} from "react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import Colors from "@/constants/Colors";
import { apiService, getErrorMessage } from "@/services/api";

interface Court {
    id: string;
    name: string;
    sport_type: string;
    base_price: number;
    is_active: boolean;
}

interface VenueDetail {
    id: string;
    name: string;
    address: string;
    description?: string;
    main_photo?: string;
    status: string;
    sport_types: string[];
    rating?: number;
    review_count: number;
    courts: Court[];
    opening_time?: string;
    closing_time?: string;
}

export default function VenueDetailPage() {
    const router = useRouter();
    const { id } = useLocalSearchParams<{ id: string }>();
    const [venue, setVenue] = useState<VenueDetail | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadVenue();
    }, [id]);

    const loadVenue = async () => {
        try {
            setIsLoading(true);
            const response = await apiService.getVenueById(id);
            const data = response.data.data || response.data;
            setVenue(data);
        } catch (error) {
            Alert.alert("Error", getErrorMessage(error));
        } finally {
            setIsLoading(false);
        }
    };

    const handleEditVenue = () => {
        router.push({
            pathname: "/(owner)/venue-form",
            params: { id }
        });
    };

    const handleManageCourts = () => {
        router.push({
            pathname: "/(owner)/courts",
            params: { venueId: id }
        });
    };

    const handleDeleteVenue = () => {
        Alert.alert(
            "Delete Venue",
            "Are you sure you want to delete this venue? This action cannot be undone.",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await apiService.owner.deleteVenue(id);
                            Alert.alert("Success", "Venue deleted successfully");
                            router.back();
                        } catch (error) {
                            Alert.alert("Error", getErrorMessage(error));
                        }
                    }
                }
            ]
        );
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "approved": return "#4CAF50";
            case "pending": return "#FF9800";
            case "rejected": return "#F44336";
            default: return Colors.grey;
        }
    };

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.primary} />
            </View>
        );
    }

    if (!venue) {
        return (
            <View style={styles.loadingContainer}>
                <Text style={styles.errorText}>Failed to load venue</Text>
                <TouchableOpacity style={styles.retryButton} onPress={() => router.back()}>
                    <Text style={styles.retryButtonText}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <>
            <Stack.Screen
                options={{
                    title: venue.name,
                    headerBackTitle: "Venues",
                    headerRight: () => (
                        <TouchableOpacity onPress={handleEditVenue}>
                            <Ionicons name="create-outline" size={24} color={Colors.primary} />
                        </TouchableOpacity>
                    ),
                }}
            />
            <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
                {/* Header Image */}
                {venue.main_photo ? (
                    <Image source={{ uri: venue.main_photo }} style={styles.headerImage} />
                ) : (
                    <View style={styles.headerImagePlaceholder}>
                        <Ionicons name="business-outline" size={64} color={Colors.grey} />
                    </View>
                )}

                {/* Status Badge */}
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(venue.status) }]}>
                    <Text style={styles.statusText}>{venue.status.toUpperCase()}</Text>
                </View>

                {/* Venue Info */}
                <View style={styles.infoContainer}>
                    <Text style={styles.venueName}>{venue.name}</Text>
                    <Text style={styles.venueAddress}>{venue.address}</Text>

                    {/* Stats Row */}
                    <View style={styles.statsRow}>
                        <View style={styles.statItem}>
                            <Ionicons name="star" size={16} color="#FFB800" />
                            <Text style={styles.statText}>
                                {venue.rating?.toFixed(1) || "N/A"} ({venue.review_count} reviews)
                            </Text>
                        </View>
                        <View style={styles.statItem}>
                            <Ionicons name="tennisball-outline" size={16} color={Colors.grey} />
                            <Text style={styles.statText}>{venue.courts?.length || 0} Courts</Text>
                        </View>
                    </View>

                    {/* Description */}
                    {venue.description && (
                        <>
                            <View style={styles.divider} />
                            <Text style={styles.sectionTitle}>About</Text>
                            <Text style={styles.description}>{venue.description}</Text>
                        </>
                    )}

                    {/* Sport Types */}
                    <View style={styles.divider} />
                    <Text style={styles.sectionTitle}>Sports Available</Text>
                    <View style={styles.sportsContainer}>
                        {venue.sport_types.map((sport, index) => (
                            <View key={index} style={styles.sportBadge}>
                                <Text style={styles.sportText}>{sport}</Text>
                            </View>
                        ))}
                    </View>

                    {/* Courts Section */}
                    <View style={styles.divider} />
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Courts</Text>
                        <TouchableOpacity onPress={handleManageCourts}>
                            <Text style={styles.manageText}>Manage</Text>
                        </TouchableOpacity>
                    </View>

                    {venue.courts && venue.courts.length > 0 ? (
                        venue.courts.map((court) => (
                            <View key={court.id} style={styles.courtCard}>
                                <View style={styles.courtInfo}>
                                    <Text style={styles.courtName}>{court.name}</Text>
                                    <View style={styles.courtMeta}>
                                        <MaterialCommunityIcons name="tennis" size={14} color={Colors.grey} />
                                        <Text style={styles.courtSport}>{court.sport_type}</Text>
                                    </View>
                                </View>
                                <Text style={styles.courtPrice}>Rs. {court.base_price}/hr</Text>
                            </View>
                        ))
                    ) : (
                        <TouchableOpacity style={styles.addCourtButton} onPress={handleManageCourts}>
                            <Ionicons name="add-circle-outline" size={24} color={Colors.primary} />
                            <Text style={styles.addCourtText}>Add Courts</Text>
                        </TouchableOpacity>
                    )}

                    {/* Operating Hours */}
                    {(venue.opening_time || venue.closing_time) && (
                        <>
                            <View style={styles.divider} />
                            <Text style={styles.sectionTitle}>Operating Hours</Text>
                            <View style={styles.hoursContainer}>
                                <Ionicons name="time-outline" size={20} color={Colors.grey} />
                                <Text style={styles.hoursText}>
                                    {venue.opening_time || "06:00"} - {venue.closing_time || "22:00"}
                                </Text>
                            </View>
                        </>
                    )}

                    {/* Actions */}
                    <View style={styles.divider} />
                    <View style={styles.actionsContainer}>
                        <TouchableOpacity style={styles.editButton} onPress={handleEditVenue}>
                            <Ionicons name="create-outline" size={20} color="#fff" />
                            <Text style={styles.editButtonText}>Edit Venue</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteVenue}>
                            <Ionicons name="trash-outline" size={20} color="#FF3B30" />
                            <Text style={styles.deleteButtonText}>Delete</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
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
    errorText: {
        fontFamily: "mon",
        fontSize: 16,
        color: Colors.grey,
        marginBottom: 16,
    },
    retryButton: {
        backgroundColor: Colors.primary,
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    retryButtonText: {
        fontFamily: "mon-sb",
        fontSize: 16,
        color: "#fff",
    },
    headerImage: {
        width: "100%",
        height: 200,
    },
    headerImagePlaceholder: {
        width: "100%",
        height: 200,
        backgroundColor: Colors.lightGrey,
        justifyContent: "center",
        alignItems: "center",
    },
    statusBadge: {
        position: "absolute",
        top: 16,
        right: 16,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
    },
    statusText: {
        fontFamily: "mon-sb",
        fontSize: 10,
        color: "#fff",
    },
    infoContainer: {
        padding: 20,
    },
    venueName: {
        fontFamily: "mon-b",
        fontSize: 24,
        color: Colors.dark,
        marginBottom: 8,
    },
    venueAddress: {
        fontFamily: "mon",
        fontSize: 14,
        color: Colors.grey,
        marginBottom: 16,
    },
    statsRow: {
        flexDirection: "row",
        gap: 24,
    },
    statItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    statText: {
        fontFamily: "mon",
        fontSize: 14,
        color: Colors.grey,
    },
    divider: {
        height: 1,
        backgroundColor: Colors.lightGrey || "#eee",
        marginVertical: 20,
    },
    sectionHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12,
    },
    sectionTitle: {
        fontFamily: "mon-sb",
        fontSize: 16,
        color: Colors.dark,
        marginBottom: 12,
    },
    manageText: {
        fontFamily: "mon-sb",
        fontSize: 14,
        color: Colors.primary,
    },
    description: {
        fontFamily: "mon",
        fontSize: 14,
        color: Colors.grey,
        lineHeight: 22,
    },
    sportsContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
    },
    sportBadge: {
        backgroundColor: Colors.lightGrey || "#f5f5f5",
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
    },
    sportText: {
        fontFamily: "mon-sb",
        fontSize: 12,
        color: Colors.dark,
    },
    courtCard: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        padding: 14,
        backgroundColor: "#fff",
        borderRadius: 10,
        borderWidth: 1,
        borderColor: Colors.lightGrey || "#eee",
        marginBottom: 10,
    },
    courtInfo: {
        flex: 1,
    },
    courtName: {
        fontFamily: "mon-sb",
        fontSize: 14,
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
    courtPrice: {
        fontFamily: "mon-sb",
        fontSize: 14,
        color: Colors.primary,
    },
    addCourtButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: Colors.primary,
        borderStyle: "dashed",
        gap: 8,
    },
    addCourtText: {
        fontFamily: "mon-sb",
        fontSize: 14,
        color: Colors.primary,
    },
    hoursContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    hoursText: {
        fontFamily: "mon",
        fontSize: 14,
        color: Colors.grey,
    },
    actionsContainer: {
        flexDirection: "row",
        gap: 12,
    },
    editButton: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: Colors.primary,
        padding: 14,
        borderRadius: 10,
        gap: 8,
    },
    editButtonText: {
        fontFamily: "mon-sb",
        fontSize: 14,
        color: "#fff",
    },
    deleteButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        padding: 14,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: "#FF3B30",
        gap: 8,
    },
    deleteButtonText: {
        fontFamily: "mon-sb",
        fontSize: 14,
        color: "#FF3B30",
    },
});
