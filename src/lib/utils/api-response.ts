import { NextResponse } from "next/server";

export function successResponse<T>(
    data: T,
    message = "Success",
    status = 200,
) {
    return NextResponse.json(
        {
            success: true,
            message,
            data,
        },
        { status },
    );
}

export function errorResponse(
    message: string,
    code: string,
    status = 400,
    details?: unknown,
) {
    return NextResponse.json(
        {
            success: false,
            message,
            error: {
                code,
                details,
            },
        },
        { status },
    );
}