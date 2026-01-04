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

export default function LoginScreen() {
    const router = useRouter();
    const { login, isLoading, error, clearError } = useAuthStore();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const handleLogin = async () => {
        if (!email.trim() || !password.trim()) {
            Alert.alert("Error", "Please enter both email and password");
            return;
        }

        const success = await login({ email: email.trim(), password });

        if (!success && error) {
            Alert.alert("Login Failed", error);
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
            >
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.iconContainer}>
                        <Ionicons name="football-outline" size={60} color={Colors.primary} />
                    </View>
                    <Text style={styles.title}>Book a Game</Text>
                    <Text style={styles.subtitle}>Book your favorite courts instantly</Text>
                </View>

                {/* Form */}
                <View style={styles.form}>
                    <Text style={styles.welcomeText}>Welcome Back</Text>
                    <Text style={styles.descriptionText}>
                        Sign in to continue booking
                    </Text>

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
                            placeholder="Email"
                            placeholderTextColor={Colors.grey}
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoComplete="email"
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
                            placeholder="Password"
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

                    {/* Login Button */}
                    <TouchableOpacity
                        style={[styles.loginButton, isLoading && styles.buttonDisabled]}
                        onPress={handleLogin}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.loginButtonText}>Sign In</Text>
                        )}
                    </TouchableOpacity>

                    {/* Divider */}
                    <View style={styles.divider}>
                        <View style={styles.dividerLine} />
                        <Text style={styles.dividerText}>or</Text>
                        <View style={styles.dividerLine} />
                    </View>

                    {/* Register Link */}
                    <TouchableOpacity
                        style={styles.registerButton}
                        onPress={() => router.push("/(auth)/register")}
                    >
                        <Text style={styles.registerButtonText}>
                            Don't have an account?{" "}
                            <Text style={styles.registerLink}>Sign Up</Text>
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
        justifyContent: "center",
        padding: 24,
    },
    header: {
        alignItems: "center",
        marginBottom: 40,
    },
    iconContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: Colors.lightGrey || "#f5f5f5",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 16,
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
    form: {
        width: "100%",
    },
    welcomeText: {
        fontFamily: "mon-sb",
        fontSize: 24,
        color: Colors.dark,
        marginBottom: 8,
    },
    descriptionText: {
        fontFamily: "mon",
        fontSize: 14,
        color: Colors.grey,
        marginBottom: 24,
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
    loginButton: {
        backgroundColor: Colors.primary,
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: "center",
        marginTop: 8,
    },
    buttonDisabled: {
        opacity: 0.7,
    },
    loginButtonText: {
        fontFamily: "mon-sb",
        fontSize: 16,
        color: "#fff",
    },
    divider: {
        flexDirection: "row",
        alignItems: "center",
        marginVertical: 24,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: Colors.lightGrey || "#e0e0e0",
    },
    dividerText: {
        fontFamily: "mon",
        fontSize: 14,
        color: Colors.grey,
        marginHorizontal: 16,
    },
    registerButton: {
        alignItems: "center",
    },
    registerButtonText: {
        fontFamily: "mon",
        fontSize: 14,
        color: Colors.grey,
    },
    registerLink: {
        fontFamily: "mon-sb",
        color: Colors.primary,
    },
});
