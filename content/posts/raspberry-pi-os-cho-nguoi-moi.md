---
title: "Raspberry Pi OS: cài đặt chuẩn cho người mới bắt đầu"
description: "Từng bước cài hệ điều hành Raspberry Pi OS, tối ưu hiệu năng và bảo mật cơ bản."
summary:
  - Thiết lập nhanh bằng Raspberry Pi Imager.
  - Cập nhật hệ thống ngay sau khi cài.
  - Bật SSH key và tường lửa cơ bản.
date: "2026-02-20"
category: "Raspberry Pi"
author: "Ngọc Lan"
tags:
  - Raspberry Pi
  - OS
cover_image: "/assets/imgs/page/healthy/img2.png"
published: true
---

## Cài đặt nhanh

Sử dụng Raspberry Pi Imager, chọn đúng model Pi và Raspberry Pi OS. Bạn có thể
thiết lập sẵn Wi‑Fi, SSH và tài khoản trong phần **Advanced Options** để tiết
kiệm thời gian.

## Tối ưu sau cài đặt

1. Cập nhật hệ thống:
   - `sudo apt update && sudo apt upgrade`
2. Bật tường lửa cơ bản với `ufw`.
3. Giảm ghi log nếu dùng thẻ nhớ để kéo dài tuổi thọ.

## Bảo mật cơ bản

- Đổi mật khẩu mặc định ngay lập tức.
- Chỉ mở những cổng thật sự cần thiết.
- Ưu tiên đăng nhập SSH bằng key thay vì mật khẩu.
