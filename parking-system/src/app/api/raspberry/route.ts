let latestData: any = null; 

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("Received data from Raspberry Pi:", body);
    
    latestData = body; 

    return Response.json({ message: "Data received successfully", received: body }, { status: 200 });
  } catch (error) {
    return Response.json({ error: "Invalid data format" }, { status: 400 });
  }
}

export async function GET() {
  if (!latestData) {
    return Response.json({ message: "No data received yet" }, { status: 200 });
  }

  return Response.json({ received: latestData }, { status: 200 });
}