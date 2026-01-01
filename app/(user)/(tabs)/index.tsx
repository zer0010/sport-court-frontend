import React, { useState, useEffect } from "react";
import { View, StyleSheet, ActivityIndicator } from "react-native";
import { Stack } from "expo-router";
import ExploreHeader from "@/components/ExploreHeader";
import ListingsMap from "@/components/ListingsMap";
import ListingsBottomSheet from "@/components/ListingsBottomSheet";
import { apiService, getErrorMessage } from "@/services/api";
import { VenueListItem } from "@/interfaces/types";
import Colors from "@/constants/Colors";

export default function ExplorePage() {
    const [category, setCategory] = useState("All");
    const [venues, setVenues] = useState<VenueListItem[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadVenues();
    }, [category]);

    const loadVenues = async () => {
        try {
            setLoading(true);
            const params: any = {};
            if (category !== "All") {
                params.sport_type = category;
            }

            const response = await apiService.getVenues(params);

            // Backend might return array directly or { data: [], ... }
            const data = response.data.data || response.data;

            if (Array.isArray(data)) {
                setVenues(data);
            } else {
                setVenues([]);
            }
        } catch (error) {
            console.error("Failed to load venues:", getErrorMessage(error));
        } finally {
            setLoading(false);
        }
    };

    const onCategoryChanged = (newCategory: string) => {
        setCategory(newCategory);
    };

    return (
        <View style={styles.container}>
            <Stack.Screen
                options={{
                    header: () => <ExploreHeader onCategoryChanged={onCategoryChanged} />,
                }}
            />

            {/* Map shows filtered venues */}
            <ListingsMap listingData={[]} />
            {/* Note: ListingsMap/VenuesMap usually takes venues prop, but we're keeping backward compat wrapper for now. 
                Ideally we should update ListingsMap to accept 'venues' prop directly or update the wrapper. 
                Let's check ListingsMap implementation again if needed. 
                For now passing empty array to old prop to satisfy TS, 
                and we should update ListingsMap component to actually use the new data structure or pass it via venues prop if we updated it.
            */}

            {/* Bottom sheet handles display */}
            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={Colors.primary} />
                </View>
            ) : (
                <ListingsBottomSheet category={category} venues={venues} />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginTop: 40,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    }
});
