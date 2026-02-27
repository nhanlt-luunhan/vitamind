import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui";

const SingleContent = () => {
  return (
    <>
      <div className="content-detail border-gray-800">
        <p className="text-xl color-gray-500">
          Home Assistant là “bộ não” điều khiển ngôi nhà thông minh của bạn. Dưới đây là bản hướng
          dẫn rút gọn, viết lại cho dễ làm, dễ hiểu và đủ đẹp để bạn vừa đọc vừa làm theo trên
          Raspberry Pi.
        </p>
        <div className="mt-20 mb-20">
          <Image
            width={730}
            height={330}
            className="img-bdrd-16"
            src="/assets/imgs/page/single/img.jpg"
            alt="Home Assistant trên Raspberry Pi"
          />
        </div>
        <p className="text-lg color-gray-500 mb-50">
          Mục tiêu: cài Home Assistant OS lên Raspberry Pi, bật máy là dùng. Bạn sẽ có một dashboard
          trung tâm, tự động hóa thiết bị, và mở rộng được về sau.
        </p>
        <h3 className="color-white mb-30">Chuẩn bị trước khi bắt đầu</h3>
        <ul className="text-lg color-gray-500">
          <li>Raspberry Pi (khuyến nghị Pi 4 hoặc Pi 5) + nguồn tốt.</li>
          <li>Thẻ microSD 32GB+ (Class 10) hoặc SSD nếu muốn ổn định hơn.</li>
          <li>Máy tính có thể ghi image (Windows/macOS/Linux).</li>
          <li>Kết nối mạng ổn định (LAN càng tốt).</li>
        </ul>
        <div className="bg-gray-850 box-quote">
          <h3 className="color-gray-500">
            “Cài Home Assistant giống như cắm não cho ngôi nhà: ban đầu hơi kỹ thuật, nhưng một lần
            xong là thấy ‘đáng’ ngay.”
          </h3>
          <div className="d-inline-block mt-40">
            <div className="box-author">
              <Image width={48} height={48} src="/assets/imgs/page/about/author2.png" alt="Genz" />
              <div className="author-info">
                <h6 className="color-gray-700">Lưu Nhân</h6>
              </div>
            </div>
          </div>
        </div>
        <h4 className="color-white mt-40 mb-30">Bước 1: Ghi Home Assistant OS vào thẻ</h4>
        <p className="text-lg color-gray-500">
          Mở Raspberry Pi Imager, chọn đúng model Pi, chọn “Home Assistant OS”, rồi ghi vào thẻ/SSD.
          Nếu muốn cấu hình Wi‑Fi từ đầu, hãy điền SSID + mật khẩu ngay trong bước ghi.
        </p>
        <div className="row">
          <div className="col-lg-8 mb-30">
            <h4 className="color-white mb-30">Bước 2: Cắm thẻ và khởi động</h4>
            <p className="text-lg color-gray-500 mb-40">
              Cắm thẻ vào Pi, nối mạng (LAN khuyến nghị), cấp nguồn. Lần khởi động đầu có thể mất
              thời gian vì hệ thống tải và chuẩn bị bản mới. Khi hoàn tất, truy cập:{" "}
              <strong className="color-white">http://homeassistant.local:8123</strong>
            </p>
            <p className="text-lg color-gray-500">
              Nếu không vào được, mở router để tìm IP của Pi, rồi truy cập bằng IP trực tiếp.
            </p>
          </div>
          <div className="col-lg-4">
            <Image
              width={227}
              height={300}
              className="img-bdrd-16 mb-30"
              src="/assets/imgs/page/single/img2.jpg"
              alt="Khởi động Home Assistant"
            />
          </div>
        </div>
        <h4 className="color-white mt-40 mb-30">Bước 3: Thiết lập tài khoản & khu vực</h4>
        <p className="text-lg color-gray-500">
          Lần đầu truy cập, Home Assistant sẽ hỏi bạn tạo tài khoản, chọn múi giờ và vị trí. Đây là
          phần quan trọng để tự động hóa theo thời tiết và thời gian địa phương.
        </p>
        <h4 className="color-white mt-40 mb-30">Tùy chọn: IP tĩnh và tối ưu độ ổn định</h4>
        <p className="text-lg color-gray-500">
          Nếu bạn muốn truy cập ổn định, hãy đặt IP tĩnh cho Pi trong router. Ngoài ra, dùng SSD qua
          USB 3.0 sẽ giúp hệ thống mượt hơn khi chạy nhiều add‑on hoặc ghi log.
        </p>
        <div className="row mt-50">
          <div className="col-lg-6 gallery-left">
            <Image
              width={330}
              height={372}
              className="img-bdrd-16 mb-30"
              src="/assets/imgs/page/single/img3.jpg"
              alt="Thiết lập khu vực"
            />
          </div>
          <div className="col-lg-6 gallery-right">
            <Image
              width={376}
              height={176}
              className="img-bdrd-16 mb-20"
              src="/assets/imgs/page/single/img4.jpg"
              alt="Dashboard Home Assistant"
            />
            <Image
              width={376}
              height={176}
              className="img-bdrd-16"
              src="/assets/imgs/page/single/img5.jpg"
              alt="Tích hợp thiết bị"
            />
          </div>
        </div>
        <p className="text-center text-lg color-gray-500">Ổn định trước – thông minh sau</p>
        <h3 className="color-white mt-50 mb-30">Mẹo nhỏ để chạy mượt hơn</h3>
        <ul className="text-lg color-gray-500">
          <li>Dùng SSD nếu bạn chạy nhiều add‑on hoặc ghi log liên tục.</li>
          <li>Đặt IP tĩnh để tránh đổi IP khi router khởi động lại.</li>
          <li>Sao lưu định kỳ (Settings → System → Backups).</li>
        </ul>
      </div>
      <div className="box-tags">
        <Button
          asChild
          unstyled
          className="btn btn-tags bg-gray-850 border-gray-800 mr-10 hover-up"
        >
          <Link href="/blog">#HomeAssistant</Link>
        </Button>
        <Button
          asChild
          unstyled
          className="btn btn-tags bg-gray-850 border-gray-800 mr-10 hover-up"
        >
          <Link href="/blog">#RaspberryPi</Link>
        </Button>
        <Button
          asChild
          unstyled
          className="btn btn-tags bg-gray-850 border-gray-800 mr-10 hover-up"
        >
          <Link href="/blog">#SmartHome</Link>
        </Button>
        <Button asChild unstyled className="btn btn-tags bg-gray-850 border-gray-800 hover-up">
          <Link href="/blog">#CaiDat</Link>
        </Button>
      </div>
      <div className="box-comments border-gray-800">
        <h3 className="text-heading-2 color-gray-300">Bình luận</h3>
        <div className="list-comments-single">
          <div className="item-comment">
            <div className="comment-left">
              <div className="box-author mb-20">
                <Image
                  width={48}
                  height={48}
                  src="/assets/imgs/page/single/author.png"
                  alt="Genz"
                />
                <div className="author-info">
                  <h6 className="color-gray-700">Tuấn Kiệt</h6>
                  <span className="color-gray-700 text-sm mr-30">24/02/2026</span>
                </div>
              </div>
            </div>
            <div className="comment-right">
              <div className="text-comment text-xl color-gray-500 bg-gray-850 border-gray-800">
                Bài viết rất rõ ràng, mình làm theo là lên dashboard ngay. Cảm ơn bạn!
              </div>
            </div>
          </div>
          <div className="item-comment">
            <div className="comment-left">
              <div className="box-author mb-20">
                <Image
                  width={48}
                  height={48}
                  src="/assets/imgs/page/single/author2.png"
                  alt="Genz"
                />
                <div className="author-info">
                  <h6 className="color-gray-700">Ngọc Lan</h6>
                  <span className="color-gray-700 text-sm mr-30">24/02/2026</span>
                </div>
              </div>
            </div>
            <div className="comment-right">
              <div className="text-comment text-xl color-gray-500 bg-gray-850 border-gray-800">
                Mình dùng Wi‑Fi mà hay rớt. Chuyển sang LAN xong ổn hẳn.
              </div>
            </div>
          </div>
          <div className="item-comment item-comment-sub">
            <div className="comment-left">
              <div className="box-author mb-20">
                <Image
                  width={48}
                  height={48}
                  src="/assets/imgs/page/single/author3.png"
                  alt="Genz"
                />
                <div className="author-info">
                  <h6 className="color-gray-700">Hải Nam</h6>
                  <span className="color-gray-700 text-sm mr-30">24/02/2026</span>
                </div>
              </div>
            </div>
            <div className="comment-right">
              <div className="text-comment text-xl color-gray-500 bg-gray-850 border-gray-800">
                Có thể dùng SSD qua USB 3.0, chạy mượt hơn hẳn thẻ nhớ.
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="box-form-comments mb-50">
        <h4 className="text-heading-4 color-gray-300 mb-40">Để lại bình luận</h4>
        <div className="box-forms">
          <form action="">
            <textarea
              className="form-control bg-gray-850 border-gray-800 bdrd16 color-gray-500"
              name="comment"
              rows={5}
              placeholder="Viết bình luận của bạn"
              defaultValue={""}
            />
            <div className="row mt-20">
              <div className="col-sm-6 mb-20">
                <input className="cb-agree" type="checkbox" />
                <p className="text-sm color-gray-500 pl-25">
                  Lưu tên và email của tôi cho lần bình luận sau.
                </p>
              </div>
              <div className="col-sm-6 text-end">
                <Button unstyled className="btn btn-linear" type="submit">
                  Gửi bình luận
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export { SingleContent };
