# Warranty Module Integration

## What was Changed

1.  **Database / Prisma Schema**:
    *   Replaced the generic `itemId` and `item_type` on the `Warranty` model with specific, strict relational connections: `machineId` (Machine) and `sparePartId` (SparePart).
    *   Added a `purchaseDate` explicitly for Spare Part Warranties.
    *   Set `warrantyType` to properly delineate `MACHINE` vs `SPARE_PART`.

2.  **Warranty Page Rebuild (`Warranties.tsx`)**:
    *   Created a clean tabbed UI switching between **Machine Warranties** and **Spare Part Warranties**.
    *   Implemented search filters specific to active columns (Search by Part Name, Machine Name, ID, Code, Supplier).
    *   Added a dynamic **Status Filter** (All, Active, Expired, Upcoming).
    *   Built the **Add Warranty Modal** conditionally rendering inputs for Machines or Spare Parts. The supplier selection natively utilizes the Supplier database module.
    *   Built the **Warranty Details Modal** natively fetching and parsing supplier contact details.

3.  **Module Integrations**:
    *   **Machines**: Added a real-time `Warranty` column computing its `ACTIVE` or `EXPIRED` status directly from the warranty `start_date` and `end_date`. Also embedded it directly into the Machine Details modal.
    *   **Spare Parts**: Embedded a `Supplier / Warranty` column inside the inventory list so warehouse workers know the warranty coverage at a glance.
    *   **Dashboard**: Completely overhauled the stats grid to explicitly split Machine Warranty and Spare Part Warranty counts (Total, Active, Expired, Upcoming). Also injected a new widget: **Warranties Expiring Soon** (Next 30 days).

## Verification
*   **Warranties separation**: Machine Warranties show only machines; Spare Part Warranties show only parts.
*   **Stock / Database Data Intact**: Re-pushed Prisma schema; verified the app restarts successfully.
*   **Supplier relationships**: Tightly bound `Supplier` instances to the Warranty entries, avoiding duplicate string mapping.
