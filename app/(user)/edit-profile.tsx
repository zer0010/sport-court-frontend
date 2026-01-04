import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuthStore } from "@/stores/authStore";
import Colors from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function EditProfilePage() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { user, updateProfile, isLoading } = useAuthStore();

    const [name, setName] = useState(user?.name || "");
    const [phone, setPhone] = useState(user?.phone || "");
    const [submitting, setSubmitting] = useState(false);

    const handleSave = async () => {
        if (!name.trim()) {
            Alert.alert("Error", "Name is required");
            return;
        }

        try {
            setSubmitting(true);
            const success = await updateProfile({
                name: name.trim(),
                phone: phone.trim(),
            });

            if (success) {
                Alert.alert("Success", "Profile updated successfully!", [
                    { text: "OK", onPress: () => router.back() }
                ]);
            } else {
                // Error is handled in store but we can show generic
                // Alert.alert("Error", "Failed to update profile");
            }
        } catch (error) {
            Alert.alert("Error", "An unexpected error occurred");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={Colors.dark} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Edit Profile</Text>
                <View style={{ width: 24 }} />
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.content}>

                    {/* Input Fields */}
                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Full Name</Text>
                        <TextInput
                            style={styles.input}
                            value={name}
                            onChangeText={setName}
                            placeholder="Enter your full name"
                            placeholderTextColor={Colors.grey}
                        />
                    </View>

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Phone Number</Text>
                        <TextInput
                            style={styles.input}
                            value={phone}
                            onChangeText={setPhone}
                            placeholder="Enter your phone number"
                            placeholderTextColor={Colors.grey}
                            keyboardType="phone-pad"
                        />
                    </View>

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Email</Text>
                        <View style={[styles.input, styles.disabledInput]}>
                            <Text style={styles.disabledText}>{user?.email}</Text>
                        </View>
                        <Text style={styles.helperText}>Email cannot be changed.</Text>
                    </View>

                </ScrollView>

                {/* Footer Save Button */}
                <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
                    <TouchableOpacity
                        style={[styles.saveButton, submitting && styles.saveButtonDisabled]}
                        onPress={handleSave}
                        disabled={submitting}
                    >
                        {submitting ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.saveButtonText}>Save Changes</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: Colors.lightGrey || "#eee",
        backgroundColor: "#fff",
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        fontFamily: "mon-sb",
        fontSize: 18,
        color: Colors.dark,
    },
    content: {
        padding: 24,
    },
    formGroup: {
        marginBottom: 20,
    },
    label: {
        fontFamily: "mon-sb",
        fontSize: 14,
        color: Colors.dark,
        marginBottom: 8,
    },
    input: {
        height: 50,
        borderWidth: 1,
        borderColor: Colors.lightGrey || "#e0e0e0",
        borderRadius: 8,
        paddingHorizontal: 16,
        fontSize: 16,
        fontFamily: "mon",
        color: Colors.dark,
    },
    disabledInput: {
        backgroundColor: "#f5f5f5",
        justifyContent: "center",
    },
    disabledText: {
        color: Colors.grey,
    },
    helperText: {
        fontFamily: "mon",
        fontSize: 12,
        color: Colors.grey,
        marginTop: 6,
    },
    footer: {
        paddingHorizontal: 24,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: Colors.lightGrey || "#eee",
    },
    saveButton: {
        backgroundColor: Colors.primary,
        height: 50,
        borderRadius: 12,
        justifyContent: "center",
        alignItems: "center",
    },
    saveButtonDisabled: {
        backgroundColor: Colors.grey,
    },
    saveButtonText: {
        fontFamily: "mon-sb",
        fontSize: 16,
        color: "#fff",
    },
});
