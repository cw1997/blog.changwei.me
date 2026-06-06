export const buildInfo = {
  commitSha: process.env.NEXT_PUBLIC_GIT_COMMIT_SHA ?? "dev",
  commitShaFull: process.env.NEXT_PUBLIC_GIT_COMMIT_SHA_FULL ?? "",
  commitDate: process.env.NEXT_PUBLIC_GIT_COMMIT_DATE ?? "",
  repoUrl: "https://github.com/cw1997/blog.changwei.me",
};
