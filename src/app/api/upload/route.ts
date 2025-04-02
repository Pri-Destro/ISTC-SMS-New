import { NextResponse } from "next/server";
import * as xlsx from "xlsx";
import prisma from "@/lib/prisma";
import { writeFile, readFile } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import os from "os";
import { NextRequest } from "next/server";
import { UserSex } from "@prisma/client/wasm";

// Add the calculateGraceMarks function here
const calculateGraceMarks = async (studentId: string, semesterId: number) => {
  const subjects = await prisma.subject.findMany({
    where: { semesterId },
  });

  const totalMarks = subjects.reduce((sum, sub) => sum + (sub.maxMarks || 0), 0);
  const graceMarks = Math.floor(totalMarks * 0.01);

  await prisma.graceMarks.upsert({
    where: { studentId_semesterId: { studentId, semesterId } },
    update: { totalGrace: graceMarks },
    create: { studentId, semesterId, totalGrace: graceMarks, usedGrace: 0 },
  });
};

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const branchId = parseInt(formData.get("branchId") as string);
    const semesterId = parseInt(formData.get("semesterId") as string);
    const file = formData.get("file") as Blob;

    if (!branchId || !semesterId || !file) {
      return NextResponse.json(
        { success: false, error: "Missing file, Branch ID, or Semester ID." },
        { status: 400 }
      );
    }

    // Check branch capacity
    const branchItem = await prisma.branch.findUnique({
      where: { id: branchId },
      include: { _count: { select: { students: true } } },
    });

    if (!branchItem) {
      return NextResponse.json(
        { success: false, error: "Branch not found." },
        { status: 404 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    const tempDir = os.tmpdir();
    const tempFilePath = path.join(tempDir, "uploaded.xlsx");
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
    
    const studentData = xlsx.utils.sheet_to_json<{
      Name: string;
      RollNo: string;
      "Father Name": string;
      "Mother Name": string;
      Birthday: Date,
      Phone: string,
      Email: string,
      Address: string,
      "Blood Type": string,
      Sex: UserSex,
    }>(sheet);

    if (!studentData.every((row) => row.Name && row.RollNo && row["Father Name"] && row["Mother Name"])) {
      return NextResponse.json({ success: false, error: "Invalid Excel columns." }, { status: 400 });
    }

    // Check if adding these students would exceed branch capacity
    const newStudentCount = studentData.length;
    if (branchItem.capacity < (branchItem._count.students + newStudentCount)) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Branch capacity exceeded. Current: ${branchItem._count.students}, Capacity: ${branchItem.capacity}, Attempting to add: ${newStudentCount}` 
        },
        { status: 400 }
      );
    }

    const students = studentData.map((row) => ({
      name: row.Name,
      username: row.RollNo,
      fatherName: row["Father Name"],
      motherName: row["Mother Name"],
      password: "defaultPassword",
      birthday: new Date(row.Birthday), 
      phone: row.Phone ? String(row.Phone) : "",
      email: row.Email,
      address: row.Address,
      bloodType: row["Blood Type"],
      sex: row.Sex,
      branchId,
      semesterId,
    }));

    // Create students and calculate grace marks for each
    const createdStudents = await prisma.$transaction(
      students.map(student => 
        prisma.student.create({ data: student })
      )
    );

    // Calculate grace marks for each created student
    await Promise.all(
      createdStudents.map(student => 
        calculateGraceMarks(student.id, semesterId)
      )
    );

    return NextResponse.json({ 
      success: true, 
      message: `${createdStudents.length} students imported successfully` 
    });
  } catch (error) {
    console.error("Error importing students:", error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "An unknown error occurred",
    });
  }
}