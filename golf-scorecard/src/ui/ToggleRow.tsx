import React from "react";
import { View, Text, Pressable } from "react-native";

export function ToggleRow(props: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <Pressable onPress={() => props.onChange(!props.value)}>
      <View className="flex-row items-center justify-between bg-slate-900 border border-slate-800 rounded-lg px-3 py-3">
        <Text className="text-white">{props.label}</Text>
        <Text className={props.value ? "text-emerald-400 font-semibold" : "text-slate-400"}>
          {props.value ? "✓" : "—"}
        </Text>
      </View>
    </Pressable>
  );
}