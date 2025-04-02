import { z } from "zod";

export const subjectSchema = z.object({
  id: z.coerce.number().optional(),
  name: z.string().min(1, { message: "Subject Name is required!" }),
  type: z.enum(["THEORY", "PRACTICAL"], { message: "Type is required!" }),
  teachers: z.array(z.string()), //teacher ids
  subjectCode: z.string(),
  maxMarks: z.coerce.number(),
  file: z
    .object({
      name: z.string(),
      data: z.string(), 
    })
    .optional()
    .nullable(), 
  branchId: z.coerce.number().min(1, { message: "branch name is required!" }),
  semesterId: z.coerce.number().min(1, { message: "semester name is required!" }),
});

export type SubjectSchema = z.infer<typeof subjectSchema>;

export const branchSchema = z.object({
  id: z.coerce.number().optional(),
  name: z.string().min(1, { message: "Branch name is required!" }),
  capacity: z.coerce.number().min(1, { message: "Capacity name is required!" }),
  teachers: z.array(z.string()), 
  subjects: z.array(z.number()).optional(),
  semesters: z.array(z.string()).optional(),
});

export type BranchSchema = z.infer<typeof branchSchema>;

export const graceMarkSchema = z.object({
  id: z.number().optional(),
  studentId: z.string().min(1, "Student ID is required"),
  subjectId: z.number().min(1, "Subject is required"),
  teacherId: z.string().min(1, "Approving teacher is required"),
  graceMark: z.number()
    .min(0, "Grace marks cannot be negative")

    .refine(
      (value) => value % 0.5 === 0, 
      "Grace marks must be in whole numbers or half marks (0.5)"
    ),
  currentMarks: z.number().optional(),
  newTotalMarks: z.number().optional(),
  previousGrade: z.string().optional(),
  newGrade: z.string().optional(),
  maxMarks: z.number().optional(),
  passingMarks: z.number().optional(),
});

export type GraceMarkSchema = z.infer<typeof graceMarkSchema>;
export const teacherSchema = z.object({
  id: z.string().optional(),
  username: z
    .string()
    .min(3, { message: "Username must be at least 3 characters long!" })
    .max(20, { message: "Username must be at most 20 characters long!" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long!" })
    .or(z.literal("")),
  name: z.string().min(1, { message: "Name is required!" }),
  email: z
    .string()
    .email({ message: "Invalid email address!" })
    .optional()
    .or(z.literal("")),
  phone: z.string().optional(),
  suffix: z.enum(["MR.", "MS.", "MRS." , "DR."], { message: "Suffix is required!" }),
  division: z.string().optional(),
  branches: z.array(z.string()).optional(),
  subjects: z.array(z.string()).optional(), // subject ids
});

export type TeacherSchema = z.infer<typeof teacherSchema>;


export const registrarSchema = z.object({
  id: z.string().optional(),
  username: z
    .string()
    .min(3, { message: "Username must be at least 3 characters long!" })
    .max(20, { message: "Username must be at most 20 characters long!" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long!" })
    .optional()
    .or(z.literal("")),
  name: z.string().min(1, { message: "Name is required!" }),
  email: z
    .string()
    .email({ message: "Invalid email address!" })
    .optional()
    .or(z.literal("")),
  phone: z.string().optional(),
});

export type RegistrarSchema = z.infer<typeof registrarSchema>;

export const theoryInchargeSchema = z.object({
  id: z.string().optional(),
  username: z
    .string()
    .min(3, { message: "Username must be at least 3 characters long!" })
    .max(20, { message: "Username must be at most 20 characters long!" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long!" })
    .optional()
    .or(z.literal("")),
  name: z.string().min(1, { message: "Name is required!" }),
  email: z
    .string()
    .email({ message: "Invalid email address!" })
    .optional()
    .or(z.literal("")),
  phone: z.string().optional(),
});

export type TheoryInchargeSchema = z.infer<typeof theoryInchargeSchema>;


export const studentSchema = z.object({
  id: z.string().optional(),
  username: z
    .string()
    .min(3, { message: "Username must be at least 3 characters long!" })
    .max(20, { message: "Username must be at most 20 characters long!" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long!" })
    .optional()
    .or(z.literal("")),
  name: z.string().min(1, { message: "Name is required!" }),
  fatherName: z.string().min(1, { message: "Father Name is required!" }),
  address: z.string(),
  motherName: z.string().min(1, { message: "Mother Name is required!" }),
  email: z
    .string()
    .email({ message: "Invalid email address!" })
    .optional()
    .or(z.literal("")),
  bloodType: z.string().min(1, { message: "Blood Type is required!" }),
  birthday: z.coerce.date({ message: "Birthday is required!" }),
  phone: z.string().optional(),
  img: z.string().optional(),
  sex: z.enum(["MALE", "FEMALE" , "PREFER_NOT_TO_SAY"], { message: "Sex is required!" }),
  semesterId: z.coerce.number().min(1, { message: "Semester is required!" }),
  branchId: z.coerce.number().min(1, { message: "Branch Name is required!" }),
});

export type StudentSchema = z.infer<typeof studentSchema>;

export const examSchema = z.object({
  id: z.coerce.number().optional(),
  examDate: z.coerce.date({ message: "exam date is required!" }),
  startTime: z.coerce.date({ message: "Start time is required!" }),
  endTime: z.coerce.date({ message: "End time is required!" }),
  branchId: z.coerce.number({ message: "branch is required!" }),
  subjectId: z.coerce.number({ message: "subject is required!" }),
  semesterId: z.coerce.number({ message: "semester is required!" }),
});

export type ExamSchema = z.infer<typeof examSchema>;



export const announcementSchema = z.object({
  id: z.coerce.number().optional(),
  title: z.string().min(1, 'Title is required'),
  content: z.string().min(1, 'Content is required'),
  type: z.enum(['GENERAL', 'TEACHER_SPECIFIC']),
  teacherIds: z.array(z.string()).optional(),
  file: z
    .object({
      name: z.string(),
      data: z.string(), 
    })
    .optional()
    .nullable(), 
});

export type AnnouncementSchema = z.infer<typeof announcementSchema>;

export const resultSchema = z.object({
  id: z.coerce.number().optional(),
  sessionalExam: z.coerce
  .string()
  .min(0, { message: "Sessional Exam Marks must be atleast 0!"})
  .max(100, { message: "Sessional Exam Marks must be atmost 100!" }),
  endTerm: z.coerce
  .number()
  .min(0, { message: "End Term Marks must be atleast 0!" })
  .max(100, { message: "End Term Marks must be atmost 100!" }),

  overallMark: z.coerce
  .number()
  .min(0, { message: "Overall Marks must be atleast 0!" })
  .max(100, { message: "Overall Marks must be atmost 100!" }),
  grade: z.string().optional(),
  studentId: z.string().min(1, { message: "Student is required!" }),
  teacherId: z.string().min(1, { message: "Teacher is required!" }),
  subjectId: z.coerce.number().min(1, { message: "Subject is required!" }),
});

export type ResultSchema = z.infer<typeof resultSchema>;