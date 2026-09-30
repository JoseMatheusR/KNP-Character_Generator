import type { ReactNode } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
  type ScrollViewProps,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { cn } from "@/src/lib/cn";

interface ScreenProps extends ScrollViewProps {
  children: ReactNode;
  maxWidth?: number;
  contentClassName?: string;
  avoidKeyboard?: boolean;
}

export function Screen({
  children,
  maxWidth = 720,
  contentClassName,
  avoidKeyboard = false,
  ...props
}: ScreenProps) {
  const insets = useSafeAreaInsets();
  const content = (
    <ScrollView
      className="flex-1 bg-background"
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ flexGrow: 1 }}
      {...props}
    >
      <View
        className={cn("w-full self-center px-4 pt-4 gap-4", contentClassName)}
        style={{ maxWidth, paddingBottom: Math.max(insets.bottom, 16) + 20 }}
      >
        <PatternBand className="-mx-4 mb-1" />
        {children}
      </View>
    </ScrollView>
  );

  if (!avoidKeyboard) return content;

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-background"
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={96}
    >
      {content}
    </KeyboardAvoidingView>
  );
}

export function Card({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <View className={cn("relative border border-border bg-card p-4", className)}>
      <View pointerEvents="none" className="absolute -top-px left-3 h-px w-12 bg-primary" />
      <View pointerEvents="none" className="absolute -left-px top-3 h-8 w-px bg-primary" />
      {children}
    </View>
  );
}

export function PatternBand({ className }: { className?: string }) {
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      className={cn("h-7 justify-center overflow-hidden border-y border-border bg-primary-soft px-2", className)}
    >
      <Text
        accessible={false}
        numberOfLines={1}
        className="font-mono text-xs tracking-[3px] text-sand"
      >
        {"╱╲╱╲  △▽△▽  • • •  ╱╲╱╲  △▽△▽  • • •  ╱╲╱╲  △▽△▽"}
      </Text>
    </View>
  );
}

export function SectionHeading({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <View className="flex-row items-start justify-between gap-3">
      <View className="flex-1">
        <Text className="font-display text-sm font-bold uppercase tracking-wider text-foreground">
          <Text className="text-primary">{"> "}</Text>
          {title}
        </Text>
        {description ? (
          <Text className="mt-1 font-mono text-xs leading-5 text-muted-foreground">
            {description}
          </Text>
        ) : null}
        <Text
          accessible={false}
          numberOfLines={1}
          className="mt-2 font-mono text-[9px] tracking-[3px] text-border"
        >
          {"△▽△▽ · · · ──────────"}
        </Text>
      </View>
      {action}
    </View>
  );
}
