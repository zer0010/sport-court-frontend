import React from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Image,
    TouchableOpacity,
    Dimensions,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/Colors";
import { apiService, getErrorMessage } from "@/services/api";

const { width } = Dimensions.get("window");

export default function VenueDetailPage() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [venue, setVenue] = React.useState<any>(null);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        loadVenueDetails();
    }, [id]);

    const loadVenueDetails = async () => {
        try {
            setLoading(true);
            const response = await apiService.getVenueById(id as string);
            setVenue(response.data.data || response.data);
        } catch (error) {
            console.error("Failed to load venue details:", getErrorMessage(error));
        } finally {
            setLoading(false);
        }
    };

    if (loading || !venue) {
        return (
            <View style={styles.loadingContainer}>
                <View style={styles.placeholderImage}>
                    <Ionicons name="business-outline" size={64} color={Colors.grey} />
                </View>
                <Text style={styles.loadingText}>Loading venue details...</Text>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => router.back()}
                >
                    <Text style={styles.backButtonText}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Main Image */}
                {venue.main_photo ? (
                    <Image source={{ uri: venue.main_photo }} style={styles.image} />
                ) : (
                    <View style={styles.imagePlaceholder}>
                        <Ionicons name="business-outline" size={64} color={Colors.grey} />
                    </View>
                )}

                <View style={styles.infoContainer}>
                    <Text style={styles.name}>{venue.name}</Text>
                    <Text style={styles.address}>{venue.address}</Text>

                    <View style={styles.statsRow}>
                        <View style={styles.ratingContainer}>
                            <Ionicons name="star" size={16} color="#FFB800" />
                            <Text style={styles.rating}>{venue.rating?.toFixed(1) || "New"}</Text>
                            <Text style={styles.reviewCount}>({venue.review_count || 0} reviews)</Text>
                        </View>
                    </View>

                    <View style={styles.divider} />

                    <Text style={styles.sectionTitle}>About</Text>
                    <Text style={styles.description}>{venue.description || "No description available."}</Text>

                    <View style={styles.divider} />

                    <Text style={styles.sectionTitle}>Sports & Courts</Text>
                    <View style={styles.sportsContainer}>
                        {venue.sport_types?.map((sport: string, index: number) => (
                            <View key={index} style={styles.sportBadge}>
                                <Text style={styles.sportText}>{sport}</Text>
                            </View>
                        ))}
                    </View>

                    {/* Placeholder for Courts list */}
                    {venue.courts && venue.courts.length > 0 ? (
                        <View style={{ marginTop: 12 }}>
                            {venue.courts.map((court: any) => (
                                <View key={court.id} style={styles.courtCard}>
                                    <Text style={styles.courtName}>{court.name}</Text>
                                    <Text style={styles.courtPrice}>{court.sport_type} • Rs. {court.hourly_rate}/hr</Text>
                                </View>
                            ))}
                        </View>
                    ) : (
                        <Text style={styles.noCourtsText}>No courts listed yet.</Text>
                    )}

                </View>
            </ScrollView>

            {/* Footer with Book Button */}
            <View style={styles.footer}>
                <View style={styles.priceContainer}>
                    <Text style={styles.priceLabel}>Starting from</Text>
                    <Text style={styles.priceValue}>Rs. {venue.min_price || 0}<Text style={styles.priceUnit}>/hr</Text></Text>
                </View>
                <TouchableOpacity style={styles.bookButton} onPress={() => { }}>
                    <Text style={styles.bookButtonText}>Book Now</Text>
                </TouchableOpacity>
            </View>

            {/* Back Button Overlay */}
            <TouchableOpacity style={styles.backButtonOverlay} onPress={() => router.back()}>
                <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },
    scrollContent: {
        paddingBottom: 100,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#fff",
    },
    placeholderImage: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: Colors.lightGrey || "#f5f5f5",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 24,
    },
    loadingText: {
        fontFamily: "mon-sb",
        fontSize: 16,
        color: Colors.grey,
        marginBottom: 16,
    },
    image: {
        width: "100%",
        height: 300,
    },
    imagePlaceholder: {
        width: "100%",
        height: 300,
        backgroundColor: Colors.lightGrey,
        justifyContent: "center",
        alignItems: "center",
    },
    infoContainer: {
        padding: 24,
    },
    name: {
        fontFamily: "mon-b",
        fontSize: 26,
        color: Colors.dark,
        marginBottom: 8,
    },
    address: {
        fontFamily: "mon",
        fontSize: 16,
        color: Colors.grey,
        marginBottom: 16,
    },
    statsRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 24,
    },
    ratingContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    rating: {
        fontFamily: "mon-sb",
        fontSize: 16,
        color: Colors.dark,
    },
    reviewCount: {
        fontFamily: "mon",
        fontSize: 14,
        color: Colors.grey,
    },
    divider: {
        height: 1,
        backgroundColor: Colors.lightGrey || "#eee",
        marginVertical: 24,
    },
    sectionTitle: {
        fontFamily: "mon-sb",
        fontSize: 18,
        color: Colors.dark,
        marginBottom: 12,
    },
    description: {
        fontFamily: "mon",
        fontSize: 16,
        lineHeight: 24,
        color: Colors.grey,
    },
    sportsContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
    },
    sportBadge: {
        backgroundColor: Colors.lightGrey || "#f5f5f5",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
    },
    sportText: {
        fontFamily: "mon",
        fontSize: 14,
        color: Colors.dark,
    },
    courtCard: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 16,
        backgroundColor: "#fff",
        borderWidth: 1,
        borderColor: Colors.lightGrey || "#eee",
        borderRadius: 12,
        marginBottom: 12,
    },
    courtName: {
        fontFamily: "mon-sb",
        fontSize: 16,
        color: Colors.dark,
    },
    courtPrice: {
        fontFamily: "mon",
        fontSize: 14,
        color: Colors.grey,
    },
    noCourtsText: {
        fontFamily: "mon",
        fontSize: 14,
        fontStyle: "italic",
        color: Colors.grey,
    },
    footer: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: "#fff",
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderTopWidth: 1,
        borderTopColor: Colors.lightGrey || "#eee",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    priceContainer: {},
    priceLabel: {
        fontFamily: "mon",
        fontSize: 12,
        color: Colors.grey,
    },
    priceValue: {
        fontFamily: "mon-b",
        fontSize: 18,
        color: Colors.dark,
    },
    priceUnit: {
        fontFamily: "mon",
        fontSize: 14,
        color: Colors.grey,
    },
    bookButton: {
        backgroundColor: Colors.primary,
        paddingHorizontal: 32,
        paddingVertical: 14,
        borderRadius: 12,
    },
    bookButtonText: {
        fontFamily: "mon-sb",
        fontSize: 16,
        color: "#fff",
    },
    backButton: {
        backgroundColor: Colors.primary,
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    backButtonText: {
        fontFamily: "mon-sb",
        fontSize: 16,
        color: "#fff",
    },
    backButtonOverlay: {
        position: "absolute",
        top: 50,
        left: 20,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "rgba(0,0,0,0.4)",
        justifyContent: "center",
        alignItems: "center",
    },
});
