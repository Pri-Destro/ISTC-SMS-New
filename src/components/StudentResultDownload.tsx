"use client";

import React from "react";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import * as XLSX from "xlsx";


interface StudentResultDownloadProps {
  role: "teacher" | "registrar" | undefined;
}

const StudentResultDownload: React.FC<StudentResultDownloadProps> = ({ role }) => {

  const generatePDF = async () => {
    const response = await fetch("/api/results"); 
    const data = await response.json();

    const pdf = new jsPDF();
    pdf.text("Student Results", 10, 10);

    let y = 20;
    data.forEach((student: any) => {
      pdf.text(`${student.name} (ID: ${student.id})`, 10, y);
      y += 6;
      student.results.forEach((result: any) => {
        pdf.text(
          `${result.subject.name}: ${result.sessionalExam} / ${result.endTerm} - ${result.grade}`,
          15,
          y
        );
        y += 6;
      });
      y += 4;
    });

    pdf.save("All_Students_Results.pdf");
  };

  const generateExcel = async () => {
    try {
      console.log("Fetching results...");
      const response = await fetch("/api/results", { cache: "no-store" });
      const data = await response.json();
      console.log("Data received:", data);
  
      if (!Array.isArray(data)) {
        console.error("Expected an array but got:", data);
        alert("Error fetching data: " + (data.message || "Invalid response"));
        return;
      }
  
      const allSubjects = new Set<string>();
      data.forEach((student: any) => {
        student.results.forEach((result: any) => {
          allSubjects.add(result.subject.name);
        });
      });
  
      const subjectList = Array.from(allSubjects); 

      const worksheetData = data.map((student: any) => {
        const row: any = {
          StudentID: student.id,
          Name: student.name,
        };

        subjectList.forEach((subject) => {
          row[`${subject} Sessional`] = "-";
          row[`${subject} EndTerm`] = "-";
          row[`${subject} Overall`] = "-";
          row[`${subject} Grade`] = "-";
        });

        student.results.forEach((result: any) => {
          const subject = result.subject.name;
          row[`${subject} Sessional`] = result.sessionalExam;
          row[`${subject} EndTerm`] = result.endTerm;
          row[`${subject} Overall`] = result.overallMark;
          row[`${subject} Grade`] = result.grade;
        });
  
        return row;
      });

      const worksheet = XLSX.utils.json_to_sheet(worksheetData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Results");

      XLSX.writeFile(workbook, "All_Students_Results.xlsx");
    } catch (error) {
      console.error("Excel Download Error:", error);
      if (error instanceof Error) {
        alert("Failed to generate Excel: " + error.message);
      } else {
        alert("Failed to generate Excel: An unknown error occurred");
      }
    }
  };
  return (
    <button
      onClick={role === "teacher" ? generateExcel : generatePDF}
      className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm"
    >
      {role === "teacher" ? "Download Excel" : "Download PDF"}
    </button>
  );
};

export default StudentResultDownload;