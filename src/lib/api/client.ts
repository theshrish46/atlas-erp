import { api } from "./axios";
import { parseApiError } from "./errors";
import type { ApiResponse } from "@/lib/types/api";

export async function apiGet<T>(url: string): Promise<T> {
    try {
        const response = await api.get<ApiResponse<T>>(url);

        if (!response.data.success) {
            throw parseApiError(response.data);
        }

        return response.data.data;
    } catch (error) {
        throw parseApiError(error);
    }
}

export async function apiPost<T, B = unknown>(
    url: string,
    body: B,
): Promise<T> {
    try {
        const response = await api.post<ApiResponse<T>>(url, body);

        if (!response.data.success) {
            throw parseApiError(response.data);
        }

        return response.data.data;
    } catch (error) {
        throw parseApiError(error);
    }
}

export async function apiPut<T, B = unknown>(
    url: string,
    body: B,
): Promise<T> {
    try {
        const response = await api.put<ApiResponse<T>>(url, body);

        if (!response.data.success) {
            throw parseApiError(response.data);
        }

        return response.data.data;
    } catch (error) {
        throw parseApiError(error);
    }
}

export async function apiDelete<T>(url: string): Promise<T> {
    try {
        const response = await api.delete<ApiResponse<T>>(url);

        if (!response.data.success) {
            throw parseApiError(response.data);
        }

        return response.data.data;
    } catch (error) {
        throw parseApiError(error);
    }
}