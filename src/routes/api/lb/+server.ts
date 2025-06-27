import fetchData from "$lib/data.server.js";

export async function GET({ url }) {
  const searchParams = url.searchParams;
  const page = parseInt(searchParams.get("page") || "1");

  let data = await fetchData();

  let pages = Math.ceil(data.users.length / 10);

  let users = data.users.sort((a, b) => b.shells - a.shells);
  users = users.slice((page - 1) * 10, page * 10);

  return Response.json({
    users,
    pages,
    timestamp: data.timestamp,
    optedIn: data.users.length,
  });
}
