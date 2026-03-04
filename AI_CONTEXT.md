# Tổng quan dự án
- Framework: Next.js 16.1.6 App Router
- Ngôn ngữ: TypeScript
- UI: Tailwind CSS + CSS token tùy biến + component nội bộ
- Auth: internal DB auth + Postgres RBAC/profile
- Nguồn dữ liệu blog: `content/posts/*.md`

# Quy tắc code
- Ưu tiên Server Component khi không cần state hoặc browser API
- Dùng `async/await`
- Không thêm màu hex hoặc font mới trực tiếp trong component nếu chưa cập nhật token
- Khi cần UI mới: ưu tiên dùng token trong `styles/tokens.css` và semantic token trong `app/globals.css`

# Vai trò thư mục
- `app/`: route, layout, metadata, global CSS
- `components/`: component UI và layout
- `lib/`: helper, adapter, xử lý dữ liệu
- `content/`: nội dung markdown và dữ liệu tĩnh còn được dùng
- `styles/`: token hệ thống
- `public/assets/`: asset runtime

# Nguồn sự thật cho giao diện
- Token màu/cỡ/khoảng cách gốc: [styles/tokens.css](./styles/tokens.css)
- Token semantic theo theme sáng/tối: [app/globals.css](./app/globals.css)
- Tailwind mapping: [tailwind.config.ts](./tailwind.config.ts)

# Quy tắc font
- Font sans chính của hệ thống: `Be Vietnam Pro`
- Font được nạp trong `app/layout.tsx` và map vào biến `--font-sans`
- Toàn bộ body, input, nav, button phải ưu tiên:
  - `var(--font-sans), "Be Vietnam Pro", system-ui, -apple-system, "Segoe UI", sans-serif`
- Heading hiện dùng:
  - `var(--font-display), "Noto Serif", "Times New Roman", serif`
- Không tự ý thay font trong component con nếu không có lý do thiết kế rõ ràng

# Quy tắc màu
## Token nền tảng
- Không hardcode màu mới trong component nếu đã có token tương đương
- Bộ màu nền tảng hiện dùng dạng `--c-*` trong `styles/tokens.css`
- Các màu thương hiệu chính:
  - `--c-0`: nền chữ đậm / mực đậm
  - `--c-1`: nền panel tối
  - `--c-2`: xanh thương hiệu
  - `--c-3`: cyan thương hiệu
  - `--c-4`: text phụ sáng
  - `--c-6`: trắng
  - `--c-7`: text phụ tối hơn
  - `--c-9`: nền dark chính
  - `--c-40`: nền light chính
- Gradient thương hiệu:
  - `--g-brand`
  - `--g-brand-soft`
  - `--g-ink`

## Token semantic
- Luôn ưu tiên token semantic ở `app/globals.css` thay vì gọi trực tiếp `--c-*` khi làm panel/component:
  - `--page-bg`
  - `--page-text`
  - `--page-text-muted`
  - `--page-heading`
  - `--page-border`
  - `--surface-elevated`
  - `--surface-panel`
  - `--surface-card`
  - `--surface-input`
  - `--frame-border`
  - `--frame-shadow`
- Theme sáng/tối được điều khiển bởi:
  - `.theme-day`
  - `.theme-night`
- Chế độ theme có 3 lựa chọn:
  - `day`
  - `night`
  - `system`

# Quy tắc spacing, radius, shadow
- Spacing dùng token:
  - `--space-1` đến `--space-8`
- Radius dùng token:
  - `--radius-1`
  - `--radius-2`
  - `--radius-3`
  - `--radius-4`
  - `--radius-pill`
- Shadow dùng token:
  - `--shadow-1`
  - `--shadow-2`
  - `--shadow-3`
- Glow dùng token:
  - `--glow-1`
  - `--glow-2`
  - `--glow-3`

# Quy tắc Tailwind
- Tailwind đang được dùng ở mức tối giản, không phải nguồn style chính
- Chỉ dùng những mapping đã khai báo trong [tailwind.config.ts](./tailwind.config.ts):
  - `brand0`
  - `brand1`
  - `brand2`
  - `brand3`
  - `brand4`
  - `backgroundImage.brand`
