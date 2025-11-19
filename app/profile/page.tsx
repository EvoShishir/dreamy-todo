"use client";

import { useEffect, useState, useRef } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import toast from "react-hot-toast";
import DashboardLayout from "../components/DashboardLayout";
import FormInput from "../components/FormInput";
import ProtectedRoute from "../components/ProtectedRoute";
import { baseUrl } from "../constants";
import { useUser } from "../contexts/UserContext";
import { getAuthHeadersWithoutContentType } from "../utils/auth";
import Image from "next/image";
import { LuUser, LuCamera, LuUpload } from "react-icons/lu";

type ProfileFormValues = {
  email: string;
  first_name: string;
  last_name: string;
  address: string;
  contact_number: string;
  birthday: string;
  bio: string;
};

const validationSchema = Yup.object({
  email: Yup.string()
    .email("Enter a valid email address.")
    .required("Email is required."),
  first_name: Yup.string().required("First name is required."),
  last_name: Yup.string().required("Last name is required."),
  address: Yup.string(),
  contact_number: Yup.string(),
  birthday: Yup.string(),
  bio: Yup.string(),
});

export default function ProfilePage() {
  const { user, loading, fetchUser } = useUser();
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formik = useFormik<ProfileFormValues>({
    initialValues: {
      email: "",
      first_name: "",
      last_name: "",
      address: "",
      contact_number: "",
      birthday: "",
      bio: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        const formData = new FormData();

        // Append all form fields
        Object.keys(values).forEach((key) => {
          const value = values[key as keyof ProfileFormValues];
          if (value) {
            formData.append(key, value);
          }
        });

        // Append profile image if selected
        if (imageFile) {
          formData.append("profile_image", imageFile);
        }

        const response = await fetch(`${baseUrl}/users/me/`, {
          method: "PATCH",
          headers: getAuthHeadersWithoutContentType(),
          body: formData,
          // Note: Don't set Content-Type header for FormData, browser will set it with boundary
        });

        if (!response.ok) {
          const error = await response.json();
          const errorMessage =
            error.detail || error.message || "Failed to update profile";
          toast.error(errorMessage);
          return;
        }

        const data = await response.json();
        toast.success("Profile updated successfully!");

        // Update profile image preview if changed
        if (data.profile_image) {
          setProfileImage(data.profile_image);
        }

        // Refresh user data in context
        await fetchUser();
      } catch (error: unknown) {
        console.error("Profile update error:", error);
        toast.error("An error occurred. Please try again.");
      }
    },
  });

  // Populate form values from user context
  useEffect(() => {
    if (user) {
      formik.setValues({
        email: user.email || "",
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        address: user.address || "",
        contact_number: user.contact_number || "",
        birthday: user.birthday || "",
        bio: user.bio || "",
      });

      // Set profile image
      if (user.profile_image) {
        setProfileImage(user.profile_image);
      }
    }
  }, [user]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast.error("Please select an image file");
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB");
        return;
      }

      setImageFile(file);

      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleCancel = () => {
    // Reset form to initial values
    formik.resetForm();
    setImageFile(null);
    // Reload profile data
    window.location.reload();
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className="flex items-center justify-center h-screen">
            <div className="text-lg text-gray-600">Loading...</div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-2xl font-semibold text-gray-800 mb-6">
            Account Information
          </h1>

          <form onSubmit={formik.handleSubmit} noValidate>
            {/* Profile Photo Section */}
            <div className="border border-gray-200 rounded-lg p-6 mb-6">
              <div className="flex items-center gap-4">
                <div className="relative w-20 h-20 bg-gray-300 rounded-full">
                  {profileImage ? (
                    <Image
                      src={profileImage}
                      alt="Profile"
                      fill
                      className="object-cover rounded-full"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-500">
                      <LuUser size={40} />
                    </div>
                  )}
                  <button
                    type="button"
                    className="absolute bottom-0 right-0 bg-[#5272FF] text-white rounded-full p-1.5 hover:bg-[#3D5AE6]"
                    onClick={handleUploadClick}
                  >
                    <LuCamera size={12} />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={handleUploadClick}
                  className="px-4 py-2 bg-[#5272FF] text-white rounded-md text-sm font-medium hover:bg-[#3D5AE6] flex items-center gap-2"
                >
                  <LuUpload size={16} />
                  Upload New Photo
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              {/* First Name & Last Name */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name
                  </label>
                  <FormInput
                    name="first_name"
                    type="text"
                    placeholder="Enter your first name"
                    value={formik.values.first_name}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.errors.first_name}
                    touched={formik.touched.first_name}
                    ariaLabel="First Name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name
                  </label>
                  <FormInput
                    name="last_name"
                    type="text"
                    placeholder="Enter your last name"
                    value={formik.values.last_name}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.errors.last_name}
                    touched={formik.touched.last_name}
                    ariaLabel="Last Name"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <FormInput
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.errors.email}
                  touched={formik.touched.email}
                  ariaLabel="Email"
                />
              </div>

              {/* Address & Contact Number */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address
                  </label>
                  <FormInput
                    name="address"
                    type="text"
                    placeholder="Enter your address"
                    value={formik.values.address}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.errors.address}
                    touched={formik.touched.address}
                    ariaLabel="Address"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Number
                  </label>
                  <FormInput
                    name="contact_number"
                    type="text"
                    placeholder="Enter your contact number"
                    value={formik.values.contact_number}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.errors.contact_number}
                    touched={formik.touched.contact_number}
                    ariaLabel="Contact Number"
                  />
                </div>
              </div>

              {/* Birthday */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Birthday
                </label>
                <input
                  name="birthday"
                  type="date"
                  value={formik.values.birthday}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#5272FF] focus:border-transparent"
                />
              </div>

              {/* Bio */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bio
                </label>
                <textarea
                  name="bio"
                  placeholder="Tell us about yourself"
                  value={formik.values.bio}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#5272FF] focus:border-transparent resize-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  disabled={formik.isSubmitting}
                  className="px-8 py-2.5 bg-[#5272FF] text-white rounded-md font-medium hover:bg-[#3D5AE6] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {formik.isSubmitting ? "Saving..." : "Save Changes"}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={formik.isSubmitting}
                  className="px-8 py-2.5 bg-gray-300 text-gray-700 rounded-md font-medium hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
              </div>
            </div>
          </form>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
