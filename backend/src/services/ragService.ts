// Service RAG: cau noi giua controller va cac ham loi trong src/rag/
import { ask, type AskResult } from '../rag/ragPipeline.js'
import { askData, type AskDataResult } from '../rag/sqlAgent.js'
import { countChunks, listFiles } from '../rag/vectorStore.js'

// Hoi tai lieu huong dan (RAG) - moi vai tro. Loc tai lieu theo vai_tro nguoi hoi.
export async function hoiTaiLieu(cauHoi: string, vaiTro: string): Promise<AskResult> {
  return ask(cauHoi, vaiTro)
}

// Hoi so lieu (SQL agent) - chi can bo xa.
export async function hoiSoLieu(cauHoi: string): Promise<AskDataResult> {
  return askData(cauHoi)
}

// Trang thai kho tri thuc.
export async function trangThai(): Promise<{ totalChunks: number; files: { file: string; count: number }[] }> {
  const [totalChunks, files] = await Promise.all([countChunks(), listFiles()])
  return { totalChunks, files }
}
