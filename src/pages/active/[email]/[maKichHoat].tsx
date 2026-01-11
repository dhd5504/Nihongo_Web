import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { env } from "~/env.mjs";

function AccountActive() {
  const router = useRouter();
  const { email, maKichHoat } = router.query; // Lấy tham số từ URL
  const [daKichHoat, setDaKichHoat] = useState(false);
  const [thongBao, setThongBao] = useState("");

  useEffect(() => {
    if (email && maKichHoat) {
      thucHienKichHoat();
    }
  }, [email, maKichHoat]); // Chạy lại khi email hoặc maKichHoat thay đổi
  const thucHienKichHoat = async () => {
    console.log("Email:", email);
    console.log("MaKichHoat:", maKichHoat);
    try {
      // const url: string = `https://nihongo-nhom26-latest.onrender.com/account/active?email=${email}&activeNumber=${maKichHoat}`;
      const url: string = `${env.NEXT_PUBLIC_API_BASE_URL}/account/active?email=${email}&activeNumber=${maKichHoat}`;
      const response = await fetch(url, { method: "GET" });

      if (response.ok) {
        setDaKichHoat(true);
        setTimeout(() => {
          void router.push("/");
        }, 5000);
      } else {
        setThongBao(await response.text());
      }
    } catch (error) {
      console.log("Lỗi khi kích hoạt: ", error);
    }
  };

  return (
    <div className="m-10 flex flex-1 content-center items-center justify-center">
      <h1>Kích hoạt tài khoản</h1> <br />
      {daKichHoat ? (
        <p>
          Tài khoản đã kích hoạt thành công, bạn hãy đăng nhập để tiếp tục sử
          dụng dịch vụ!
        </p>
      ) : (
        <p>{thongBao}</p>
      )}
    </div>
  );
}

export default AccountActive;