- Ví dụ class hợp lệ:
  - `bg-brand2/10`
  - `text-brand4`
  - `border-brand1/20`
  - `bg-brand`
- Nếu cần thêm token mới cho Tailwind:
  1. thêm token gốc vào `styles/tokens.css` nếu là token nền tảng
  2. thêm token semantic vào `app/globals.css` nếu liên quan theme
  3. map sang `tailwind.config.ts`
- Không mở rộng Tailwind tùy hứng nếu cùng mục tiêu đã làm được bằng token CSS hiện có

# Quy tắc layout public
- Shell chiều ngang dùng:
  - `--site-shell-max`
  - `--site-shell-gutter`
- `.container` đã bị override để theo shell riêng của dự án
- Khi tạo section public mới:
  - không dùng max-width Bootstrap mặc định
  - phải bám chiều rộng shell hiện tại
- Overlay search và mega menu phải giữ header luôn visible, panel mở từ dưới header

# Quy tắc account/admin
- `account`, `admin`, `admin/database` dùng token chung, không tạo hệ màu riêng
- Form account phải gọn, ưu tiên chiều ngang theo shell header
- Admin shell dùng full screen nhưng vẫn bám token màu/khung chung

# Quy tắc icon
- Bộ icon đang dùng trong Vitamind:
  - `uicons-regular-rounded`
  - `boxicons`
  - `remixicon`
- Không phụ thuộc runtime vào thư mục Lahomes
- Nếu thêm icon mới, ưu tiên dùng 1 trong 3 bộ trên trước khi nhập SVG rời

# Quy tắc blog
- Typography phải đồng nhất giữa danh sách và trang chi tiết
- Meta bar đầu trang: chip danh mục + count/author, sau đó mới đến title
- Ảnh không được méo, luôn giữ tỉ lệ
- Trang category: 1 bài nổi bật + grid bài còn lại
- Tóm tắt AI: border gradient tĩnh, bo góc, không animation thừa
- TOC blog: gọn, dễ đọc, không nặng khung

# Quy tắc dọn template
- Không tái sử dụng dataset demo kiểu `blogData`, `categoriesData`, `commentsData`, `galleryData`
- Không thêm lại asset thương hiệu/template cũ như `Genz`, `Lahomes`, `AliThemes`
- Khi tạo component mới, ưu tiên dữ liệu thật từ `content/posts` hoặc API nội bộ

# Quy tắc Docker và Synology
- File compose chuẩn của repo là `compose.yml`.
- Local Mac/Win va Synology deu dung cung bo bien env, nhung `.env` runtime khong duoc commit.
- Moi bien env bat buoc cho `next build` phai co trong file `.env` tren may dang build, dac biet:
  - `AUTH_SESSION_SECRET`
  - `INTERNAL_API_SECRET`
  - `DATABASE_URL`
  - `SITE_URL`
- Docker build không được `source` env bằng shell theo kiểu `set -a && . ./.env.*`; với Alpine/Synology cách này dễ che lỗi thật.
- Nếu log Docker có warning kiểu `buildx: failed to read current commit information with git rev-parse --is-inside-work-tree`, coi đó là cảnh báo phụ. Phải đọc tiếp lỗi thật ở phần `npm run build`.
- Neu `next build` bao loi env auth, ket luan mac dinh la `.env` dang thieu `AUTH_SESSION_SECRET` hoac `INTERNAL_API_SECRET`.
- Healthcheck production không dùng `wget`; dùng `node fetch('http://127.0.0.1:3333/api/health')` để tránh lỗi `wget: can't connect to remote host` hoặc khác biệt tool trên image.
- Trước khi kết luận lỗi Docker/Synology đã xong, phải kiểm tra đủ 3 bước:
  1. `docker compose config`
  2. `docker build` hoặc `docker compose build`
  3. `docker compose logs --tail=200 app`

# Checklist trước khi chốt giao diện
- Có dùng đúng font hệ thống chưa
- Có dùng token màu thay vì hex cứng chưa
- Có tương thích sáng/tối chưa
- Có giữ đúng shell desktop/iPad chưa
- Có dùng icon library nội bộ thay vì ảnh nền template chưa
- Có tránh thêm component demo không dùng vào runtime chưa
