import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { message, history = [] } = body;

        if (!message) {
            return NextResponse.json({ error: "No message provided" }, { status: 400 });
        }

        const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

        if (!GEMINI_API_KEY || GEMINI_API_KEY.trim() === "") {
            // HIGH-QUALITY SIMULATED INTELLIGENCE ENGINE
            const query = message.toLowerCase();
            let simulatedResponse = "";

            if (query.includes("report") || query.includes("waste") || query.includes("trash")) {
                simulatedResponse = "Vanakkam! To report waste accurately, go to the 'Citizen Dashboard' and upload a photo. Our AI core will instantly analyze the image, detect the type of waste (Biodegradable vs Recyclable), and assign the nearest collection van. You can track the status of your report in real-time. This system ensures Madurai stays the 'Thoonga Nagaram' we all love—ever clean and ever bright!";
            } else if (query.includes("hospital") || query.includes("medical") || query.includes("biomedical")) {
                simulatedResponse = "The Hospital Safe Trace module is a critical part of ThoongaNagaram AI. Hospitals are assigned unique QR codes to track biomedical waste disposal. If a hospital fails to report disposal within 3-4 days, the system automatically triggers an alert to municipal authorities. This ensures 100% compliance and prevents hazardous waste from entering public zones.";
            } else if (query.includes("river") || query.includes("vaigai")) {
                simulatedResponse = "Protecting the Vaigai River is our top priority. Our specialized 'Vaigai Protection' module allows citizens to pinpoint illegal dumping areas along the riverbanks. These reports are pushed directly to a priority queue for immediate municipal intervention. We use AI to monitor recurrence and deploy preventive measures in high-risk zones.";
            } else if (query.includes("predict") || query.includes("recurrence") || query.includes("intelligence")) {
                simulatedResponse = "ThoongaNagaram AI doesn't just clean; it predicts! Our Preventive Intelligence engine analyzes historical data to identify 'Root Causes' of waste accumulation. By predicting recurrence patterns, we help the municipality place bins exactly where they are needed most, stopping waste before it even hits the ground.";
            } else if (query.includes("who are you") || query.includes("what is this") || query.includes("tell me about")) {
                simulatedResponse = "I am the Thoonga Assistant, the digital heart of Madurai's Smart City initiatives. I help citizens interact with our AI-powered waste management system, track biomedical compliance, and protect our natural assets like the Vaigai River. My mission is to empower you with data to build a cleaner, smarter Madurai!";
            } else {
                simulatedResponse = "I appreciate your interest in Madurai's development! While my 'Advanced Brain' is in simulated mode right now, I can still guide you on Waste Reporting, Hospital QR Tracking, Vaigai River Protection, and our AI Preventive Intelligence. Which of these premium features would you like to explore in detail?";
            }

            return NextResponse.json({
                response: simulatedResponse,
                isSimulated: true
            });
        }

        const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

        const systemPrompt = `
        You are "Thoonga Assistant", the official AI guide for the "ThoongaNagaram AI" platform, a premium urban governance system for Madurai, Tamil Nadu. 
        Your tone is professional, helpful, and deeply knowledgeable about Madurai's culture and the platform's features.
        
        Platform Features you must know:
        1. AI Waste Reporting: Citizens upload photos of waste, AI categorizes it, assesses risk, and assigns municipal vans.
        2. Hospital Safe Trace: Tracks biomedical waste from hospitals using QR codes to ensure 100% compliance.
        3. Vaigai River Protection: Specialized module for reporting illegal dumping along the Vaigai riverbanks with high-priority alerts.
        4. Preventive Intelligence: AI predicts where waste will accumulate next and why (root cause analysis).
        
        Instructions:
        - Use "Vanakkam!" for greetings sometimes.
        - Be concise but comprehensive.
        - Answer all questions accurately based on the ThoongaNagaram system.
        - If asked about something unrelated to Madurai or the platform, try to bring the conversation back to urban cleanliness and Madurai's development.
        - Always encourage the user to use the reporting features if they spot waste.
        `;

        const response = await ai.models.generateContent({
            model: "gemini-1.5-flash",
            contents: [
                { role: "user", parts: [{ text: `System Instruction: ${systemPrompt}` }] },
                ...history.map((msg: any) => ({
                    role: msg.sender === "user" ? "user" : "model",
                    parts: [{ text: msg.text }]
                })),
                { role: "user", parts: [{ text: message }] }
            ],
            config: {
                temperature: 0.7
            }
        });

        const responseText = response.text || "I'm sorry, I couldn't generate a response.";

        return NextResponse.json({
            response: responseText,
            isSimulated: false
        });

    } catch (error: any) {
        console.error("Chat API Error:", error);
        return NextResponse.json({
            error: "Failed to generate response",
            fallback: "Our AI brain is briefly resting. ThoongaNagaram AI helps you report waste and monitor hospital compliance in Madurai."
        }, { status: 500 });
    }
}
