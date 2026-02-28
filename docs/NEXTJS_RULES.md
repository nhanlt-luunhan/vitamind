# Next.js Rules For Vitamind

Cap nhat: 2026-02-28

Tai lieu nay tong hop cac kha nang chinh cua Next.js theo docs chinh thuc va chuyen thanh quy tac ap dung rieng cho repo `vitamind`.

## Nguon chinh

- https://nextjs.org/docs/app
- https://nextjs.org/docs/app/building-your-application/rendering/server-components
- https://nextjs.org/docs/app/building-your-application/rendering/client-components
- https://nextjs.org/docs/app/building-your-application/data-fetching
- https://nextjs.org/docs/app/deep-dive/caching
- https://nextjs.org/docs/app/building-your-application/routing/route-handlers
- https://nextjs.org/docs/app/building-your-application/routing/redirecting
- https://nextjs.org/docs/app/getting-started/metadata-and-og-images
- https://nextjs.org/docs/app/api-reference/file-conventions/proxy
- https://nextjs.org/docs/app/getting-started/images
- https://nextjs.org/docs/app/getting-started/fonts
- https://nextjs.org/docs/app/guides/self-hosting

## 1. Next.js cung cap gi cho repo nay

### 1. App Router

Next.js App Router cung cap:

- route theo thu muc `app/`
- `layout.tsx` de chia se shell
- `page.tsx` de render route
- `loading.tsx`, `error.tsx`, `not-found.tsx` de tach trang thai tai, loi, 404
- route groups va dynamic segments
- route handlers trong `app/**/route.ts`

Trang thai hien tai cua repo:

- repo da dung App Router
- co route group `(blog)`, `(public)`, `(shop)`
- co route handlers cho `api`, `adminer`, `sitemap.xml`

### 2. Server Components va Client Components

Theo docs, App Router mac dinh uu tien Server Components. Client Components chi dung khi can:

- `useState`, `useEffect`, event handlers
- truy cap `window`, `document`, `sessionStorage`
- tuong tac browser time

Trang thai hien tai cua repo:

- admin shell, auth shell, header, user menu, zalo widget dang la client components
- blog pages, layouts, metadata handling phan lon la server side

### 3. Data fetching, rendering, cache

Next.js cho phep:

- fetch tren server
- static rendering
- dynamic rendering
- revalidate theo route segment
- invalidation bang `revalidatePath` va `revalidateTag`
- route handler cache control

Trang thai hien tai cua repo:

- blog slug page dang dung `generateStaticParams` + `revalidate = 60`
- search API va adminer proxy da danh dau `dynamic = "force-dynamic"`
- auth/admin flow phu thuoc user session nen thuoc nhom dynamic

### 4. Metadata, Image, Font

Next.js cung cap:

- `metadata` va `generateMetadata`
- `next/image`
- `next/font/local` hoac Google fonts

Trang thai hien tai cua repo:

- root layout dang dung `metadata`
- blog slug page da dung `generateMetadata`
- project dang dung `next/image` rong rai
- font chinh dang duoc load qua `next/font/local`

### 5. Proxy va auth gating

Docs hien tai da dung ten `proxy.ts` thay cho `middleware.ts`. Proxy dung de:

- gate route truoc khi vao page
- redirect auth
- xu ly rewrite/redirect o edge

Trang thai hien tai cua repo:

- repo da dung `proxy.ts`
- `proxy.ts` dang gate `/admin`, `/account`, `/adminer`
- Clerk auth va RBAC dang dat tai day va tai `lib/auth`

### 6. Self-hosting va standalone output

Next.js ho tro tu host voi:

- Node server
- Docker
- `output: "standalone"` de giam footprint khi deploy

Trang thai hien tai cua repo:

- `next.config.mjs` da dung `output: "standalone"`
- phu hop voi Docker/Synology hien tai

## 2. Quy tac bat buoc cho du an

### A. Routing va file conventions

1. Chi dung App Router. Khong them `pages/` router moi.
2. `app/` chi chua route, layout, metadata, route handler va file conventions cua Next.
3. Logic UI dua vao `components/`. Logic server/helper dua vao `lib/`.
4. Route auth va admin khong duoc gate bang UI thuong. Gate phai o `proxy.ts` hoac helper server-side nhu `lib/auth/admin-auth.ts`.
5. Neu tao route dong moi, dung kieu params async cua App Router hien tai:
   - `type PageProps = { params: Promise<...> }`
   - `const { slug } = await params`

### B. Server/Client boundaries

1. Mac dinh viet page va layout la Server Components.
2. Chi them `"use client"` khi that su can state, effect, DOM API, browser storage hoac event handler.
3. Khong keo component cha len client neu chi co mot nut con can tuong tac. Tach mot client island nho hon.
4. Component client khong duoc tu xu ly auth/quyen theo cach tin vao browser. Quyen phai duoc kiem tra o server.

### C. Data fetching va cache

1. Public content co tinh on dinh nhu blog nen uu tien static hoac ISR.
2. Noi dung gan user, auth, admin, account, search request-time phai coi la dynamic.
3. Khi route hoac handler phu thuoc session, cookie, header, query real-time hoac DB admin, phai chi ro y do:
   - `dynamic = "force-dynamic"` o segment/handler, hoac
   - `fetch(..., { cache: "no-store" })` cho request nhay cam
