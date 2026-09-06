# Ghép Prompt

Mini app nối input vào mẫu prompt có chỗ trống (`{{tên_biến}}`). Mẫu được lưu dùng chung trên server dưới dạng **một file JSON** (không cần Postgres/Supabase) — đọc/ghi qua một API Node.js nhỏ, deploy trên Vercel (free tier).

## Kiến trúc

- `index.html` — toàn bộ giao diện + logic phía trình duyệt (không cần build).
- `api/prompts.js` — 1 serverless function Node.js, expose `/api/prompts`:
  - `GET` → trả về mảng các mẫu đã lưu
  - `POST {name, body}` → thêm 1 mẫu mới
  - `DELETE ?id=...` → xoá 1 mẫu
- Dữ liệu (`prompts.json`) được lưu trong **Vercel Blob** — một store file do chính Vercel cung cấp (không cần tạo tài khoản ở nơi khác như Supabase). Store đã được tạo và liên kết sẵn với project này (`ghep-prompt-data`, private), token truy cập (`BLOB_READ_WRITE_TOKEN`) được Vercel tự động bơm vào biến môi trường — bạn không cần cấu hình gì thêm.

## Deploy / cập nhật

Repo này đã được nối với project Vercel (qua `vercel git connect`) và đẩy lên GitHub tại https://github.com/MinhNhutTG/QuickForm. Từ giờ, mỗi lần:

```bash
git add .
git commit -m "mô tả thay đổi"
git push
```

Vercel sẽ tự động build và deploy bản mới lên production — không cần chạy `vercel --prod` bằng tay nữa. Vào tab **Deployments** trong Vercel Dashboard để xem tiến trình/log của từng lần deploy.

Nếu vẫn muốn deploy thủ công từ máy (bỏ qua Git), vẫn có thể chạy:

```bash
vercel --prod
```

## Chạy thử ở máy local

```bash
vercel dev
```

Lệnh này chạy cả static file lẫn `/api/prompts` giống hệt trên production (dùng cùng Blob store qua token trong `.env.local`).

## Giới hạn cần biết

- File `prompts.json` được đọc — sửa — ghi lại mỗi lần lưu/xoá, không có khoá tránh xung đột (race condition) khi 2 người lưu cùng lúc. Với quy mô vài mẫu dùng cá nhân/nhóm nhỏ thì không đáng lo.
- API hiện không yêu cầu đăng nhập — ai có địa chỉ trang đều đọc/ghi/xoá được danh sách mẫu. Nếu cần khoá lại, có thể thêm một secret key kiểm tra trong `api/prompts.js`.
