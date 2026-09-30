import { useEffect, useRef } from "react";
import { ActivityIndicator, Alert, Modal, Pressable, Text, View } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { DecodedCharacterQr } from "@/src/lib/characterQr";
import { decodeCharacterQr } from "@/src/lib/characterQr";
import { Button } from "@/src/components/ui/Button";

interface Props {
  visible: boolean;
  onClose: () => void;
  onImport: (sheet: DecodedCharacterQr) => void;
}

export function CharacterQrScanner({ visible, onClose, onImport }: Props) {
  const insets = useSafeAreaInsets();
  const [permission, requestPermission] = useCameraPermissions();
  const locked = useRef(false);

  useEffect(() => {
    if (visible) locked.current = false;
  }, [visible]);

  const scan = ({ data }: { data: string }) => {
    if (locked.current) return;
    locked.current = true;
    try {
      onImport(decodeCharacterQr(data));
    } catch (error) {
      const message = error instanceof Error ? error.message : "Tente de novo.";
      Alert.alert("QR inválido", message, [{ text: "Tentar de novo", onPress: () => { locked.current = false; } }]);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" statusBarTranslucent onRequestClose={onClose}>
      <View className="flex-1 bg-background">
        {!permission ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator color="#D05E3E" />
          </View>
        ) : permission.granted ? (
          <CameraView
            style={{ flex: 1 }}
            facing="back"
            barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
            onBarcodeScanned={scan}
          />
        ) : (
          <View className="flex-1 items-center justify-center gap-4 px-6">
            <Text className="text-center font-display text-xl font-bold text-foreground">Câmera para importar</Text>
            <Text className="text-center font-mono text-sm leading-5 text-muted-foreground">
              A câmera lê o QR de uma ficha mostrada em outro celular.
            </Text>
            <Button label="Permitir câmera" onPress={() => requestPermission()} />
          </View>
        )}
        <View className="absolute left-4 right-4" style={{ bottom: Math.max(insets.bottom, 16) }}>
          <Pressable className="min-h-[52px] items-center justify-center border border-border bg-card" onPress={onClose}>
            <Text className="font-mono text-sm font-bold uppercase tracking-wider text-foreground">[ Fechar ]</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
