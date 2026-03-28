import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

import { Button } from "@app/components/Button";
import { SignupModal } from "@app/containers";
import { useLoginMutation } from "@lib/apis/mutations";
import { useModal } from "@lib/hooks";
import { useAuthStore } from "@lib/stores";

interface LoginFormValues {
  email: string;
  password: string;
}

const LoginPage = () => {
  const navigate = useNavigate();
  const [isShow, openModal, closeModal] = useModal();
  const { mutate, isPending, error } = useLoginMutation();
  const setTokens = useAuthStore(state => state.setTokens);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>();

  const onSubmit = (data: LoginFormValues) => {
    mutate(data, {
      onSuccess: ({ access_token, refresh_token, expires_in }) => {
        setTokens(access_token, refresh_token, expires_in);
        navigate("/");
      },
    });
  };

  return (
    <div className="flex h-screen items-center justify-center bg-gray-bg">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex w-[36rem] flex-col gap-[2rem] rounded-[1.2rem] bg-white p-[3.2rem] shadow-md"
      >
        <h1 className="text-[2.4rem] font-bold text-text-primary">로그인</h1>

        <div className="flex flex-col gap-[1.2rem]">
          <div className="flex flex-col gap-[0.4rem]">
            <label
              htmlFor="login-email"
              className="block text-[1.3rem] font-semibold text-text-secondary"
            >
              이메일
            </label>
            <input
              id="login-email"
              type="email"
              placeholder="이메일을 입력하세요"
              {...register("email", { required: true })}
              className="box-border h-[3.6rem] w-full rounded-[0.6rem] border border-[var(--color-border)] px-[1.2rem] text-[1.4rem] outline-none"
            />
            {errors.email?.message && (
              <p className="text-[1.2rem] text-error">{errors.email.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-[0.4rem]">
            <label
              htmlFor="login-password"
              className="block text-[1.3rem] font-semibold text-text-secondary"
            >
              비밀번호
            </label>
            <input
              id="login-password"
              type="password"
              placeholder="비밀번호를 입력하세요"
              {...register("password", { required: true })}
              className="box-border h-[3.6rem] w-full rounded-[0.6rem] border border-[var(--color-border)] px-[1.2rem] text-[1.4rem] outline-none"
            />
            {errors.password?.message && (
              <p className="text-[1.2rem] text-error">{errors.password.message}</p>
            )}
          </div>
        </div>

        <p className={`text-[1.2rem] text-error ${error ? "visible" : "invisible"}`}>
          로그인에 실패했습니다. 이메일과 비밀번호를 확인해주세요.
        </p>

        <div className="flex flex-col gap-[1rem]">
          <Button
            type="submit"
            variant="primary"
            className="w-full"
            isLoading={isPending}
          >
            로그인
          </Button>

          <Button
            type="button"
            variant="text"
            className="w-full"
            onClick={openModal}
          >
            회원가입
          </Button>
        </div>
      </form>

      <SignupModal
        isShow={isShow}
        onClose={closeModal}
      />
    </div>
  );
};

export default LoginPage;
