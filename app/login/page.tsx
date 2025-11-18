"use client";

import { useRouter } from "next/navigation";
import { useFormik } from "formik";
import * as Yup from "yup";
import toast from "react-hot-toast";
import { baseUrl } from "../constants";
import AuthLayout from "../components/AuthLayout";
import FormInput from "../components/FormInput";
import Link from "next/link";

type FormValues = {
  email: string;
  password: string;
};

const validationSchema = Yup.object({
  email: Yup.string()
    .email("Enter a valid email address.")
    .required("Enter a valid email address."),
  password: Yup.string()
    .min(6, "6 characters minimum.")
    .required("Password is required."),
});

export default function LoginPage() {
  const router = useRouter();

  const formik = useFormik<FormValues>({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        const response = await fetch(`${baseUrl}/auth/login/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: values.email,
            password: values.password,
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          const errorMessage = error.detail || "An error occurred";
          toast.error(errorMessage);
          return;
        }

        const data = await response.json();
        console.log(data);

        // Store access token in localStorage
        if (data.access) {
          localStorage.setItem("access_token", data.access);
        }

        toast.success("Login successful!");

        // Redirect to dashboard or home
        setTimeout(() => {
          router.replace("/");
        }, 1500);
      } catch (error: unknown) {
        toast.error("An error occurred. Please try again.");
      }
    },
  });

  return (
    <AuthLayout
      imageSrc="/login-illustration-2.png"
      imageAlt="Login Illustration"
      title="Log in to your account"
      subtitle="Start managing your tasks efficiently"
    >
      <form className="space-y-4" onSubmit={formik.handleSubmit} noValidate>
        <FormInput
          name="email"
          type="email"
          placeholder="Enter your email"
          value={formik.values.email}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.errors.email}
          touched={formik.touched.email}
          required
          ariaLabel="Email"
        />

        <FormInput
          name="password"
          type="password"
          placeholder="Enter your password"
          value={formik.values.password}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.errors.password}
          touched={formik.touched.password}
          required
          ariaLabel="Password"
        />

        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2">
            <input type="checkbox" className="rounded" />
            <span className="text-gray-600">Remember me</span>
          </label>
          <a href="/forgot-password" className="text-[#5272FF] hover:underline">
            Forgot your password?
          </a>
        </div>

        <button
          type="submit"
          disabled={formik.isSubmitting}
          className="w-full bg-[#5272FF] text-white py-2 rounded-md font-medium hover:bg-[#3D5AE6] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {formik.isSubmitting ? "Logging in..." : "Log In"}
        </button>

        <p className="text-center text-sm text-gray-600">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-[#5272FF] hover:underline">
            Register now
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
