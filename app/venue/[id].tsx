import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Image,
    TouchableOpacity,
    Dimensions,
    ActivityIndicator,
    Alert,
    Modal,
    Platform,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import Colors from "@/constants/Colors";
import { apiService, getErrorMessage } from "@/services/api";
import { Court } from "@/interfaces/types";
import DatePicker from "@/components/DatePicker";
import TimeSlotPicker from "@/components/TimeSlotPicker";
import ReviewList from "@/components/ReviewList";
import Skeleton from "@/components/ui/Skeleton";
import * as Haptics from "expo-haptics";

const { width } = Dimensions.get("window");

export default function VenueDetailPage() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [venue, setVenue] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isFavorite, setIsFavorite] = useState(false);
    const [togglingFavorite, setTogglingFavorite] = useState(false);

    // Booking state
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [selectedCourt, setSelectedCourt] = useState<Court | null>(null);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [selectedSlots, setSelectedSlots] = useState<{ start_time: string; end_time: string }[]>([]);
    const [isBooking, setIsBooking] = useState(false);

    useEffect(() => {
        loadVenueDetails();
    }, [id]);

    const loadVenueDetails = async () => {
        try {
            setLoading(true);
            const response = await apiService.getVenueById(id as string);
            // Backend returns { venue: {...} }
            const data = response.data;
            const venueData = data.venue || data.data || data;
            setVenue(venueData);
            setIsFavorite(venueData.is_favorite || false);
        } catch (error) {
            console.error("Failed to load venue details:", getErrorMessage(error));
        } finally {
            setLoading(false);
        }
    };

    const handleFavoriteToggle = async () => {
        try {
            setTogglingFavorite(true);
            if (Platform.OS !== "web") {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }

            if (isFavorite) {
                await apiService.removeFavorite(id as string);
                setIsFavorite(false);
            } else {
                await apiService.addFavorite(id as string);
                setIsFavorite(true);
            }
        } catch (error) {
            Alert.alert("Error", getErrorMessage(error));
        } finally {
            setTogglingFavorite(false);
        }
    };

    const handleCourtSelect = (court: Court) => {
        setSelectedCourt(court);
        setSelectedSlots([]);
        setShowBookingModal(true);
    };

    const handleSlotSelect = (slots: { start_time: string; end_time: string }[]) => {
        setSelectedSlots(slots);
    };

    const calculatePrice = () => {
        if (!selectedCourt || selectedSlots.length === 0) return 0;

        // Calculate hours from slot selection
        if (selectedSlots[0]) {
            const start = selectedSlots[0].start_time;
            const end = selectedSlots[0].end_time;
            const startHour = parseInt(start.split(":")[0]);
            const endHour = parseInt(end.split(":")[0]);
            const hours = endHour - startHour;
            return hours * (selectedCourt.base_price || selectedCourt.hourly_rate || 0);
        }
        return 0;
    };

    const handleBooking = async () => {
        if (!selectedCourt || selectedSlots.length === 0) return;

        Alert.alert(
            "Confirm Booking",
            `Book ${selectedCourt.name} on ${selectedDate.toLocaleDateString()} from ${selectedSlots[0].start_time} to ${selectedSlots[0].end_time} for Rs. ${calculatePrice()}?`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Confirm",
                    onPress: async () => {
                        try {
                            setIsBooking(true);
                            // Construct local date string YYYY-MM-DD
                            const year = selectedDate.getFullYear();
                            const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
                            const day = String(selectedDate.getDate()).padStart(2, '0');
                            const dateStr = `${year}-${month}-${day}`;

                            await apiService.createBooking({
                                court_id: selectedCourt.id,
                                date: dateStr,
                                start_time: selectedSlots[0].start_time,
                                end_time: selectedSlots[0].end_time,
                            });

                            setShowBookingModal(false);
                            Alert.alert(
                                "Booking Confirmed! 🎉",
                                "Your court has been booked successfully. Check your bookings for details.",
                                [
                                    {
                                        text: "View Bookings",
                                        onPress: () => router.push("/(user)/(tabs)/bookings")
                                    },
                                    { text: "OK" }
                                ]
                            );
                        } catch (error) {
                            Alert.alert("Booking Failed", getErrorMessage(error));
                        } finally {
                            setIsBooking(false);
                        }
                    },
                },
            ]
        );
    };

    if (loading || !venue) {
        return (
            <View style={styles.container}>
                <Skeleton width="100%" height={300} />
                <View style={styles.infoContainer}>
                    <Skeleton width="60%" height={32} style={{ marginBottom: 12 }} />
                    <Skeleton width="40%" height={20} style={{ marginBottom: 24 }} />

                    <Skeleton width="30%" height={24} style={{ marginBottom: 12 }} />
                    <Skeleton width="100%" height={100} borderRadius={8} />
                </View>

                <TouchableOpacity style={styles.backButtonOverlay} onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Main Image */}
                {venue.main_photo || venue.photos?.[0] ? (
                    <Image source={{ uri: venue.main_photo || venue.photos[0] }} style={styles.image} />
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

                    {/* Description */}
                    {venue.description && (
                        <>
                            <Text style={styles.sectionTitle}>About</Text>
                            <Text style={styles.description}>{venue.description}</Text>
                            <View style={styles.divider} />
                        </>
                    )}

                    {/* Sports Types */}
                    {venue.sport_types && venue.sport_types.length > 0 && (
                        <>
                            <Text style={styles.sectionTitle}>Sports Available</Text>
                            <View style={styles.sportsContainer}>
                                {venue.sport_types.map((sport: string, index: number) => (
                                    <View key={index} style={styles.sportBadge}>
                                        <Text style={styles.sportText}>{sport}</Text>
                                    </View>
                                ))}
                            </View>
                            <View style={styles.divider} />
                        </>
                    )}

                    {/* Courts */}
                    <Text style={styles.sectionTitle}>Available Courts</Text>
                    {venue.courts && venue.courts.length > 0 ? (
                        <View style={styles.courtsContainer}>
                            {venue.courts.map((court: any) => (
                                <TouchableOpacity
                                    key={court.id}
                                    style={styles.courtCard}
                                    onPress={() => handleCourtSelect(court)}
                                    activeOpacity={0.8}
                                >
                                    <View style={styles.courtInfo}>
                                        <Text style={styles.courtName}>{court.name}</Text>
                                        <View style={styles.courtMeta}>
                                            <MaterialCommunityIcons
                                                name="tennis"
                                                size={14}
                                                color={Colors.grey}
                                            />
                                            <Text style={styles.courtSport}>{court.sport_type}</Text>
                                        </View>
                                    </View>
                                    <View style={styles.courtPriceContainer}>
                                        <Text style={styles.courtPrice}>
                                            Rs. {court.base_price || court.hourly_rate}
                                        </Text>
                                        <Text style={styles.courtPriceUnit}>/hour</Text>
                                    </View>
                                    <Ionicons name="chevron-forward" size={20} color={Colors.grey} />
                                </TouchableOpacity>
                            ))}
                        </View>
                    ) : (
                        <Text style={styles.noCourtsText}>No courts listed yet.</Text>
                    )}
                </View>

                {/* Reviews */}
                <View style={styles.infoContainer}>
                    <Text style={styles.sectionTitle}>Reviews</Text>
                    <ReviewList venueId={venue.id} scrollEnabled={false} />
                </View>
                <View style={{ height: 20 }} />

            </ScrollView>

            {/* Footer */}
            <View style={styles.footer}>
                <View style={styles.priceContainer}>
                    <Text style={styles.priceLabel}>Starting from</Text>
                    <Text style={styles.priceValue}>
                        Rs. {venue.min_price || 0}
                        <Text style={styles.priceUnit}>/hr</Text>
                    </Text>
                </View>
                <TouchableOpacity
                    style={styles.bookButton}
                    onPress={() => {
                        if (venue.courts?.length > 0) {
                            handleCourtSelect(venue.courts[0]);
                        } else {
                            Alert.alert("No Courts", "This venue has no courts available for booking.");
                        }
                    }}
                >
                    <Text style={styles.bookButtonText}>Book Now</Text>
                </TouchableOpacity>
            </View>

            {/* Back Button Overlay */}
            <TouchableOpacity style={styles.backButtonOverlay} onPress={() => router.back()}>
                <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>

            {/* Favorite Button Overlay */}
            <TouchableOpacity
                style={styles.favoriteButtonOverlay}
                onPress={handleFavoriteToggle}
                disabled={togglingFavorite}
            >
                {togglingFavorite ? (
                    <ActivityIndicator size="small" color="#fff" />
                ) : (
                    <Ionicons
                        name={isFavorite ? "heart" : "heart-outline"}
                        size={24}
                        color={isFavorite ? "#FF3B30" : "#fff"}
                    />
                )}
            </TouchableOpacity>

            {/* Booking Modal */}
            <Modal
                visible={showBookingModal}
                animationType="slide"
                presentationStyle="pageSheet"
                onRequestClose={() => setShowBookingModal(false)}
            >
                <View style={styles.modalContainer}>
                    {/* Modal Header */}
                    <View style={styles.modalHeader}>
                        <TouchableOpacity onPress={() => setShowBookingModal(false)}>
                            <Ionicons name="close" size={28} color={Colors.dark} />
                        </TouchableOpacity>
                        <Text style={styles.modalTitle}>Book Court</Text>
                        <View style={{ width: 28 }} />
                    </View>

                    <ScrollView style={styles.modalContent}>
                        {/* Selected Court Info */}
                        {/* Court Selector */}
                        <Text style={styles.modalSectionTitle}>Select Court</Text>
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.courtSelectorContent}
                            style={styles.courtSelectorScroll}
                        >
                            {venue?.courts?.map((court: Court) => (
                                <TouchableOpacity
                                    key={court.id}
                                    style={[
                                        styles.courtChip,
                                        selectedCourt?.id === court.id && styles.courtChipSelected
                                    ]}
                                    onPress={() => handleCourtSelect(court)}
                                >
                                    <Text style={[
                                        styles.courtChipText,
                                        selectedCourt?.id === court.id && styles.courtChipTextSelected
                                    ]}>
                                        {court.name}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>

                        {selectedCourt && (
                            <Text style={styles.courtPriceSubtext}>
                                {selectedCourt.sport_type} • Rs. {selectedCourt.base_price || selectedCourt.hourly_rate}/hr
                            </Text>
                        )}

                        {/* Date Picker */}
                        <DatePicker
                            selectedDate={selectedDate}
                            onDateSelect={setSelectedDate}
                            daysToShow={7}
                        />

                        {/* Time Slot Picker */}
                        {selectedCourt && (
                            <TimeSlotPicker
                                courtId={selectedCourt.id}
                                selectedDate={selectedDate}
                                onSlotSelect={handleSlotSelect}
                                maxSlots={4}
                            />
                        )}
                    </ScrollView>

                    {/* Modal Footer */}
                    <View style={styles.modalFooter}>
                        <View style={styles.modalPriceContainer}>
                            <Text style={styles.modalPriceLabel}>Total</Text>
                            <Text style={styles.modalPriceValue}>Rs. {calculatePrice()}</Text>
                        </View>
                        <TouchableOpacity
                            style={[
                                styles.confirmButton,
                                selectedSlots.length === 0 && styles.confirmButtonDisabled
                            ]}
                            onPress={handleBooking}
                            disabled={selectedSlots.length === 0 || isBooking}
                        >
                            {isBooking ? (
                                <ActivityIndicator size="small" color="#fff" />
                            ) : (
                                <Text style={styles.confirmButtonText}>Confirm Booking</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
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
    loadingText: {
        fontFamily: "mon-sb",
        fontSize: 16,
        color: Colors.grey,
        marginTop: 16,
        marginBottom: 24,
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
        marginBottom: 8,
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
        backgroundColor: (Colors.accent || "#CCFF00") + "30",
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
    },
    sportText: {
        fontFamily: "mon-sb",
        fontSize: 14,
        color: Colors.dark,
    },
    courtsContainer: {
        gap: 12,
    },
    courtCard: {
        flexDirection: "row",
        alignItems: "center",
        padding: 16,
        backgroundColor: "#fff",
        borderWidth: 1,
        borderColor: Colors.lightGrey || "#eee",
        borderRadius: 12,
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
        fontSize: 14,
        color: Colors.grey,
    },
    courtPriceContainer: {
        alignItems: "flex-end",
        marginRight: 8,
    },
    courtPrice: {
        fontFamily: "mon-b",
        fontSize: 16,
        color: Colors.primary,
    },
    courtPriceUnit: {
        fontFamily: "mon",
        fontSize: 12,
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
        fontSize: 20,
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
    favoriteButtonOverlay: {
        position: "absolute",
        top: 50,
        right: 20,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "rgba(0,0,0,0.4)",
        justifyContent: "center",
        alignItems: "center",
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
        fontSize: 18,
        color: Colors.dark,
    },
    modalContent: {
        flex: 1,
        padding: 16,
    },
    selectedCourtCard: {
        backgroundColor: Colors.primary + "10",
        padding: 16,
        borderRadius: 12,
        marginBottom: 24,
    },
    selectedCourtName: {
        fontFamily: "mon-sb",
        fontSize: 18,
        color: Colors.dark,
        marginBottom: 4,
    },
    selectedCourtDetails: {
        fontFamily: "mon",
        fontSize: 14,
        color: Colors.grey,
    },
    modalSectionTitle: {
        fontFamily: "mon-sb",
        fontSize: 16,
        color: Colors.dark,
        marginBottom: 12,
        marginTop: 8,
    },
    courtSelectorScroll: {
        marginBottom: 8,
    },
    courtSelectorContent: {
        gap: 8,
        paddingRight: 16,
    },
    courtChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: Colors.lightGrey || "#f5f5f5",
        borderWidth: 1,
        borderColor: "transparent",
    },
    courtChipSelected: {
        backgroundColor: Colors.primary + "20",
        borderColor: Colors.primary,
    },
    courtChipText: {
        fontFamily: "mon",
        fontSize: 14,
        color: Colors.dark,
    },
    courtChipTextSelected: {
        fontFamily: "mon-sb",
        color: Colors.primary,
    },
    courtPriceSubtext: {
        fontFamily: "mon",
        fontSize: 14,
        color: Colors.grey,
        marginBottom: 24,
    },
    modalFooter: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: Colors.lightGrey || "#eee",
        backgroundColor: "#fff",
    },
    modalPriceContainer: {},
    modalPriceLabel: {
        fontFamily: "mon",
        fontSize: 12,
        color: Colors.grey,
    },
    modalPriceValue: {
        fontFamily: "mon-b",
        fontSize: 22,
        color: Colors.dark,
    },
    confirmButton: {
        backgroundColor: Colors.primary,
        paddingHorizontal: 32,
        paddingVertical: 14,
        borderRadius: 12,
    },
    confirmButtonDisabled: {
        backgroundColor: Colors.grey,
    },
    confirmButtonText: {
        fontFamily: "mon-sb",
        fontSize: 16,
        color: "#fff",
    },
});
