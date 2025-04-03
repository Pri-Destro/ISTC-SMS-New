import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { updateProgress } from '@/lib/progress-state';

export async function POST(req: NextRequest) {
  try {
    const { semesterId } = await req.json();

    if (!semesterId) {
      return NextResponse.json({ success: false, message: 'Semester ID is required' }, { status: 400 });
    }

    // Find all students in the specified semester who have results
    const students = await prisma.student.findMany({
      where: {
        semesterId: parseInt(semesterId),
        results: {
          some: {} // Only include students who have at least one result
        }
      },
      include: {
        branch: { include: { _count: { select: { lectures: true } } } },
        semester: true,
        results: {
          include: { subject: true },
        }
      }
    });

    if (students.length === 0) {
      return NextResponse.json({ 
        success: false, 
        message: 'No students found with results for the selected semester' 
      }, { status: 404 });
    }

    // Reset progress tracking
    updateProgress(0, students.length);
    
    // Return the student data instead of generating PDFs on the server
    return NextResponse.json({ 
      success: true, 
      message: `Fetched data for ${students.length} students`,
      students: students
    });
    
  } catch (error) {
    console.error('Error fetching student data:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to generate DMCs' 
    }, { status: 500 });
  }
}