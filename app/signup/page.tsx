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
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
};

const validationSchema = Yup.object({
  firstName: Yup.string()
    .matches(/^[A-Za-z]+$/, "Please enter a valid name format.")
    .required("Please enter a valid name format."),
  lastName: Yup.string()
    .matches(/^[A-Za-z]+$/, "Please enter a valid name format.")
    .required("Please enter a valid name format."),
  email: Yup.string()
    .email("Enter a valid email address.")
    .required("Enter a valid email address."),
  password: Yup.string()
    .min(6, "6 characters minimum.")
    .required("Password is required."),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "Passwords do not match.")
    .required("Please confirm your password."),
});

export default function SignupPage() {
  const router = useRouter();

  const formik = useFormik<FormValues>({
    initialValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        const response = await fetch(`${baseUrl}/users/signup/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            first_name: values.firstName,
            last_name: values.lastName,
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
        toast.success("Account created successfully!");

        // Redirect to login page
        setTimeout(() => {
          router.push("/login");
        }, 1500);
      } catch (error: unknown) {
        toast.error("An error occurred. Please try again.");
      }
    },
  });

  return (
    <AuthLayout
      imageSrc="/login-illustration.png"
      imageAlt="Signup Illustration"
      title="Create your account"
      subtitle="Start managing your tasks efficiently"
    >
      <form className="space-y-4" onSubmit={formik.handleSubmit} noValidate>
        <div className="flex gap-3">
          <FormInput
            name="firstName"
            type="text"
            placeholder="First Name"
            value={formik.values.firstName}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.errors.firstName}
            touched={formik.touched.firstName}
            required
            ariaLabel="First name"
            className="w-1/2"
          />

          <FormInput
            name="lastName"
            type="text"
            placeholder="Last Name"
            value={formik.values.lastName}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.errors.lastName}
            touched={formik.touched.lastName}
            ariaLabel="Last name"
            className="w-1/2"
          />
        </div>

        <FormInput
          name="email"
          type="email"
          placeholder="Email"
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
          placeholder="Password"
          value={formik.values.password}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.errors.password}
          touched={formik.touched.password}
          required
          ariaLabel="Password"
        />

        <FormInput
          name="confirmPassword"
          type="password"
          placeholder="Confirm Password"
          value={formik.values.confirmPassword}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.errors.confirmPassword}
          touched={formik.touched.confirmPassword}
          ariaLabel="Confirm password"
        />

        <button
          type="submit"
          disabled={formik.isSubmitting}
          className="w-full bg-[#5272FF] text-white py-2 rounded-md font-medium hover:bg-[#3D5AE6] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {formik.isSubmitting ? "Signing up..." : "Sign Up"}
        </button>

        <p className="text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link href="/login" className="text-[#5272FF] hover:underline">
            Log in
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
