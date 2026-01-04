import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity,
    Dimensions,
    ActivityIndicator,
    Alert,
    Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import Colors from "@/constants/Colors";
import { VenueListItem } from "@/interfaces/types";
import { apiService, getErrorMessage } from "@/services/api";
import * as Haptics from "expo-haptics";

const { width } = Dimensions.get("window");

interface Props {
    venue: VenueListItem;
    isFavorite?: boolean;
    onFavoriteChange?: (venueId: string, isFavorite: boolean) => void;
    hideFavoriteButton?: boolean;
}

const VenueCard = ({ venue, isFavorite = false, onFavoriteChange, hideFavoriteButton = false }: Props) => {
    const [favorite, setFavorite] = useState(isFavorite);
    const [isTogglingFavorite, setIsTogglingFavorite] = useState(false);

    const handlePress = () => {
        router.push(`/venue/${venue.id}`);
    };

    const handleFavoritePress = async () => {
        try {
            setIsTogglingFavorite(true);
            if (Platform.OS !== "web") {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }

            if (favorite) {
                await apiService.removeFavorite(venue.id);
                setFavorite(false);
                onFavoriteChange?.(venue.id, false);
            } else {
                await apiService.addFavorite(venue.id);
                setFavorite(true);
                onFavoriteChange?.(venue.id, true);
            }
        } catch (error) {
            Alert.alert("Error", getErrorMessage(error));
        } finally {
            setIsTogglingFavorite(false);
        }
    };

    return (
        <TouchableOpacity style={styles.container} onPress={handlePress} activeOpacity={0.9}>
            {/* Image */}
            <View style={styles.imageContainer}>
                {venue.main_photo ? (
                    <Image source={{ uri: venue.main_photo }} style={styles.image} />
                ) : (
                    <View style={styles.imagePlaceholder}>
                        <Ionicons name="business-outline" size={40} color={Colors.grey} />
                    </View>
                )}
                {/* Favorite Button */}
                {!hideFavoriteButton && (
                    <TouchableOpacity
                        style={styles.favoriteButton}
                        onPress={handleFavoritePress}
                        disabled={isTogglingFavorite}
                    >
                        {isTogglingFavorite ? (
                            <ActivityIndicator size="small" color="#fff" />
                        ) : (
                            <Ionicons
                                name={favorite ? "heart" : "heart-outline"}
                                size={24}
                                color={favorite ? "#FF3B30" : "#fff"}
                            />
                        )}
                    </TouchableOpacity>
                )}
            </View>

            {/* Info */}
            <View style={styles.infoContainer}>
                {/* Title & Rating Row */}
                <View style={styles.titleRow}>
                    <Text style={styles.name} numberOfLines={1}>
                        {venue.name}
                    </Text>
                    <View style={styles.ratingContainer}>
                        <Ionicons name="star" size={14} color="#FFB800" />
                        <Text style={styles.rating}>
                            {venue.rating?.toFixed(1) || "New"}
                        </Text>
                        <Text style={styles.reviewCount}>
                            ({venue.review_count || 0})
                        </Text>
                    </View>
                </View>

                {/* Address */}
                <Text style={styles.address} numberOfLines={1}>
                    {venue.address}
                </Text>

                {/* Sport Types */}
                {(() => {
                    const sportList = venue.sports || venue.sport_types || [];
                    return sportList.length > 0 && (
                        <View style={styles.sportsContainer}>
                            {sportList.slice(0, 3).map((sport: string, index: number) => (
                                <View key={index} style={styles.sportBadge}>
                                    <Text style={styles.sportText}>{sport}</Text>
                                </View>
                            ))}
                            {sportList.length > 3 && (
                                <Text style={styles.moreSports}>
                                    +{sportList.length - 3} more
                                </Text>
                            )}
                        </View>
                    );
                })()}

                {/* Price */}
                {(() => {
                    const minPrice = venue.min_price || venue.price_range?.min;
                    const maxPrice = venue.max_price || venue.price_range?.max;
                    if (!minPrice) return null;
                    return (
                        <View style={styles.priceContainer}>
                            <Text style={styles.price}>
                                Rs. {minPrice}
                                {maxPrice && maxPrice !== minPrice ? ` - ${maxPrice}` : ""}
                            </Text>
                            <Text style={styles.priceUnit}> / hour</Text>
                        </View>
                    );
                })()}

                {/* Distance */}
                {(() => {
                    const dist = venue.distance ?? venue.distance_km;
                    if (dist === undefined) return null;
                    return (
                        <Text style={styles.distance}>
                            {dist < 1
                                ? `${(dist * 1000).toFixed(0)} m away`
                                : `${dist.toFixed(1)} km away`}
                        </Text>
                    );
                })()}
            </View>
        </TouchableOpacity>
    );
};

export default VenueCard;

const styles = StyleSheet.create({
    container: {
        marginBottom: 24,
    },
    imageContainer: {
        position: "relative",
    },
    image: {
        width: "100%",
        height: 280,
        borderRadius: 12,
    },
    imagePlaceholder: {
        width: "100%",
        height: 280,
        borderRadius: 12,
        backgroundColor: Colors.lightGrey || "#f5f5f5",
        justifyContent: "center",
        alignItems: "center",
    },
    favoriteButton: {
        position: "absolute",
        top: 12,
        right: 12,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "rgba(0,0,0,0.4)",
        justifyContent: "center",
        alignItems: "center",
    },
    infoContainer: {
        paddingTop: 12,
    },
    titleRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 4,
    },
    name: {
        flex: 1,
        fontFamily: "mon-sb",
        fontSize: 16,
        color: Colors.dark,
        marginRight: 8,
    },
    ratingContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    rating: {
        fontFamily: "mon-sb",
        fontSize: 14,
        color: Colors.dark,
    },
    reviewCount: {
        fontFamily: "mon",
        fontSize: 12,
        color: Colors.grey,
    },
    address: {
        fontFamily: "mon",
        fontSize: 14,
        color: Colors.grey,
        marginBottom: 8,
    },
    sportsContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 6,
        marginBottom: 8,
    },
    sportBadge: {
        backgroundColor: Colors.lightGrey || "#f5f5f5",
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    sportText: {
        fontFamily: "mon",
        fontSize: 12,
        color: Colors.dark,
    },
    moreSports: {
        fontFamily: "mon",
        fontSize: 12,
        color: Colors.grey,
        alignSelf: "center",
    },
    priceContainer: {
        flexDirection: "row",
        alignItems: "baseline",
    },
    price: {
        fontFamily: "mon-sb",
        fontSize: 16,
        color: Colors.dark,
    },
    priceUnit: {
        fontFamily: "mon",
        fontSize: 14,
        color: Colors.grey,
    },
    distance: {
        fontFamily: "mon",
        fontSize: 12,
        color: Colors.grey,
        marginTop: 4,
    },
});
