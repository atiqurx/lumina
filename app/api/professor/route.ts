import { NextResponse } from "next/server";

const GRAPHQL_URL = "https://www.ratemyprofessors.com/graphql";
// UT Arlington Relay ID (base64 of "School-1343")
const SCHOOL_ID = "U2Nob29sLTEzNDM=";

const SEARCH_PROF_QUERY = `
  query SearchProfessors($text: String!, $schoolID: ID!) {
    newSearch {
      teachers(query: { text: $text, schoolID: $schoolID }) {
        edges {
          node {
            firstName
            lastName
            avgRating
            numRatings
            wouldTakeAgainPercent
            avgDifficulty
            department
            school { name }
          }
        }
      }
    }
  }
`;

export async function POST(req: Request) {
  const { professorName } = (await req.json()) as { professorName?: string };

  if (!professorName) {
    return NextResponse.json(
      { error: "Missing `professorName` in request body" },
      { status: 400 }
    );
  }

  // Call RMP's GraphQL endpoint
  const resp = await fetch(GRAPHQL_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      // RateMyProfessors doesn’t require auth for this endpoint
      Accept: "application/json",
    },
    body: JSON.stringify({
      query: SEARCH_PROF_QUERY,
      variables: {
        text: professorName,
        schoolID: SCHOOL_ID,
      },
    }),
  });

  if (!resp.ok) {
    console.error("RMP GraphQL error:", await resp.text());
    return NextResponse.json({ error: "Lookup failed" }, { status: 502 });
  }

  const { data, errors } = await resp.json();
  if (errors || !data?.newSearch?.teachers?.edges?.length) {
    return NextResponse.json({ error: "Professor not found" }, { status: 404 });
  }

  const prof = data.newSearch.teachers.edges[0].node;
  return NextResponse.json({
    name: `${prof.firstName} ${prof.lastName}`,
    rating: prof.avgRating,
    reviews: prof.numRatings,
    wouldTakeAgainPct: prof.wouldTakeAgainPercent,
    difficulty: prof.avgDifficulty,
    department: prof.department,
    school: prof.school.name,
  });
}
