import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

import { Button } from "@app/components/Button";
import { Modal } from "@app/components/Modal";
import { useRegisterMutation } from "@lib/apis/mutations";
import { useAuthStore } from "@lib/stores";

import type { SignupModalProps } from "./SignupModal.type";

interface SignupFormValues {
  email: string;
  password: string;
  passwordConfirm: string;
}

const SignupModal = ({ isShow, onClose }: SignupModalProps) => {
  const navigate = useNavigate();
  const { setTokens } = useAuthStore();

  const { mutate, isPending, error } = useRegisterMutation();

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<SignupFormValues>();

  const handleClose = () => {
    reset();
    onClose();
  };

  const onSubmit = ({ passwordConfirm, ...data }: SignupFormValues) => {
    if (data.password !== passwordConfirm) {
      setError("passwordConfirm", {
        message: "비밀번호가 일치하지 않습니다.",
      });
      return;
    }

    mutate(data, {
      onSuccess: ({ access_token, refresh_token, expires_in }) => {
        setTokens(access_token, refresh_token, expires_in);
        handleClose();
        navigate("/");
      },
    });
  };

  return (
    <Modal
      isShow={isShow}
      onClose={handleClose}
    >
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex w-[28rem] flex-col gap-[2rem]"
      >
        <h2 className="text-[1.8rem] font-bold text-text-primary">회원가입</h2>

        <div className="flex flex-col gap-[1.2rem]">
          <div className="flex flex-col gap-[0.4rem]">
            <label
              htmlFor="signup-email"
              className="block text-[1.3rem] font-semibold text-text-secondary"
            >
              이메일
            </label>
            <input
              id="signup-email"
              type="email"
              placeholder="이메일을 입력하세요"
              {...register("email", { required: true })}
              className="w-full h-[3.6rem] px-[1.2rem] text-[1.4rem] border border-[var(--color-border)] rounded-[0.6rem] outline-none box-border"
            />

            {errors.email?.message && (
              <p className="text-[1.2rem] text-error">{errors.email.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-[0.4rem]">
            <label
              htmlFor="signup-password"
              className="block text-[1.3rem] font-semibold text-text-secondary"
            >
              비밀번호
            </label>

            <input
              id="signup-password"
              type="password"
              placeholder="비밀번호를 입력하세요"
              {...register("password", {
                required: true,
                minLength: {
                  value: 8,
                  message: "비밀번호는 8자 이상이어야 합니다.",
                },
              })}
              className="w-full h-[3.6rem] px-[1.2rem] text-[1.4rem] border border-[var(--color-border)] rounded-[0.6rem] outline-none box-border"
            />
            {errors.password?.message && (
              <p className="text-[1.2rem] text-error">{errors.password.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-[0.4rem]">
            <label
              htmlFor="signup-password-confirm"
              className="block text-[1.3rem] font-semibold text-text-secondary"
            >
              비밀번호 확인
            </label>
            <input
              id="signup-password-confirm"
              type="password"
              placeholder="비밀번호를 다시 입력하세요"
              {...register("passwordConfirm", {
                required: true,
              })}
              className="w-full h-[3.6rem] px-[1.2rem] text-[1.4rem] border border-[var(--color-border)] rounded-[0.6rem] outline-none box-border"
            />
            {errors.passwordConfirm?.message && (
              <p className="text-[1.2rem] text-error">{errors.passwordConfirm.message}</p>
            )}
          </div>
        </div>

        <p className={`text-[1.2rem] text-error ${error ? "visible" : "invisible"}`}>
          회원가입에 실패했습니다. 다시 시도해주세요.
        </p>

        <Button
          type="submit"
          variant="primary"
          className="w-full"
          isLoading={isPending}
        >
          가입
        </Button>
      </form>
    </Modal>
  );
};

export default SignupModal;
