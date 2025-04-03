"use client";

import { useRouter } from "next/navigation";
import { Branch, Semester, Subject } from "@prisma/client";
import { useEffect, useState } from "react";

interface FiltersProps {
  branches?: Branch[];
  semesters?: Semester[];
  subjects?: Subject[];
  branchId?: string;
  semester?: string;
  subjectId?: string;
}

export default function Filters({
  branches,
  semesters,
  selectedBranchId,
  selectedSemester,
}: {
  branches: { id: number; name: string }[];
  semesters: { id: number; level: number }[];
  selectedBranchId?: string;
  selectedSemester?: string;
}) {
  const router = useRouter();

  const handleBranchChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const branchId = e.target.value;
    const url = new URL(window.location.href);
    if (branchId) {
      url.searchParams.set("branchId", branchId);
      url.searchParams.delete("semester"); // Reset semester when branch changes
    } else {
      url.searchParams.delete("branchId");
      url.searchParams.delete("semester"); // Reset semester when branch is cleared
    }
    router.push(url.toString());
  };

  const handleSemesterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const semester = e.target.value;
    const url = new URL(window.location.href);
    if (semester) {
      url.searchParams.set("semester", semester);
    } else {
      url.searchParams.delete("semester");
    }
    router.push(url.toString());
  };

  return (
    <div className="flex items-center gap-2">
      {/* Branch Filter */}
      <select
        className="p-2 rounded-md bg-blue-50 hover:bg-blue-100 transition-colors"
        value={selectedBranchId || ""}
        onChange={handleBranchChange}
      >
        <option value="">All Branches</option>
        {branches.map((branch) => (
          <option key={branch.id} value={branch.id}>
            {branch.name}
          </option>
        ))}
      </select>

      {/* Semester Filter */}
      <select
        className="p-2 rounded-md bg-blue-50 hover:bg-blue-100 transition-colors"
        value={selectedSemester || ""}
        onChange={handleSemesterChange}
        disabled={!selectedBranchId}
      >
        <option value="">All Semesters</option>
        {semesters.map((sem) => (
          <option key={sem.id} value={sem.id}>
            Semester {sem.level}
          </option>
        ))}
      </select>
    </div>
  );
}

export function TeacherFilter({
  branches = [],
  branchId,
}: {
  branches: { id: number; name: string }[];
  branchId?: string;
}) {
  const router = useRouter();

  const handleBranchChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const branchId = e.target.value;
    const url = new URL(window.location.href);
    if (branchId) {
      url.searchParams.set("branchId", branchId);
    } else {
      url.searchParams.delete("branchId");
    }
    router.push(url.toString());
  };

  return (
    <div className="flex items-center gap-2">
      {/* Branch Filter */}
      <select
        className="p-2 rounded-md bg-white-50 hover:bg-white-100 transition-colors"
        value={branchId || ""}
        onChange={handleBranchChange}
      >
        <option value="">All Branches</option>
        {branches.map((branch) => (
          <option key={branch.id} value={branch.id}>
            {branch.name}
          </option>
        ))}
      </select>
    </div>
  );
}

