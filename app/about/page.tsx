export const metadata = { title: "About" };

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <div className="prose-tech">
        <h1>About PixelTech</h1>
        <p>
          PixelTech is a computer technology blog and community for working engineers. It
          exists for one reason: most technical writing on the internet is either surface
          level or sales copy. We publish the long-form, honest, engineering-first writing
          we wish we had when we were learning.
        </p>
        <h2>What we write about</h2>
        <ul>
          <li>Web platform engineering (React, Next.js, browsers)</li>
          <li>Backend and databases (Postgres, distributed systems)</li>
          <li>AI and ML in production</li>
          <li>Security and the realities of shipping it</li>
          <li>Career, code craft, and the human side of engineering</li>
        </ul>
        <h2>Who writes here</h2>
        <p>
          Anyone with an account can publish. Our authors are practitioners — the
          editorial bar is &ldquo;would I read this twice?&rdquo; If the answer is yes, we
          publish.
        </p>
        <h2>Community conduct</h2>
        <p>
          Be kind. Be technical. Assume the other person has context you do not. Abusive
          or low-effort content will be removed without notice.
        </p>
      </div>
    </div>
  );
}
