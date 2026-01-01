import { useFonts } from "expo-font";
import { SplashScreen, Slot } from "expo-router";
import { useEffect, useState } from "react";
import Colors from "@/constants/Colors";
import { ActivityIndicator, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useAuthStore } from "@/stores/authStore";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from "expo-router";

export const unstable_settings = {
  initialRouteName: "index",
};

export default function RootLayout() {
  const [loaded, error] = useFonts({
    mon: require("../assets/fonts/Montserrat-Regular.ttf"),
    "mon-b": require("../assets/fonts/Montserrat-Bold.ttf"),
    "mon-sb": require("../assets/fonts/Montserrat-SemiBold.ttf"),
  });

  const initialize = useAuthStore((state) => state.initialize);
  const isLoading = useAuthStore((state) => state.isLoading);
  const [isReady, setIsReady] = useState(false);

  // Handle font loading errors
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  // Initialize auth when fonts are loaded
  useEffect(() => {
    if (loaded) {
      initialize().then(() => {
        SplashScreen.hideAsync();
        setIsReady(true);
      });
    }
  }, [loaded, initialize]);

  // Show nothing while fonts are loading
  if (!loaded) {
    return null;
  }

  // Show loading spinner while auth is initializing
  if (!isReady || isLoading) {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fff" }}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </GestureHandlerRootView>
    );
  }

  // Use Slot to render child routes - this is the expo-router v6 recommended pattern
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Slot />
    </GestureHandlerRootView>
  );
}
