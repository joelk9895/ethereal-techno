import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/database";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";

interface JWTPayload {
  userId: string;
  iat?: number;
  exp?: number;
}

interface ApplicationBody {
  // Registration fields (for guests)
  email?: string;
  password?: string;
  confirmPassword?: string;
  username?: string;
  name?: string;
  surname?: string;

  // Application fields
  artistName?: string;
  quote?: string;
  photoUrl?: string | null;
  instagram?: string | null;
  tiktok?: string | null;
  facebook?: string | null;
  youtube?: string | null;
  x?: string | null;
  linktree?: string | null;
  spotify?: string | null;
  soundcloud?: string | null;
  beatport?: string | null;
  bandcamp?: string | null;
  appleMusic?: string | null;
  track1?: string | null;
  track2?: string | null;
  track3?: string | null;
  canCreateLoops?: boolean;
  canCreateSerum?: boolean;
  canCreateDiva?: boolean;
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");

    if (!authHeader?.startsWith("Bearer ")) {
      // For GET check, if no token, just say not exists (guest view)
      // Or return 401 if we strictly want to know "status for this user"
      // But logically, a guest has no application.
      return NextResponse.json({ exists: false }, { status: 200 });
    }

    const token = authHeader.substring(7);
    let decoded: JWTPayload;

    try {
      decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    } catch {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      );
    }

    const existingApplication = await prisma.artistApplication.findFirst({
      where: { userId: decoded.userId },
    });

    if (existingApplication) {
      return NextResponse.json(
        { exists: true, application: existingApplication },
        { status: 200 }
      );
    }

    return NextResponse.json({ exists: false }, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  } finally {

  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as ApplicationBody;
    let userId: string | null = null;
    let token: string | null = null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let user: any = null;

    const authHeader = request.headers.get("authorization");

    // 1. Authenticated User Flow
    if (authHeader?.startsWith("Bearer ")) {
      const existingToken = authHeader.substring(7);
      try {
        const decoded = jwt.verify(existingToken, JWT_SECRET) as JWTPayload;
        userId = decoded.userId;
      } catch {
        return NextResponse.json(
          { error: "Invalid or expired token" },
          { status: 401 }
        );
      }
    }
    // 2. Guest Registration Flow
    else {
      // Validate Registration Fields
      if (!body.email || !body.password || !body.username || !body.name) {
        return NextResponse.json(
          { error: "Missing registration details (email, password, username, name)" },
          { status: 400 }
        );
      }

      // Check if user exists
      const existingUser = await prisma.user.findFirst({
        where: {
          OR: [
            { email: body.email },
            { username: body.username }
          ]
        }
      });

      if (existingUser) {
        return NextResponse.json(
          { error: "User with this email or username already exists" },
          { status: 409 }
        );
      }

      // Create User
      const hashedPassword = await bcrypt.hash(body.password, 10);
      user = await prisma.user.create({
        data: {
          email: body.email,
          username: body.username,
          password: hashedPassword,
          name: body.name,
          surname: body.surname || null,
          type: "USER", // Default type
          country: "Unknown" // Can be updated later or added to form
        }
      });

      userId = user.id;

      // Generate Token for auto-login
      token = jwt.sign(
        { userId: user.id },
        JWT_SECRET,
        { expiresIn: "7d" }
      );
    }

    // 3. Create Application (Common Step)
    if (!userId) {
      return NextResponse.json(
        { error: "Could not identify or create user" },
        { status: 500 }
      );
    }

    const existingApplication = await prisma.artistApplication.findFirst({
      where: { userId: userId },
    });

    if (existingApplication) {
      return NextResponse.json(
        { error: "Application already exists" },
        { status: 400 }
      );
    }

    const application = await prisma.artistApplication.create({
      data: {
        userId: userId,
        artistName: body.artistName || "",
        email: body.email || "", // Fallback to body email if available
        status: "PENDING",
        quote: body.quote || "",
        photoUrl: body.photoUrl || null,
        instagram: body.instagram || null,
        tiktok: body.tiktok || null,
        facebook: body.facebook || null,
        youtube: body.youtube || null,
        x: body.x || null,
        linktree: body.linktree || null,
        spotify: body.spotify || null,
        soundcloud: body.soundcloud || null,
        beatport: body.beatport || null,
        bandcamp: body.bandcamp || null,
        appleMusic: body.appleMusic || null,
        track1: body.track1 || null,
        track2: body.track2 || null,
        track3: body.track3 || null,
        canCreateLoops: body.canCreateLoops || false,
        canCreateSerum: body.canCreateSerum || false,
        canCreateDiva: body.canCreateDiva || false,
      },
    });

    return NextResponse.json({
      application,
      token, // Will be null if authenticated user
      user   // Will be null if authenticated user (unless we fetch it)
    }, { status: 201 });

  } catch (error) {
    console.error("Apply API Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  } finally {

  }
}
