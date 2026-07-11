## Dữ liệu ban đầu (import)

- Import tên + CCCD chủ hộ từ **Cơ sở dữ liệu quốc gia về dân cư** vào DB
- Import SĐT chủ hộ do **thôn cung cấp** vào DB
- Dữ liệu này dùng để xác thực đăng nhập và quản lý danh sách hộ

## Đăng nhập / Xác thực

- Dân nhập: tên + CCCD + SĐT
- Hệ thống đối chiếu với dữ liệu đã import trong DB
- Xác thực OTP qua Zalo OA

## Luồng kê khai

### Lần đầu tiên (Quý đầu)
1. Xã tạo đợt kê khai → thông báo qua web + Zalo OA
2. Dân kê khai tất cả CT mà dân phụ trách + upload minh chứng
3. Thôn duyệt thủ công minh chứng tất cả hộ
4. Thôn nhập CT của thôn (CT09, CT12, CT13, CT14)
5. Thôn gửi lên xã
6. Xã tổng hợp 10 thôn → xuất báo cáo
7. Lưu toàn bộ dữ liệu (không xoá)

### Các lần sau
1. Xã tạo đợt kê khai mới (định kỳ theo quý hoặc đột xuất — xã tạo nhiệm vụ bất kỳ lúc nào)
2. Hệ thống hiện dữ liệu lần trước
3. Dân chọn "Giữ nguyên" hoặc "Thay đổi" từng CT. Nếu thay đổi → nhập lại + upload minh chứng mới
4. Giữ nguyên 100% → auto-approve, thôn không cần duyệt lại
5. Thay đổi CT nào → thôn chỉ duyệt minh chứng CT đó
6. Thôn xác nhận/sửa CT của thôn
7. Thôn gửi lên xã → xã tổng hợp

## Bảng chỉ tiêu CT01-CT14

| Mã | Tên chỉ tiêu | Người nhập |
|---|---|---|
| CT01 | Tổng số hộ dân | Hệ thống tự tính |
| CT02 | Tổng số nhân khẩu | Người dân |
| CT03 | Số hộ nghèo | Người dân |
| CT04 | Số hộ cận nghèo | Người dân |
| CT05 | Số người có công với CM | Người dân |
| CT06 | Đối tượng bảo trợ XH | Người dân |
| CT07 | Số trẻ em dưới 16 tuổi | Người dân |
| CT08 | Trẻ em có hoàn cảnh đặc biệt | Người dân |
| CT09 | Số hộ đạt "Gia đình văn hóa" | Cán bộ thôn |
| CT10 | Số người trong độ tuổi lao động | Người dân |
| CT11 | Số người tham gia BHYT | Người dân |
| CT12 | Thành viên Tổ CNSCĐ | Cán bộ thôn |
| CT13 | Người được hướng dẫn DVC trực tuyến | Cán bộ thôn |
| CT14 | Số vụ bạo lực gia đình | Cán bộ thôn |

## Hệ thống tự tính

- CT01: Đếm tổng số hộ có trạng thái "Đang cư trú"

## Quy tắc nhập dữ liệu

- Sau khi nộp, dân vẫn được sửa → tạo bản cập nhật mới, KHÔNG ghi đè bản cũ
- Mọi thao tác đều lưu nhật ký: ai sửa, thời gian, nội dung thay đổi
- KHÔNG BAO GIỜ xóa dữ liệu, chỉ tạo phiên bản cập nhật

## Ràng buộc dữ liệu kê khai

Khi dân hoặc thôn nhập dữ liệu, hệ thống kiểm tra ngay trên giao diện. Nút Lưu/Nộp luôn bấm được, nhưng nếu dữ liệu vi phạm ràng buộc → KHÔNG lưu/nộp, hiện thông báo đỏ tại các ô sai kèm nội dung lỗi cụ thể.

### Ràng buộc chung (áp dụng tất cả ô nhập)

| Loại lỗi | Điều kiện | Thông báo lỗi |
|---|---|---|
| Để trống | Ô bắt buộc mà không nhập | "Vui lòng nhập giá trị" |
| Nhập chữ vào ô số | Giá trị không phải số | "Vui lòng nhập số, không nhập chữ" |
| Nhập số âm | Giá trị < 0 | "Giá trị không được nhỏ hơn 0" |
| Nhập số thập phân | Giá trị không phải số nguyên | "Vui lòng nhập số nguyên, không nhập số lẻ" |
| Nhập ký tự đặc biệt | Chứa ký tự không phải số | "Vui lòng chỉ nhập số" |

Giao diện nên dùng ô input type="number" để hạn chế nhập chữ ngay từ đầu, nhưng vẫn cần kiểm tra phía code phòng trường hợp dán (paste) dữ liệu sai vào.

### Ràng buộc cấp hộ (dân kê khai)

| CT | Điều kiện | Thông báo lỗi |
|---|---|---|
| Tất cả | Số nguyên, ≥ 0 | "Giá trị phải là số nguyên lớn hơn hoặc bằng 0" |
| CT02 | CT02 ≥ 1 | "Mỗi hộ phải có ít nhất 1 nhân khẩu (chủ hộ)" |
| CT03 | CT03 ≤ 1 (vì 1 hộ chỉ có thể nghèo hoặc không) | "Giá trị hộ nghèo chỉ có thể là 0 hoặc 1" |
| CT04 | CT04 ≤ 1 và CT03 + CT04 ≤ 1 | "Hộ không thể vừa nghèo vừa cận nghèo" |
| CT08 | CT08 ≤ CT07 | "Trẻ em hoàn cảnh đặc biệt không thể nhiều hơn tổng trẻ em" |
| CT11 | CT11 ≤ CT02 | "Số người tham gia BHYT không thể nhiều hơn tổng nhân khẩu" |

