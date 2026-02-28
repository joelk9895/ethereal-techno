import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/database";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const JWT_SECRET =
  process.env.JWT_SECRET || "your-secret-key-change-in-production";

interface JWTPayload {
  userId: string;
  iat?: number;
  exp?: number;
}

interface UpdateProfileBody {
  username?: string;
  email?: string;
  password?: string;
  artistName?: string;
  city?: string | null;
  country?: string | null;
  quote?: string | null;
  allowContact?: boolean;
  canCreateSamples?: boolean;
  canCreateSerum?: boolean;
  canCreateDiva?: boolean;
  instagram?: string | null;
  tiktok?: string | null;
  facebook?: string | null;
  youtube?: string | null;
  x?: string | null;
  linktree?: string | null;
  soundcloud?: string | null;
  spotify?: string | null;
  beatport?: string | null;
  bandcamp?: string | null;
  appleMusic?: string | null;
  track1?: string | null;
  track2?: string | null;
  track3?: string | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  billing?: any;
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");

    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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

    // Fetch user with ArtistApplication fallback
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        artistApplications: {
          where: { status: "APPROVED" },
          take: 1,
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Producer not found" },
        { status: 404 }
      );
    }

    // Fallback Logic: Use User fields if present, else fallback to ArtistApplication
    const app = user.artistApplications[0];

    const producer = {
      id: user.id,
      username: user.username,
      email: user.email,
      name: user.name,
      surname: user.surname,
      type: user.type,

      // Profile Fields (User > Application > null)
      artistName: user.artistName || app?.artistName || null,
      artistPhoto: user.artistPhoto || app?.photoUrl || null,
      city: user.city || null,
      country: user.country || null,
      quote: user.quote || app?.quote || null,

      // Socials
      instagram: user.instagram || app?.instagram || null,
      tiktok: user.tiktok || app?.tiktok || null,
      facebook: user.facebook || app?.facebook || null,
      youtube: user.youtube || app?.youtube || null,
      x: user.x || app?.x || null,
      linktree: user.linktree || app?.linktree || null,
      soundcloud: user.soundcloud || app?.soundcloud || null,
      spotify: user.spotify || app?.spotify || null,
      beatport: user.beatport || app?.beatport || null,
      bandcamp: user.bandcamp || app?.bandcamp || null,
      appleMusic: user.appleMusic || app?.appleMusic || null,
      track1: user.track1 || app?.track1 || null,
      track2: user.track2 || app?.track2 || null,
      track3: user.track3 || app?.track3 || null,

      // Capabilities
      publicEmail: false, // Default or add to schema if needed
      canCreateSamples: user.canCreateSamples,
      canCreateSerum: user.canCreateSerum,
      canCreateDiva: user.canCreateDiva,
      allowContact: user.allowContact,

      createdAt: user.createdAt,
      approvedAt: user.approvedAt,

      // Billing (User specific)
      billing: user.billing || {},

      telegramUsername: user.telegramUsername || null,
    };

    return NextResponse.json({ producer });
  } catch (error) {
    console.error("Profile GET Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");

    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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

    const body = (await request.json()) as UpdateProfileBody;

    // Build update data
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: any = {
      ...(body.username !== undefined && { username: body.username }),
      ...(body.email !== undefined && { email: body.email }),
      ...(body.artistName !== undefined && { artistName: body.artistName }),
      ...(body.city !== undefined && { city: body.city }),
      ...(body.country !== undefined && { country: body.country }),
      ...(body.quote !== undefined && { quote: body.quote }),
      ...(body.instagram !== undefined && { instagram: body.instagram }),
      ...(body.tiktok !== undefined && { tiktok: body.tiktok }),
      ...(body.facebook !== undefined && { facebook: body.facebook }),
      ...(body.youtube !== undefined && { youtube: body.youtube }),
      ...(body.x !== undefined && { x: body.x }),
      ...(body.linktree !== undefined && { linktree: body.linktree }),
      ...(body.soundcloud !== undefined && { soundcloud: body.soundcloud }),
      ...(body.spotify !== undefined && { spotify: body.spotify }),
      ...(body.beatport !== undefined && { beatport: body.beatport }),
      ...(body.bandcamp !== undefined && { bandcamp: body.bandcamp }),
      ...(body.appleMusic !== undefined && { appleMusic: body.appleMusic }),
      ...(body.track1 !== undefined && { track1: body.track1 }),
      ...(body.track2 !== undefined && { track2: body.track2 }),
      ...(body.track3 !== undefined && { track3: body.track3 }),
      ...(body.billing !== undefined && { billing: body.billing }),
      ...(body.allowContact !== undefined && { allowContact: body.allowContact }),
      ...(body.canCreateSamples !== undefined && { canCreateSamples: body.canCreateSamples }),
      ...(body.canCreateSerum !== undefined && { canCreateSerum: body.canCreateSerum }),
      ...(body.canCreateDiva !== undefined && { canCreateDiva: body.canCreateDiva }),
    };

    if (body.password) {
      updateData.password = await bcrypt.hash(body.password, 10);
    }

    // Check for unique constraint conflicts if email or username is updated
    if (updateData.email || updateData.username) {
      const existingUser = await prisma.user.findFirst({
        where: {
          OR: [
            ...(updateData.email ? [{ email: updateData.email }] : []),
            ...(updateData.username ? [{ username: updateData.username }] : [])
          ],
          NOT: { id: decoded.userId }
        }
      });

      if (existingUser) {
        return NextResponse.json({ error: "Username or Email already in use." }, { status: 400 });
      }
    }

    // Update User model directly
    const updatedUser = await prisma.user.update({
      where: { id: decoded.userId },
      data: updateData,
    });

    // Return the updated shape (simplified for PATCH response)
    return NextResponse.json({ producer: updatedUser });
  } catch (error) {
    console.error("Profile PATCH Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");

    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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

    // Delete the user from the database
    // Prisma's onDelete: Cascade will handle related ArtistApplications, Sessions, RiskLogs
    await prisma.user.delete({
      where: { id: decoded.userId },
    });

    return NextResponse.json({ success: true, message: "Account deleted successfully." });
  } catch (error) {
    console.error("Profile DELETE Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
