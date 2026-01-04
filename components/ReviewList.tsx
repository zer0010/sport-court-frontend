import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Image, FlatList, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/Colors";
import { Review } from "@/interfaces/types";
import { apiService, getErrorMessage } from "@/services/api";

interface ReviewListProps {
    venueId?: string;
    reviews?: Review[];
    scrollEnabled?: boolean;
}

export default function ReviewList({ venueId, reviews: initialReviews, scrollEnabled = true }: ReviewListProps) {
    const [reviews, setReviews] = useState<Review[]>(initialReviews || []);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (venueId && !initialReviews) {
            loadReviews();
        }
    }, [venueId]);

    const loadReviews = async () => {
        if (!venueId) return;
        try {
            setLoading(true);
            const response = await apiService.getVenueReviews(venueId, { limit: 10 });
            // Handle different response structures gracefully
            const data = response.data.data || response.data.reviews || response.data || [];
            if (Array.isArray(data)) {
                setReviews(data);
            } else {
                setReviews([]);
            }
        } catch (err) {
            console.error("Failed to load reviews:", err);
            setError(getErrorMessage(err));
        } finally {
            setLoading(false);
        }
    };

    const renderStars = (rating: number) => {
        return (
            <View style={styles.starsContainer}>
                {[1, 2, 3, 4, 5].map((star) => (
                    <Ionicons
                        key={star}
                        name={star <= rating ? "star" : "star-outline"}
                        size={14}
                        color={Colors.primary}
                    />
                ))}
            </View>
        );
    };

    const renderItem = ({ item }: { item: Review }) => (
        <View style={styles.reviewCard}>
            <View style={styles.header}>
                <View style={styles.userContainer}>
                    <Image
                        source={{ uri: item.user?.avatar_url || "https://companieslogo.com/img/orig/go_logo_icon_1702524485-61376996.png" }}
                        style={styles.avatar}
                    />
                    <View>
                        <Text style={styles.userName}>{item.user?.name || "Anonymous User"}</Text>
                        <Text style={styles.date}>{new Date(item.created_at).toLocaleDateString()}</Text>
                    </View>
                </View>
                {renderStars(item.rating)}
            </View>
            {item.comment && <Text style={styles.comment}>{item.comment}</Text>}
            {item.owner_response && (
                <View style={styles.responseContainer}>
                    <Text style={styles.responseLabel}>Owner Response:</Text>
                    <Text style={styles.responseText}>{item.owner_response}</Text>
                </View>
            )}
        </View>
    );

    if (loading) {
        return <ActivityIndicator size="small" color={Colors.primary} style={{ margin: 20 }} />;
    }

    if (error) {
        return <Text style={styles.errorText}>Failed to load reviews</Text>;
    }

    if (reviews.length === 0) {
        return (
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No reviews yet.</Text>
            </View>
        );
    }

    return (
        <FlatList
            data={reviews}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            scrollEnabled={scrollEnabled}
            contentContainerStyle={styles.listContent}
        />
    );
}

const styles = StyleSheet.create({
    listContent: {
        paddingVertical: 10,
    },
    reviewCard: {
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: Colors.lightGrey || "#eee",
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 8,
    },
    userContainer: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
    },
    avatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        marginRight: 10,
        backgroundColor: "#f0f0f0",
    },
    userName: {
        fontFamily: "mon-sb",
        fontSize: 14,
        color: Colors.dark,
    },
    date: {
        fontFamily: "mon",
        fontSize: 12,
        color: Colors.grey,
    },
    starsContainer: {
        flexDirection: "row",
        marginTop: 2,
    },
    comment: {
        fontFamily: "mon",
        fontSize: 14,
        color: Colors.dark,
        lineHeight: 20,
    },
    responseContainer: {
        marginTop: 10,
        padding: 10,
        backgroundColor: "#f9f9f9",
        borderRadius: 8,
        borderLeftWidth: 3,
        borderLeftColor: Colors.primary,
    },
    responseLabel: {
        fontFamily: "mon-sb",
        fontSize: 12,
        color: Colors.grey,
        marginBottom: 4,
    },
    responseText: {
        fontFamily: "mon",
        fontSize: 13,
        color: Colors.dark,
    },
    errorText: {
        fontFamily: "mon",
        color: "red",
        textAlign: "center",
        margin: 10,
    },
    emptyContainer: {
        padding: 16,
        alignItems: "center",
    },
    emptyText: {
        fontFamily: "mon",
        color: Colors.grey,
    },
});
