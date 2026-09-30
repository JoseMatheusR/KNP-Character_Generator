import { Pressable, Text, type PressableProps } from "react-native";
import { cn } from "@/src/lib/cn";

type Variant = "default" | "outline" | "ghost" | "destructive";

interface Props extends PressableProps {
  label: string;
  variant?: Variant;
  className?: string;
  textClassName?: string;
}

export function Button({
  label,
  variant = "default",
  className,
  textClassName,
  disabled,
  style,
  ...props
}: Props) {
  const base = "min-h-[52px] flex-row items-center justify-center border px-5 py-3";
  const variants: Record<Variant, string> = {
    default: "border-primary bg-primary",
    outline: "border-border bg-card-strong",
    ghost: "border-transparent bg-transparent",
    destructive: "border-destructive bg-destructive",
  };
  const textVariants: Record<Variant, string> = {
    default: "text-background",
    outline: "text-foreground",
    ghost: "text-muted-foreground",
    destructive: "text-background",
  };

  return (
    <Pressable
      className={cn(base, variants[variant], disabled && "opacity-40", className)}
      disabled={disabled}
      android_ripple={{ color: "rgba(255,255,255,0.12)" }}
      style={(state) => [
        typeof style === "function" ? style(state) : style,
        state.pressed && !disabled ? { opacity: 0.72, transform: [{ scale: 0.99 }] } : null,
      ]}
      {...props}
    >
      <Text className={cn("font-mono text-sm font-bold uppercase tracking-wider", textVariants[variant], textClassName)}>
        {variant === "ghost" ? label : `[ ${label} ]`}
      </Text>
    </Pressable>
  );
}
