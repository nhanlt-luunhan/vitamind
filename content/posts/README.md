# Quy tắc viết bài

## 1) Tiêu đề và cấu trúc heading
- **H1**: dùng ở phần `title` (frontmatter). **Không** dùng `#` trong nội dung.
- **H2**: các mục chính của bài (3–6 mục). H2 sẽ tự đánh số và xuất hiện ở cột Mục lục.
- **H3**: mục con giải thích chi tiết.
- **H4**: lưu ý, mẹo, checklist nhỏ.

## 2) Khung tóm tắt AI
- Dùng trường `summary` trong frontmatter.
- Nên có **3–5 gạch đầu dòng**, mỗi dòng <= 14 từ.
- Ngắn gọn, trung tính, nêu ý chính của bài.

## 3) Trích đoạn và SEO
- `description` dùng làm mô tả ngắn (hiển thị ở danh sách).
- `summary` dùng cho **khung tóm tắt AI** trong bài.
- Nếu ảnh cover bị méo, thêm `cover_width` và `cover_height` đúng kích thước ảnh.

## 4) Slug
- Mặc định lấy từ `title` và tự chuẩn hóa.
- Muốn slug riêng, thêm `slug` trong frontmatter (ví dụ: `pi-home-tro-ly`).

## 5) Template mẫu
```md
---
title: "Pi Home Trợ Lý"
description: "Tóm tắt ngắn hiển thị ở danh sách."
summary:
  - Cài nhanh Home Assistant OS lên Raspberry Pi.
  - Ưu tiên SSD để chạy ổn định lâu dài.
  - Sao lưu định kỳ trước khi cập nhật.
date: "2026-02-25"
category: "Raspberry Pi"
author: "Tên tác giả"
tags:
  - Raspberry Pi
  - Smart Home
cover_image: "/assets/imgs/page/healthy/img.png"
cover_width: 996
cover_height: 618
published: true
# slug: "pi-home-tro-ly"
---

## Mục tiêu
Viết vài câu nêu mục tiêu chính của bài.

## Chuẩn bị
- Danh sách công cụ/phần cứng cần có.

## Các bước cốt lõi
### Bước 1
Mô tả ngắn gọn.

### Bước 2
Mô tả ngắn gọn.

#### Lưu ý
Mẹo nhỏ hoặc cảnh báo.
```
