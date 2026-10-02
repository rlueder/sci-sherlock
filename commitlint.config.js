// Commit messages follow Conventional Commits (AGENTS.md); the commit-msg hook and CI check them.
export default {
  extends: ["@commitlint/config-conventional"],
  rules: {
    // Scopes are optional; when used, they name a part of the repo.
    "scope-enum": [2, "always", ["game", "rooms", "art", "music", "docs", "ci", "deps"]],
    "body-max-line-length": [1, "always", 100],
    // Subjects often start with a name: Holmes, Watson, YAML.
    "subject-case": [0],
  },
};
