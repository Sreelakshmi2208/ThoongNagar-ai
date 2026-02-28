import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { base64Image, description = "No description provided", lat, lng } = body;

        // If the base64 string includes the data URI scheme, strip it out for Gemini
        const base64Data = base64Image?.split(",")[1] || base64Image;

        if (!base64Data) {
            return NextResponse.json({ error: "No image provided" }, { status: 400 });
        }

        const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY;
        const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

        if (!GOOGLE_PLACES_API_KEY || !GEMINI_API_KEY) {
            // Provide a high-quality fallback "Standard Diagnostic" if keys are missing
            return NextResponse.json({
                wasteType: "General Municipal Waste",
                rootCause: "This report was generated using our 'Standard Diagnostic Engine' because the Advanced AI Analysis is currently offline. \n\nTypically, waste accumulation in urban areas like Madurai is a result of high foot traffic and limited disposal infrastructure in proximity to commercial or residential hubs. Without real-time AI mapping, we categorize this as general urban waste requiring standard collection protocols.",
                behavioralCause: "System Offline (Standard Processing)",
                wasteSegregation: {
                    wet: 45,
                    dry: 45,
                    hazardous: 10
                },
                recurrenceProb: 65,
                riskLevel: "Medium",
                recommendedAction: "Please proceed with a standard cleanup request. We recommend deploying a collection team within the next 24-48 hours. \n\nTo prevent recurrence, consider placing additional 'Fixed-Point' bins in this vicinity and engaging local shopkeepers to ensure they are using the designated disposal points rather than dumping at the curb. This 'Standard Report' serves as a valid entry for the Command Center."
            });
        }

        let poiContext = "No significant POIs found nearby.";

        // 1. Fetch nearby POIs using Google Places API (New)
        if (lat && lng) {
            try {
                // We use standard fetch for Places API
                const placesUrl = `https://places.googleapis.com/v1/places:searchNearby`;
                const placesBody = {
                    "includedTypes": ["hindu_temple", "hospital", "market", "coffee_shop", "restaurant", "bus_station"],
                    "maxResultCount": 5,
                    "locationRestriction": {
                        "circle": {
                            "center": {
                                "latitude": parseFloat(lat),
                                "longitude": parseFloat(lng)
                            },
                            "radius": 500.0
                        }
                    }
                };

                const placesResponse = await fetch(placesUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Goog-Api-Key': GOOGLE_PLACES_API_KEY,
                        'X-Goog-FieldMask': 'places.displayName,places.primaryType'
                    },
                    body: JSON.stringify(placesBody)
                });

                const placesData = await placesResponse.json();

                const poiNames = placesData.places?.map((p: any) => `${p.displayName?.text || 'Unknown'} (${p.primaryType})`).join(", ") || "No significant POIs found.";
                poiContext = `Nearby Points of Interest (within 500m): ${poiNames}.`;
            } catch (error) {
                console.error("Error fetching places:", error);
                poiContext = "Error fetching nearby POIs.";
            }
        }

        // 2. Determine Historical Context (Mocked for now due to complex Firebase spatial querying setup)
        // In a full production app, we would query Firestore using GeoHashes.
        const pastComplaintsCount = Math.floor(Math.random() * 5); // 0 to 4 past complaints


        // 3. Prepare Image and System Instructions for Gemini
        const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

        const systemInstruction = `
            You are ThoongaNagaram AI, an expert AI in waste management and risk analysis.
            Analyze the provided image of unmanaged waste. 
            
            Context provided:
            1. User Description: "${description}"
            2. POI Context: ${poiContext}
            3. Historical Context: ${pastComplaintsCount} past complaints.
            
            Use the following logic to determine the 'recurrence probability' and risk level:
            - If it's organic waste near a temple (Cultural) + past complaints > 0 -> High recurrence.
            - If it's plastic/paper near tea stalls/restaurants (Commercial) -> Medium-High recurrence.
            - If it's rotten vegetables near a market -> High recurrence.
            - If it's illegal dumping (debris) in an isolated area (no POIs) -> Very High recurrence.
            - Calculate recurrence probability (0-100) using weighted scoring: Image contents (40%) + POI proximity (30%) + Past complaints (30%).
            
            IMPORTANT: Your responses for 'rootCause' and 'recommendedAction' MUST be written as 2-3 detailed paragraphs. Do not use simple bullet points. Explain the structural reasons for waste accumulation and provide a comprehensive, step-by-step intervention plan.
            
            Output ONLY valid JSON with no markdown formatting.
            Structure:
            {
                "wasteType": "Detailed categorized name (e.g. Commercial Packing & Food Waste, Market Waste, Illegal Dumping, Cultural Waste)",
                "rootCause": "Highly detailed structural/environmental root cause in 2-3 paragraphs. Explain EXACTLY why waste accumulates here based on the environment and POIs.",
                "behavioralCause": "The underlying human behavior causing this (e.g. Convenience dumping, Lack of bins, Commercial negligence)",
                "wasteSegregation": {
                    "wet": 40,
                    "dry": 50,
                    "hazardous": 10
                },
                "recurrenceProb": (number between 0 and 100),
                "riskLevel": "Low | Medium | High | Critical",
                "recommendedAction": "Highly detailed, actionable step-by-step intervention in 2-3 paragraphs. Include specifics like bin placement, scheduling, and community engagement."
            }
        `;

        const response = await ai.models.generateContent({
            model: "gemini-1.5-flash",
            contents: [
                {
                    role: "user",
                    parts: [
                        { text: systemInstruction },
                        {
                            inlineData: {
                                data: base64Data,
                                mimeType: "image/jpeg",
                            }
                        }
                    ]
                }
            ],
            config: {
                responseMimeType: "application/json",
                temperature: 0.1
            }
        });

        if (response.text) {
            const jsonResponse = JSON.parse(response.text);
            return NextResponse.json(jsonResponse);
        } else {
            return NextResponse.json({ error: "Failed to generate response from Gemini" }, { status: 500 });
        }

    } catch (error: any) {
        console.error("Analysis Error:", error);
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
}
