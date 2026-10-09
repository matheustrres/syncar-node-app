"use client";

import styles from "./DataTableSkeleton.module.css";

export type DataTableSkeletonColumn = {
  key: string;
  label?: string;
  variant?: "text" | "primary" | "secondary" | "status" | "amount" | "actions" | "icon-actions";
  supportingLine?: boolean;
};

interface DataTableSkeletonProps {
  columns: number | DataTableSkeletonColumn[];
  rows?: number;
  label?: string;
  className?: string;
  tableClassName?: string;
}

const numericColumns = (count: number): DataTableSkeletonColumn[] => [
  ...Array.from({ length: count }, (_, index) => ({ key: `column-${index}` })),
  { key: "actions", variant: "icon-actions" },
];

export default function DataTableSkeleton({
  columns,
  rows = 5,
  label = "Carregando registros",
  className,
  tableClassName,
}: DataTableSkeletonProps) {
  const columnList = typeof columns === "number" ? numericColumns(columns) : columns;

  return (
    <div className={`${styles.container}${className ? ` ${className}` : ""}`} role="status" aria-label={label}>
      <span className={styles.srOnly}>{label}</span>
      <table className={`${styles.table}${tableClassName ? ` ${tableClassName}` : ""}`} aria-hidden="true">
        <thead>
          <tr>
            {columnList.map((column) => (
              <th scope="col" key={column.key}>
                <span className={styles.heading} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }, (_, row) => (
            <tr key={row}>
              {columnList.map((column) => {
                const variant = column.variant ?? "text";
                return (
                  <td key={column.key} data-label={column.label}>
                    {variant === "actions" ? (
                      <span className={`${styles.line} ${styles.action}`} />
                    ) : variant === "icon-actions" ? (
                      <span className={styles.iconActions}>
                        <span className={styles.iconAction} />
                        <span className={styles.iconAction} />
                      </span>
                    ) : (
                      <>
                        <span className={`${styles.line} ${variant === "text" ? "" : styles[variant]}`} />
                        {column.supportingLine && <span className={`${styles.line} ${styles.supporting}`} />}
                      </>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
