import React, { memo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { defaultStyles } from "@/constants/Styles";
import Colors from "@/constants/Colors";
import { VenueListItem } from "@/interfaces/types";

interface Props {
    venues: VenueListItem[];
}

const VenuesMap = memo(({ venues }: Props) => {
    return (
        <View style={[defaultStyles.container, styles.container]}>
            <Text style={styles.text}>Map view is not available on web yet.</Text>
            <Text style={styles.subText}>
                Please switch to "List" view or use a mobile device.
            </Text>
            {venues.length > 0 && (
                <Text style={styles.info}>
                    {venues.length} venues loaded
                </Text>
            )}
        </View>
    );
});

// Alias for backward compatibility if needed, matching the native export
const ListingsMap = memo(({ listingData }: { listingData: any[] }) => {
    return <VenuesMap venues={[]} />;
});

export { VenuesMap };
export default ListingsMap;

const styles = StyleSheet.create({
    container: {
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f0f0f0",
    },
    text: {
        fontFamily: "mon-sb",
        fontSize: 16,
        color: Colors.dark,
        marginBottom: 8,
    },
    subText: {
        fontFamily: "mon",
        fontSize: 14,
        color: Colors.grey,
    },
    info: {
        marginTop: 16,
        fontFamily: "mon",
        fontSize: 12,
        color: Colors.primary,
    }
});
