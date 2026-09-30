import { TextInput, type TextInputProps } from "react-native";
import { cn } from "@/src/lib/cn";

export function Input({ className, ...props }: TextInputProps & { className?: string }) {
  return (
    <TextInput
      placeholderTextColor="#8F806D"
      selectionColor="#D05E3E"
      textAlignVertical={props.multiline ? "top" : "center"}
      className={cn(
        "min-h-[52px] border border-border bg-card-strong px-4 py-3 font-mono text-base text-foreground",
        className
      )}
      {...props}
    />
  );
}
