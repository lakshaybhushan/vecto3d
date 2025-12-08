import { geolocation } from "@vercel/functions";

export function GET(request: Request) {
  try {
    const { country, city, region } = geolocation(request);
    console.log("Geolocation data:", { country, city, region });

    const isUS = country === "US";

    return new Response(
      JSON.stringify({
        isUS,
        country,
        city,
        region,
        debug: process.env.NODE_ENV,
      }),
      {
        headers: { "content-type": "application/json" },
      },
    );
  } catch (error) {
    console.error("Error checking geolocation:", error);
    return new Response(
      JSON.stringify({
        isUS: false,
        error: error instanceof Error ? error.message : "Unknown error",
        debug: process.env.NODE_ENV,
      }),
      {
        headers: { "content-type": "application/json" },
      },
    );
  }
}
