## Phong cách thiết kế tổng quan

- **Tone:** Thân thiện, đơn giản, dễ tiếp cận cho người yếu công nghệ
- **Màu chính:** Xanh dương (#2563EB) — tạo cảm giác tin cậy, chuyên nghiệp
- **Màu phụ:** Xanh lá (#10B981) cho trạng thái thành công, Đỏ (#EF4444) cho cảnh báo, Vàng (#F59E0B) cho nhắc nhở
- **Nền:** Trắng (#FFFFFF) và xám nhạt (#F9FAFB)
- **Font chữ:** Inter hoặc Roboto — dễ đọc trên mọi thiết bị
- **Cỡ chữ tối thiểu:** 16px (để người lớn tuổi đọc được)
- **Bo góc:** 8px — tạo cảm giác mềm mại, thân thiện
- **Icon:** Lucide React — đơn giản, nhất quán

## Bố cục trang (Layout)

### Dân (chủ hộ)
- Không có sidebar — chỉ có header + nội dung chính
- Header: logo + tên ứng dụng + nút đăng xuất
- Nội dung: hiển thị dạng card lớn, từng bước một
- Nút bấm to, rõ ràng, có icon kèm chữ

### Cán bộ thôn
- Header + sidebar bên trái (thu gọn được trên điện thoại)
- Sidebar: Dashboard, Danh sách hộ dân, Nhập CT thôn, Nộp báo cáo, Thông báo
- Main: bảng dữ liệu + bộ lọc

### Cán bộ xã
- Header + sidebar bên trái (thu gọn được trên điện thoại)
- Sidebar: Dashboard, Quản lý đợt kê khai, Tiến độ 10 thôn, Tổng hợp báo cáo, Xuất file, Chatbot AI
- Main: dashboard tổng quan + bảng + biểu đồ

## Danh sách các trang chính

### Chung
- **Trang đăng nhập:** Form đơn giản (số điện thoại hoặc tài khoản + mật khẩu). Có hướng dẫn ngay trên form.
- **Trang thông báo:** Danh sách thông báo từ hệ thống (đợt kê khai mới, nhắc nhở, kết quả duyệt)

### Dân
- **Trang chủ dân:** Hiển thị đợt kê khai hiện tại (nếu có), trạng thái kê khai, nút "Bắt đầu kê khai"
- **Trang kê khai:** Form nhập CT02-CT08, CT11 theo từng bước. Lần sau hiện dữ liệu cũ + nút "Giữ nguyên" / "Chỉnh sửa"
- **Trang lịch sử:** Xem lại các lần kê khai trước

### Cán bộ thôn
- **Dashboard thôn:** Tiến độ kê khai của dân trong thôn (đã nộp / chưa nộp / quá hạn)
- **Trang duyệt hộ dân:** Xem chi tiết kê khai từng hộ → Duyệt / Trả lại (kèm lý do)
- **Trang nhập CT thôn:** Form nhập CT09, CT12, CT13, CT14
- **Trang nộp báo cáo:** Xác nhận tổng hợp thôn → Gửi lên xã

### Cán bộ xã
- **Dashboard xã:** Tổng quan 10 thôn — tiến độ, trạng thái, biểu đồ
- **Trang tạo đợt kê khai:** Form tạo đợt mới (loại: định kỳ / đột xuất, thời hạn, mô tả)
- **Trang tiến độ thôn:** Bảng 10 thôn — % hoàn thành, số hộ đã nộp, trạng thái
- **Trang tổng hợp báo cáo:** Bảng CT01-CT14 tổng hợp từ 10 thôn + biểu đồ so sánh
- **Trang xuất file:** Xuất Excel, Word, PDF
- **Trang chatbot AI:** Giao diện chat để tra cứu dữ liệu (RAG)
- **Trang phân tích xu hướng:** So sánh dữ liệu qua các quý — biểu đồ đường, cột

## Nguyên tắc UX

1. **Ít thao tác nhất có thể** — mỗi trang chỉ làm 1 việc, tối đa 3 bước để hoàn thành
2. **Chữ to, nút to** — cỡ chữ >= 16px, nút bấm >= 44px chiều cao
3. **Hướng dẫn ngay trên giao diện** — mỗi form có chỉ dẫn ngắn gọn bằng tiếng Việt
4. **Phản hồi rõ ràng** — sau mỗi thao tác: thông báo thành công (xanh), lỗi (đỏ), đang xử lý (loading)
5. **Responsive** — ưu tiên thiết kế cho điện thoại trước (mobile-first), sau đó mở rộng cho máy tính
6. **Không dùng thuật ngữ kỹ thuật** — giao diện dùng ngôn ngữ đời thường
7. **Xác nhận trước khi gửi** — luôn có bước xác nhận trước khi nộp/duyệt/gửi

## Components dùng chung

- **NutBam (Button):** Có 3 kiểu — chính (xanh dương), phụ (viền), nguy hiểm (đỏ). Luôn có icon + chữ.
- **FormNhapLieu (Input):** Label rõ ràng phía trên, placeholder gợi ý, thông báo lỗi phía dưới (đỏ)
- **TheBang (Table):** Bảng dữ liệu có phân trang, sắp xếp, tìm kiếm
- **TheCard (Card):** Khung bo góc, shadow nhẹ, dùng cho dashboard và danh sách
- **ThongBao (Alert):** 4 loại — thành công, cảnh báo, lỗi, thông tin
- **ModalXacNhan (Confirm Dialog):** Hiện trước khi gửi/duyệt/xóa — có nút "Xác nhận" + "Hủy"
- **Stepper:** Thanh tiến trình cho form nhiều bước (dùng cho trang kê khai của dân)
- **BieuDo (Chart):** Biểu đồ cột, đường, tròn — dùng Recharts
- **Loading:** Spinner + chữ "Đang xử lý..." khi chờ dữ liệu

--------------------------------------------------------------------------------
# UI/UX SYSTEM DESIGN GUIDELINES (DESKTOP OPTIMIZED)
> Dành cho AI Assistant: Dự án này CHỈ thiết kế cho màn hình máy tính (Desktop-only). Tuyệt đối không cần làm Mobile-first hay Responsive cho điện thoại. Khi viết code, BẮT BUỘC tuân thủ nghiêm ngặt các quy tắc dưới đây.

## 1. TRIẾT LÝ THIẾT KẾ (CORE PHILOSOPHY)
- **Desktop Focus:** Tận dụng tối đa không gian rộng rãi của màn hình máy tính. Bố cục phải thoáng, dàn trải hợp lý, không nhồi nhét.
- **Zero-Learning Curve:** Người dùng không rành công nghệ (chỉ dùng chuột và bàn phím cơ bản) nhìn vào là biết phải bấm vào đâu ngay. 
- **Premium Interaction:** Tạo cảm giác "xịn xò", cao cấp thông qua các hiệu ứng tương tác vật lý với con trỏ chuột. Mọi thứ trên màn hình đều phải có phản hồi khi chuột lướt qua.

## 2. QUY CHUẨN TRẢI NGHIỆM NGƯỜI DÙNG (UX FOR LOW-TECH USERS)
- **Ngôn ngữ (Copywriting):** Dùng tiếng Việt phổ thông, hành động rõ ràng. KHÔNG dùng thuật ngữ IT. (VD: "Lưu thông tin", "Xóa bài viết" thay vì "Lưu", "Xóa").
- **Điều hướng bằng chuột:** 
  - Mọi màn hình đều phải có nút "Quay lại" hoặc "Trang chủ" to, rõ ràng.
  - Sử dụng Sidebar (Menu bên trái) hoặc Topbar (Menu bên trên) cố định để người dùng luôn biết mình đang ở đâu.
- **Kích thước chuẩn Desktop:** 
  - Font chữ cơ bản tối thiểu 15px - 16px. 
  - Nút bấm có chiều cao tiêu chuẩn (khoảng `h-10` hoặc `h-11`) với padding chiều ngang rộng rãi (`px-6`) để tạo sự cân đối trên màn hình lớn.

## 3. HIỆU ỨNG TƯƠNG TÁC CHUỘT (THE "POP-UP" HOVER EFFECTS)
*Đây là yêu cầu QUAN TRỌNG NHẤT để tạo sự "xịn xò". Áp dụng framework Tailwind CSS cho các hiệu ứng sau:*

- **Hiệu ứng "Nổi lên" (Elevate on Hover):** 
  - Áp dụng cho **tất cả** các Nút bấm (Button) và Thẻ thông tin (Card).
  - Khi con trỏ chuột lướt qua (Hover), phần tử BẮT BUỘC phải nhích lên trên một khoảng ngắn và tỏa bóng đậm hơn.
  - **Code mẫu bắt buộc:** Dùng chuỗi class `transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-lg`.
- **Hiệu ứng lún xuống khi bấm (Active/Click State):**
  - Khi người dùng nhấn chuột (Click), phần tử phải có cảm giác bị ấn lún xuống thực tế.
  - **Code mẫu bắt buộc:** Dùng chuỗi class `active:translate-y-0 active:scale-[0.98] active:shadow-sm`.
- **Màu sắc khi rờ chuột (Hover Color):** Sắc độ màu phải sáng lên hoặc tối đi một bậc khi chuột lướt vào (VD: Từ `bg-blue-600` chuyển thành `hover:bg-blue-500`).

## 4. HỆ THỐNG GIAO DIỆN TRỰC QUAN (VISUAL IDENTITY)
- **Màu sắc (Color Palette):**
  - **Background:** Nền chính dùng `bg-slate-50` hoặc `bg-gray-100`. Các Thẻ (Card) hoặc khu vực nội dung chính dùng nền trắng `bg-white` để tạo sự nổi bật tách biệt khỏi nền sau.
  - **Text:** Dùng `text-slate-800` cho Tiêu đề, `text-slate-600` cho văn bản thường. Tuyệt đối không dùng màu đen tuyền.
  - **Primary Action:** Chọn 1 màu chủ đạo xịn xò (VD: Xanh ngọc `emerald-600`, Xanh dương đậm `indigo-600`) cho các nút quan trọng nhất.
- **Hình khối & Chiều sâu:**
  - Bo góc vừa phải: Áp dụng `rounded-xl` cho Card và Modal, `rounded-lg` cho Button và Input.
  - Viền tinh tế: Dùng `border border-slate-200` kết hợp với `shadow-sm` cho trạng thái tĩnh của các Card.

## 5. YÊU CẦU TRIỂN KHAI CODE (IMPLEMENTATION RULES)
- **Layout Desktop:** Sử dụng CSS Grid (`grid-cols-2`, `grid-cols-3`...) hoặc Flexbox rộng rãi để phân bổ nội dung trên màn hình ngang. KHÔNG bóp nghẹt nội dung vào giữa màn hình như app điện thoại.
- **Loading & Feedback:**
  - Nút bấm khi Submit phải chuyển sang trạng thái "Đang xử lý..." và disable để chống click đúp.
  - Có popup thông báo (Toast) nhỏ gọn mượt mà góc màn hình khi hoàn tất một hành động.
- **Component Tách biệt:** Tách code thành các khối UI riêng biệt (VD: `ElevatedButton`, `HoverCard`) chứa sẵn các class hiệu ứng nổi lên, để tái sử dụng xuyên suốt toàn bộ dự án máy tính này.