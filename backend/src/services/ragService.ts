// Service RAG: cau noi giua api va cac ham loi trong src/rag/
import { ask as askTaiLieu, type AskResult } from '../rag/ragPipeline.js'
import { askData as askSoLieu, type AskDataResult } from '../rag/sqlAgent.js'
import { countChunks, listFiles } from '../rag/vectorStore.js'

// Hoi tai lieu huong dan (RAG) - moi vai tro. Loc tai lieu theo vai_tro nguoi hoi.
export async function ask(cauHoi: string, vaiTro: string): Promise<AskResult> {
  return askTaiLieu(cauHoi, vaiTro)
}

// Hoi so lieu (SQL agent) - chi can bo xa.
export async function askData(cauHoi: string): Promise<AskDataResult> {
  return askSoLieu(cauHoi)
}

// Trang thai kho tri thuc.
export async function status(): Promise<{ totalChunks: number; files: { file: string; count: number }[] }> {
  const [totalChunks, files] = await Promise.all([countChunks(), listFiles()])
  return { totalChunks, files }
}
