import { createFileRoute } from "@tanstack/react-router";
import { CommandCenter } from "@/ar/screen";

export const Route = createFileRoute("/")({
  component: CommandCenter,
});
