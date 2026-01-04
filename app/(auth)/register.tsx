import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    ActivityIndicator,
    Alert,
} from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/Colors";
import { useAuthStore } from "@/stores/authStore";

type Role = "user" | "owner";

export default function RegisterScreen() {
    const router = useRouter();
    const { registerUser, registerOwner, isLoading, error, clearError } = useAuthStore();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [selectedRole, setSelectedRole] = useState<Role>("user");

    const handleRegister = async () => {
        // Validation
        if (!name.trim() || !email.trim() || !password.trim()) {
            Alert.alert("Error", "Please fill in all required fields");
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert("Error", "Passwords do not match");
            return;
        }

        if (password.length < 6) {
            Alert.alert("Error", "Password must be at least 6 characters");
            return;
        }

        const registerData = {
            name: name.trim(),
            email: email.trim(),
            password,
            phone: phone.trim() || undefined,
        };

        let success: boolean;
        if (selectedRole === "owner") {
            success = await registerOwner(registerData);
        } else {
            success = await registerUser(registerData);
        }

        if (success) {
            // Show success message and redirect to login
            Alert.alert(
                "Registration Successful! 🎉",
                `Your ${selectedRole === "owner" ? "owner" : "player"} account has been created. Please log in with your credentials.`,
                [
                    {
                        text: "Go to Login",
                        onPress: () => router.replace("/(auth)/login"),
                    },
                ]
            );
        } else if (error) {
            Alert.alert("Registration Failed", error);
            clearError();
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                {/* Back Button */}
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => router.back()}
                >
                    <Ionicons name="arrow-back" size={24} color={Colors.dark} />
                </TouchableOpacity>

                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.title}>Create Account</Text>
                    <Text style={styles.subtitle}>
                        Join Book a Game to start booking
                    </Text>
                </View>

                {/* Role Selection */}
                <View style={styles.roleContainer}>
                    <Text style={styles.roleLabel}>I want to:</Text>
                    <View style={styles.roleButtons}>
                        <TouchableOpacity
                            style={[
                                styles.roleButton,
                                selectedRole === "user" && styles.roleButtonActive,
                            ]}
                            onPress={() => setSelectedRole("user")}
                        >
                            <Ionicons
                                name="person-outline"
                                size={24}
                                color={selectedRole === "user" ? "#fff" : Colors.primary}
                            />
                            <Text
                                style={[
                                    styles.roleButtonText,
                                    selectedRole === "user" && styles.roleButtonTextActive,
                                ]}
                            >
                                Book Courts
                            </Text>
                            <Text
                                style={[
                                    styles.roleDescription,
                                    selectedRole === "user" && styles.roleDescriptionActive,
                                ]}
                            >
                                As a Player
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[
                                styles.roleButton,
                                selectedRole === "owner" && styles.roleButtonActive,
                            ]}
                            onPress={() => setSelectedRole("owner")}
                        >
                            <Ionicons
                                name="business-outline"
                                size={24}
                                color={selectedRole === "owner" ? "#fff" : Colors.primary}
                            />
                            <Text
                                style={[
                                    styles.roleButtonText,
                                    selectedRole === "owner" && styles.roleButtonTextActive,
                                ]}
                            >
                                List Venues
                            </Text>
                            <Text
                                style={[
                                    styles.roleDescription,
                                    selectedRole === "owner" && styles.roleDescriptionActive,
                                ]}
                            >
                                As an Owner
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Form */}
                <View style={styles.form}>
                    {/* Name Input */}
                    <View style={styles.inputContainer}>
                        <Ionicons
                            name="person-outline"
                            size={20}
                            color={Colors.grey}
                            style={styles.inputIcon}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Full Name *"
                            placeholderTextColor={Colors.grey}
                            value={name}
                            onChangeText={setName}
                            autoCapitalize="words"
                        />
                    </View>

                    {/* Email Input */}
                    <View style={styles.inputContainer}>
                        <Ionicons
                            name="mail-outline"
                            size={20}
                            color={Colors.grey}
                            style={styles.inputIcon}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Email *"
                            placeholderTextColor={Colors.grey}
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoComplete="email"
                        />
                    </View>

                    {/* Phone Input */}
                    <View style={styles.inputContainer}>
                        <Ionicons
                            name="call-outline"
                            size={20}
                            color={Colors.grey}
                            style={styles.inputIcon}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Phone Number (optional)"
                            placeholderTextColor={Colors.grey}
                            value={phone}
                            onChangeText={setPhone}
                            keyboardType="phone-pad"
                        />
                    </View>

                    {/* Password Input */}
                    <View style={styles.inputContainer}>
                        <Ionicons
                            name="lock-closed-outline"
                            size={20}
                            color={Colors.grey}
                            style={styles.inputIcon}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Password *"
                            placeholderTextColor={Colors.grey}
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry={!showPassword}
                            autoCapitalize="none"
                        />
                        <TouchableOpacity
                            onPress={() => setShowPassword(!showPassword)}
                            style={styles.eyeIcon}
                        >
                            <Ionicons
                                name={showPassword ? "eye-outline" : "eye-off-outline"}
                                size={20}
                                color={Colors.grey}
                            />
                        </TouchableOpacity>
                    </View>

                    {/* Confirm Password Input */}
                    <View style={styles.inputContainer}>
                        <Ionicons
                            name="lock-closed-outline"
                            size={20}
                            color={Colors.grey}
                            style={styles.inputIcon}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Confirm Password *"
                            placeholderTextColor={Colors.grey}
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            secureTextEntry={!showPassword}
                            autoCapitalize="none"
                        />
                    </View>

                    {/* Register Button */}
                    <TouchableOpacity
                        style={[styles.registerButton, isLoading && styles.buttonDisabled]}
                        onPress={handleRegister}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.registerButtonText}>
                                Create {selectedRole === "owner" ? "Owner" : "Player"} Account
                            </Text>
                        )}
                    </TouchableOpacity>

                    {/* Login Link */}
                    <TouchableOpacity
                        style={styles.loginLink}
                        onPress={() => router.back()}
                    >
                        <Text style={styles.loginLinkText}>
                            Already have an account?{" "}
                            <Text style={styles.loginLinkHighlight}>Sign In</Text>
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },
    scrollContent: {
        flexGrow: 1,
        padding: 24,
        paddingTop: 60,
    },
    backButton: {
        position: "absolute",
        top: 50,
        left: 24,
        zIndex: 1,
        padding: 8,
    },
    header: {
        marginBottom: 24,
        marginTop: 20,
    },
    title: {
        fontFamily: "mon-b",
        fontSize: 28,
        color: Colors.dark,
        marginBottom: 8,
    },
    subtitle: {
        fontFamily: "mon",
        fontSize: 16,
        color: Colors.grey,
    },
    roleContainer: {
        marginBottom: 24,
    },
    roleLabel: {
        fontFamily: "mon-sb",
        fontSize: 16,
        color: Colors.dark,
        marginBottom: 12,
    },
    roleButtons: {
        flexDirection: "row",
        gap: 12,
    },
    roleButton: {
        flex: 1,
        padding: 16,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: Colors.primary,
        alignItems: "center",
    },
    roleButtonActive: {
        backgroundColor: Colors.primary,
        borderColor: Colors.primary,
    },
    roleButtonText: {
        fontFamily: "mon-sb",
        fontSize: 14,
        color: Colors.primary,
        marginTop: 8,
    },
    roleButtonTextActive: {
        color: "#fff",
    },
    roleDescription: {
        fontFamily: "mon",
        fontSize: 12,
        color: Colors.grey,
        marginTop: 4,
    },
    roleDescriptionActive: {
        color: "rgba(255,255,255,0.8)",
    },
    form: {
        width: "100%",
    },
    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: Colors.lightGrey || "#f5f5f5",
        borderRadius: 12,
        marginBottom: 16,
        paddingHorizontal: 16,
    },
    inputIcon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        fontFamily: "mon",
        fontSize: 16,
        color: Colors.dark,
        paddingVertical: 16,
    },
    eyeIcon: {
        padding: 4,
    },
    registerButton: {
        backgroundColor: Colors.primary,
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: "center",
        marginTop: 8,
    },
    buttonDisabled: {
        opacity: 0.7,
    },
    registerButtonText: {
        fontFamily: "mon-sb",
        fontSize: 16,
        color: "#fff",
    },
    loginLink: {
        alignItems: "center",
        marginTop: 24,
    },
    loginLinkText: {
        fontFamily: "mon",
        fontSize: 14,
        color: Colors.grey,
    },
    loginLinkHighlight: {
        fontFamily: "mon-sb",
        color: Colors.primary,
    },
});
