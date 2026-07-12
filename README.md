# Ba Na SmartLink

Nền tảng web hỗ trợ quy trình kê khai & báo cáo từ dân → thôn → xã cho xã Bà Nà (10 thôn, ~25.000 dân).

## 3 loại người dùng

- **Dân (chủ hộ):** Kê khai dữ liệu hộ gia đình theo quý. Rất yếu công nghệ → giao diện phải cực kỳ đơn giản.
- **Cán bộ thôn:** Duyệt dữ liệu dân, nhập thủ công CT của thôn, nộp lên xã.
- **Cán bộ xã:** Tạo đợt kê khai, theo dõi tiến độ 10 thôn, tổng hợp báo cáo, xuất file.

## Luồng chính

```
Xã tạo đợt kê khai → Thông báo qua web + Zalo OA
→ Dân kê khai (lần sau: xác nhận giữ nguyên hoặc sửa)
→ Thôn duyệt + nhập thủ công CT của thôn
→ Xã tổng hợp 10 thôn → Xuất báo cáo Excel/Word/PDF + biểu đồ
```

## Chỉ tiêu kê khai (CT01-CT14)

- Hệ thống tự tính: CT01
- Dân nhập: CT02, CT03, CT04, CT05, CT06, CT07, CT08, CT10, CT11
- Cán bộ thôn nhập: CT09, CT12, CT13, CT14

## Tính năng chính

- Kê khai định kỳ (theo quý) + kê khai đột xuất (xã tạo nhiệm vụ bất kỳ lúc nào)
- Lần kê khai sau: giữ dữ liệu lần trước, dân xác nhận hoặc sửa
- AI kiểm tra dữ liệu bất thường, thiếu, sai định dạng
- Dashboard tiến độ (thôn xem dân, xã xem thôn)
- Thông báo nhắc việc qua web + Zalo OA
- Chatbot AI (RAG) cho thôn và xã tra cứu dữ liệu
- Xuất báo cáo Excel, Word, PDF, biểu đồ
- Kho dữ liệu số dùng chung tích lũy qua các quý
- Quản lý danh sách hộ dân (thêm hộ mới, đánh dấu hộ rời xã, cập nhật thông tin)

## Công nghệ

- Frontend: React + Tailwind CSS
- Backend: Supabase
- AI: RAG chatbot
- Thông báo: Zalo OA API

## Cách chạy

```bash
npm install
npm run dev
```

## Cấu trúc thư mục

```
src/
  pages/       → các trang
  components/  → phần dùng chung
  lib/         → kết nối Supabase, API
  hooks/       → custom hooks
```

## Tài liệu chi tiết

Đọc các file trong docs/ trước khi code:
- docs/user_profile.md — Thông tin người dùng, cách giao tiếp
- docs/project_overview.md — Thực trạng, giải pháp, đối tượng, kết quả đầu ra
- docs/project_data_flow.md — Luồng dân→thôn→xã, bảng CT01-CT14
- docs/project_criteria.md — 7 tiêu chí chấm điểm cuộc thi
- docs/design.md — Thiết kế giao diện: màu sắc, bố cục, danh sách trang, nguyên tắc UX, components dùng chung

## Quy tắc code

- Tên biến, tên hàm viết tiếng Việt không dấu (VD: soHoDan, nopBaoCao)
- Component viết PascalCase (VD: TrangChu.jsx, BieuMau.jsx)
- Giao diện đẹp mắt NHƯNG dễ dùng cho người yếu công nghệ
- Responsive (hỗ trợ điện thoại)
- Không thêm tính năng ngoài yêu cầu

## Quy trình làm việc

- Trước khi code: nêu lại cách hiểu → nêu plan → Khôi đồng ý → mới code
