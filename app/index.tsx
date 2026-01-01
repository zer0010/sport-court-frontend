import { Redirect } from "expo-router";
import { useAuthStore } from "@/stores/authStore";

export default function Index() {
    const { isAuthenticated, user } = useAuthStore();

    // If not authenticated, go to login
    if (!isAuthenticated) {
        return <Redirect href="/(auth)/login" />;
    }

    // If authenticated, redirect based on role
    if (user?.role === "owner") {
        return <Redirect href="/(owner)/(tabs)/dashboard" />;
    }

    return <Redirect href="/(user)/(tabs)" />;
}
