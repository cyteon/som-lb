import fetchData from "$lib/data.server.js";

export async function GET({ url }) {
  const searchParams = url.searchParams;
  const page = parseInt(searchParams.get("page") || "1");
  const byNetWorth = searchParams.get("byNetWorth") === "true";

  let data = await fetchData();

  let pages = Math.ceil(data.users.length / 10);

  let users;

  if (byNetWorth) {
    users = data.users.map(user => ({
      ...user,
      total_shells: user.shells + user.payouts.reduce((acc, payout) => acc + (payout.type == "ShopOrder" ? payout.amount * -1 : 0), 0)
    })).sort((a, b) => b.total_shells - a.total_shells);
  } else {
    users = data.users.sort((a, b) => b.shells - a.shells);
  }

  users = users.slice((page - 1) * 10, page * 10);

  return Response.json({
    users,
    pages,
    timestamp: data.timestamp,
    optedIn: data.users.length,
  });
}