### Ràng buộc cấp thôn (thôn kê khai)

| CT | Điều kiện | Thông báo lỗi |
|---|---|---|
| CT09 | CT09 ≤ CT01 | "Số hộ gia đình văn hóa không thể nhiều hơn tổng số hộ" |
| CT12 | CT12 ≤ CT02 | "Thành viên Tổ CNSCĐ không thể nhiều hơn tổng nhân khẩu" |
| CT13 | CT13 ≤ CT02 | "Người được hướng dẫn DVC không thể nhiều hơn tổng nhân khẩu" |
| CT14 | Số nguyên, ≥ 0 | "Giá trị phải là số nguyên lớn hơn hoặc bằng 0" |

### Ràng buộc cấp thôn khi tổng hợp (trước khi nộp lên xã)

| CT | Điều kiện | Thông báo lỗi |
|---|---|---|
| CT02 | CT02 nằm trong khoảng 3–4.5 × CT01 | "Tổng nhân khẩu không hợp lý so với tổng số hộ, vui lòng kiểm tra lại" |
| CT03 | CT03 ≤ CT01 | "Số hộ nghèo không thể nhiều hơn tổng số hộ" |
| CT04 | CT03 + CT04 ≤ CT01 | "Tổng hộ nghèo + cận nghèo vượt quá tổng số hộ" |
| CT07 | CT07 ≤ CT02 | "Số trẻ em không thể nhiều hơn tổng nhân khẩu" |
| CT08 | CT08 ≤ CT07 | "Trẻ em hoàn cảnh đặc biệt không thể nhiều hơn tổng trẻ em" |
| CT09 | CT09 ≤ CT01 | "Số hộ gia đình văn hóa không thể nhiều hơn tổng số hộ" |
| CT10 | CT10 ≤ CT02 | "Số người trong tuổi lao động không thể nhiều hơn tổng nhân khẩu" |
| CT11 | CT11 ≤ CT02 | "Số người tham gia BHYT không thể nhiều hơn tổng nhân khẩu" |

### Quy tắc áp dụng

- Nút Lưu/Nộp luôn bấm được, nhưng khi bấm mà có lỗi → hiện thông báo đỏ tại các ô sai, kèm nội dung lỗi cụ thể, và KHÔNG lưu/nộp dữ liệu
- Thông báo lỗi cũng hiện realtime khi nhập (nếu phát hiện sai ngay) để người dùng sửa trước khi bấm nộp
- Hệ thống tự tính CT01 → luôn đúng, không cần kiểm tra

## Minh chứng kê khai

Mỗi CT khi kê khai có thể yêu cầu minh chứng (ảnh chụp giấy tờ) để đảm bảo tính chính xác.

### CT do dân kê khai

| CT | Tên chỉ tiêu | Minh chứng |
|---|---|---|
| CT02 | Tổng số nhân khẩu | Ảnh chụp Sổ hộ khẩu / Thông báo số định danh |
| CT03 | Số hộ nghèo | Ảnh chụp Giấy chứng nhận hộ nghèo (UBND xã cấp) |
| CT04 | Số hộ cận nghèo | Ảnh chụp Giấy chứng nhận hộ cận nghèo |
| CT05 | Người có công với CM | Ảnh chụp Giấy chứng nhận người có công / Huân, Huy chương |
| CT06 | Đối tượng bảo trợ XH | Ảnh chụp Quyết định hưởng trợ cấp BTXH |
| CT08 | Trẻ em hoàn cảnh đặc biệt | Ảnh chụp Giấy xác nhận của xã (mồ côi, khuyết tật...) |
| CT11 | Người tham gia BHYT | Ảnh chụp Thẻ BHYT từng thành viên |

### CT do thôn kê khai

| CT | Tên chỉ tiêu | Minh chứng |
|---|---|---|
| CT09 | Hộ gia đình văn hóa | Danh sách bình xét / Biên bản họp thôn |
| CT12 | Thành viên Tổ CNSCĐ | Quyết định thành lập tổ / Danh sách thành viên |
| CT13 | Người được hướng dẫn DVC | Sổ ghi chép / Danh sách có chữ ký |
| CT14 | Số vụ bạo lực gia đình | Biên bản hòa giải / Báo cáo từ thôn hoặc công an |

## Quản lý danh sách hộ dân

### Hộ rời xã
- Thôn hoặc xã đánh dấu trạng thái hộ = "Đã rời" (KHÔNG xóa dữ liệu)
- Hộ "Đã rời" không xuất hiện trong đợt kê khai mới, không tính vào thống kê quý hiện tại
- Dữ liệu cũ của hộ vẫn lưu trữ, vẫn xem được lịch sử khi cần
- CT01 chỉ đếm số hộ có trạng thái "Đang cư trú"

### Hộ mới vào
- Thôn thêm thông tin hộ mới vào hệ thống (tên, CCCD, SĐT)
- Hộ mới đăng nhập → kê khai lần đầu như bình thường
- Thôn duyệt hộ mới này (giống flow lần đầu, chỉ 1 hộ nên không nặng)

### Cập nhật thông tin hộ
- Thôn có thể cập nhật SĐT, thông tin liên lạc của hộ khi cần
- Mọi thay đổi đều lưu nhật ký

## Kho dữ liệu số

- Mỗi quý lưu 1 bản ghi riêng, KHÔNG ghi đè quý trước
- Mỗi đợt kê khai của mỗi người lưu riêng không đè dữ liệu nhau
- Tích lũy dữ liệu theo thời gian → so sánh, phân tích xu hướng
- Đây là "kho dữ liệu số dùng chung" — tiêu chí sáng tạo của cuộc thi
