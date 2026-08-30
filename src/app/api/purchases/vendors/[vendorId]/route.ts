import { NextRequest } from "next/server";

import { and, eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { vendors } from "@/lib/db/schema/purchases-schema";
import { employees } from "@/lib/db/schema/profile-schema";
import { getAuthenticatedUser } from "@/lib/auth/get-authenticated-user";
import {
    errorResponse,
    successResponse,
} from "@/lib/utils/api-response";

type RouteContext = {
    params: Promise<{
        vendorId: string;
    }>;
};

export async function PUT(
    request: NextRequest,
    { params }: RouteContext
) {
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

        const { vendorId } = await params;

        if (!vendorId) {
            return errorResponse(
                "Vendor ID is required",
                "VENDOR_ID_REQUIRED",
                400
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

        const existingVendor =
            await db.query.vendors.findFirst({
                where: and(
                    eq(vendors.id, vendorId),
                    eq(
                        vendors.companyId,
                        employee.companyId
                    )
                ),
            });

        if (!existingVendor) {
            return errorResponse(
                "Vendor not found",
                "VENDOR_NOT_FOUND",
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

        const duplicateVendor =
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

        if (
            duplicateVendor &&
            duplicateVendor.id !== vendorId
        ) {
            return errorResponse(
                "A vendor with this code already exists",
                "VENDOR_CODE_ALREADY_EXISTS",
                409
            );
        }

        const [updatedVendor] = await db
            .update(vendors)
            .set({
                name: name.trim(),

                vendorCode:
                    normalizedVendorCode,

                email:
                    email?.trim() || null,

                phone:
                    phone?.trim() || null,

                website:
                    website?.trim() || null,

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

                updatedAt: new Date(),
            })
            .where(
                and(
                    eq(vendors.id, vendorId),
                    eq(
                        vendors.companyId,
                        employee.companyId
                    )
                )
            )
            .returning();

        if (!updatedVendor) {
            return errorResponse(
                "Failed to update vendor",
                "VENDOR_UPDATE_FAILED",
                500
            );
        }

        return successResponse(
            {
                vendor: updatedVendor,
            },
            "Vendor updated successfully",
            200
        );
    } catch (error) {
        console.error(
            "PUT /api/purchases/vendors/[vendorId] error:",
            error
        );

        return errorResponse(
            "Failed to update vendor",
            "VENDOR_UPDATE_FAILED",
            500
        );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: RouteContext
) {
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

        const { vendorId } = await params;

        if (!vendorId) {
            return errorResponse(
                "Vendor ID is required",
                "VENDOR_ID_REQUIRED",
                400
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

        const existingVendor =
            await db.query.vendors.findFirst({
                where: and(
                    eq(vendors.id, vendorId),
                    eq(
                        vendors.companyId,
                        employee.companyId
                    )
                ),
                columns: {
                    id: true,
                },
            });

        if (!existingVendor) {
            return errorResponse(
                "Vendor not found",
                "VENDOR_NOT_FOUND",
                404
            );
        }

        const [deletedVendor] = await db
            .delete(vendors)
            .where(
                and(
                    eq(vendors.id, vendorId),
                    eq(
                        vendors.companyId,
                        employee.companyId
                    )
                )
            )
            .returning({
                id: vendors.id,
            });

        if (!deletedVendor) {
            return errorResponse(
                "Failed to delete vendor",
                "VENDOR_DELETE_FAILED",
                500
            );
        }

        return successResponse(
            {
                vendorId: deletedVendor.id,
            },
            "Vendor deleted successfully",
            200
        );
    } catch (error) {
        console.error(
            "DELETE /api/purchases/vendors/[vendorId] error:",
            error
        );

        return errorResponse(
            "Failed to delete vendor",
            "VENDOR_DELETE_FAILED",
            500
        );
    }
}