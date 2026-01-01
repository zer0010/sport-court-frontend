import React from "react";
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    RefreshControl,
    Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/Colors";
import { useRouter } from "expo-router";

export default function VenuesPage() {
    const router = useRouter();
    const [refreshing, setRefreshing] = React.useState(false);

    // TODO: Fetch from API in Phase 3
    const venues: any[] = [];
    const isLoading = false;

    const onRefresh = async () => {
        setRefreshing(true);
        // TODO: Fetch venues from API
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setRefreshing(false);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "approved":
                return "#4CAF50";
            case "pending":
                return "#FF9800";
            case "rejected":
                return "#F44336";
            default:
                return Colors.grey;
        }
    };

    const renderVenueCard = ({ item }: { item: any }) => (
        <TouchableOpacity
            style={styles.venueCard}
            onPress={() => {
                // TODO: Navigate to venue details/edit
            }}
        >
            <View style={styles.venueImageContainer}>
                {item.main_photo ? (
                    <Image source={{ uri: item.main_photo }} style={styles.venueImage} />
                ) : (
                    <View style={styles.venueImagePlaceholder}>
                        <Ionicons name="business-outline" size={32} color={Colors.grey} />
                    </View>
                )}
                <View
                    style={[
                        styles.statusBadge,
                        { backgroundColor: getStatusColor(item.status) },
                    ]}
                >
                    <Text style={styles.statusText}>{item.status}</Text>
                </View>
            </View>

            <View style={styles.venueInfo}>
                <Text style={styles.venueName}>{item.name}</Text>
                <Text style={styles.venueAddress} numberOfLines={1}>
                    {item.address}
                </Text>
                <View style={styles.venueStats}>
                    <View style={styles.statItem}>
                        <Ionicons name="tennisball-outline" size={14} color={Colors.grey} />
                        <Text style={styles.statText}>{item.courts_count || 0} Courts</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Ionicons name="star" size={14} color="#FFB800" />
                        <Text style={styles.statText}>
                            {item.rating?.toFixed(1) || "N/A"} ({item.review_count || 0})
                        </Text>
                    </View>
                </View>
            </View>

            <Ionicons name="chevron-forward" size={20} color={Colors.grey} />
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            {/* Add Venue Button */}
            <TouchableOpacity
                style={styles.addVenueButton}
                onPress={() => {
                    // TODO: Navigate to add venue form
                }}
            >
                <Ionicons name="add-circle-outline" size={24} color={Colors.primary} />
                <Text style={styles.addVenueText}>Add New Venue</Text>
            </TouchableOpacity>

            {venues.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <View style={styles.emptyIconContainer}>
                        <Ionicons name="business-outline" size={64} color={Colors.grey} />
                    </View>
                    <Text style={styles.emptyTitle}>No venues yet</Text>
                    <Text style={styles.emptyDescription}>
                        Add your first venue to start receiving bookings
                    </Text>
                    <TouchableOpacity
                        style={styles.emptyButton}
                        onPress={() => {
                            // TODO: Navigate to add venue form
                        }}
                    >
                        <Text style={styles.emptyButtonText}>Add Venue</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <FlatList
                    data={venues}
                    keyExtractor={(item) => item.id}
                    renderItem={renderVenueCard}
                    contentContainerStyle={styles.listContent}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={[Colors.primary]}
                        />
                    }
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },
    addVenueButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        margin: 16,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: Colors.primary,
        borderStyle: "dashed",
        gap: 8,
    },
    addVenueText: {
        fontFamily: "mon-sb",
        fontSize: 16,
        color: Colors.primary,
    },
    listContent: {
        padding: 16,
        paddingTop: 0,
    },
    venueCard: {
        flexDirection: "row",
        alignItems: "center",
        padding: 12,
        backgroundColor: "#fff",
        borderRadius: 12,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: Colors.lightGrey || "#e0e0e0",
    },
    venueImageContainer: {
        position: "relative",
    },
    venueImage: {
        width: 80,
        height: 80,
        borderRadius: 8,
    },
    venueImagePlaceholder: {
        width: 80,
        height: 80,
        borderRadius: 8,
        backgroundColor: Colors.lightGrey || "#f5f5f5",
        justifyContent: "center",
        alignItems: "center",
    },
    statusBadge: {
        position: "absolute",
        top: 4,
        left: 4,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    statusText: {
        fontFamily: "mon-sb",
        fontSize: 8,
        color: "#fff",
        textTransform: "uppercase",
    },
    venueInfo: {
        flex: 1,
        marginLeft: 12,
    },
    venueName: {
        fontFamily: "mon-sb",
        fontSize: 16,
        color: Colors.dark,
        marginBottom: 4,
    },
    venueAddress: {
        fontFamily: "mon",
        fontSize: 12,
        color: Colors.grey,
        marginBottom: 8,
    },
    venueStats: {
        flexDirection: "row",
        gap: 16,
    },
    statItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    statText: {
        fontFamily: "mon",
        fontSize: 12,
        color: Colors.grey,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
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
        marginBottom: 24,
    },
    emptyButton: {
        backgroundColor: Colors.primary,
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    emptyButtonText: {
        fontFamily: "mon-sb",
        fontSize: 16,
        color: "#fff",
    },
});
