"""
plot_links.py
-------------
Query the links table and produce a bar chart PNG showing how many links
were created per month over the past 12 months.

Usage:
    python plot_links.py [--output <path>]

Environment:
    DATABASE_URL must be set in the .env file located in the current working
    directory, e.g.:
        DATABASE_URL=postgresql://user:pass@host:5432/dbname
"""

import argparse
import os
import sys
from datetime import date, timedelta
from calendar import month_abbr
from pathlib import Path

# ---------------------------------------------------------------------------
# Optional dependency bootstrap — give a helpful message if anything is missing
# ---------------------------------------------------------------------------
_missing = []
try:
    import psycopg2
except ImportError:
    _missing.append("psycopg2-binary")
try:
    import matplotlib
    matplotlib.use("Agg")  # non-interactive backend, works without a display
    import matplotlib.pyplot as plt
    import matplotlib.ticker as mticker
except ImportError:
    _missing.append("matplotlib")
try:
    from dotenv import load_dotenv
except ImportError:
    _missing.append("python-dotenv")

if _missing:
    print(
        "ERROR: Missing required Python packages.\n"
        f"Install them with:  pip install {' '.join(_missing)}",
        file=sys.stderr,
    )
    sys.exit(1)


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def load_database_url() -> str:
    """Load DATABASE_URL from .env in the current working directory."""
    env_path = Path.cwd() / ".env"
    if env_path.exists():
        load_dotenv(dotenv_path=env_path, override=False)
    db_url = os.environ.get("DATABASE_URL")
    if not db_url:
        print(
            "ERROR: DATABASE_URL is not set.\n"
            "Make sure .env exists in the current directory and contains:\n"
            "  DATABASE_URL=postgresql://user:pass@host:5432/dbname",
            file=sys.stderr,
        )
        sys.exit(1)
    return db_url


def build_month_range(today: date) -> list[tuple[int, int]]:
    """Return a list of (year, month) tuples for the 12-month window ending today.

    Example: if today is 2026-03-31, returns
      [(2025, 4), (2025, 5), ..., (2026, 3)]
    """
    months = []
    # Start from 11 months ago (so we get 12 months total including the current one)
    year, month = today.year, today.month
    for _ in range(12):
        months.append((year, month))
        month -= 1
        if month == 0:
            month = 12
            year -= 1
    months.reverse()
    return months


def query_counts(db_url: str, months: list[tuple[int, int]]) -> dict[tuple[int, int], int]:
    """Return a mapping of (year, month) -> count from the links table."""
    first_year, first_month = months[0]
    window_start = date(first_year, first_month, 1)

    # Upper bound: first day of the month *after* the last month in the window
    last_year, last_month = months[-1]
    if last_month == 12:
        window_end = date(last_year + 1, 1, 1)
    else:
        window_end = date(last_year, last_month + 1, 1)

    sql = """
        SELECT
            EXTRACT(YEAR  FROM created_at)::int AS yr,
            EXTRACT(MONTH FROM created_at)::int AS mo,
            COUNT(*)                             AS cnt
        FROM links
        WHERE created_at >= %(start)s
          AND created_at <  %(end)s
        GROUP BY yr, mo
        ORDER BY yr, mo
    """

    conn = psycopg2.connect(db_url)
    try:
        with conn.cursor() as cur:
            cur.execute(sql, {"start": window_start, "end": window_end})
            rows = cur.fetchall()
    finally:
        conn.close()

    return {(row[0], row[1]): row[2] for row in rows}


def make_chart(
    months: list[tuple[int, int]],
    counts: dict[tuple[int, int], int],
    output_path: Path,
) -> None:
    """Render and save the bar chart."""
    labels = [f"{month_abbr[m]} {y}" for y, m in months]
    values = [counts.get((y, m), 0) for y, m in months]

    fig, ax = plt.subplots(figsize=(14, 6))
    bars = ax.bar(labels, values, color="#4f86c6", edgecolor="#2c5f8a", linewidth=0.8)

    # Value labels above each bar
    for bar, val in zip(bars, values):
        if val > 0:
            ax.text(
                bar.get_x() + bar.get_width() / 2.0,
                bar.get_height() + max(values) * 0.01,
                str(val),
                ha="center",
                va="bottom",
                fontsize=9,
                fontweight="bold",
            )

    ax.set_xlabel("Month", fontsize=12, labelpad=8)
    ax.set_ylabel("Links Created", fontsize=12, labelpad=8)
    ax.set_title("Links Created per Month (Past 12 Months)", fontsize=14, fontweight="bold", pad=14)
    ax.yaxis.set_major_locator(mticker.MaxNLocator(integer=True))
    ax.set_ylim(bottom=0, top=max(values) * 1.15 if any(v > 0 for v in values) else 10)
    ax.tick_params(axis="x", rotation=45)
    ax.grid(axis="y", linestyle="--", alpha=0.5)

    plt.tight_layout()
    output_path.parent.mkdir(parents=True, exist_ok=True)
    fig.savefig(output_path, dpi=150)
    plt.close(fig)


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------

def main() -> None:
    parser = argparse.ArgumentParser(
        description="Plot monthly link-creation counts as a bar chart PNG."
    )
    parser.add_argument(
        "--output",
        default="links_per_month.png",
        help="Destination path for the PNG file (default: links_per_month.png)",
    )
    args = parser.parse_args()
    output_path = Path(args.output)

    db_url = load_database_url()
    today = date.today()
    months = build_month_range(today)
    counts = query_counts(db_url, months)
    make_chart(months, counts, output_path)

    print(f"Chart saved to: {output_path.resolve()}")


if __name__ == "__main__":
    main()
