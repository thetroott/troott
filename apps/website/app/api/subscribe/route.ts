import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function POST(req: NextRequest) {
  const { email, name, consent, country, user_type } = await req.json();
  console.log("Incoming subscribe data:", { email, name, consent, country, user_type });


  // Basic validation
  if (!email || !name || !consent || !country || !user_type) {
    return NextResponse.json(
      { error: "Missing email, name, consent, country, or userType" },
      { status: 400 }
    );
  }

  const API_KEY = process.env.MAILERLITE_API_KEY!;
  const GROUP_ID = process.env.MAILERLITE_GROUP_ID!;

  // 1) Check if subscriber already exists
  try {
    await axios.get(
      `https://api.mailerlite.com/api/v2/subscribers/${encodeURIComponent(email)}`,
      {
        headers: {
          "X-MailerLite-ApiKey": API_KEY,
        },
      }
    );
    // If the GET succeeds, subscriber exists
    return NextResponse.json(
      { error: "This email is already subscribed" },
      { status: 409 }
    );
  } catch (err: any) {
    // If 404, subscriber not found — we can proceed
    if (err.response?.status !== 404) {
      console.error("Error checking subscriber:", err.response?.data || err);
      return NextResponse.json(
        { error: "Could not verify subscription" },
        { status: 500 }
      );
    }
  }

  // 2) Create new subscriber
  try {
    await axios.post(
      "https://api.mailerlite.com/api/v2/subscribers",
      {
        email,
        name,
        fields: {
          consent,
          country: country,
          user_type: user_type,
        },
        resubscribe: true,
        ...(GROUP_ID && { groups: [GROUP_ID] }),
      },
      {
        headers: {
          "Content-Type": "application/json",
          "X-MailerLite-ApiKey": API_KEY,
        },
      }
    );

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err: any) {
    console.error("Error creating subscriber:", err.response?.data || err);
    return NextResponse.json(
      { error: "Subscription failed. Please try again." },
      { status: 500 }
    );
  }
}
