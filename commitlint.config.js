/** @type {import('@commitlint/types').UserConfig} */
module.exports = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    // AGENTS.md 기준 허용 타입
    "type-enum": [
      2,
      "always",
      ["feat", "fix", "docs", "style", "refactor", "chore"],
    ],
    "subject-case": [0], // 한글 커밋 메시지 허용
  },
};
