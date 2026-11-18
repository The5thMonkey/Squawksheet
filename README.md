# WinterSquawks Stats

The team's single source of truth: one data file (`data/squawks.json`) and a small website that calculates every stat from it. There's no server, no database, no Google Sheets and no outside libraries. It runs free on GitHub Pages, and you control who can change it.

```
index.html            the public site
admin.html            stats entry (not linked from the site; only The5thMonkey and mkinz006 can publish)
data/squawks.json     ALL the data: players, seasons, rosters, games, goals, video links, awards, stories
js/core.js            all stat math + the data checks (shared by site, entry page and GitHub check)
js/app.js, css/       the site
img/players/          player photos + the two default silhouettes
tools/validate.mjs    the check that runs on every change
.github/              the automatic check + CODEOWNERS (who must approve)
```

## One-time setup (about 10 minutes)

1. **Create the repository.** On github.com, click **New repository**, name it e.g. `squawks-stats`, and make it **Public** (free GitHub Pages needs a public repo). Upload every file and folder in this package, including the hidden `.github` folder and `.nojekyll`. Tip: drag the folder contents into "uploading an existing file".
2. **Turn on the website.** Go to **Settings → Pages → Build and deployment**, set Source to *Deploy from a branch*, Branch to `main`, folder to `/ (root)`, then **Save**. After a minute it's live at `https://YOUR-USERNAME.github.io/squawks-stats/`.
3. **Put yourself in control.**
   - Edit `.github/CODEOWNERS` and replace `YOUR-GITHUB-USERNAME` with your username.
   - **Settings → Branches → Add branch ruleset** (or *Add rule*) for `main`:
     - ✅ Require a pull request before merging, with **1 approval** and **Require review from Code Owners**
     - ✅ Require status checks to pass, then pick **validate** (it appears after the check has run once)
     - ✅ Block force pushes
     - Leave "Do not allow bypassing" off if you want to be able to publish your own edits directly.
   - **Settings → Collaborators**: add the people who should be able to *propose* changes. Anyone else can still suggest changes from a fork, but nothing goes live without your approval.
4. (Optional) **Custom domain:** Settings → Pages → Custom domain.

## Entering a game

1. Open `admin.html` on the live site by adding it to the address, e.g. `https://YOUR-USERNAME.github.io/squawksheet/admin.html`. It isn't linked from the site.
2. On the **Game** tab, the next scheduled game is already picked. Set it to *Final*, enter the score, tick who played, then add each goal with its scorer, assists and optional video link, plus the three stars, any penalties, and any empty-net goals against (those don't count against the goalie).
3. Click **Save game**. It checks the entry: scorers must be in the lineup, the goal count must match the score, nobody can assist their own goal, and so on.
4. On the **Save & publish** tab, click **Download squawks.json**, then upload it into the repo's `data/` folder as a pull request (the steps are on that page). Approve and merge it, and the site updates.

Your work is kept in the browser until you publish or discard it, so closing the tab is safe.

**New season:** go to Season & roster → **Start next season**. It copies the roster. Then paste in the schedule, one game per line: `2027-01-08 20:40 Puck Norris`.

## Player photos

Put photos in `img/players/`, named with the player's id (it's shown on the entry page's Players tab):
`nick-berry.jpg` for the main photo, and `nick-berry-alt.jpg` for an alternate. Square images around 300–600 px work best.
Then list them in the player's **Photos** box on the Players tab, main photo first. If a player has more than one photo, one is picked at random each time his page opens. Players without a photo get the default silhouette (a goalie mask for goalies).

## Previewing locally

Browsers won't load the data straight from disk, so serve the folder:

```
python3 -m http.server 8000     # then open http://localhost:8000
node tools/validate.mjs         # run the same check GitHub runs
```

## How the data is organised

* **players**: one per person, with a permanent `id` (e.g. `sei-harris`). Renaming someone never breaks history.
* **seasons**: name, roster (number, position, notes like `C` or `LTIR - Ankle`), result, trophies, story lines with links, the standings snapshot and league leaders.
  * Seasons before F24 (`tracking: "season-totals"`) hold each player's season totals. They were scraped by hand from the old league site and can't be checked.
* **games** (F24 →): date, opponent, score, result, OT/SO, playoff flags, lineup, goalie, shots, three stars, penalties, and **goals** with `scorer`, `a1`, `a2` and `video`.
  Games from the old sheet keep their assists in `assists_unpaired`, because the old grid never said which goal an assist belonged to. New games pair them on each goal.
* **legacy**: the old hand-kept all-time head-to-head table and the data-anomaly notes.
* **livebarn**: the team's LiveBarn login and rink codes.
* **issues**: every fix and decision made during the migration, with the cell it came from (shown on the About the Data page).
* **team_colors**: each team's background and text color, taken from the SquawkSheet's conditional formatting. Add a line here when a new team joins the division.

Rules applied: wins are worth 2 points and ties/OTL 1, in every season. Three stars are worth 4/2/1 (F24 had a single star, worth 4). Where the two old spreadsheets disagreed for F24+, the season-tab game log was kept.
