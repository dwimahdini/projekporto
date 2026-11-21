// Hapus file upload milik satu order dari Supabase Storage.
// Dipakai penghapusan data klien (Tahap 7) — file tidak
// boleh tertinggal setelah data dihapus.
import { createAdminClient } from "./supabase/server";

export async function deleteOrderFiles(orderId: string): Promise<void> {
  try {
    const supabase = createAdminClient();
    const { data: files } = await supabase.storage.from("portfolio-uploads").list(orderId);
    if (!files || files.length === 0) return;
    const paths = files.map((f) => `${orderId}/${f.name}`);
    const { error } = await supabase.storage.from("portfolio-uploads").remove(paths);
    if (error) console.error("[storage-cleanup] gagal hapus file order", orderId, error);
  } catch (e) {
    console.error("[storage-cleanup] gagal", e);
  }
}
