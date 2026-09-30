import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import "react-native-reanimated";
import "../global.css";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) SplashScreen.hideAsync();
  }, [loaded]);

  if (!loaded) return null;

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: "#15130F" },
          headerShadowVisible: false,
          headerTintColor: "#E0BE83",
          headerTitleStyle: { fontFamily: "SpaceMono", fontSize: 14 },
          headerBackTitle: "VOLTAR",
          contentStyle: { backgroundColor: "#0B0B09" },
        }}
      >
        <Stack.Screen name="index" options={{ title: "> KNP_TERMINAL" }} />
        <Stack.Screen name="create" options={{ title: "> NOVO_AGENTE" }} />
        <Stack.Screen name="sheet/[id]" options={{ title: "> REGISTRO_AGENTE" }} />
        <Stack.Screen name="homebrew" options={{ title: "> ARQUIVO_HOMEBREW" }} />
      </Stack>
    </SafeAreaProvider>
  );
}
