# Playable Preview

Trang web xem trước **playable ads (HTML)**, duyệt thư mục giống **Google Drive**, bấm vào game để chơi trong khung xem trước kiểu **AppLovin Playable Preview**.
Chỉ cần push lên GitHub / GitLab → CI tự build và deploy lên Pages.

## Cấu trúc

```
games/                 ← BỎ GAME VÀO ĐÂY (tạo thư mục tuỳ ý)
  Demo/
    Puzzle/
      Color Match.html          ← 1 file HTML = 1 playable
      Color Match.png           ← (tuỳ chọn) thumbnail cùng tên
    Runner/
      Endless Run/              ← thư mục có index.html = 1 playable (nhiều file)
        index.html
        game.js, style.css ...
        thumbnail.png           ← (tuỳ chọn) thumbnail|thumb|icon|cover|preview .png/.jpg/.webp/.gif/.svg
        playable.json           ← (tuỳ chọn) { "title", "orientation": "portrait|landscape", "description" }
site/                  ← giao diện web (HTML/CSS/JS thuần, không cần build)
scripts/
  build.js             ← quét games/, sinh manifest.json, xuất ra dist/ (hoặc public/)
  serve.js             ← dev server (Node)
  serve.ps1            ← dev server (PowerShell, không cần cài Node)
.github/workflows/deploy.yml   ← GitHub Pages
.gitlab-ci.yml                 ← GitLab Pages
```

Quy tắc quét:
- Thư mục **có `index.html`** → là 1 game (không duyệt vào bên trong).
- File `*.html` / `*.htm` khác → là 1 game.
- Thư mục khác → thư mục bình thường để duyệt.
- Tên bắt đầu bằng `.` hoặc `_` → ẩn khỏi danh sách (vẫn được deploy, dùng cho asset dùng chung).

## Chạy thử trên máy

Không có Node (Windows): **double-click `serve.bat`**, hoặc chạy từ bất kỳ thư mục nào:
```powershell
D:\PROJECT\PlayablePreview\serve.bat
```
Có Node:
```bash
node scripts/serve.js        # in ra cả địa chỉ LAN để test bằng điện thoại
```
Mở http://localhost:5173 . Thêm/sửa game rồi **F5** là thấy ngay.

## Deploy

**GitHub**: push lên nhánh `main` → vào *Settings → Pages → Source: GitHub Actions*. Web ở `https://<user>.github.io/<repo>/`.

**GitLab**: push lên nhánh mặc định → job `pages` tự chạy. Xem link ở *Deploy → Pages*.

> Cả hai CI đều clone full history để cột **Modified** hiển thị đúng ngày commit cuối của từng game.

## Sửa ngay trên web: upload, đổi tên, xoá (Edit mode)

Quyền sửa gắn với **mật khẩu đăng nhập**: mỗi người trong `PREVIEW_ACCESS` có một `role`:

| Role | Upload | Đổi tên / xoá game | Đổi tên / xoá thư mục | Quản lý tài khoản |
|---|---|---|---|---|
| `owner` | ✓ | mọi game | ✓ | ✓ |
| `admin` | ✓ | mọi game | ✗ | ✗ |
| `editor` | ✓ | chỉ game **mình upload** | ✗ | ✗ |
| `viewer` (mặc định) | ✗ | ✗ | ✗ | ✗ |

Người sửa **không cần tài khoản GitHub**: mọi thao tác được commit bằng token của chủ repo, commit ghi rõ tên người làm. Người upload mỗi file được lưu trong `.pp-owners.json` (cạnh thư mục `games/`); game đưa lên bằng git thường không có người upload nên chỉ owner/admin sửa được. Cấu hình cũ `"edit": true` được hiểu là `owner`.

> ⚠️ Quyền được chặn **trên giao diện**: owner/admin/editor dùng chung một token, người rành kỹ thuật vẫn có thể lấy token ra gọi GitHub API trực tiếp. Chỉ cấp quyền sửa cho người tin tưởng; mọi thay đổi vẫn còn trong lịch sử git để khôi phục.

