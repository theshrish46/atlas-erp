import { eq, and, sql } from "drizzle-orm";

import { documentCounters } from "@/lib/db/schema/document-counter-schema";

export type DocumentType =
    | "vendor"
    | "purchase_order"
    | "goods_received_note"
    | "purchase_invoice"
    | "purchase_payment"
    | "customer"
    | "quotation"
    | "sales_order"
    | "sales_invoice"
    | "sales_payment"
    | "inventory_adjustment";

export async function getNextDocumentNumber(
    tx: any,
    companyId: string,
    documentType: DocumentType,
): Promise<number> {
    const [counter] = await tx
        .update(documentCounters)
        .set({
            currentValue: sql`${documentCounters.currentValue} + 1`,
            updatedAt: new Date(),
        })
        .where(
            and(
                eq(documentCounters.companyId, companyId),
                eq(documentCounters.documentType, documentType),
            ),
        )
        .returning({
            currentValue: documentCounters.currentValue,
        });

    if (!counter) {
        throw new Error(
            `Document counter not found for company ${companyId} and type ${documentType}`,
        );
    }

    return counter.currentValue;
}