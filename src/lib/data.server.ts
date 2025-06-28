import fs from "fs";

let userCache;

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

  try {
    userCache = JSON.parse(fs.readFileSync("userCache.json", "utf-8"));
  } catch (e) {
    userCache = { users: {}, timestamp: 0 };
  }

  // 6hr cache
  if (userCache.timestamp < Date.now() - 1000 * 60 * 60 * 6) {
    console.log("user cache expired");
    userCache = { users: {}, timestamp: 0 };
  }

  console.log("cache miss");

  let users;

  try {
    const res = await fetch("https://explorpheus.hackclub.com/leaderboard");

    if (!res.ok) {
      if (cache.users.length > 0) {
        console.error("Using cached data due to API failure");
        return cache;
      }

      throw new Error("Failed to fetch data from API, and cache is empty");
    }

    users = await res.json();
  } catch (error) {
    console.error("Error fetching data:", error);

    if (cache.users.length > 0) {
      console.error("Using cached data due to API failure");
      return cache;
    }

    throw new Error("Failed to fetch data from API, and cache is empty");
  }

  const data = {
    users,
    timestamp: Date.now(),
  };

  data.users = await Promise.all(
    data.users.map(async (user) => {
      const userData = await fetchUserData(user.slack_id);

      return {
        ...user,
        username: userData.username || user.slack_id,
        image: userData.image,
      };
    }),
  );

  fs.writeFileSync("cache.json", JSON.stringify(data, null, 2));
  
  userCache.timestamp = Date.now();
  fs.writeFileSync("userCache.json", JSON.stringify(userCache, null, 2));

  return data;
}

async function fetchUserData(slackId) {
  const cachedUser = userCache.users[slackId];

  if (cachedUser) {
    return cachedUser;
  }

  console.log(`cache miss for user ${slackId}`);

  const res = await fetch(`https://cachet.dunkirk.sh/users/${slackId}`);

  if (!res.ok && res.status !== 422) {
    console.error(`Failed to fetch user data for ${slackId}: ${res.statusText}`);

    return {
      username: slackId,
      image: `https://cachet.dunkirk.sh/users/${slackId}/r`,
    };
  }

  let userData = await res.json();

  if (res.status === 422) {
    userData = userData.found;
  }

  userCache.users[slackId] = {
    username: userData.displayName || slackId,
    image: userData.image,
  };

  return {
    username: userData.displayName || slackId,
    image: userData.image,
  };
}