**Owner làm 1 lần** (GitHub bắt buộc có chìa khoá để ghi vào repo):
1. https://github.com/settings/personal-access-tokens/new → *Fine-grained token* (Expiration: chọn dài nhất / No expiration)
2. *Repository access*: Only select repositories → chọn repo này
3. *Permissions*: **Contents: Read and write**, **Actions: Read and write** (cho nút Publish dự phòng và Save & publish) và **Secrets: Read and write** (để owner quản lý tài khoản trên web) → Generate → copy token
   (hoặc classic token với scope `repo`; fine-grained phải tạo từ tài khoản chủ repo)
4. Repo → *Settings → Secrets and variables → Actions* → secret mới tên **`PREVIEW_EDIT_TOKEN`** → dán token → chạy lại workflow

Token được **mã hoá bằng mật khẩu** của từng người không phải viewer; viewer không giải mã được. Dùng mật khẩu đủ mạnh cho các tài khoản sửa.

Khi đã đăng nhập (góc phải hiện nhãn role):
- **Đổi tên / xoá**: chuột phải vào game/thư mục (hoặc nút ⋮) → *Rename* / *Delete*. Game 1 file sẽ đổi tên/xoá luôn thumbnail cùng tên.
- **Upload**: vào thư mục → *Upload files* / *Upload folder*, hoặc kéo-thả file/thư mục vào bất kỳ đâu trên trang. Editor không ghi đè được game của người khác.
- **Quản lý tài khoản** (owner): nút ✏️ → *Manage users* → thêm/xoá người, đổi mật khẩu, role, thư mục → *Save & publish*. Trang ghi thẳng secret `PREVIEW_ACCESS` rồi build lại (dưới 1 phút). Phải giữ ít nhất một owner có quyền `*`.

Upload chạy theo **hàng đợi**: từng file được đẩy lên lần lượt (thả thêm file trong lúc đang upload thì xếp vào cuối hàng), hết hàng mới gộp thành 1 commit rồi mới refresh trang. Đừng đóng tab khi đang upload.

Mỗi thao tác sửa file = 1 commit và **tự build + deploy** (~30–45 giây). Trang hiện *"Updating site…"* rồi tự làm mới danh sách khi bản mới lên, không cần reload. Sửa liên tục nhiều lần thì run cũ bị huỷ, chỉ bản cuối được deploy. Nếu một lần deploy bị lỗi, trang hiện *"N changes not published yet"* kèm nút **Publish** để chạy lại.
Trang Actions sẽ báo ai được sửa và cảnh báo nếu có owner/admin/editor mà chưa có `PREVIEW_EDIT_TOKEN`.

## Mật khẩu & phân quyền thư mục

Mỗi tài khoản (tên đăng nhập + mật khẩu) được xem một số thư mục nhất định. Khi đã bật, file game private được **mã hoá AES-256** lúc build (tên file cũng bị thay bằng mã băm), nên tải trộm về cũng không đọc được.

1. Viết cấu hình (xem mẫu [access.example.json](access.example.json)):
   ```json
   {
     "public": ["Demo/Puzzle"],
     "users": [
       { "name": "Admin",    "password": "mat-khau-admin", "folders": ["*"], "role": "owner" },
       { "name": "Designer", "password": "mat-khau-d",     "folders": ["ClientA"], "role": "editor" },
       { "name": "Client A", "password": "mat-khau-a",     "folders": ["ClientA", "Demo/Runner"] }
     ]
   }
   ```
   - `folders`: đường dẫn trong `games/`; `"*"` = tất cả. Được quyền thư mục cha là xem được mọi thư mục con.
   - `public` (tuỳ chọn): các thư mục ai cũng xem được, không cần mật khẩu. Nếu bỏ trống, vào trang là phải đăng nhập ngay.
   - Đăng nhập bằng **`name` (tên đăng nhập, không phân biệt hoa thường) + `password`**. Mỗi người một `name` khác nhau; mật khẩu trùng nhau cũng được. `name` cũng là tên hiển thị góc phải.
   - `role` (tuỳ chọn): `owner` / `admin` / `editor` / `viewer` (mặc định), xem bảng ở mục trên. Các role sửa cần `PREVIEW_EDIT_TOKEN`.
