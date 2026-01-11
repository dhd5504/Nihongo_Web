import Link from "next/link";
import { CloseSvg } from "./Svgs";
import type { ComponentProps } from "react";
import React, { useEffect, useRef, useState } from "react";
import { useBoundStore } from "src/hooks/useBoundStore";
import { useRouter } from "next/router";
import { checkNewUser, signin, signup } from "~/db/queries";
import Fetching from "./Fetching";
import { useToast } from "~/context/toast";
import { getIdUserByToken } from "~/utils/JWTService";
import { isAxiosError } from "axios";

export const GoogleLogoSvg = (props: ComponentProps<"svg">) => {
  return (
    <svg viewBox="0 0 48 48" {...props}>
      <g>
        <path
          fill="#EA4335"
          d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
        ></path>
        <path
          fill="#4285F4"
          d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
        ></path>
        <path
          fill="#FBBC05"
          d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
        ></path>
        <path
          fill="#34A853"
          d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
        ></path>
        <path fill="none" d="M0 0h48v48H0z"></path>
      </g>
    </svg>
  );
};

export type LoginScreenState = "HIDDEN" | "LOGIN" | "SIGNUP";

export const useLoginScreen = () => {
  const router = useRouter();
  const loggedIn = useBoundStore((x) => x.loggedIn);
  const queryState: LoginScreenState = (() => {
    if (loggedIn) return "HIDDEN";
    if ("login" in router.query) return "LOGIN";
    if ("sign-up" in router.query) return "SIGNUP";
    return "HIDDEN";
  })();
  const [loginScreenState, setLoginScreenState] = useState(queryState);
  useEffect(() => setLoginScreenState(queryState), [queryState]);
  return { loginScreenState, setLoginScreenState };
};

