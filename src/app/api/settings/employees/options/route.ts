import { successResponse } from "@/lib/utils/api-response";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
    return successResponse(
        "202"
    );
}