4. Khong them cache ngam cho admin, Clerk, RBAC, Adminer proxy, profile, search.
5. Chi dung `revalidatePath` hoac `revalidateTag` khi co mutation va co du lieu dang duoc cache that su.
6. Neu sau nay them `unstable_cache`, phai tach ro:
   - key cache
   - TTL/revalidate
   - cach invalidation
   - danh sach route tuyet doi khong duoc cache

### D. Metadata, SEO, va dynamic pages

1. SEO dung `metadata` hoac `generateMetadata`, khong tu nhoi the `head` thu cong trong component thuong.
2. Dynamic blog/category pages phai co canonical URL ro rang.
3. Route khong tim thay phai dung `notFound()`, khong render fallback im lang.
4. Redirect route-level dung `redirect()` tu `next/navigation` neu dang trong server component/page.
5. JSON-LD duoc phep, nhung phai dua tu du lieu da duoc sanitize va dung type schema phu hop.

### E. Route handlers

1. API moi dat trong `app/api/**/route.ts`.
2. Chi dung `NextRequest`/`NextResponse` khi can API mo rong cua Next; neu khong can, uu tien Web API chuan.
3. Route handler co auth/quyen noi bo phai xac thuc server-side, khong tin gia tri tu client.
4. Proxy noi bo nhu `app/adminer/[[...adminerPath]]/route.ts` phai:
   - preserve method
   - preserve body khi can
   - loc/ghi de header can thiet
   - tu rewrite `location` neu backend redirect ve origin noi bo
5. API tim kiem va API theo query user phai tranh cache sai. Duy tri dynamic/no-store.

### F. Proxy, auth, va RBAC

1. Duy tri file `proxy.ts` theo convention moi cua Next.js. Khong tao lai `middleware.ts` moi.
2. Gate `/admin`, `/account`, `/adminer`, va API nhay cam ngay tai proxy hoac helper server.
3. Khi auth state phu thuoc Clerk session claims, phai co fallback server check nhu repo dang lam voi `/api/internal/admin-check`.
4. Neu deployment di qua reverse proxy/container, khong hard-code loopback cho request auth noi bo neu origin public moi la duong dung.

### G. Images, fonts, va assets

1. Dung `next/image` cho anh UI noi dung va asset chinh, trừ truong hop co ly do ro rang.
2. Dung `next/font/local` cho font noi bo de tranh FOIT/FOUT va de Next toi uu preload.
3. Metadata icon/favicon phai tro den asset that cua du an, khong de icon phat sinh ngoai y muon.
4. Khi them image remote domain, phai cap nhat `next.config.mjs` neu docs yeu cau cho pattern load anh.

### H. Deploy va runtime

1. Giữ `output: "standalone"` tru khi co ly do hạ tầng ro rang.
2. Moi thay doi lien quan deploy phai giu tuong thich voi Docker/Synology.
3. `allowedDevOrigins` chi dung cho development; khong dua workaround local vao production flow.
4. Route/feature phu thuoc env phai co fallback an toan va thong diep loi ro rang.

### I. Error/loading boundaries

1. Neu page moi co fetch cham, can them `loading.tsx` thay vi spinner tu phat trong client neu co the.
2. Neu khu vuc moi co kha nang throw loi server, can nhac `error.tsx` o segment do.
3. Khong de admin/search/auth roi vao trang thai treo im lang khi request fail.

## 3. Quy tac ap dung rieng cho Vitamind

### Public blog

- Giữ `generateStaticParams` cho slug neu tap bai viet co the xac dinh truoc.
- Giữ `revalidate` o muc hop ly cho noi dung bai viet.
- Metadata bai viet phai di tu `getPostBySlug`.

### Admin va account

- Luon dynamic.
- Khong cache theo route segment neu route can user/session/quyen thoi gian thuc.
- Phan quyen phai duoc check o `proxy.ts` va helper server, khong dua vao menu hien/hidden.

### Search API

- Duy tri `dynamic = "force-dynamic"`.
- Khong dua ket qua search va admin/product query vao cache mac dinh.

### Adminer proxy

- Giữ route handler proxy rieng trong App Router.
- Khong expose origin noi bo ra ngoai.
- Luon rewrite redirect header neu backend tra ve host noi bo.

### Auth UI

- Shell `sign-in/sign-up` co the la client component, nhung auth completion va redirect can giu theo flow server-safe cua Clerk.
- Cac route trung gian nhu `/login` va `/register` chi nen redirect sang canonical route `/sign-in`, `/sign-up`.

## 4. Checklist truoc khi merge thay doi Next.js

- Route moi da dat dung `app/` convention chua?
- Co thuc su can `"use client"` khong?
- Route nay la static hay dynamic? Da khai bao y do ro rang chua?
- Neu co auth/quyen, da gate o proxy hoac server helper chua?
- Neu co mutation, da co invalidation dung cach chua?
- Metadata/canonical/notFound/redirect da dung dung convention chua?
- Deploy Docker/Synology co bi anh huong boi env, origin, proxy hay standalone output khong?

## 5. Ghi chu quan trong cho repo nay

- Next.js docs hien tai da nhan manh `proxy.ts` thay cho `middleware.ts`.
- Trong App Router hien tai, `params` va mot so dynamic APIs duoc xu ly theo async model. Code moi nen follow kieu dang repo dang dung o blog page va adminer route.
- Khong dua quy tac cache chung chung vao admin/auth. O repo nay, do chinh xac cua session va RBAC quan trong hon toi uu cache.
