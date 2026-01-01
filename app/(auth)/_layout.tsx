import { Stack } from "expo-router";
import Colors from "@/constants/Colors";

export default function AuthLayout() {
    return (
        <Stack
            screenOptions={{
                headerStyle: {
                    backgroundColor: Colors.primary,
                },
                headerTintColor: "#fff",
                headerTitleStyle: {
                    fontFamily: "mon-sb",
                },
            }}
        >
            <Stack.Screen
                name="login"
                options={{
                    title: "Welcome Back",
                    headerShown: false,
                }}
            />
            <Stack.Screen
                name="register"
                options={{
                    title: "Create Account",
                    headerShown: false,
                }}
            />
        </Stack>
    );
}
