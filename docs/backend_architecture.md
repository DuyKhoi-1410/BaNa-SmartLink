# Kiến trúc Backend (cập nhật 2026-07-12)

## Tổng quan
Backend Express 5 + PostgreSQL (Supabase) viết bằng TypeScript, chạy bằng `tsx`. Phân tầng chuẩn:
`api (router) → services (nghiệp vụ) → repositories (truy vấn DB) → db`

## Chạy
```bash
cd backend
npm run dev       # tsx watch src/index.ts, cổng 3636
npm run migrate   # DROP + tạo lại schema từ src/schema/migration.sql
npm run seed      # nạp dữ liệu mẫu theo USER DEMO.xlsx
npm run test:api  # test 41 case, 3 role + phân quyền 403
```

## Xác thực (JWT 2 token)
- **Access token** 30 phút (JWT_ACCESS_EXPIRES), **Refresh token** 7 ngày (JWT_REFRESH_EXPIRES).
- Refresh token lưu hash (sha256) trong bảng `refresh_token`, có thể thu hồi.
- Xoay vòng: mỗi lần /auth/refresh cấp cặp mới + thu hồi cái cũ (chống tái sử dụng).
- Đổi/quên mật khẩu → thu hồi toàn bộ phiên.
- Frontend tự refresh khi access hết hạn (401 TOKEN_EXPIRED → gọi /auth/refresh → retry).

## Response chuẩn (kiểu FastAPI)
- Thành công: `{ "success": true, "data": ... }`
- Lỗi: `{ "success": false, "error": { "code", "message", "detail"? } }`
- `AppError` + `asyncHandler` (src/utils/response.ts) → mọi route tôn trọng err.status.
- Mã lỗi: 400 BAD_REQUEST, 401 (NO_TOKEN/TOKEN_EXPIRED/TOKEN_INVALID), 403 FORBIDDEN, 404 NOT_FOUND, 409 CONFLICT, 422 VALIDATION_ERROR.

## Bảo mật
- IDOR: evidence GET/DELETE kiểm tra quyền sở hữu (dân=hộ mình, thôn=thôn mình, xã=tất cả).
- Get-before-delete + xoá file vật lý (evidence local) / Supabase Storage (attachments) khi xoá.
- Soft-delete có truy vết (nguoi_xoa_id, ngay_xoa).
- Mật khẩu mặc định lấy từ env, không hardcode.
- Log truy cập hồ sơ nhạy cảm: xem Detail nhân khẩu → ghi `nhat_ky_truy_cap` (ai/khi nào/IP/user-agent).

## Bảng DB mới thêm
- `refresh_token` — phiên đăng nhập, thu hồi.
- `nhat_ky_truy_cap` — log XEM hồ sơ nhạy cảm (CCCD/SĐT/địa chỉ).
- Trigger `set_updated_at` cho 9 bảng có updated_at.
- `nguoi_dung`: so_lan_dang_nhap_sai, khoa_den, lan_dang_nhap_cuoi, doi_mat_khau_luc.
- `ho_dan`: ngay_roi, ly_do_roi, nguoi_cap_nhat_id.

## Quản lý nhân khẩu (cán bộ xã) — src/api/nhanKhau.ts
- List View: chỉ tên chủ hộ + trạng thái + CCCD/SĐT che một phần.
- Detail View: lộ đầy đủ CCCD/SĐT/địa chỉ, BẮT BUỘC ghi log truy cập.
- Thêm hộ chuyển đến (tạo chủ hộ + ho_dan trong transaction).
- Đánh dấu rời đi: đổi trạng thái da_roi (KHÔNG xoá dữ liệu) → hộ đó không đăng nhập được nữa.
- Cho quay lại cư trú; cập nhật thông tin liên lạc.
