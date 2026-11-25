import type { Metadata } from "next";
import BuatForm from "@/components/buat/BuatForm";

export const metadata: Metadata = {
  title: "Isi biodata — Buat portofolio",
  description: "Isi biodata kamu — nama, pendidikan, pengalaman, proyek, keahlian, sertifikasi, pencapaian, dan bahasa — untuk membuat website portofolio sendiri.",
};

// Langkah 1 alur baru: isi biodata dalam satu halaman
// panjang. Data tersimpan otomatis di browser, lalu
// dilanjutkan ke halaman konfirmasi (/buat/konfirmasi).
export default function BuatPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-12 sm:py-16">
      <div className="fade-up">
        <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-faint">Langkah 1 dari 4 — Isi biodata</p>
        <h1 className="mt-4 text-4xl leading-[1.05] tracking-[-0.04em] sm:text-5xl">Isi biodata kamu</h1>
        <p className="mt-4 max-w-xl text-lg leading-relaxed text-muted">
          Isi sebanyak yang kamu bisa — bagian yang kosong tidak akan tampil
          di portofolio. Data tersimpan otomatis di browser kamu.
        </p>
      </div>
      <div className="fade-up mt-10" style={{ animationDelay: "100ms" }}>
        <BuatForm />
      </div>
    </main>
  );
}
