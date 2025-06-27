import fs from "fs";

export default async function fetchData() {
  // TODO: Fetch data from API

  let cache;

  try {
    cache = JSON.parse(fs.readFileSync("cache.json", "utf-8"));
  } catch (e) {
    cache = { users: [], timestamp: 0 };
  }

  // 5 min cache
  if (cache.timestamp > Date.now() - 1000 * 60 * 5) {
    console.log("cache hit");
    return cache;
  }

  console.log("cache miss");

  const res = await fetch("https://explorpheus.hackclub.com/leaderboard");

  if (!res.ok) {
    if (cache.users.length > 0) {
      console.error("Using cached data due to API failure");
      return cache;
    }

    throw new Error("Failed to fetch data from API, and cache is empty");
  }

  const users = await res.json();
  const data = {
    users,
    timestamp: Date.now(),
  };

  data.users = await Promise.all(
    data.users.map(async (user) => {
      console.log(`Fetching data for user ${user.slack_id}`);

      const userData = await fetchUserData(user.slack_id);

      return {
        ...user,
        username: userData.username || user.slack_id,
        avatar: userData.image,
      };
    }),
  );

  fs.writeFileSync("cache.json", JSON.stringify(data, null, 2));

  return data;
}

async function fetchUserData(slackId) {
  console.log(`Fetching user data for ${slackId}`);

  let cache;

  try {
    cache = JSON.parse(fs.readFileSync("userCache.json", "utf-8"));
  } catch (e) {
    cache = { users: {}, timestamp: 0 };
  }

  // 6hr cache
  if (cache.timestamp > Date.now() - 1000 * 60 * 60 * 6) {
    const user = cache.users[slackId];
    if (user) {
      return user;
    }
  }

  const res = await fetch(`https://cachet.dunkirk.sh/users/${slackId}`);

  if (!res.ok) {
    return {
      username: slackId,
      avatar: `https://cachet.dunkirk.sh/users/${slackId}/r`,
    };
  }

  const userData = await res.json();

  fs.writeFileSync(
    "userCache.json",
    JSON.stringify(
      {
        users: {
          ...cache.users,
          [slackId]: {
            username: userData.displayName || slackId,
            image: userData.image,
          },
        },
        timestamp: Date.now(),
      },
      null,
      2,
    ),
  );

  return {
    username: userData.displayName || slackId,
    avatar: userData.image,
  };
}
