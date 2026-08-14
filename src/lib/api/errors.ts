import axios, { AxiosError } from "axios";

export class ApiError extends Error {
    status: number;
    code: string;
    details?: unknown;

    constructor(
        message: string,
        status = 500,
        code = "UNKNOWN_ERROR",
        details?: unknown,
    ) {
        super(message);
        this.name = "ApiError";
        this.status = status;
        this.code = code;
        this.details = details;
    }
}

export function parseApiError(error: unknown): ApiError {
    if (error instanceof ApiError) return error;

    if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<any>;

        return new ApiError(
            axiosError.response?.data?.message || axiosError.message,
            axiosError.response?.status || 500,
            axiosError.response?.data?.error?.code || "API_ERROR",
            axiosError.response?.data?.error?.details,
        );
    }

    if (error instanceof Error) {
        return new ApiError(error.message);
    }

    return new ApiError("Something went wrong");
}