export function ResultFilters({
  branches = [],
  semesters = [],
  subjects = [],
  branchId,
  semester,
  subjectId,
}: FiltersProps) {
  const router = useRouter();

  // State for dependent dropdowns
  const [filteredSemesters, setFilteredSemesters] = useState<Semester[]>([]);
  const [filteredSubjects, setFilteredSubjects] = useState<Subject[]>([]);

  // Update semesters when branch changes
  useEffect(() => {
    if (branchId) {
      const filtered = semesters.filter((sem) => sem.branchId === parseInt(branchId));
      setFilteredSemesters(filtered);
    } else {
      setFilteredSemesters([]);
    }
    // Reset semester and subject when branch changes
    if (!branchId) {
      const url = new URL(window.location.href);
      url.searchParams.delete("semester");
      url.searchParams.delete("subjectId");
      router.replace(url.toString());
    }
  }, [branchId, semesters, router]);

  // Update subjects when semester changes
  useEffect(() => {
    if (branchId && semester) {
      const filtered = subjects.filter(
        (sub) =>
          sub.branchId === parseInt(branchId) && sub.semesterId === parseInt(semester)
      );
      setFilteredSubjects(filtered);
    } else {
      setFilteredSubjects([]);
    }
    // Reset subject when semester changes
    if (!semester && branchId) {
      const url = new URL(window.location.href);
      url.searchParams.delete("subjectId");
      router.replace(url.toString());
    }
  }, [branchId, semester, subjects, router]);

  const handleFilterChange = (key: string, value: string) => {
    const url = new URL(window.location.href);
    
    // Reset dependent filters when parent filter changes
    if (key === "branchId") {
      url.searchParams.delete("semester");
      url.searchParams.delete("subjectId");
    } else if (key === "semester") {
      url.searchParams.delete("subjectId");
    }
    
    if (value) {
      url.searchParams.set(key, value);
    } else {
      url.searchParams.delete(key);
    }
    router.replace(url.toString());
  };

  return (
    <div className="flex gap-4 my-4">
      {/* Branch Dropdown */}
      <select
        value={branchId || ""}
        onChange={(e) => handleFilterChange("branchId", e.target.value)}
        className="p-2 border rounded"
      >
        <option value="">Filter by Branch</option>
        {branches.map((branch) => (
          <option key={branch.id} value={branch.id}>
            {branch.name}
          </option>
        ))}
      </select>

      {/* Semester Dropdown */}
      <select
        value={semester || ""}
        onChange={(e) => handleFilterChange("semester", e.target.value)}
        className="p-2 border rounded"
        disabled={!branchId}
      >
        <option value="">Filter by Semester</option>
        {filteredSemesters.map((sem) => (
          <option key={sem.id} value={sem.level}>
            Semester {sem.level}
          </option>
        ))}
      </select>

      {/* Subject Dropdown */}
      <select
        value={subjectId || ""}
        onChange={(e) => handleFilterChange("subjectId", e.target.value)}
        className="p-2 border rounded"
        disabled={!semester}
      >
        <option value="">Filter by Subject</option>
        {filteredSubjects.map((subject) => (
          <option key={subject.id} value={subject.id}>
            {subject.name}
          </option>
        ))}
      </select>
    </div>
  );
}

export function SubjectFilters({
  branches = [],
  semesters = [],
  branchId,
  semester,
}: FiltersProps) {
  const router = useRouter();

  // State for dependent dropdowns
  const [filteredSemesters, setFilteredSemesters] = useState<Semester[]>([]);

  // Update semesters when branch changes
  useEffect(() => {
    if (branchId) {
      const filtered = semesters.filter((sem) => sem.branchId === parseInt(branchId));
      setFilteredSemesters(filtered);
    } else {
      setFilteredSemesters([]);
    }
    // Reset semester when branch changes
    if (!branchId) {
      const url = new URL(window.location.href);
      url.searchParams.delete("semester");
      router.replace(url.toString());
    }
  }, [branchId, semesters, router]);

  const handleFilterChange = (key: string, value: string) => {
    const url = new URL(window.location.href);
    
    // Reset semester when branch changes
    if (key === "branchId") {
      url.searchParams.delete("semester");
    }
    
    if (value) {
      url.searchParams.set(key, value);
    } else {
      url.searchParams.delete(key);
    }
    router.replace(url.toString());
  };

  return (
    <div className="flex gap-4">
      {/* Branch Dropdown */}
      <select
        value={branchId || ""}
        onChange={(e) => handleFilterChange("branchId", e.target.value)}
        className="p-2 border rounded"
      >
        <option value="">Filter by Branch</option>
        {branches.map((branch) => (
          <option key={branch.id} value={branch.id}>
            {branch.name}
          </option>
        ))}
      </select>

      {/* Semester Dropdown */}
      <select
        value={semester || ""}
        onChange={(e) => handleFilterChange("semester", e.target.value)}
        className="p-2 border rounded"
        disabled={!branchId}
      >
        <option value="">Filter by Semester</option>
        {filteredSemesters.map((sem) => (
          <option key={sem.id} value={sem.id}>
            Semester {sem.level}
          </option>
        ))}
      </select>
    </div>
  );
}