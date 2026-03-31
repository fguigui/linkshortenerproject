---
name: links-monthly-chart
description: >
  Generates a bar chart PNG showing the number of links created per month over
  the past 12 months from the project's PostgreSQL database. Use this skill
  whenever the user asks to visualize link creation trends, see a monthly
  breakdown of links, plot link statistics, generate a chart from the database,
  or wants any kind of "how many links were created" report or graph. Trigger
  even if the user just says "show me a chart of links" or "link stats this year"
  or "how active has the link shortener been".
---

# Links Monthly Chart

This skill queries the project's PostgreSQL database (using `DATABASE_URL` from
the `.env` file) and produces a bar chart PNG showing how many short-links were
created each month for the past 12 months.

## How to use this skill

Run the bundled script `scripts/plot_links.py` from the project root
(the directory that contains the `.env` file and `db/` folder).

### Prerequisites

Make sure the Python dependencies are available:

```bash
pip install psycopg2-binary python-dotenv matplotlib
```

### Running the script

```bash
python .agents/skills/links-monthly-chart/scripts/plot_links.py
```

By default the PNG is saved to `links_per_month.png` in the current working
directory. Pass `--output <path>` to change the destination:

```bash
python .agents/skills/links-monthly-chart/scripts/plot_links.py --output reports/links_chart.png
```

## What the script does

1. Reads `DATABASE_URL` from the `.env` file in the current working directory.
2. Opens a connection to the PostgreSQL database.
3. Runs a single SQL query that counts rows in the `links` table grouped by
   calendar month, restricted to the last 12 complete months plus the current
   partial month (i.e. the 12-month window ending today).
4. Fills in any months with zero links so the x-axis is always complete.
5. Renders a bar chart with:
   - **X axis** — month labels (`Jan 2025`, `Feb 2025`, …)
   - **Y axis** — integer count of links created that month
   - A value label above each bar for quick reading
6. Saves the figure as a PNG and prints the output path.

## Troubleshooting

| Problem | Fix |
|---|---|
| `DATABASE_URL not set` | Make sure `.env` exists and contains `DATABASE_URL=postgres://...` |
| `psycopg2` import error | Run `pip install psycopg2-binary` |
| `matplotlib` import error | Run `pip install matplotlib` |
| No data / empty chart | The `links` table may be empty; the chart will still render with zero bars |
