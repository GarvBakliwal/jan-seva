import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const lat = searchParams.get("lat");
        const lon = searchParams.get("lon");

        if (!lat || !lon) {
            return NextResponse.json(
                { error: "Latitude and longitude are required" },
                { status: 400 }
            );
        }

        const latitude = Number(lat);
        const longitude = Number(lon);

        if (
            !Number.isFinite(latitude) ||
            !Number.isFinite(longitude) ||
            latitude < -90 ||
            latitude > 90 ||
            longitude < -180 ||
            longitude > 180
        ) {
            return NextResponse.json(
                { error: "Invalid coordinates" },
                { status: 400 }
            );
        }

        const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`,
            {
                headers: {
                    // Identify your application properly per Nominatim terms
                    "User-Agent": "JanSevaMunicipalApp/1.0 (contact@janseva.gov.in)",
                    "Accept-Language": "en",
                },
                cache: "no-store",
            }
        );

        if (!response.ok) {
            return NextResponse.json(
                { error: "Reverse geocoding service failed" },
                { status: 502 }
            );
        }

        const data = await response.json();

        return NextResponse.json({
            address: data.display_name || "",
            latitude,
            longitude,
        });
    } catch (error) {
        console.error("Reverse geocoding error:", error);

        return NextResponse.json(
            { error: "Unable to determine address" },
            { status: 500 }
        );
    }
}