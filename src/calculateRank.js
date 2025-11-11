/**
 * Calculates the exponential cdf.
 *
 * @param {number} x The value.
 * @returns {number} The exponential cdf.
 */
function exponential_cdf(x) {
  return 1 - 2 ** -x;
}

/**
 * Calculates the log normal cdf.
 *
 * @param {number} x The value.
 * @returns {number} The log normal cdf.
 */
function log_normal_cdf(x) {
  // approximation
  return x / (1 + x);
}

/**
 * Calculates the users rank.
 *
 * @param {object} params Parameters on which the user's rank depends.
 * @param {boolean} params.all_commits Whether `include_all_commits` was used.
 * @param {number} params.commits Number of commits.
 * @param {number} params.prs The number of pull requests.
 * @param {number} params.issues The number of issues.
 * @param {number} params.reviews The number of reviews.
 * @param {number} params.repos Total number of repos.
 * @param {number} params.stars The number of stars.
 * @param {number} params.followers The number of followers.
 * @returns {{ level: string, percentile: number }} The users rank.
 */
function calculateRank({
  all_commits,
  commits,
  prs,
  issues,
  reviews,
  repos,
  stars,
  followers,
}) {
  // 🧮 Adjusted medians and weights for a natural but generous ranking
  const COMMITS_MEDIAN = all_commits ? 600 : 200,
        COMMITS_WEIGHT = 3;
  const PRS_MEDIAN = 40,
        PRS_WEIGHT = 3;
  const ISSUES_MEDIAN = 20,
        ISSUES_WEIGHT = 1;
  const REVIEWS_MEDIAN = 2,
        REVIEWS_WEIGHT = 1;
  const FOLLOWERS_MEDIAN = 8,
        FOLLOWERS_WEIGHT = 1;
  const STARS_WEIGHT = 0; // ⭐ stars ignored completely

  const TOTAL_WEIGHT =
    COMMITS_WEIGHT +
    PRS_WEIGHT +
    ISSUES_WEIGHT +
    REVIEWS_WEIGHT +
    FOLLOWERS_WEIGHT; // stars excluded

  const THRESHOLDS = [1, 12.5, 25, 37.5, 50, 62.5, 75, 87.5, 100];
  const LEVELS = ["S", "A+", "A", "A-", "B+", "B", "B-", "C+", "C"];

  // 📈 Calculate weighted rank (stars skipped)
  const rank =
    1 -
    (COMMITS_WEIGHT * (1 - 2 ** -(commits / COMMITS_MEDIAN)) +
      PRS_WEIGHT * (1 - 2 ** -(prs / PRS_MEDIAN)) +
      ISSUES_WEIGHT * (1 - 2 ** -(issues / ISSUES_MEDIAN)) +
      REVIEWS_WEIGHT * (1 - 2 ** -(reviews / REVIEWS_MEDIAN)) +
      FOLLOWERS_WEIGHT * (followers / (followers + FOLLOWERS_MEDIAN))) /
      TOTAL_WEIGHT;

  let percentile = rank * 100;

  // 🚫 Never drop below A-
  if (percentile > 37.5) percentile = 37.5;

  const level = LEVELS[THRESHOLDS.findIndex((t) => percentile <= t)];

  return { level, percentile };
}

export { calculateRank };
export default calculateRank;
