// import { NextResponse } from "next/server";
// import * as xlsx from "xlsx";
// import prisma from "@/lib/prisma";
// import { writeFile, readFile } from "fs/promises";
// import { existsSync } from "fs";
// import path from "path";
// import os from "os";
// import { NextRequest } from "next/server";
// import { auth } from "@clerk/nextjs/server";

// export async function POST(req: NextRequest) {
//   try {
//     const { sessionClaims } = auth();

//     const role = (sessionClaims?.metadata as { role?: string })?.role;
//     const userId = sessionClaims?.sub;
//     console.log(userId)

//     if (role !== "teacher") {
//       return NextResponse.json(
//         { success: false, error: "Unauthorized: User is not a teacher" },
//         { status: 403 }
//       );
//     }
//     const teacherId = userId;

//     const formData = await req.formData();
//     const file = formData.get("file") as Blob;

//     if (!file) {
//       return NextResponse.json(
//         { success: false, error: "Missing file" },
//         { status: 400 }
//       );
//     }
//     const arrayBuffer = await file.arrayBuffer();
//     const uint8Array = new Uint8Array(arrayBuffer);

//     const tempDir = os.tmpdir();
//     const tempFilePath = path.join(tempDir, "uploadedresults.xlsx");
//     await writeFile(tempFilePath, uint8Array);

//     if (!existsSync(tempFilePath)) {
//       return NextResponse.json(
//         { success: false, error: "File save failed." },
//         { status: 400 }
//       );
//     }

//     const fileBuffer = await readFile(tempFilePath);
//     const workbook = xlsx.read(fileBuffer, { type: "buffer" });
//     const sheet = workbook.Sheets[workbook.SheetNames[0]];

//     const resultData = xlsx.utils.sheet_to_json<{
//       "Roll No": string; 
//       "Subject Code": string;
//       "Sessional Exam"?: number; 
//       "End Term"?: number;
//       "Overall Mark": number;
//       Grade: string;
//     }>(sheet);

//     // Validate Excel columns
//     if (
//       !resultData.every(
//         (row) => row["Roll No"] && row["Subject Code"] && row["Overall Mark"] && row.Grade
//       )
//     ) {
//       return NextResponse.json(
//         { success: false, error: "Invalid Excel columns." },
//         { status: 400 }
//       );
//     }
//     const results = await Promise.all(
//       resultData.map(async (row) => {
//         const student = await prisma.student.findUnique({
//           where: { username: row["Roll No"] },
//         });
//         if (!student) {
//           throw new Error(`Student with username '${row["Roll No"]}' not found`);
//         }

//         // Find the subject in the database
//         const subject = await prisma.subject.findFirst({
//           where: { subjectCode: row["Subject Code"] },
//         });
//         if (!subject) {
//           throw new Error(`Subject with code '${row["Subject Code"]}' not found`);
//         }

//         return {
//           studentId: student.id,
//           subjectId: subject.id,
//           sessionalExam: row["Sessional Exam"]?.toString() ?? null,
//           endTerm: row["End Term"] ?? null,
//           overallMark: row["Overall Mark"],
//           grade: row.Grade,
//           teacherId: teacherId,
//         };
//       })
//     );

//     await prisma.result.createMany({ data: results, skipDuplicates: false });

//     return NextResponse.json({
//       success: true,
//       message: "Results imported successfully",
//     });
//   } catch (error) {
//     console.error("Error importing results:", error);
//     return NextResponse.json({
//       success: false,
//       error: error instanceof Error ? error.message : "An unknown error occurred",
//     });
//   }
// }

import { NextResponse } from "next/server";
import * as xlsx from "xlsx";
import prisma from "@/lib/prisma";
import { writeFile, readFile } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import os from "os";
import { NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";

// ✅ Function to calculate grade based on overall marks
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

export async function POST(req: NextRequest) {
  try {
    const { sessionClaims } = auth();
    const role = (sessionClaims?.metadata as { role?: string })?.role;
    const userId = sessionClaims?.sub;

    if (role !== "teacher") {
      return NextResponse.json(
        { success: false, error: "Unauthorized: User is not a teacher" },
        { status: 403 }
      );
    }
    const teacherId = userId;

    const formData = await req.formData();
    const file = formData.get("file") as Blob;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "Missing file" },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    const tempDir = os.tmpdir();
    const tempFilePath = path.join(tempDir, "uploadedresults.xlsx");
    await writeFile(tempFilePath, uint8Array);

    if (!existsSync(tempFilePath)) {
      return NextResponse.json(
        { success: false, error: "File save failed." },
        { status: 400 }
      );
    }

    const fileBuffer = await readFile(tempFilePath);
    const workbook = xlsx.read(fileBuffer, { type: "buffer" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];

    const resultData = xlsx.utils.sheet_to_json<{
      "Roll No": string;
      "Subject Code": string;
      "Sessional Exam"?: number;
      "End Term"?: number;
      "Overall Mark": number;
    }>(sheet);

    // Validate Excel columns
    if (
      !resultData.every((row) => row["Roll No"] && row["Subject Code"] && row["Overall Mark"])
    ) {
      return NextResponse.json(
        { success: false, error: "Invalid Excel columns." },
        { status: 400 }
      );
    }

    const failedStudents: { studentId: string; subjectId: number }[] = [];

    const results = await Promise.all(
      resultData.map(async (row) => {
        const student = await prisma.student.findUnique({
          where: { username: row["Roll No"] },
        });
        if (!student) {
          throw new Error(`Student with username '${row["Roll No"]}' not found`);
        }

        // Find the subject in the database to get `maxMarks`
        const subject = await prisma.subject.findFirst({
          where: { subjectCode: row["Subject Code"] },
        });
        if (!subject) {
          throw new Error(`Subject with code '${row["Subject Code"]}' not found`);
        }

        const maxMarks = subject.maxMarks!;
        const percentage = (row["Overall Mark"] / maxMarks) * 100;
        const grade = calculateGrade(percentage);

        // If grade is "E", move student to `failed` table
        if (grade === "E") {
          failedStudents.push({ studentId: student.id, subjectId: subject.id });
        }

        return {
          studentId: student.id,
          subjectId: subject.id,
          sessionalExam: row["Sessional Exam"]?.toString() ?? null,
          endTerm: row["End Term"] ?? null,
          overallMark: row["Overall Mark"],
          grade,
          teacherId: teacherId,
        };
      })
    );

    // Insert results into the `result` table
    await prisma.result.createMany({ data: results, skipDuplicates: false });

    // Insert failed students into the `failed` table
    if (failedStudents.length > 0) {
      await prisma.failed.createMany({ data: failedStudents, skipDuplicates: true });
    }

    return NextResponse.json({
      success: true,
      message: "Results imported successfully",
    });
  } catch (error) {
    console.error("Error importing results:", error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "An unknown error occurred",
    });
  }
}
