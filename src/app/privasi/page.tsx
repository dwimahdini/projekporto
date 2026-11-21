import { redirect } from "next/navigation";

// Rute lama — arahkan ke /kebijakan-privasi (Tahap 7).
export default function PrivasiPage() {
  redirect("/kebijakan-privasi");
}
