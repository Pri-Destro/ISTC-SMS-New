import prisma from "@/lib/prisma";
import FormModal from "./FormModal";
import { auth } from "@clerk/nextjs/server";

export type FormContainerProps = {
  table:
    | "teacher"
    | "student"
    | "registrar"
    | "theoryIncharge"
    | "subject"
    | "branch"
    | "exam"
    | "result"
    | "attendance"
    | "announcement"
    | "graceMark";
  type: "create" | "update" | "delete";
  data?: any;
  id?: number | string;
  branchId?: string; // Add branchId as a prop
};

const FormContainer = async ({
  table,
  type,
  data,
  id,
  branchId, // Destructure branchId from props
}: FormContainerProps) => {
  let relatedData = {};

  const { userId, sessionClaims } = auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;
  const currentUserId = userId;

  if (type !== "delete") {
    switch (table) {
      case "subject":
        // Fetch teachers based on branchId if provided
        const subjectTeachers = await prisma.teacher.findMany({
          where: branchId
            ? {
                branches: {
                  some: {
                    id: parseInt(branchId),
                  },
                },
              }
            : {},
          select: { id: true, name: true },
        });
        
        // console.log("Filtered Teachers:", subjectTeachers); // Log the results

        const subjectSemesters = await prisma.semester.findMany({
          select: { id: true, level: true },
        });

        const subjectBranches = await prisma.branch.findMany({
          include: { _count: { select: { students: true } } },
        });

        relatedData = {
          teachers: subjectTeachers,
          branches: subjectBranches,
          semesters: subjectSemesters,
        };
        break;

      case "branch":
        const branchSemesters = await prisma.semester.findMany({
          select: { id: true, level: true },
        });

        const branchTeachers = await prisma.teacher.findMany({
          select: { id: true, name: true },
        });

        relatedData = { teachers: branchTeachers, semesters: branchSemesters };
        break;

      case "teacher":
        const teacherSubjects = await prisma.subject.findMany({
          select: { id: true, name: true },
        });

        const teacherBranches = await prisma.branch.findMany({
          select: { id: true, name: true },
        });

        relatedData = { subjects: teacherSubjects, branches: teacherBranches };
        break;

      case "student":
        const studentSemesters = await prisma.semester.findMany({
          select: { id: true, level: true },
        });

        const studentBranches = await prisma.branch.findMany({
          include: { _count: { select: { students: true } } },
        });

        relatedData = { branches: studentBranches, semesters: studentSemesters };
        break;

      case "exam":
        const examLectures = await prisma.lectures.findMany({
          where: {
            ...(role === "teacher" ? { teacherId: currentUserId! } : {}),
          },
          select: { id: true, name: true },
        });

        relatedData = { lectures: examLectures };
        break;

      case "announcement":
        const announcementBranches = await prisma.branch.findMany({
          include: { _count: { select: { students: true } } },
        });
        const announcementTeacher = await prisma.teacher.findMany({
          select: { id: true, name: true },
        });


        relatedData = { branches: announcementBranches, teachers: announcementTeacher };
        break;
        
      case "graceMark":


      case "result":
        const resultStudents = await prisma.student.findMany({
          select: { id: true, name: true },
        });

        const resultExams = await prisma.exam.findMany({
          select: { id: true },
        });

        const resultSubjects = await prisma.subject.findMany({
          select: { id: true, name: true },
        });
        const resultTeachers = await prisma.teacher.findMany({
          select: { id: true, name: true },
        });

        relatedData = {
          students: resultStudents,
          exams: resultExams,
          subjects: resultSubjects,
          teachers: resultTeachers,
        };
        break;

      default:
        break;
    }
  }

  return (
    <div className="">
      <FormModal
        table={table}
        type={type}
        data={data}
        id={id}
        relatedData={relatedData}
      />
    </div>
  );
};

export default FormContainer;