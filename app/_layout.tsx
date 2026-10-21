import { useFonts } from "expo-font";
import { DarkTheme, Stack, ThemeProvider } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import "react-native-reanimated";
import "../global.css";

const navigationTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: "#0B0B09",
    card: "#15130F",
    text: "#E0BE83",
    border: "#7D6C58",
    primary: "#D05E3E",
    notification: "#D05E3E",
  },
};

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
      <View style={{ flex: 1, backgroundColor: "#0B0B09" }}>
      <ThemeProvider value={navigationTheme}>
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
      </ThemeProvider>
      </View>
    </SafeAreaProvider>
  );
}
