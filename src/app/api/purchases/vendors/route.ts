import { NextRequest } from "next/server";

import { and, desc, eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { vendors } from "@/lib/db/schema/purchases-schema";
import { employees } from "@/lib/db/schema/profile-schema";
import { getAuthenticatedUser } from "@/lib/auth/get-authenticated-user";
import {
    errorResponse,
    successResponse,
} from "@/lib/utils/api-response";

export async function GET(request: NextRequest) {
    try {
        const authenticatedUser =
            await getAuthenticatedUser(request);

        if (!authenticatedUser) {
            return errorResponse(
                "Unauthorized",
                "UNAUTHORIZED",
                401
            );
        }

        const employee = await db.query.employees.findFirst({
            where: eq(
                employees.userId,
                authenticatedUser.userId
            ),
            columns: {
                id: true,
                companyId: true,
            },
        });

        if (!employee) {
            return errorResponse(
                "Employee profile not found",
                "EMPLOYEE_NOT_FOUND",
                404
            );
        }

        const searchParams = request.nextUrl.searchParams;

        const search =
            searchParams.get("search")?.trim().toLowerCase();

        const status = searchParams.get("status");

        const conditions = [
            eq(vendors.companyId, employee.companyId),
        ];

        if (
            status === "active" ||
            status === "inactive"
        ) {
            conditions.push(
                eq(vendors.status, status)
            );
        }

        const result = await db
            .select()
            .from(vendors)
            .where(and(...conditions))
            .orderBy(desc(vendors.createdAt));

        const filteredResult = search
            ? result.filter((vendor) => {
                return (
                    vendor.name
                        .toLowerCase()
                        .includes(search) ||
                    vendor.vendorCode
                        .toLowerCase()
                        .includes(search) ||
                    vendor.email
                        ?.toLowerCase()
                        .includes(search) ||
                    vendor.phone
                        ?.toLowerCase()
                        .includes(search) ||
                    vendor.city
                        ?.toLowerCase()
                        .includes(search) ||
                    vendor.country
                        ?.toLowerCase()
                        .includes(search)
                );
            })
            : result;

        return successResponse(
            {
                vendors: filteredResult,
            },
            "Vendors fetched successfully",
            200
        );
    } catch (error) {
        console.error(
            "GET /api/purchases/vendors error:",
            error
        );

        return errorResponse(
            "Failed to fetch vendors",
            "VENDORS_FETCH_FAILED",
            500
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const authenticatedUser =
            await getAuthenticatedUser(request);

        if (!authenticatedUser) {
            return errorResponse(
                "Unauthorized",
                "UNAUTHORIZED",
                401
            );
        }

        const employee = await db.query.employees.findFirst({
            where: eq(
                employees.userId,
                authenticatedUser.userId
            ),
            columns: {
                companyId: true,
            },
        });

        if (!employee) {
            return errorResponse(
                "Employee profile not found",
                "EMPLOYEE_NOT_FOUND",
                404
            );
        }

        const body = await request.json();

        const {
            name,
            vendorCode,
            email,
            phone,
            website,
            gstNumber,
            panNumber,
            billingAddress,
            shippingAddress,
            city,
            state,
            country,
            postalCode,
            paymentTerms,
            notes,
            status,
        } = body;

        if (!name?.trim()) {
            return errorResponse(
                "Vendor name is required",
                "VENDOR_NAME_REQUIRED",
                400
            );
        }

        if (!vendorCode?.trim()) {
            return errorResponse(
                "Vendor code is required",
                "VENDOR_CODE_REQUIRED",
                400
            );
        }

        const normalizedVendorCode =
            vendorCode.trim();

        const existingVendor =
            await db.query.vendors.findFirst({
                where: and(
                    eq(
                        vendors.companyId,
                        employee.companyId
                    ),
                    eq(
                        vendors.vendorCode,
                        normalizedVendorCode
                    )
                ),
                columns: {
                    id: true,
                },
            });

        if (existingVendor) {
            return errorResponse(
                "A vendor with this code already exists",
                "VENDOR_CODE_ALREADY_EXISTS",
                409
            );
        }

        const [vendor] = await db
            .insert(vendors)
            .values({
                companyId: employee.companyId,

                name: name.trim(),

                vendorCode: normalizedVendorCode,

                email: email?.trim() || null,

                phone: phone?.trim() || null,

                website: website?.trim() || null,

                gstNumber:
                    gstNumber?.trim() || null,

                panNumber:
                    panNumber?.trim() || null,

                billingAddress:
                    billingAddress?.trim() || null,

                shippingAddress:
                    shippingAddress?.trim() || null,

                city:
                    city?.trim() || null,

                state:
                    state?.trim() || null,

                country:
                    country?.trim() || "India",

                postalCode:
                    postalCode?.trim() || null,

                paymentTerms:
                    paymentTerms?.trim() || null,

                notes:
                    notes?.trim() || null,

                status:
                    status === "inactive"
                        ? "inactive"
                        : "active",

                isActive:
                    status !== "inactive",
            })
            .returning();

        if (!vendor) {
            return errorResponse(
                "Failed to create vendor",
                "VENDOR_CREATION_FAILED",
                500
            );
        }

        return successResponse(
            {
                vendor,
            },
            "Vendor created successfully",
            201
        );
    } catch (error) {
        console.error(
            "POST /api/purchases/vendors error:",
            error
        );

        return errorResponse(
            "Failed to create vendor",
            "VENDOR_CREATION_FAILED",
            500
        );
    }
}