"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface MarkLeftButtonProps {
  studentId: string;
  hasLeft: boolean;
}

const MarkLeftButton = ({ studentId, hasLeft }: MarkLeftButtonProps) => {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      const formData = new FormData();
      formData.append("studentId", studentId);
      formData.append("setLeft", (!hasLeft).toString());

      const response = await fetch("/api/student-left", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        setIsModalOpen(false);
        router.refresh();
      } else {
        const data = await response.json();
        alert(data.message || "Something went wrong");
      }
    } catch (error) {
      console.error("Error marking student:", error);
      alert("Failed to update student status");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <button
        onClick={handleOpenModal}
        className={`flex items-center justify-center p-2 m-2 ${
          hasLeft ? "bg-blue-500 hover:bg-blue-600" : "bg-green-500 hover:bg-green-600"
        } text-white rounded`}
      >
        {hasLeft ? "Retain Student" : "Mark as Left"}
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">
              {hasLeft
                ? "Retain Student"
                : "Mark Student as Left"}
            </h3>
            <p className="mb-6">
              {hasLeft
                ? "Are you sure you want to retain this student? They will be visible in the main student list again."
                : "Are you sure you want to mark this student as left? They will no longer appear in the main student list."}
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={handleCloseModal}
                className="px-4 py-2 border border-gray-300 rounded-md bg-white hover:bg-gray-50"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className={`px-4 py-2 text-white rounded-md ${
                  hasLeft ? "bg-green-500 hover:bg-green-600" : "bg-red-500 hover:bg-red-600"
                }`}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Processing..." : hasLeft ? "Retain" : "Mark as Left"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MarkLeftButton;