import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { extractText } from "@/lib/utils/file-parser";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/msword",
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "Only PDF and DOCX files are supported" }, { status: 400 });
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "File size must be under 10MB" }, { status: 400 });
    }

    // Get or create user
    const user = await db.user.upsert({
      where: { clerkId: userId },
      update: {},
      create: {
        clerkId: userId,
        email: "",
        subscription: { create: { scansUsed: 0, scansLimit: 3 } },
      },
    });

    // Extract text from file
    const buffer = Buffer.from(await file.arrayBuffer());
    const rawText = await extractText(buffer, file.type);

    if (!rawText || rawText.trim().length < 50) {
      return NextResponse.json({ error: "Could not extract text from file. Please ensure it's a valid resume." }, { status: 400 });
    }

    // Clear previous master resumes so there is always exactly one
    await db.resume.updateMany({
      where: { userId: user.id, isMaster: true },
      data: { isMaster: false },
    });

    // Save resume to DB — no AI at upload time, AI only runs during Generate
    const resume = await db.resume.create({
      data: {
        userId: user.id,
        fileName: file.name,
        fileUrl: "",
        fileType: file.type,
        rawText,
        parsedData: {},
        isMaster: true,
      },
    });

    return NextResponse.json({
      resumeId: resume.id,
      message: "Resume uploaded successfully",
      rawTextPreview: rawText.slice(0, 2000),
    });
  } catch (error) {
    console.error("Resume upload error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload failed" },
      { status: 500 }
    );
  }
}
