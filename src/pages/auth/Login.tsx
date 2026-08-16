import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

import {
  loginSchema,
  type LoginFormData,
} from "../../schemas/authSchema";
import { useAuth } from "../../hooks/useAuth";

export default function Login() {
  const navigate = useNavigate();
  const { signIn } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    const { error } = await signIn(data.email, data.password);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Login successful!");

    navigate("/settings/team");
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl bg-slate-900 p-8 shadow-xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-white">
            Welcome Back
          </h1>

          <p className="mt-2 text-sm text-slate-400">
            Login to your WorkspaceGuard account
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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

          {/* Password */}
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

          
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-400">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="font-medium text-blue-400 hover:text-blue-300"
          >
            Create Account
          </Link>
        </p>
      </div>
    </div>
  );
}