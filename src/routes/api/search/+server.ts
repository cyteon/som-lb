import fetchData from "$lib/data.server.js";

export async function GET({ url }) {
  const searchParams = url.searchParams;
  const page = parseInt(searchParams.get("page") || "1");
  const search = searchParams.get("search") || "";

  if (!search) {
    return Response.json(
      {
        error: "Search query is required",
      },
      { status: 400 },
    );
  }

  let data = await fetchData();

  let users = data.users.sort((a, b) => b.shells - a.shells);
  let searchData = users.filter((user) =>
    user.username.toLowerCase().includes(search.toLowerCase()),
  );

  let pages = Math.ceil(searchData.length / 10);

  if (searchData.length === 0) {
    return Response.json(
      {
        error: "No users found",
        pages,
        timestamp: data.timestamp,
        optedIn: data.users.length,
      },
      { status: 404 },
    );
  }

  searchData = searchData.slice((page - 1) * 10, page * 10);

  searchData = searchData.map((user) => ({
    ...user,
    rank: users.findIndex((u) => u.slack_id === user.slack_id) + 1,
  }));

  return Response.json({
    users: searchData,
    pages,
    timestamp: data.timestamp,
    optedIn: data.users.length,
  });
}
