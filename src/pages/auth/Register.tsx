import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

import {
  registerSchema,
  type RegisterFormData,
} from "../../schemas/authSchema";
import { useAuth } from "../../hooks/useAuth";

export default function Register() {
  const navigate = useNavigate();
  const { signUp } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    const { error } = await signUp(data.email, data.password, data.fullName,data.workspaceName);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Registration successful!");

    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl bg-slate-900 p-8 shadow-xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-white">Create Account</h1>

          <p className="mt-2 text-sm text-slate-400">
            Create your WorkspaceGuard account
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-200">
              Full Name
            </label>

            <input
              type="text"
              placeholder="Enter your full name"
              {...register("fullName")}
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none focus:border-blue-500"
            />

            {errors.fullName && (
              <p className="mt-1 text-sm text-red-400">
                {errors.fullName.message}
              </p>
            )}
          </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-200">
                Workspace Name
              </label>

              <input
                type="text"
                placeholder="Enter your workspace name"
                {...register("workspaceName")}
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none focus:border-blue-500"
              />

              {errors.workspaceName && (
                <p className="mt-1 text-sm text-red-400">
                  {errors.workspaceName.message}
                </p>
              )}
            </div>
         
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-200">
              Email
            </label>

            <input
              type="email"
              placeholder="Enter your email"
              {...register("email")}
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none focus:border-blue-500"
            />

            {errors.email && (
              <p className="mt-1 text-sm text-red-400">
                {errors.email.message}
              </p>
            )}
          </div>

          
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-200">
              Password
            </label>

            <input
              type="password"
              placeholder="Enter your password"
              {...register("password")}
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none focus:border-blue-500"
            />

            {errors.password && (
              <p className="mt-1 text-sm text-red-400">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-200">
              Confirm Password
            </label>

            <input
              type="password"
              placeholder="Confirm your password"
              {...register("confirmPassword")}
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none focus:border-blue-500"
            />

            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-400">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-400">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-medium text-blue-400 hover:text-blue-300"
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
