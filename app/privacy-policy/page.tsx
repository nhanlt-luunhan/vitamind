import type { Metadata } from "next";
import { Layout } from "@/components/layout/Layout";
import styles from "./privacy-policy.module.css";

export const metadata: Metadata = {
    title: "Chính sách Quyền riêng tư – VITAMIND",
    description:
        "Chính sách quyền riêng tư của VITAMIND. Tìm hiểu cách chúng tôi thu thập, sử dụng và bảo vệ dữ liệu cá nhân của bạn.",
    alternates: {
        canonical: "https://app.vitamind.com.vn/privacy-policy",
    },
    openGraph: {
        title: "Chính sách Quyền riêng tư – VITAMIND",
        description:
            "Chính sách quyền riêng tư của VITAMIND. Tìm hiểu cách chúng tôi thu thập, sử dụng và bảo vệ dữ liệu cá nhân của bạn.",
        url: "https://app.vitamind.com.vn/privacy-policy",
        type: "website",
    },
};

const sections = [
    {
        icon: "fi fi-rr-info",
        title: "1. Thông tin chúng tôi thu thập",
        content: [
            "Khi bạn đăng ký hoặc đăng nhập vào VITAMIND bằng tài khoản Google hoặc email, chúng tôi có thể thu thập các thông tin sau:",
        ],
        list: [
            "Tên hiển thị và địa chỉ email từ tài khoản Google của bạn",
            "Ảnh đại diện (avatar) được liên kết với tài khoản Google",
            "Thông tin nhận dạng người dùng (User ID) do hệ thống tạo ra",
            "Thời gian đăng nhập và hoạt động trên nền tảng",
        ],
    },
    {
        icon: "fi fi-rr-settings",
        title: "2. Cách chúng tôi sử dụng thông tin",
        content: ["Thông tin thu thập được sử dụng cho các mục đích sau:"],
        list: [
            "Xác thực danh tính và quản lý phiên đăng nhập của bạn",
            "Cá nhân hóa trải nghiệm người dùng trên VITAMIND",
            "Lưu trữ lịch sử đọc, bình luận và các tương tác của bạn",
            "Gửi thông báo liên quan đến tài khoản (khi cần thiết)",
            "Cải thiện dịch vụ và trải nghiệm người dùng",
        ],
    },
    {
        icon: "fi fi-rr-shield-check",
        title: "3. Bảo mật dữ liệu",
        content: [
            "Chúng tôi cam kết bảo vệ dữ liệu cá nhân của bạn bằng các biện pháp kỹ thuật và tổ chức phù hợp:",
        ],
        list: [
            "Dữ liệu được mã hóa khi truyền tải qua giao thức HTTPS/TLS",
            "Mật khẩu (nếu có) được băm bằng thuật toán bảo mật hiện đại",
            "Chỉ những người được ủy quyền mới có quyền truy cập dữ liệu người dùng",
            "Chúng tôi không bán hoặc cho thuê dữ liệu cá nhân của bạn cho bên thứ ba",
        ],
    },
    {
        icon: "fi fi-rr-share",
        title: "4. Chia sẻ thông tin với bên thứ ba",
        content: [
            "VITAMIND sử dụng các dịch vụ bên thứ ba đáng tin cậy để vận hành nền tảng:",
        ],
        list: [
            "Google OAuth 2.0 – Dịch vụ xác thực đăng nhập",
            "He thong xac thuc noi bo cua VITAMIND – Quan ly tai khoan va phien nguoi dung",
            "PostgreSQL Database – Lưu trữ dữ liệu người dùng an toàn",
        ],
        note: "Chúng tôi không chia sẻ thông tin cá nhân của bạn với bên thứ ba ngoài phạm vi nêu trên, trừ khi có yêu cầu pháp lý bắt buộc.",
    },
    {
        icon: "fi fi-rr-cookie",
        title: "5. Cookie và lưu trữ cục bộ",
        content: ["Chúng tôi sử dụng cookie và localStorage để:"],
        list: [
            "Duy trì phiên đăng nhập của bạn giữa các lần truy cập",
            "Ghi nhớ tùy chọn giao diện (chủ đề sáng/tối)",
            "Cải thiện hiệu suất tải trang",
        ],
        note: "Bạn có thể tắt cookie trong trình duyệt, tuy nhiên điều này có thể ảnh hưởng đến một số tính năng của trang web.",
    },
    {
        icon: "fi fi-rr-user-gear",
        title: "6. Quyền của người dùng",
        content: ["Bạn có các quyền sau đối với dữ liệu cá nhân của mình:"],
        list: [
            "Quyền truy cập: Xem dữ liệu cá nhân chúng tôi lưu giữ về bạn",
            "Quyền chỉnh sửa: Cập nhật thông tin tài khoản trong phần cài đặt",
            "Quyền xóa: Yêu cầu xóa tài khoản và toàn bộ dữ liệu liên quan",
            "Quyền rút lại đồng ý: Hủy liên kết đăng nhập Google bất kỳ lúc nào",
        ],
    },
    {
        icon: "fi fi-rr-time-half-past",
        title: "7. Lưu giữ dữ liệu",
        content: [
            "Chúng tôi lưu giữ dữ liệu cá nhân của bạn trong suốt thời gian tài khoản còn hoạt động. Sau khi bạn yêu cầu xóa tài khoản, dữ liệu sẽ được xóa vĩnh viễn trong vòng 30 ngày, trừ các trường hợp pháp luật yêu cầu lưu giữ lâu hơn.",
        ],
    },
    {
        icon: "fi fi-rr-file-edit",
        title: "8. Thay đổi chính sách",
        content: [
            "Chúng tôi có thể cập nhật Chính sách Quyền riêng tư này theo thời gian. Mọi thay đổi đáng kể sẽ được thông báo trên trang web hoặc qua email. Ngày cập nhật gần nhất sẽ luôn được hiển thị ở đầu trang này.",
        ],
    },
    {
        icon: "fi fi-rr-envelope",
        title: "9. Liên hệ",
        content: [
            "Nếu bạn có bất kỳ câu hỏi, thắc mắc hoặc yêu cầu liên quan đến quyền riêng tư, vui lòng liên hệ với chúng tôi:",
        ],
        list: [
            "Website: app.vitamind.com.vn",
            "Email: admin@vitamind.com.vn",
        ],
    },
];

