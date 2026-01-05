
import { getConversation } from "@/lib/db-utils";
import { type NextRequest } from "next/server";

export async function GET(req: NextRequest) {
    const searchParams = req.nextUrl.searchParams;
    const sessionId = searchParams.get("sessionId");

    if (!sessionId) {
        return new Response("Missing sessionId", { status: 400 });
    }

    const conversation = await getConversation(sessionId);
    return Response.json({ messages: conversation?.messages || [] });
}
