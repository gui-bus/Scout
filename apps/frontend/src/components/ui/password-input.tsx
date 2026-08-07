"use client";

import { Icon } from "@iconify/react";
import * as React from "react";
import { Input } from "./input";
import { cn } from "@/lib/utils";

export interface PasswordRule {
  id: string;
  label: string;
  validate: (value: string) => boolean;
}

export interface PasswordInputProps
  extends Omit<React.ComponentPropsWithoutRef<typeof Input>, "type"> {
  minLength?: number;
  requireUppercase?: boolean;
  requireLowercase?: boolean;
  requireNumber?: boolean;
  requireSymbol?: boolean;
  customRules?: PasswordRule[];
  showRequirements?: "always" | "on-focus" | "never";
  showStrengthMeter?: boolean;
  onValidityChange?: (isValid: boolean) => void;
}

const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  (
    {
      className,
      minLength = 8,
      requireUppercase = true,
      requireLowercase = true,
      requireNumber = true,
      requireSymbol = true,
      customRules,
      showRequirements = "on-focus",
      showStrengthMeter = true,
      onValidityChange,
      value,
      defaultValue,
      onChange,
      onFocus,
      onBlur,
      ...props
    },
    ref,
  ) => {
    const [internalValue, setInternalValue] = React.useState(
      (value !== undefined
        ? value
        : defaultValue !== undefined
          ? defaultValue
          : ""
      )?.toString() || "",
    );
    const [isFocused, setIsFocused] = React.useState(false);

    const isControlled = value !== undefined;
    const currentValue = isControlled ? value.toString() : internalValue;

    const rules = React.useMemo(() => {
      const activeRules: PasswordRule[] = [];

      if (minLength > 0) {
        activeRules.push({
          id: "min-length",
          label: `Pelo menos ${minLength} caracteres`,
          validate: (val) => val.length >= minLength,
        });
      }
      if (requireUppercase) {
        activeRules.push({
          id: "uppercase",
          label: "Pelo menos uma letra maiúscula",
          validate: (val) => /[A-Z]/.test(val),
        });
      }
      if (requireLowercase) {
        activeRules.push({
          id: "lowercase",
          label: "Pelo menos uma letra minúscula",
          validate: (val) => /[a-z]/.test(val),
        });
      }
      if (requireNumber) {
        activeRules.push({
          id: "number",
          label: "Pelo menos um número",
          validate: (val) => /[0-9]/.test(val),
        });
      }
      if (requireSymbol) {
        activeRules.push({
          id: "symbol",
          label: "Pelo menos um caractere especial",
          validate: (val) => /[^A-Za-z0-9]/.test(val),
        });
      }

      if (customRules) {
        activeRules.push(...customRules);
      }

      return activeRules;
    }, [
      minLength,
      requireUppercase,
      requireLowercase,
      requireNumber,
      requireSymbol,
      customRules,
    ]);

    const ruleStatuses = React.useMemo(() => {
      return rules.map((rule) => ({
        ...rule,
        isValid: rule.validate(currentValue),
      }));
    }, [rules, currentValue]);

    const allValid = React.useMemo(() => {
      return ruleStatuses.every((r) => r.isValid);
    }, [ruleStatuses]);

    React.useEffect(() => {
      onValidityChange?.(allValid);
    }, [allValid, onValidityChange]);

    const strengthPercentage = React.useMemo(() => {
      if (rules.length === 0) return 0;
      const validCount = ruleStatuses.filter((r) => r.isValid).length;
      return Math.round((validCount / rules.length) * 100);
    }, [ruleStatuses, rules]);

    const strengthColor = React.useMemo(() => {
      if (strengthPercentage < 40) return "bg-rose-500";
      if (strengthPercentage < 80) return "bg-amber-500";
      return "bg-emerald-500";
    }, [strengthPercentage]);

    const strengthText = React.useMemo(() => {
      if (strengthPercentage === 0) return "Vazio";
      if (strengthPercentage < 40) return "Fraca";
      if (strengthPercentage < 80) return "Média";
      return "Forte";
    }, [strengthPercentage]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!isControlled) {
        setInternalValue(e.target.value);
      }
      onChange?.(e);
    };

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      onBlur?.(e);
    };

    const shouldShowRequirements =
      showRequirements === "always" ||
      (showRequirements === "on-focus" &&
        (isFocused || currentValue.length > 0));

    return (
      <div className={cn("w-full flex flex-col gap-2", className)}>
        <Input
          ref={ref}
          type="password"
          isPasswordToggle
          value={currentValue}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...props}
        />

        {shouldShowRequirements && rules.length > 0 && (
          <div className="w-full p-4 rounded-xl border border-border bg-card transition-all duration-300 animate-in fade-in slide-in-from-top-2">
            {showStrengthMeter && (
              <div className="mb-4">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-muted-foreground font-medium">
                    Força da Senha
                  </span>
                  <span
                    className={cn(
                      "font-semibold",
                      strengthPercentage < 40
                        ? "text-rose-500"
                        : strengthPercentage < 80
                          ? "text-amber-500"
                          : "text-emerald-500",
                    )}
                  >
                    {strengthText}
                  </span>
                </div>
                <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                  <div
                    className={cn(
                      "h-full transition-all duration-300",
                      strengthColor,
                    )}
                    style={{ width: `${strengthPercentage}%` }}
                  />
                </div>
              </div>
            )}

            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {ruleStatuses.map((rule) => (
                <li
                  key={rule.id}
                  className={cn(
                    "flex items-center gap-2 transition-colors duration-200",
                    rule.isValid
                      ? "text-emerald-600 dark:text-emerald-400"
                      : currentValue.length > 0
                        ? "text-rose-600 dark:text-rose-400"
                        : "text-muted-foreground",
                  )}
                >
                  <Icon
                    icon={
                      rule.isValid
                        ? "hugeicons:tick-02"
                        : currentValue.length > 0
                          ? "hugeicons:cancel-01"
                          : "hugeicons:circle"
                    }
                    className="size-4 shrink-0 transition-transform duration-300"
                  />
                  <span className="font-medium">{rule.label}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  },
);

PasswordInput.displayName = "PasswordInput";

export { PasswordInput };
