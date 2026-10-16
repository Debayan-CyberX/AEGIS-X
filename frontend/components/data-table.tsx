"use client";
import { useMemo, useState } from "react";
import {
  ArrowUpRight,
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
export type Column<T> = {
  key: string;
  label: string;
  value: (row: T) => string | number;
  render?: (row: T) => React.ReactNode;
};
export default function DataTable<T extends { id: number }>({
  rows,
  columns,
  label,
  onOpen,
  details,
  empty,
}: {
  rows: T[];
  columns: Column<T>[];
  label: string;
  onOpen?: (row: T) => void;
  details?: (row: T) => React.ReactNode;
  empty?: React.ReactNode;
}) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("");
  const [sort, setSort] = useState({ key: "", asc: true });
  const [page, setPage] = useState(0);
  const [expanded, setExpanded] = useState<number | null>(null);
  const statusColumn = columns.find((c) =>
    ["severity", "outcome", "status"].includes(c.key),
  );
  const values = statusColumn
    ? Array.from(new Set(rows.map((r) => String(statusColumn.value(r)))))
    : [];
  const matches = useMemo(() => {
    const items = rows.filter(
      (row) =>
        (!search ||
          columns.some((c) =>
            String(c.value(row)).toLowerCase().includes(search.toLowerCase()),
          )) &&
        (!filter ||
          !statusColumn ||
          String(statusColumn.value(row)) === filter),
    );
    const col = columns.find((c) => c.key === sort.key);
    return col
      ? items.sort((a, b) => {
          const x = col.value(a),
            y = col.value(b);
          return (
            (typeof x === "number" && typeof y === "number"
              ? x - y
              : String(x).localeCompare(String(y))) * (sort.asc ? 1 : -1)
          );
        })
      : items;
  }, [rows, columns, search, filter, statusColumn, sort]);
  const size = 10;
  const current = Math.min(
    page,
    Math.max(0, Math.ceil(matches.length / size) - 1),
  );
  const start = current * size;
  return (
    <div className="data-table">
      <div className="table-tools">
        <label className="table-search">
          <Search size={14} aria-hidden="true" />
          <input
            aria-label={`Search ${label}`}
            placeholder={`Search ${label.toLowerCase()}…`}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
          />
        </label>
        {statusColumn && (
          <select
            aria-label={`Filter ${label} by ${statusColumn.label}`}
            value={filter}
            onChange={(e) => {
              setFilter(e.target.value);
              setPage(0);
            }}
          >
            <option value="">All {statusColumn.label.toLowerCase()}</option>
            {values.map((value) => (
              <option key={value}>{value}</option>
            ))}
          </select>
        )}
        <span className="table-count">{matches.length} RECORDS</span>
      </div>
      <div className="table-scroll">
        <table>
          <caption className="sr-only">{label}</caption>
          <thead>
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  aria-sort={
                    sort.key === col.key
                      ? sort.asc
                        ? "ascending"
                        : "descending"
                      : "none"
                  }
                >
                  <button
                    onClick={() =>
                      setSort({
                        key: col.key,
                        asc: sort.key === col.key ? !sort.asc : true,
                      })
                    }
                  >
                    {col.label}
                    <span aria-hidden="true">
                      {sort.key === col.key ? (
                        sort.asc ? (
                          <ArrowUp size={11} />
                        ) : (
                          <ArrowDown size={11} />
                        )
                      ) : (
                        <ArrowUpDown size={11} />
                      )}
                    </span>
                  </button>
                </th>
              ))}
              {(details || onOpen) && (
                <th>
                  <span className="sr-only">Details</span>
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {matches.slice(start, start + size).map((row) => (
              <TableRow
                key={row.id}
                row={row}
                columns={columns}
                onOpen={onOpen}
                details={details}
                expanded={expanded === row.id}
                toggle={() => setExpanded(expanded === row.id ? null : row.id)}
              />
            ))}
          </tbody>
        </table>
        {!matches.length &&
          (rows.length ? (
            <div className="table-no-results">
              No matching records.{" "}
              <button
                onClick={() => {
                  setSearch("");
                  setFilter("");
                }}
              >
                Clear filters
              </button>
            </div>
          ) : (
            empty
          ))}
      </div>
      <div className="table-pagination">
        <span>
          {matches.length
            ? `${start + 1}–${Math.min(start + size, matches.length)}`
            : "0"}{" "}
          OF {matches.length}
        </span>
        <div>
          <button
            disabled={current === 0}
            onClick={() => setPage(current - 1)}
            aria-label={`Previous ${label} page`}
          >
            ←
          </button>
          <span>
            {current + 1} / {Math.max(1, Math.ceil(matches.length / size))}
          </span>
          <button
            disabled={start + size >= matches.length}
            onClick={() => setPage(current + 1)}
            aria-label={`Next ${label} page`}
          >
            →
          </button>
        </div>
      </div>
    </div>
  );
}
function TableRow<T extends { id: number }>({
  row,
  columns,
  onOpen,
  details,
  expanded,
  toggle,
}: {
  row: T;
  columns: Column<T>[];
  onOpen?: (row: T) => void;
  details?: (row: T) => React.ReactNode;
  expanded: boolean;
  toggle: () => void;
}) {
  return (
    <>
      <tr>
        {columns.map((col, i) => (
          <td key={col.key}>
            {i === 0 && onOpen ? (
              <button className="table-link" onClick={() => onOpen(row)}>
                {col.render ? col.render(row) : col.value(row)}
              </button>
            ) : col.render ? (
              col.render(row)
            ) : (
              col.value(row)
            )}
          </td>
        ))}
        {(details || onOpen) && (
          <td>
            <button
              className="row-open"
              aria-label={
                details
                  ? `${expanded ? "Collapse" : "Expand"} record ${row.id}`
                  : `Open record ${row.id}`
              }
              aria-expanded={details ? expanded : undefined}
              onClick={() => (details ? toggle() : onOpen?.(row))}
            >
              {details ? (
                expanded ? (
                  "−"
                ) : (
                  "＋"
                )
              ) : (
                <ArrowUpRight size={16} aria-hidden="true" />
              )}
            </button>
          </td>
        )}
      </tr>
      {details && expanded && (
        <tr className="expanded-row">
          <td colSpan={columns.length + 1}>{details(row)}</td>
        </tr>
      )}
    </>
  );
}
