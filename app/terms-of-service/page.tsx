import type { Metadata } from "next";
import { Layout } from "@/components/layout/Layout";
import styles from "./terms-of-service.module.css";

export const metadata: Metadata = {
    title: "Điều khoản Dịch vụ – VITAMIND",
    description:
        "Điều khoản sử dụng dịch vụ của VITAMIND. Vui lòng đọc kỹ trước khi sử dụng nền tảng.",
    alternates: {
        canonical: "https://app.vitamind.com.vn/terms-of-service",
    },
    openGraph: {
        title: "Điều khoản Dịch vụ – VITAMIND",
        description:
            "Điều khoản sử dụng dịch vụ của VITAMIND. Vui lòng đọc kỹ trước khi sử dụng nền tảng.",
        url: "https://app.vitamind.com.vn/terms-of-service",
        type: "website",
    },
};

const sections = [
    {
        icon: "fi fi-rr-handshake",
        title: "1. Chấp nhận điều khoản",
        content: [
            "Bằng việc truy cập hoặc sử dụng VITAMIND (vitamind.store), bạn đồng ý bị ràng buộc bởi các Điều khoản Dịch vụ này. Nếu bạn không đồng ý với bất kỳ điều khoản nào, vui lòng không sử dụng dịch vụ của chúng tôi.",
        ],
    },
    {
        icon: "fi fi-rr-user",
        title: "2. Tài khoản người dùng",
        content: ["Khi tạo tài khoản trên VITAMIND, bạn có trách nhiệm:"],
        list: [
            "Cung cấp thông tin chính xác và đầy đủ khi đăng ký",
            "Bảo mật thông tin đăng nhập và không chia sẻ với người khác",
            "Thông báo ngay cho chúng tôi nếu phát hiện truy cập trái phép",
            "Chịu trách nhiệm pháp lý đối với mọi hoạt động dưới tài khoản của bạn",
        ],
    },
    {
        icon: "fi fi-rr-pencil",
        title: "3. Nội dung người dùng",
        content: [
            "Khi đăng tải nội dung (bài viết, bình luận, hình ảnh) lên VITAMIND, bạn đồng ý rằng:",
        ],
        list: [
            "Nội dung không vi phạm bản quyền, nhãn hiệu hoặc quyền sở hữu trí tuệ của bất kỳ bên thứ ba nào",
            "Nội dung không chứa thông tin sai lệch, gây hiểu nhầm hoặc có hại",
            "Nội dung không mang tính phân biệt đối xử, quấy rối hoặc bạo lực",
            "Bạn cấp cho VITAMIND quyền hiển thị nội dung đó trên nền tảng",
        ],
        note: "Chúng tôi có quyền xóa bất kỳ nội dung nào vi phạm các quy định trên mà không cần báo trước.",
    },
    {
        icon: "fi fi-rr-ban",
        title: "4. Hành vi bị cấm",
        content: ["Bạn không được phép thực hiện các hành vi sau trên VITAMIND:"],
        list: [
            "Đăng nhập hoặc cố gắng truy cập trái phép vào hệ thống",
            "Sử dụng bot, scraper hoặc công cụ tự động để thu thập dữ liệu",
            "Phát tán mã độc, virus hoặc bất kỳ phần mềm gây hại nào",
            "Spam, quảng cáo không được phép hoặc nội dung thương mại trái phép",
            "Giả mạo danh tính người dùng khác hoặc nhân viên VITAMIND",
        ],
    },
    {
        icon: "fi fi-rr-copyright",
        title: "5. Quyền sở hữu trí tuệ",
        content: [
            "Toàn bộ nội dung gốc, thiết kế, logo, mã nguồn và thương hiệu VITAMIND là tài sản của chúng tôi và được bảo vệ bởi luật sở hữu trí tuệ. Bạn không được sao chép, phân phối hoặc sử dụng cho mục đích thương mại mà không có sự cho phép bằng văn bản.",
        ],
    },
    {
        icon: "fi fi-rr-link",
        title: "6. Liên kết bên thứ ba",
        content: [
            "VITAMIND có thể chứa liên kết đến các trang web bên ngoài. Chúng tôi không chịu trách nhiệm về nội dung, chính sách bảo mật hoặc hoạt động của các trang web đó. Việc truy cập các liên kết này hoàn toàn do bạn quyết định và chịu rủi ro.",
        ],
    },
    {
        icon: "fi fi-rr-shield-exclamation",
        title: "7. Giới hạn trách nhiệm",
        content: [
            "VITAMIND được cung cấp trên cơ sở \"nguyên trạng\" (as-is). Chúng tôi không đảm bảo dịch vụ hoạt động liên tục, không có lỗi hoặc đáp ứng mọi yêu cầu của bạn. Trong phạm vi tối đa được pháp luật cho phép, chúng tôi không chịu trách nhiệm về bất kỳ thiệt hại trực tiếp, gián tiếp hoặc ngẫu nhiên nào phát sinh từ việc sử dụng dịch vụ.",
        ],
    },
    {
        icon: "fi fi-rr-pause",
        title: "8. Tạm ngưng và chấm dứt dịch vụ",
        content: [
            "Chúng tôi có quyền tạm ngưng hoặc chấm dứt tài khoản của bạn nếu:",
        ],
        list: [
            "Bạn vi phạm bất kỳ điều khoản nào trong tài liệu này",
            "Hoạt động của bạn gây hại cho người dùng khác hoặc hệ thống",
            "Theo yêu cầu của cơ quan pháp luật có thẩm quyền",
        ],
    },
    {
        icon: "fi fi-rr-file-edit",
        title: "9. Thay đổi điều khoản",
        content: [
            "Chúng tôi có thể cập nhật các Điều khoản Dịch vụ này bất cứ lúc nào. Những thay đổi quan trọng sẽ được thông báo trên trang web. Việc tiếp tục sử dụng dịch vụ sau khi thay đổi có hiệu lực đồng nghĩa với việc bạn chấp nhận các điều khoản mới.",
        ],
    },
    {
        icon: "fi fi-rr-envelope",
        title: "10. Liên hệ",
        content: [
            "Mọi thắc mắc về Điều khoản Dịch vụ, vui lòng liên hệ:",
        ],
        list: [
            "Website: app.vitamind.com.vn",
            "Email: admin@vitamind.com.vn",
        ],
    },
];

export default function TermsOfServicePage() {
    const lastUpdated = "04 tháng 03 năm 2026";

    return (
        <Layout>
            <div className={styles.page}>
                {/* Hero */}
                <div className={styles.hero}>
                    <div className={styles.heroInner}>
                        <div className={styles.heroIcon}>
                            <i className="fi fi-rr-document-signed" />
                        </div>
                        <h1 className={styles.heroTitle}>Điều khoản Dịch vụ</h1>
                        <p className={styles.heroSubtitle}>
                            Vui lòng đọc kỹ các điều khoản sử dụng dưới đây trước khi sử
                            sụng dịch vụ của VITAMIND.
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
                                bạn xác nhận rằng bạn đã đọc, hiểu và đồng ý với toàn bộ Điều
                                khoản Dịch vụ này.
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
                                Điều khoản này tuân thủ các yêu cầu của Google OAuth 2.0
                                và là điều kiện bắt buộc để app.vitamind.com.vn được phép sử
                                dụng dịch vụ đăng nhập bằng Google.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