2. **GitHub**: *Settings → Secrets and variables → Actions → New repository secret*, tên `PREVIEW_ACCESS`, dán nguyên JSON trên vào → chạy lại workflow.
   **GitLab**: *Settings → CI/CD → Variables*, key `PREVIEW_ACCESS` (tích *Protect*, không cần *Mask*).
3. Đổi mật khẩu / thêm người / đổi quyền: dùng *Manage users* trên web (owner), hoặc sửa secret rồi chạy lại workflow. Mật khẩu cũ mất hiệu lực ngay sau lần deploy đó.

Không có secret thì web chạy như cũ (không cần mật khẩu). Chạy local bằng `serve.bat` luôn xem được hết.
Muốn thử bản có mật khẩu trên máy: tạo file `access.config.json` (đã gitignore) rồi `node scripts/build.js && node scripts/serve.js --dist`.

> ⚠️ Mã hoá chỉ bảo vệ **trang web**. Nếu repo để **public** thì ai cũng xem được thư mục `games/` ngay trên GitHub. Muốn giấu game thật sự phải để repo **private** (GitHub Pages với repo private cần gói Pro/Team, hoặc dùng GitLab Pages / Cloudflare Pages miễn phí).
>
> Lưu ý: file dùng chung giữa các thư mục có quyền khác nhau (vd `_shared/`) chỉ người có quyền `*` đọc được — hãy để asset nằm trong thư mục game, hoặc đưa `_shared` vào `public`.

## Tính năng

**Trình duyệt (kiểu Drive)**
- Cây thư mục bên trái, breadcrumb, xem dạng lưới (có thumbnail) hoặc danh sách
- Sắp xếp theo tên / ngày sửa / dung lượng, mục *Recent*
- Tìm kiếm toàn bộ (không phân biệt dấu tiếng Việt), phím tắt `/`
- Mỗi game và thư mục đều có link riêng, gửi link cho người khác được

**Trình xem (kiểu AppLovin)**
- Khung thiết bị: iPhone 15, iPhone SE, Pixel 7, Galaxy S23, iPad; tự co giãn cho vừa màn hình
- Xoay dọc/ngang (`O`), reload (`R`), toàn màn hình (iPhone: game phủ kín cửa sổ), mở file gốc, copy link, `Esc` để quay lại
- **Giả lập MRAID 3.0** (bật/tắt được): `ready`, `stateChange`, `viewableChange`, `sizeChange`, `mraid.open()`...
  Bấm CTA sẽ **mở link store thật** ở tab mới (tắt được bằng "Open CTA store links") + ghi vào log. Cũng bắt `window.open` và `ExitApi.exit()`.
- **Event log**: CTA, lời gọi MRAID, lỗi JS, file asset không tải được, `console.error/warn`
- **AppLovin checks**: ≤ 5 MB, là file HTML đơn, có gọi `mraid.open()`, không load resource từ URL ngoài
- **QR code** để quét bằng điện thoại và chơi toàn màn hình
- Trên điện thoại: game tự tràn toàn màn hình, các công cụ nằm trong nút ☰

## Lưu ý
- GitHub Pages giới hạn ~1 GB/site, file < 100 MB. Nếu có nhiều asset nặng, cân nhắc Git LFS (workflow đã bật `lfs: true`).
- Game được chạy cùng origin với trang web (cần để giả lập MRAID); chỉ nên để game của team trong repo.
