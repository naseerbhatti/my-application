import { Eye, EyeOff } from "lucide-react";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { useApiLoginMutation, api } from "@/src/redux/api";
import { showToast } from "@/src/utils/toast";
import { useDispatch } from "react-redux";
import { setUser } from "@/src/redux/reducers/authSlice";
import { Button } from "@/src/components/ui/button";

// Zod validation schema
const loginSchema = z.object({
  email: z.string().min(1, "Email is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormInput = z.infer<typeof loginSchema>;

function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [login, { isLoading }] = useApiLoginMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const getErrorMessage = (err: any): string => {
    if (!err) return "An unexpected error occurred.";
    if (typeof err === "string") return err;
    if (typeof err?.data === "string") return err.data;
    if (err?.data?.message && typeof err.data.message === "string")
      return err.data.message;
    if (err?.message && typeof err.message === "string") return err.message;
    return "Login failed. Please try again.";
  };

  const onSubmit = async (data: LoginFormInput) => {
    try {
      const res = await login(data).unwrap();

      // Backend response structure: { status: 200, success: true, message: "...", data: { token, user } }
      const token = res?.data?.token;
      const user = res?.data?.user;

      if (token) {
        localStorage.setItem("auth__token", token);
      }

      if (user) {
        localStorage.setItem("auth__user", JSON.stringify(user));

        dispatch(
          setUser({
            accessToken: token,
            user: {
              id: (user as any)._id ?? (user as any).id ?? user.id,
              name: user.name,
              email: user.email,
              role: user.role as any,
              avatar: (user as any).avatar,
              status: (user as any).status,
              createdAt: user.createdAt,
              updatedAt: user.updatedAt,
            },
          }),
        );
        
        // Clear all cached RTK Query data (like the failed useApiGetMeQuery) so it fetches fresh data
        dispatch(api.util.resetApiState());
      }

      showToast(res?.message || "Login successful!", "success");
      navigate("/dashboard", { replace: true });
    } catch (err: any) {
      console.error("Login error:", err);
      const errorMessage = getErrorMessage(err);
      showToast(errorMessage, "error");
    }
  };

  return (
    <div className="min-h-screen flex  justify-center items-center">
      {/* Card */}
      <div className="w-full max-w-md bg-white p-4 sm:p-6 text-center  ">
        {/* Image */}
        <div className="flex justify-center  mb-4  ">
          <img
            src="/assets/auth/sbcaLogo.png"
            alt="SBCA Logo"
            className=" w-full max-w-[120px] 
           md:max-h-[200px] h-auto
              object-contain"
          />
        </div>

        {/* Heading */}
        <h2 className="text-2xl    font-manrope   mb-1">Login</h2>
        <p className="text-gray-500 text-sm mb-6">
          login to access SBCA Management Portal
        </p>

        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Username */}
          <div className="text-left mb-4">
            <label className="block mb-1 font-manrope ">Email</label>
            <input
              type="email"
              placeholder="Enter Email"
              {...register("email")}
              className="w-full border font-manrope  rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password */}
          <div className="text-left mb-4">
            <label className="block mb-1 font-manrope ">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter Password"
                {...register("password")}
                className="w-full border font-manrope rounded-xl px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              {/* Eye Icon */}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer hover:text-gray-600"
              >
                {showPassword ? (
                  <Eye className="w-4 h-4" />
                ) : (
                  <EyeOff className="w-4 h-4" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-500 text-xs mt-1">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Button */}
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full 
   cursor-pointer shadow-none bg-[#047857] hover:bg-[#047857]    text-white py-2 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading && (
              <svg
                className="animate-spin h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                />
              </svg>
            )}
            {isLoading ? "Logging in..." : "Login"}
          </Button>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;
