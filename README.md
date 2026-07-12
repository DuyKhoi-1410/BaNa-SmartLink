# Ba Na SmartLink

Nền tảng web hỗ trợ quy trình kê khai & báo cáo từ dân → thôn → xã cho xã Bà Nà (10 thôn, ~25.000 dân).

## Giới thiệu

Ba Na SmartLink số hóa quy trình thu thập dữ liệu dân cư theo 14 chỉ tiêu (CT01-CT14), thay thế giấy tờ thủ công bằng hệ thống web với 3 vai trò:

- **Dân (chủ hộ):** Kê khai dữ liệu hộ gia đình theo quý. Giao diện đơn giản, thân thiện cho người yếu công nghệ.
- **Cán bộ thôn:** Duyệt kê khai của dân, nhập chỉ tiêu cấp thôn (CT09, CT12-CT14), nộp báo cáo lên xã.
- **Cán bộ xã:** Tạo đợt kê khai, theo dõi tiến độ 10 thôn, tổng hợp báo cáo, quản lý hộ dân.

## Luồng hoạt động

```
Xã tạo đợt kê khai → Thông báo đến dân + thôn
→ Dân kê khai 9 chỉ tiêu (CT02-CT08, CT10, CT11) + upload minh chứng
→ Thôn duyệt kê khai dân + nhập 4 chỉ tiêu thôn (CT09, CT12-CT14)
→ Thôn nộp báo cáo lên xã
→ Xã tổng hợp 10 thôn → Xuất báo cáo
```

## Tính năng chính

- Kê khai định kỳ (theo quý) và đột xuất (xã tạo bất kỳ lúc nào)
- Giữ dữ liệu lần kê khai trước, dân chỉ cần xác nhận hoặc sửa
- Upload minh chứng (ảnh giấy tờ) cho từng chỉ tiêu
- Dashboard tiến độ theo thời gian thực (thôn xem dân, xã xem thôn)
- Thông báo nhắc việc tự động
- Quản lý hộ dân & nhân khẩu
- Xuất báo cáo tổng hợp

## Công nghệ

| Thành phần | Công nghệ |
|------------|-----------|
| Frontend | React 19, TypeScript, Tailwind CSS v4, Vite 8, React Router 7 |
| Backend | Express.js 5, TypeScript, Node.js |
| Database | PostgreSQL (Supabase) |
| Xác thực | JWT (access + refresh token), bcrypt |
| Lưu trữ file | Supabase Storage + Local filesystem |

## Hướng dẫn cài đặt & chạy thử

### Yêu cầu

- Node.js >= 18
- PostgreSQL database (hoặc tài khoản Supabase)

### Bước 1: Cài đặt

```bash
# Clone repo
git clone https://github.com/DuyKhoi-1410/BaNa-SmartLink.git
cd BaNa-SmartLink

# Cài dependencies
cd backend && npm install
cd ../frontend && npm install
```

### Bước 2: Cấu hình

Tạo file `.env` cho backend theo mẫu `backend/.env.example`

### Bước 3: Khởi tạo database

```bash
cd backend
npm run migrate   # Tạo bảng
npm run seed      # Tạo dữ liệu demo
```

### Bước 4: Chạy ứng dụng

```bash
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend
cd frontend && npm run dev
```

Truy cập: **http://localhost:3000**

## Tài khoản demo

| Vai trò | Đăng nhập | Mật khẩu |
|---------|-----------|----------|
| Cán bộ xã | `canboxa` | `demo123` |
| Cán bộ thôn | `canbothon1` đến `canbothon10` | `demo123` |
| Người dân | CCCD `048025000001` đến `048025000030` | `demo123` |

> Mỗi thôn có 3 hộ dân. Thôn 1: CCCD 001-003, Thôn 2: 004-006, ...

## Tài liệu

Chi tiết về thiết kế, luồng dữ liệu và kiến trúc xem trong thư mục `docs/`