export const LoginScreen = ({
  loginScreenState,
  setLoginScreenState,
}: {
  loginScreenState: LoginScreenState;
  setLoginScreenState: React.Dispatch<React.SetStateAction<LoginScreenState>>;
}) => {
  const router = useRouter();
  const loggedIn = useBoundStore((x) => x.loggedIn);
  const logIn = useBoundStore((x) => x.logIn);
  const setUsername = useBoundStore((x) => x.setUsername);
  const setName = useBoundStore((x) => x.setName);

  const [ageTooltipShown, setAgeTooltipShown] = useState(false);

  const nameInputRef = useRef<null | HTMLInputElement>(null);

  const [form, setForm] = useState<{
    username: string;
    age: string;
    email: string;
    password: string;
    confirmPassword: string;
  }>({
    username: "",
    age: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState<{
    email: string;
    password: string;
    confirmPassword: string;
  }>({
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    if (loginScreenState !== "HIDDEN" && loggedIn) {
      setLoginScreenState("HIDDEN");
    }
  }, [loginScreenState, loggedIn, setLoginScreenState]);

  const logInAndSetUserProperties = async () => {
    if (loginScreenState === "SIGNUP") {
      setErrors({
        email: "",
        password: "",
        confirmPassword: "",
      });
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(form.email.trim())) {
        setErrors((prev) => ({ ...prev, email: "Email không hợp lệ" }));
        return;
      }
      const passwordRegex = /^(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
      if (!passwordRegex.test(form.password)) {
        setErrors((prev) => ({
          ...prev,
          password:
            "Mật khẩu phải có ít nhất 8 ký tự và bao gồm ít nhất 1 ký tự đặc biệt (!@#$%^&*)",
        }));
        return;
      }
      if (form.password !== form.confirmPassword) {
        setErrors((prev) => ({
          ...prev,
          confirmPassword: "Mật khẩu và nhập lại mật khẩu không khớp",
        }));
        return;
      }
      try {
        setLoading(true);
        await signup(form);
        addToast("Đăng ký thành công", "success");
        void router.push("/");
      } catch (error) {
        if (isAxiosError(error)) {
          if (error.response?.status === 409) {
            setErrors((prev) => ({
              ...prev,
              email: "Email đã được đăng ký",
            }));
            return;
          }
          if (error.response?.data?.message) {
            const message = String(error.response.data.message);
            setErrors((prev) => ({
              ...prev,
              email:
                message === "Tên đăng nhập đã tồn tại."
                  ? "Email đã được đăng ký"
                  : message,
            }));
            return;
          }
        }
        addToast(String(error), "error");
      } finally {
        setForm({
          username: "",
          age: "",
          email: "",
          password: "",
          confirmPassword: "",
        });
        setLoading(false);
      }
    } else {
      try {
        setLoading(true);
        const user = await signin({
          username: form.email,
          password: form.password,
        });
        const userId = getIdUserByToken();
        setForm({
          username: "",
          age: "",
          email: "",
          password: "",
          confirmPassword: "",
        });
        if (userId != null && !(await checkNewUser(userId))) {
          void router.push("/register");
        } else {
          void router.push("/learn");
        }
      } catch (error) {
        console.log(error);
        addToast(String(error), "error");
      } finally {
        setLoading(false);
      }
    }
  };

  if (loading) {
    return <Fetching />;
  }

  return (
    <article
      className={[
        "fixed inset-0 z-30 flex flex-col bg-white p-7 transition duration-300",
        loginScreenState === "HIDDEN"
          ? "pointer-events-none opacity-0"
          : "opacity-100",
      ].join(" ")}
      aria-hidden={!loginScreenState}
    >
      <header className="flex flex-row-reverse justify-between sm:flex-row">
        <button
          className="flex text-gray-400"
          onClick={() => setLoginScreenState("HIDDEN")}
        >
          <CloseSvg />
          <span className="sr-only"></span>
        </button>
        <button
          className="hidden rounded-2xl border-2 border-b-4 border-gray-200 px-4 py-3 text-sm font-bold uppercase text-blue-400 transition hover:bg-gray-50 hover:brightness-90 sm:block"
          onClick={() =>
            setLoginScreenState((x) => (x === "LOGIN" ? "SIGNUP" : "LOGIN"))
          }
        >
          {loginScreenState === "LOGIN" ? "Sign up" : "Login"}
        </button>
      </header>
      <div className="flex grow items-center justify-center">
        <div className="flex w-full flex-col gap-5 sm:w-96">
          <h2 className="text-center text-2xl font-bold text-gray-800">
            {loginScreenState === "LOGIN" ? "Đăng nhập" : "Tạo tài khoản"}
          </h2>
          <div className="flex flex-col gap-2 text-black">
            {loginScreenState === "SIGNUP" && (
              <>
                <div className="relative flex grow">
                  <input
                    className="grow rounded-2xl border-2 border-gray-200 bg-gray-50 px-4 py-3"
                    placeholder="Họ và tên"
                    value={form.age}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        age: e.target.value,
                      })
                    }
                  />
                  <div className="absolute bottom-0 right-0 top-0 flex items-center justify-center pr-4">
                    <div
                      className="relative flex h-6 w-6 cursor-pointer items-center justify-center rounded-full border-2 border-gray-200 text-gray-400"
                      onMouseEnter={() => setAgeTooltipShown(true)}
                      onMouseLeave={() => setAgeTooltipShown(false)}
                      onClick={() => setAgeTooltipShown((x) => !x)}
                      role="button"
                      tabIndex={0}
                      aria-label="Tại sao bạn cần độ tuổi?"
                    >
                      ?
                      {ageTooltipShown && (
                        <div className="absolute -right-5 top-full z-10 w-72 rounded-2xl border-2 border-gray-200 bg-white p-4 text-center text-xs leading-5 text-gray-800">
                          Cung cấp độ tuổi của bạn để đảm bảo bạn có được trải
                          nghiệm Duolingo phù hợp. Để biết thêm chi tiết, vui
                          lòng truy cập{" "}
                          <Link
                            href="https://www.privacy"
                            className="text-blue-700"
                          >
                            Chính sách bảo mật
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <input
                  className="grow rounded-2xl border-2 border-gray-200 bg-gray-50 px-4 py-3"
                  placeholder="Tên đăng nhập"
                  ref={nameInputRef}
                  value={form.username}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      username: e.target.value,
                    })
                  }
                />
              </>
            )}
            <input
              className="grow rounded-2xl border-2 border-gray-200 bg-gray-50 px-4 py-3"
              placeholder={
                loginScreenState === "LOGIN"
                  ? "Email hoặc tên đăng nhập"
                  : "Email"
              }
              value={form.email}
              onChange={(e) =>
                  setForm({
                    ...form,
                    email: e.target.value,
                  })
                }
              />
            {errors.email && (
              <p className="mt-1 text-xs text-rose-500">{errors.email}</p>
            )}
            <div className="relative flex grow">
              <input
                className="grow rounded-2xl border-2 border-gray-200 bg-gray-50 px-4 py-3"
                placeholder="Mật khẩu "
                type="password"
                value={form.password}
                onChange={(e) =>
                    setForm({
                      ...form,
                      password: e.target.value,
                    })
                  }
                />
              {errors.password && (
                <p className="mt-1 text-xs text-rose-500">{errors.password}</p>
              )}
              {loginScreenState === "LOGIN" && (
                <div className="absolute bottom-0 right-0 top-0 flex items-center justify-center pr-5">
                  <Link
                    className="font-bold uppercase text-gray-400 hover:brightness-75"
                    href="/forgot-password"
                  >
                    Quên mật khẩu?
                  </Link>
                </div>
              )}
            </div>
            {loginScreenState === "SIGNUP" && (
              <div className="relative flex grow">
                <input
                  className="grow rounded-2xl border-2 border-gray-200 bg-gray-50 px-4 py-3"
                  placeholder="Nhập lại mật khẩu"
                  type="password"
                  value={form.confirmPassword}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      confirmPassword: e.target.value,
                    })
                  }
                />
                {errors.confirmPassword && (
                  <p className="mt-1 text-xs text-rose-500">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>
            )}
          </div>
          <button
            className="rounded-2xl border-b-4 border-blue-500 bg-blue-400 py-3 font-bold uppercase text-white transition hover:brightness-110"
            onClick={logInAndSetUserProperties}
          >
            {loginScreenState === "LOGIN" ? "Đăng nhập" : "Tạo tài khoản"}
          </button>
          <div className="flex items-center gap-2"></div>

          <p className="text-center text-xs leading-5 text-gray-400">
            Bằng cách đăng nhập vào Duolingo, bạn đồng ý với{" "}
            <Link
              className="font-bold"
              href="https://www.duolingo.com/terms?wantsPlainInfo=1"
            >
              Điều khoản
            </Link>{" "}
            và{" "}
            <Link
              className="font-bold"
              href="https://www.duolingo.com/privacy?wantsPlainInfo=1"
            >
              Chính sách bảo mật
            </Link>
            .
          </p>
          <p className="block text-center sm:hidden">
            <span className="text-sm font-bold text-gray-700">
              {loginScreenState === "LOGIN"
                ? "Không có tài khoản?"
                : "Đã có tài khoản?"}
            </span>{" "}
            <button
              className="text-sm font-bold uppercase text-blue-400"
              onClick={() =>
                setLoginScreenState((x) => (x === "LOGIN" ? "SIGNUP" : "LOGIN"))
              }
            >
              {loginScreenState === "LOGIN" ? "sign up" : "log in"}
            </button>
          </p>
        </div>
      </div>
    </article>
  );
};
