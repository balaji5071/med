import { GoogleGenerativeAI } from "@google/generative-ai";
import { AIMED_GURU_PROMPT } from "@/config/aimed-guru-prompt";
import { saveConversationMessage } from "@/lib/db-utils";

export const maxDuration = 60;

export async function POST(req: Request) {
    try {
        const { messages, isAntiGravity, sessionId } = await req.json();
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            console.error("Critical: GEMINI_API_KEY is missing from environment variables.");
            return new Response("Missing API Key", { status: 500 });
        }

        // 1. Safety Wrap Database Save
        if (sessionId && messages.length > 0) {
            const lastUserMessage = messages[messages.length - 1];
            saveConversationMessage(sessionId, "user", lastUserMessage.content)
                .catch(err => console.error("DB Save Error (User):", err));
        }

        // 2. Configure System Instructions
        let systemInstruction = AIMED_GURU_PROMPT;
        if (isAntiGravity) {
            systemInstruction += "\n\nSYSTEM UPDATE: ACTIVATING ANTI-GRAVITY MODE. Use zero-gravity metaphors. Keep medical facts accurate.";
        }

        // 3. Initialize Model with proper systemInstruction property
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ 
            model: "gemini-2.5-flash",
            systemInstruction: systemInstruction 
        });

        // 4. Clean Helper for Image Processing (Avoids Regex Timeouts)
        const parseImageData = (imageStr: string) => {
            if (!imageStr.startsWith("data:")) return null;
            const [header, data] = imageStr.split(";base64,");
            const mimeType = header.split(":")[1];
            return { inlineData: { mimeType, data } };
        };

        // 5. Convert History (strictly alternating user/model)
        const history = messages.slice(0, -1).map((m: any) => {
            const parts: any[] = [{ text: m.content || "" }];
            const imgData = m.image ? parseImageData(m.image) : null;
            if (imgData) parts.push(imgData);
            
            return {
                role: m.role === "user" ? "user" : "model",
                parts: parts,
            };
        });

        // 6. Prepare Current Message
        const lastMessageObj = messages[messages.length - 1];
        const lastMessageParts: any[] = [{ text: lastMessageObj.content || "" }];
        const currentImgData = lastMessageObj.image ? parseImageData(lastMessageObj.image) : null;
        if (currentImgData) lastMessageParts.push(currentImgData);

        const chatSession = model.startChat({
            history: history,
            generationConfig: { maxOutputTokens: 8192 }
        });

        const result = await chatSession.sendMessageStream(lastMessageParts);

        // 7. Streaming Response
        const stream = new ReadableStream({
            async start(controller) {
                const encoder = new TextEncoder();
                let fullResponseText = "";
                try {
                    for await (const chunk of result.stream) {
                        const chunkText = chunk.text();
                        if (chunkText) {
                            fullResponseText += chunkText;
                            controller.enqueue(encoder.encode(chunkText));
                        }
                    }

                    if (sessionId) {
                        saveConversationMessage(sessionId, "model", fullResponseText)
                            .catch(err => console.error("DB Save Error (Model):", err));
                    }
                    controller.close();
                } catch (err) {
                    console.error("Streaming Error:", err);
                    controller.error(err);
                }
            }
        });

        return new Response(stream, {
            headers: { "Content-Type": "text/plain; charset=utf-8" },
        });

    } catch (error: any) {
        console.error("Detailed Server Error:", error);
        return new Response(
            JSON.stringify({ error: error.message || "Internal Server Error" }), 
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
}