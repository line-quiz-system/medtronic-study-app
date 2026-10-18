import React from "react";
import { EcgLoader } from "@/components/EcgLoader";

export default function Loading() {
  return <EcgLoader message="心電図・体外循環モニタを準備中..." fullScreen />;
}
