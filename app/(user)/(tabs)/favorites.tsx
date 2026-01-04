import React, { useState, useEffect, useCallback } from "react";
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    ActivityIndicator,
    RefreshControl,
    TouchableOpacity,
    Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import Colors from "@/constants/Colors";
import { apiService, getErrorMessage } from "@/services/api";
import { VenueListItem } from "@/interfaces/types";
import VenueCard from "@/components/VenueCard";

interface FavoriteItem {
    id: string;
    venue_id: string;
    venue: VenueListItem;
    created_at: string;
}

export default function FavoritesPage() {
    const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [removingId, setRemovingId] = useState<string | null>(null);

    const loadFavorites = async () => {
        try {
            const response = await apiService.getFavorites();
            const data = response.data.data || response.data.favorites || response.data || [];
            setFavorites(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Failed to load favorites:", getErrorMessage(error));
        } finally {
            setIsLoading(false);
            setRefreshing(false);
        }
    };

    // Load on focus (when tab is selected)
    useFocusEffect(
        useCallback(() => {
            loadFavorites();
        }, [])
    );

    const onRefresh = async () => {
        setRefreshing(true);
        await loadFavorites();
    };

    const handleRemoveFavorite = async (venueId: string) => {
        Alert.alert(
            "Remove Favorite",
            "Are you sure you want to remove this venue from your favorites?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Remove",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            setRemovingId(venueId);
                            await apiService.removeFavorite(venueId);
                            setFavorites(prev => prev.filter(f => f.venue_id !== venueId));
                        } catch (error) {
                            Alert.alert("Error", getErrorMessage(error));
                        } finally {
                            setRemovingId(null);
                        }
                    },
                },
            ]
        );
    };

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.primary} />
            </View>
        );
    }

    if (favorites.length === 0) {
        return (
            <View style={styles.emptyContainer}>
                <View style={styles.emptyIconContainer}>
                    <Ionicons name="heart-outline" size={64} color={Colors.grey} />
                </View>
                <Text style={styles.emptyTitle}>No favorites yet</Text>
                <Text style={styles.emptyDescription}>
                    Tap the heart icon on any venue to save it here for quick access
                </Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={favorites}
                keyExtractor={(item) => item.id || item.venue_id}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={[Colors.primary]}
                    />
                }
                contentContainerStyle={styles.listContent}
                renderItem={({ item }) => (
                    <View style={styles.favoriteItem}>
                        <VenueCard venue={item.venue} />
                        <TouchableOpacity
                            style={styles.removeButton}
                            onPress={() => handleRemoveFavorite(item.venue_id)}
                            disabled={removingId === item.venue_id}
                        >
                            {removingId === item.venue_id ? (
                                <ActivityIndicator size="small" color="#FF3B30" />
                            ) : (
                                <Ionicons name="heart" size={24} color="#FF3B30" />
                            )}
                        </TouchableOpacity>
                    </View>
                )}
            />
        </View>
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
    emptyContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#fff",
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
        lineHeight: 20,
    },
    listContent: {
        padding: 16,
    },
    favoriteItem: {
        position: "relative",
    },
    removeButton: {
        position: "absolute",
        top: 12,
        right: 12,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "rgba(255,255,255,0.9)",
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
});