export default function PrivacyPolicyPage() {
    const lastUpdated = "04 tháng 03 năm 2026";

    return (
        <Layout>
            <div className={styles.page}>
                {/* Hero */}
                <div className={styles.hero}>
                    <div className={styles.heroInner}>
                        <div className={styles.heroIcon}>
                            <i className="fi fi-rr-shield-check" />
                        </div>
                        <h1 className={styles.heroTitle}>Chính sách Quyền riêng tư</h1>
                        <p className={styles.heroSubtitle}>
                            Chúng tôi tôn trọng quyền riêng tư của bạn và cam kết bảo vệ
                            thông tin cá nhân một cách minh bạch và có trách nhiệm.
                        </p>
                        <div className={styles.heroMeta}>
                            <span>
                                <i className="fi fi-rr-calendar" />
                                Cập nhật lần cuối: {lastUpdated}
                            </span>
                            <span>
                                <i className="fi fi-rr-globe" />
                                Áp dụng cho: app.vitamind.com.vn
                            </span>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className={styles.content}>
                    <div className={styles.contentInner}>
                        {/* Intro card */}
                        <div className={styles.introCard}>
                            <i className="fi fi-rr-info" />
                            <p>
                                Bằng việc sử dụng VITAMIND và đăng nhập bằng tài khoản Google,
                                bạn đồng ý với Chính sách Quyền riêng tư này. Vui lòng đọc kỹ
                                trước khi sử dụng dịch vụ.
                            </p>
                        </div>

                        {/* Sections */}
                        <div className={styles.sections}>
                            {sections.map((section, idx) => (
                                <section key={idx} className={styles.section}>
                                    <div className={styles.sectionHeader}>
                                        <div className={styles.sectionIconWrap}>
                                            <i className={section.icon} />
                                        </div>
                                        <h2 className={styles.sectionTitle}>{section.title}</h2>
                                    </div>
                                    <div className={styles.sectionBody}>
                                        {section.content.map((para, pIdx) => (
                                            <p key={pIdx} className={styles.paragraph}>
                                                {para}
                                            </p>
                                        ))}
                                        {section.list && (
                                            <ul className={styles.list}>
                                                {section.list.map((item, lIdx) => (
                                                    <li key={lIdx} className={styles.listItem}>
                                                        <i className="fi fi-rr-check" />
                                                        <span>{item}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                        {section.note && (
                                            <div className={styles.note}>
                                                <i className="fi fi-rr-triangle-warning" />
                                                <p>{section.note}</p>
                                            </div>
                                        )}
                                    </div>
                                </section>
                            ))}
                        </div>

                        {/* Footer notice */}
                        <div className={styles.footerNotice}>
                            <i className="fi fi-rr-lock" />
                            <p>
                                Chính sách này tuân thủ các quy định của Google OAuth 2.0 và
                                các yêu cầu Authorized Domains. Trang này là điều kiện bắt buộc
                                để sử dụng dịch vụ đăng nhập Google trên app.vitamind.com.vn.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
