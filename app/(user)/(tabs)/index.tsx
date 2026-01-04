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

            console.log(`Fetching venues for category: ${category}`);
            const response = await apiService.getVenues(params);

            // Backend might return array directly or { data: [], ... }
            const data = response.data.data || response.data;
            console.log(`Fetched ${Array.isArray(data) ? data.length : 0} venues`);

            if (Array.isArray(data)) {
                setVenues(data);
            } else if (data.venues && Array.isArray(data.venues)) {
                setVenues(data.venues);
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
            <ListingsMap listingData={venues} />

            {/* Bottom sheet handles display */}
            <ListingsBottomSheet category={category} venues={venues} loading={loading} />
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
