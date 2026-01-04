import React from "react";
import { View, StyleSheet } from "react-native";
import Skeleton from "@/components/ui/Skeleton";
import Colors from "@/constants/Colors";

const VenueCardSkeleton = () => {
    return (
        <View style={styles.container}>
            {/* Image Skeleton */}
            <Skeleton width="100%" height={280} borderRadius={12} />

            {/* Content Skeleton */}
            <View style={styles.content}>
                <View style={styles.row}>
                    <Skeleton width={150} height={20} />
                    <Skeleton width={40} height={20} />
                </View>
                <View style={styles.spacer} />
                <Skeleton width={200} height={16} />
                <View style={styles.spacer} />
                <View style={styles.row}>
                    <Skeleton width={80} height={16} />
                    <Skeleton width={60} height={16} />
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 20,
    },
    content: {
        marginTop: 10,
    },
    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    spacer: {
        height: 6,
    },
});

export default VenueCardSkeleton;
