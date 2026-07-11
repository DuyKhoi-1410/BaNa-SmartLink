## Tiêu chí chấm điểm (theo thứ tự ưu tiên)

1. **Tính khả thi và phù hợp thực tế địa phương**
   → Web phải thực sự dùng được cho dân low-tech, cán bộ thôn/xã

2. **Độ chính xác của AI trong tổng hợp và xử lý dữ liệu**
   → Dân và thôn kê khai dữ liệu trực tiếp trên web. AI tự động kiểm tra và thông báo cho thôn các dữ liệu bất thường (tăng đột biến, không phù hợp thực tế), thôn sẽ yêu cầu dân kê khai lại qua thông báo trên web. Chatbot RAG cho thôn và xã chỉ tra cứu và giải đáp dựa trên dữ liệu thực tế đã kê khai — chỉ phân tích từ dữ liệu đó, không được tự chế hoặc bịa dữ liệu

3. **Dễ sử dụng đối với cán bộ xã và cán bộ thôn**
   → Giao diện đơn giản, trực quan, dễ học

4. **Chi phí triển khai hợp lý**
   → Dùng Supabase (miễn phí tier đầu), không cần server riêng

5. **Tính sáng tạo: kho dữ liệu số dùng chung từ quy trình báo cáo**
   → Dữ liệu tích lũy qua các quý, không mất đi, dùng để phân tích xu hướng

6. **Khả năng mở rộng và nhân rộng sang địa phương khác**
   → Kiến trúc linh hoạt, có thể áp dụng cho xã khác

7. **Bảo đảm an toàn và bảo mật dữ liệu**
   → Phân quyền rõ ràng (dân/thôn/xã), bảo mật thông tin 

## Lưu ý khi code

- Ưu tiên #1 (khả thi) và #3 (dễ dùng): giao diện phải CỰC KỲ đơn giản
- Ưu tiên #5 (sáng tạo): có dashboard phân tích xu hướng

