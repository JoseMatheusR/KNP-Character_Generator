import { Link, Stack } from "expo-router";
import { Text } from "react-native";
import { Card, Screen } from "@/src/components/ui/Screen";

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "> ERRO_404" }} />
      <Screen contentClassName="justify-center">
        <Card className="items-center gap-4 py-10">
          <Text className="font-mono text-xs font-bold tracking-widest text-destructive">ERRO // ROTA_NÃO_ENCONTRADA</Text>
          <Text className="font-display text-xl font-bold text-foreground">Este registro não existe.</Text>
          <Link href="/" style={{ paddingVertical: 14, paddingHorizontal: 18 }}>
            <Text className="font-mono text-sm font-bold text-primary">[ VOLTAR_AO_TERMINAL ]</Text>
          </Link>
        </Card>
      </Screen>
    </>
  );
}
