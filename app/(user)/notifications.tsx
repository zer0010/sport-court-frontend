import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    Switch,
    ScrollView,
    TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import Colors from "@/constants/Colors";

export default function NotificationsPage() {
    const router = useRouter();
    const [pushEnabled, setPushEnabled] = useState(true);
    const [emailEnabled, setEmailEnabled] = useState(true);
    const [promoEnabled, setPromoEnabled] = useState(false);

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={Colors.dark} />
                </TouchableOpacity>
                <Text style={styles.title}>Notifications</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.section}>
                    <Text style={styles.sectionHeader}>General</Text>

                    <View style={styles.item}>
                        <View style={styles.itemInfo}>
                            <Text style={styles.itemTitle}>Push Notifications</Text>
                            <Text style={styles.itemSubtitle}>Receive booking updates and reminders</Text>
                        </View>
                        <Switch
                            value={pushEnabled}
                            onValueChange={setPushEnabled}
                            trackColor={{ false: Colors.lightGrey, true: Colors.primary }}
                        />
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.item}>
                        <View style={styles.itemInfo}>
                            <Text style={styles.itemTitle}>Email Notifications</Text>
                            <Text style={styles.itemSubtitle}>Receive booking confirmations via email</Text>
                        </View>
                        <Switch
                            value={emailEnabled}
                            onValueChange={setEmailEnabled}
                            trackColor={{ false: Colors.lightGrey, true: Colors.primary }}
                        />
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionHeader}>Marketing</Text>

                    <View style={styles.item}>
                        <View style={styles.itemInfo}>
                            <Text style={styles.itemTitle}>Promotions & Offers</Text>
                            <Text style={styles.itemSubtitle}>Get notified about new venues and deals</Text>
                        </View>
                        <Switch
                            value={promoEnabled}
                            onValueChange={setPromoEnabled}
                            trackColor={{ false: Colors.lightGrey, true: Colors.primary }}
                        />
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
        paddingTop: 50,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: Colors.lightGrey || "#e0e0e0",
    },
    backButton: {
        padding: 4,
    },
    title: {
        fontFamily: "mon-sb",
        fontSize: 18,
        color: Colors.dark,
    },
    content: {
        padding: 24,
    },
    section: {
        marginBottom: 32,
    },
    sectionHeader: {
        fontFamily: "mon-sb",
        fontSize: 14,
        color: Colors.grey,
        marginBottom: 16,
        textTransform: "uppercase",
        letterSpacing: 1,
    },
    item: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 8,
    },
    itemInfo: {
        flex: 1,
        paddingRight: 16,
    },
    itemTitle: {
        fontFamily: "mon-sb",
        fontSize: 16,
        color: Colors.dark,
        marginBottom: 4,
    },
    itemSubtitle: {
        fontFamily: "mon",
        fontSize: 12,
        color: Colors.grey,
    },
    divider: {
        height: 1,
        backgroundColor: Colors.lightGrey || "#e0e0e0",
        marginVertical: 16,
    },
});
