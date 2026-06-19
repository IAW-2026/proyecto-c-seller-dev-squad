// app/test/page.tsx

import { auth } from "@clerk/nextjs/server";

export default async function TestPage() {
  const data = await auth();

  return (
    <pre>
      {JSON.stringify(data, null, 2)}
    </pre>
  );
}