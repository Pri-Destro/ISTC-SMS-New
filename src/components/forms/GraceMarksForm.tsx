"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { GraceMarkSchema, graceMarkSchema } from "@/lib/formValidationSchemas";
import { useFormState } from "react-dom";
import { updateGraceMark } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

const GraceMarkForm = ({
  type,
  data,
  setOpen,
  relatedData,
}: {
  type: "update";
  data?: any;
  setOpen: Dispatch<SetStateAction<boolean>>;
  relatedData?: {
    students: any[];
    subjects: any[];
    teachers: any[];
    graceMarks: any;
    studentResult: any;
  };
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<GraceMarkSchema>({
    resolver: zodResolver(graceMarkSchema),
  });

  const [state, formAction] = useFormState(updateGraceMark, {
    success: false,
    error: false,
  });

  const router = useRouter();
  const studentGraceMarks = relatedData?.graceMarks || {};
  const availableGraceMarks =
    (studentGraceMarks.totalGrace || 0) - (studentGraceMarks.usedGrace || 0);

  const studentResult = relatedData?.studentResult || {};
  const currentMarks = studentResult.overallMark || 0;

  const subjectId = watch("subjectId");
  const selectedSubject =
    relatedData?.subjects.find((s: any) => s.id === subjectId) ||
    (relatedData?.subjects.length
      ? relatedData.subjects[0]
      : { maxMarks: 100 });
  const maxMarks = selectedSubject.maxMarks;
  const passingMarks = Math.ceil(maxMarks * 0.4);
  const requiredGraceMarks = Math.max(0, passingMarks - currentMarks);

  const appliedGrace = Number(watch("graceMark") || 0);
  const newTotalMarks = currentMarks + appliedGrace;
  const percentage = (newTotalMarks/ maxMarks) * 100
  const willPass = newTotalMarks >= passingMarks;
  const calculateGrade = (percentage: number) => {
    if (percentage >= 90) return "A+";
    if (percentage >= 80) return "A";
    if (percentage >= 70) return "B+";
    if (percentage >= 60) return "B";
    if (percentage >= 50) return "C+";
    if (percentage >= 45) return "C";
    if (percentage >= 40) return "D";
    return "E"; // Fail
  };

  const onSubmit = handleSubmit((formData) => {
    const submissionData = {
      ...formData,
      studentId: data?.student?.id,
      currentMarks,
      newTotalMarks,
      previousGrade: studentResult.grade,
      newGrade: "D",
      maxMarks,
      passingMarks,
    };
    formAction(submissionData);
  });

  useEffect(() => {
    if (state.success) {
      toast.success(`Grace Marks applied successfully!`);
      setOpen(false);
      router.refresh();
    } else if (state.error) {
      toast.error("Failed to apply grace marks");
    }
  }, [state, router, setOpen]);

  useEffect(() => {
    if (data?.student) {
      setValue("studentId", data.student.id);
      if (studentResult.subjectId) {
        setValue("subjectId", studentResult.subjectId);
      }
    }
  }, [data, setValue, studentResult]);

  return (
    <form className="flex flex-col gap-6" onSubmit={onSubmit}>
      {/* Student Information Section */}
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <h2 className="text-lg font-bold text-gray-800 mb-4">
          Use Grace Marks for student -{" "}
          {data?.student?.name || "Select Student"}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-3 rounded shadow border">
            <p className="text-sm text-gray-500">Available Grace Marks</p>
            <p className="text-xl font-semibold">
              {availableGraceMarks} / {studentGraceMarks.totalGrace || 0}
            </p>
          </div>

          <div className="bg-white p-3 rounded shadow border">
            <p className="text-sm text-gray-500">Current Marks</p>
            <p className="text-xl font-semibold">{currentMarks}</p>
            <p className="text-xs text-gray-500">
              Grade: {studentResult.grade || "N/A"}
            </p>
          </div>

          <div className="bg-white p-3 rounded shadow border">
            <p className="text-sm text-gray-500">Passing Marks</p>
            <p className="text-xl font-semibold">{passingMarks}</p>
            <p className="text-xs text-gray-500">(40% of {maxMarks})</p>
          </div>

          <div className="bg-white p-3 rounded shadow border">
            <p className="text-sm text-gray-500">Required to Pass</p>
            <p className="text-xl font-semibold">
              {requiredGraceMarks > 0
                ? `${requiredGraceMarks} needed`
                : "Already passed"}
            </p>
          </div>
        </div>
      </div>

      {/* Grace Marks Application Section */}
      <div className="space-y-6">
        <h1 className="text-xl font-semibold text-gray-800">
          Apply Grace Marks
        </h1>

        {/* Hidden fields */}
        <input type="hidden" {...register("studentId")} />
        <input type="hidden" {...register("id")} defaultValue={data?.id} />

        {/* Subject Selection */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Subject
          </label>
          <select
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
            {...register("subjectId")}
            defaultValue={studentResult.subjectId}
          >
            {relatedData?.subjects.map((subject: any) => (
              <option value={subject.id} key={subject.id}>
                {subject.name} (Max: {subject.maxMarks} marks)
              </option>
            ))}
          </select>
          {errors.subjectId && (
            <p className="mt-1 text-sm text-red-600">
              {errors.subjectId.message}
            </p>
          )}
        </div>

        {/* Grace Marks Input */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Grace Marks to Apply
          </label>
          <input
            type="number"
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
            {...register("graceMark", {
              valueAsNumber: true,
              min: 0,
              max: availableGraceMarks,
            })}
            defaultValue={0}
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>Min: 0</span>
            <span>Max: {availableGraceMarks}</span>
          </div>
          {errors.graceMark && (
            <p className="mt-1 text-sm text-red-600">
              {errors.graceMark.message}
            </p>
          )}
        </div>

        {/* Preview of Changes */}
        {appliedGrace > 0 && (
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h3 className="font-medium text-blue-800 mb-2">
              Preview of Changes
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-blue-700">Current Marks</p>
                <p className="font-medium">{currentMarks}</p>
              </div>
              <div>
                <p className="text-sm text-blue-700">After Grace Marks</p>
                <p className="font-medium">{newTotalMarks}</p>
              </div>
              <div>
                <p className="text-sm text-blue-700">Current Grade</p>
                <p className="font-medium">{studentResult.grade || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-blue-700">New Grade</p>
                <p className="font-medium">{calculateGrade(percentage)}</p>
              </div>
            </div>
            <p
              className={`mt-2 text-sm font-medium ${
                willPass ? "text-green-600" : "text-red-600"
              }`}
            >
              {willPass
                ? "Student will PASS with these grace marks"
                : "Student will still FAIL with these grace marks"}
            </p>
          </div>
        )}

        {/* Teacher Approval */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Approved By
          </label>
          <select
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
            {...register("teacherId")}
            defaultValue={data?.teacherId}
          >
            {relatedData.teachers.map((teacher: any) => (
              <option value={teacher.id} key={teacher.id}>
                {teacher.name} ({teacher.username})
              </option>
            ))}
          </select>
          {errors.teacherId && (
            <p className="mt-1 text-sm text-red-600">
              {errors.teacherId.message}
            </p>
          )}
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end gap-4 pt-4">
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          className={`px-4 py-2 text-sm font-medium text-white rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
            availableGraceMarks <= 0
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
          disabled={availableGraceMarks <= 0}
        >
          {availableGraceMarks <= 0
            ? "No Grace Marks Available"
            : "Apply Grace Marks"}
        </button>
      </div>

      {state.error && (
        <div className="p-4 text-sm text-red-700 bg-red-100 rounded-md">
          Something went wrong while applying grace marks. Please try again.
        </div>
      )}
    </form>
  );
};

export default GraceMarkForm;
