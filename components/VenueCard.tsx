import React from "react";
import {
    View,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity,
    Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import Colors from "@/constants/Colors";
import { VenueListItem } from "@/interfaces/types";

const { width } = Dimensions.get("window");

interface Props {
    venue: VenueListItem;
}

const VenueCard = ({ venue }: Props) => {
    const handlePress = () => {
        router.push(`/venue/${venue.id}`);
    };

    return (
        <TouchableOpacity style={styles.container} onPress={handlePress}>
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
                <TouchableOpacity style={styles.favoriteButton}>
                    <Ionicons name="heart-outline" size={24} color="#fff" />
                </TouchableOpacity>
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
                {venue.sport_types && venue.sport_types.length > 0 && (
                    <View style={styles.sportsContainer}>
                        {venue.sport_types.slice(0, 3).map((sport, index) => (
                            <View key={index} style={styles.sportBadge}>
                                <Text style={styles.sportText}>{sport}</Text>
                            </View>
                        ))}
                        {venue.sport_types.length > 3 && (
                            <Text style={styles.moreSports}>
                                +{venue.sport_types.length - 3} more
                            </Text>
                        )}
                    </View>
                )}

                {/* Price */}
                <View style={styles.priceContainer}>
                    <Text style={styles.price}>
                        Rs. {venue.min_price}
                        {venue.max_price && venue.max_price !== venue.min_price
                            ? ` - ${venue.max_price}`
                            : ""}
                    </Text>
                    <Text style={styles.priceUnit}> / hour</Text>
                </View>

                {/* Distance */}
                {venue.distance !== undefined && (
                    <Text style={styles.distance}>
                        {venue.distance < 1
                            ? `${(venue.distance * 1000).toFixed(0)} m away`
                            : `${venue.distance.toFixed(1)} km away`}
                    </Text>
                )}
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
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: "rgba(0,0,0,0.3)",
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
