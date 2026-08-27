
/* =============================================================================
 * PUT /api/purchases/vendors?id=<vendorId>
 * ============================================================================= */

import { getAuthenticatedUser } from "@/lib/auth/get-authenticated-user";
import { db } from "@/lib/db";
import { employees } from "@/lib/db/schema/profile-schema";

export async function PUT(request: NextRequest) {
    try {
        const authenticatedUser =
            await getAuthenticatedUser(request);

        if (!authenticatedUser) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Unauthorized",
                },
                { status: 401 },
            );
        }

        const employee =
            await db.query.employees.findFirst({
                where: eq(
                    employees.userId,
                    authenticatedUser.userId,
                ),
                columns: {
                    companyId: true,
                },
            });

        if (!employee) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Employee profile not found",
                },
                { status: 404 },
            );
        }

        const vendorId =
            request.nextUrl.searchParams.get("id");

        if (!vendorId) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Vendor ID is required",
                },
                { status: 400 },
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

        /*
         * Make sure the vendor belongs to
         * the authenticated user's company.
         */
        const existingVendor =
            await db.query.vendors.findFirst({
                where: and(
                    eq(vendors.id, vendorId),
                    eq(
                        vendors.companyId,
                        employee.companyId,
                    ),
                ),
            });

        if (!existingVendor) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Vendor not found",
                },
                { status: 404 },
            );
        }

        /*
         * If vendor code is being changed,
         * make sure it isn't already used.
         */
        if (
            vendorCode &&
            vendorCode.trim() !==
            existingVendor.vendorCode
        ) {
            const duplicate =
                await db.query.vendors.findFirst({
                    where: and(
                        eq(
                            vendors.companyId,
                            employee.companyId,
                        ),
                        eq(
                            vendors.vendorCode,
                            vendorCode.trim(),
                        ),
                    ),
                });

            if (duplicate) {
                return NextResponse.json(
                    {
                        success: false,
                        message:
                            "A vendor with this code already exists",
                    },
                    { status: 409 },
                );
            }
        }

        const [updatedVendor] =
            await db
                .update(vendors)
                .set({
                    ...(name !== undefined && {
                        name: name.trim(),
                    }),

                    ...(vendorCode !== undefined && {
                        vendorCode:
                            vendorCode.trim(),
                    }),

                    ...(email !== undefined && {
                        email:
                            email?.trim() || null,
                    }),

                    ...(phone !== undefined && {
                        phone:
                            phone?.trim() || null,
                    }),

                    ...(website !== undefined && {
                        website:
                            website?.trim() || null,
                    }),

                    ...(gstNumber !== undefined && {
                        gstNumber:
                            gstNumber?.trim() || null,
                    }),

                    ...(panNumber !== undefined && {
                        panNumber:
                            panNumber?.trim() || null,
                    }),

                    ...(billingAddress !== undefined && {
                        billingAddress:
                            billingAddress?.trim() ||
                            null,
                    }),

                    ...(shippingAddress !== undefined && {
                        shippingAddress:
                            shippingAddress?.trim() ||
                            null,
                    }),

                    ...(city !== undefined && {
                        city:
                            city?.trim() || null,
                    }),

                    ...(state !== undefined && {
                        state:
                            state?.trim() || null,
                    }),

                    ...(country !== undefined && {
                        country:
                            country?.trim() ||
                            "India",
                    }),

                    ...(postalCode !== undefined && {
                        postalCode:
                            postalCode?.trim() || null,
                    }),

                    ...(paymentTerms !== undefined && {
                        paymentTerms:
                            paymentTerms?.trim() ||
                            null,
                    }),

                    ...(notes !== undefined && {
                        notes:
                            notes?.trim() || null,
                    }),

                    ...(status !== undefined && {
                        status:
                            status === "inactive"
                                ? "inactive"
                                : "active",

                        isActive:
                            status !== "inactive",
                    }),

                    updatedAt: new Date(),
                })
                .where(
                    and(
                        eq(vendors.id, vendorId),
                        eq(
                            vendors.companyId,
                            employee.companyId,
                        ),
                    ),
                )
                .returning();

        return NextResponse.json({
            success: true,
            message: "Vendor updated successfully",
            data: updatedVendor,
        });
    } catch (error) {
        console.error(
            "PUT /api/purchases/vendors error:",
            error,
        );

        return NextResponse.json(
            {
                success: false,
                message: "Failed to update vendor",
            },
            { status: 500 },
        );
    }
}

/* =============================================================================
 * DELETE /api/purchases/vendors?id=<vendorId>
 * =============================================================================
 *
 * IMPORTANT:
 * We don't physically delete the vendor.
 *
 * Vendors can be referenced by purchase orders and
 * invoices, so hard deletion is dangerous.
 *
 * Instead we deactivate the vendor.
 *
 * ============================================================================= */

export async function DELETE(
    request: NextRequest,
) {
    try {
        const authenticatedUser =
            await getAuthenticatedUser();

        if (!authenticatedUser) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Unauthorized",
                },
                { status: 401 },
            );
        }

        const employee =
            await db.query.employees.findFirst({
                where: eq(
                    employees.userId,
                    authenticatedUser.id,
                ),
                columns: {
                    companyId: true,
                },
            });

        if (!employee) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Employee profile not found",
                },
                { status: 404 },
            );
        }

        const vendorId =
            request.nextUrl.searchParams.get("id");

        if (!vendorId) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Vendor ID is required",
                },
                { status: 400 },
            );
        }

        const [deletedVendor] =
            await db
                .update(vendors)
                .set({
                    status: "inactive",
                    isActive: false,
                    updatedAt: new Date(),
                })
                .where(
                    and(
                        eq(vendors.id, vendorId),
                        eq(
                            vendors.companyId,
                            employee.companyId,
                        ),
                    ),
                )
                .returning();

        if (!deletedVendor) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Vendor not found",
                },
                { status: 404 },
            );
        }

        return NextResponse.json({
            success: true,
            message: "Vendor deactivated successfully",
            data: deletedVendor,
        });
    } catch (error) {
        console.error(
            "DELETE /api/purchases/vendors error:",
            error,
        );

        return NextResponse.json(
            {
                success: false,
                message: "Failed to delete vendor",
            },
            { status: 500 },
        );
    }
}