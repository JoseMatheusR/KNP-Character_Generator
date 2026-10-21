import { useEffect, useState } from "react";
import { Modal, Pressable, Text, View } from "react-native";
import QRCode from "react-native-qrcode-svg";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { Character } from "@/src/domain/character";
import { encodeCharacterQr } from "@/src/lib/characterQr";
import { loadHomebrew } from "@/src/storage/homebrew";
import { Button } from "@/src/components/ui/Button";

interface Props {
  character: Character | null;
  onClose: () => void;
}

export function CharacterQrModal({ character, onClose }: Props) {
  const insets = useSafeAreaInsets();
  const [loaded, setLoaded] = useState<{ character: Character; value: string } | null>(null);
  const value = !character ? null : loaded?.character === character ? loaded.value : encodeCharacterQr(character);
  const tooBig = (value?.length ?? 0) > 2400;

  useEffect(() => {
    if (!character) return;
    let active = true;
    loadHomebrew()
      .then((items) => {
        if (active) setLoaded({ character, value: encodeCharacterQr(character, items) });
      })
      .catch(() => {
        if (active) setLoaded({ character, value: encodeCharacterQr(character) });
      });
    return () => {
      active = false;
    };
  }, [character]);

  return (
    <Modal visible={!!character} transparent animationType="fade" statusBarTranslucent onRequestClose={onClose}>
      <Pressable className="flex-1 items-center justify-center bg-black/80 px-6" onPress={onClose}>
        <Pressable
          className="w-full max-w-[420px] border border-border bg-card px-5 py-5"
          style={{ marginBottom: insets.bottom }}
          onPress={() => undefined}
        >
          <Text className="font-display text-xl font-bold text-foreground">Compartilhar ficha</Text>
          <Text className="mt-2 font-mono text-sm leading-5 text-muted-foreground">
            Mostre este QR para outro celular com o app aberto em Importar QR.
          </Text>
          {value && !tooBig ? (
            <View className="my-5 items-center bg-white p-4">
              <QRCode value={value} size={240} ecl="L" backgroundColor="#ffffff" color="#111111" />
            </View>
          ) : (
            <Text className="my-5 font-mono text-sm leading-5 text-muted-foreground">
              {tooBig
                ? "Esta ficha, com o homebrew, não cabe num QR. Use o backup do arquivo."
                : "Preparando o QR."}
            </Text>
          )}
          <Text className="mb-4 text-center font-mono text-sm text-foreground">{character?.name}</Text>
          <Button label="Fechar" variant="outline" onPress={onClose} />
        </Pressable>
      </Pressable>
    </Modal>
  );
}
