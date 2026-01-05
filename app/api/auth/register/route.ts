
import { createUser, findUserByEmail } from "@/lib/db-utils";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const { email, password } = await req.json();

        if (!email || !password) {
            return new NextResponse("Missing email or password", { status: 400 });
        }

        const existingUser = await findUserByEmail(email);
        if (existingUser) {
            return new NextResponse("User already exists", { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        await createUser(email, hashedPassword);

        return new NextResponse("User created", { status: 201 });
    } catch (error) {
        console.error("Registration error:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
