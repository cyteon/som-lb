import fs from "fs";
import { WebClient } from "@slack/web-api";
import PQueue from "p-queue";

import { SLACK_TOKEN } from "$env/static/private";

const slack = new WebClient(SLACK_TOKEN);

// slack ratelimit of around 100/min
const userInfoQueue = new PQueue({
  intervalCap: 100,
  interval: 60_000,
  carryoverConcurrencyCount: true,
});

let userCache: {
  users: Record<string, { username: string; image: string }>;
  timestamp: number;
};

let cache: {
  users: any[];
  timestamp: number;
};

try {
  cache = JSON.parse(fs.readFileSync("cache.json", "utf-8"));
} catch (e) {
  cache = { users: [], timestamp: 0 };
}

try {
  userCache = JSON.parse(fs.readFileSync("userCache.json", "utf-8"));
} catch (e) {
  userCache = { users: {}, timestamp: 0 };
}

export default async function fetchData() {
  // 5 min cache
  if (cache.timestamp > Date.now() - 1000 * 60 * 5) {
    console.log("cache hit");
    return cache;
  }

  let doRefreshUserCache = false;

  // 6hr cache
  if (userCache.timestamp < Date.now() - 1000 * 60 * 60 * 6) {
    console.log("user cache expired");
    doRefreshUserCache = true;
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
    console.log(`fetched ${users.length} users from explorpheus`);
  } catch (error) {
    console.error("Error fetching data:", error);

    if (cache.users.length > 0) {
      console.error("Using cached data due to API failure");
      return cache;
    }

    throw new Error("Failed to fetch data from API, and cache is empty");
  }

  users = await Promise.all(
    users.map(async (user) => {
      if (!user.slack_id) {
        return { ...user, username: "<unknown>", image: "https://ca.slack-edge.com/T0266FRGM-U015ZPLDZKQ-gf3696467c28-512" };
      }

      const userData = await fetchUserData(user.slack_id);

      return {
        ...user,
        username: userData.username || user.slack_id,
        image: userData.image,
      };
    }),
  );

  const data = {
    users,
    timestamp: Date.now(),
  };

  cache = data;
  fs.writeFileSync("cache.json", JSON.stringify(data, null, 2));

  userCache.timestamp = Date.now();
  fs.writeFileSync("userCache.json", JSON.stringify(userCache, null, 2));

  if (doRefreshUserCache) {
    // put it here so the fetch requests arent before the required ones for this request in queue
    // also not await so it returns immediately
    refreshUserCache().catch(console.error);
  }

  return data;
}

async function fetchUserData(slackId, useCache = true) {
  const cachedUser = userCache.users[slackId];

  if (cachedUser && useCache) {
    return cachedUser;
  } else if (useCache) {
    console.log(`cache miss for user ${slackId}`); // only log cache miss if using cache
  }

  const res = await userInfoQueue.add(() =>
    slack.users.info({ user: slackId }),
  );

  const data = {
    username:
      res.user?.profile?.display_name_normalized || res.user?.name || slackId,
    image:
      res.user?.profile?.image_192 ||
      `https://cachet.dunkirk.sh/users/${slackId}/r`,
  };

  userCache.users[slackId] = data;
  return data;
}

export async function refreshUserCache() {
  console.log("refreshing user cache...");
  console.time("refeshUserCache");

  cache.users = await Promise.all(
    cache.users.map(async (user) => {
      if (!user.slack_id) {
        return { ...user, username: "<unknown>", image: "https://ca.slack-edge.com/T0266FRGM-U015ZPLDZKQ-gf3696467c28-512" };
      }

      const userData = await fetchUserData(user.slack_id, false);

      return {
        ...user,
        username: userData.username || user.slack_id,
        image: userData.image,
      };
    }),
  );

  userCache.timestamp = Date.now();
  fs.writeFileSync("userCache.json", JSON.stringify(userCache, null, 2));
  
  console.timeEnd("refeshUserCache");
  console.log("user cache refreshed");
}