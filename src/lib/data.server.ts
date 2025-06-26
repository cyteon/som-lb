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

    let data = {
        users: [
            {
                id: "U12345678",
                avatar: "https://i.pravatar.cc/500",
                username: "User1",
                shells: 20
            },
            {
                id: "U12345680",
                avatar: "https://i.pravatar.cc/502",
                username: "3",
                shells: 685.311 // decimal places sometimes occured on highseas lb, having this to test
            },
            {
                id: "U12345679",
                avatar: "https://i.pravatar.cc/531",
                username: "User 2",
                shells: 400
            },
            {
                id: "U12345681",
                avatar: "https://i.pravatar.cc/523",
                username: "awe24",
                shells: 152
            },
            {
                id: "U12345681",
                avatar: "https://i.pravatar.cc/501",
                username: "weaweae34",
                shells: 716
            },
            {
                id: "U12345681",
                avatar: "https://i.pravatar.cc/505",
                username: "wagaweg",
                shells: 8751
            },
            {
                id: "U12345681",
                avatar: "https://i.pravatar.cc/509",
                username: "bwaef",
                shells: 123
            },
            {
                id: "U12345681",
                avatar: "https://i.pravatar.cc/508",
                username: "j56ur56",
                shells: 0.5
            },
            {
                id: "U12345681",
                avatar: "https://i.pravatar.cc/507",
                username: "se45h4",
                shells: 2351
            },
            {
                id: "U12345681",
                avatar: "https://i.pravatar.cc/506",
                username: "ser545",
                shells: 3212
            },
            {
                id: "U12345681",
                avatar: "https://i.pravatar.cc/505",
                username: "esrter5",
                shells: 213
            },
            {
                id: "U12345681",
                avatar: "https://i.pravatar.cc/523",
                username: "sergserg",
                shells: 12
            },
            {
                id: "U12345681",
                avatar: "https://i.pravatar.cc/504",
                username: "User8",
                shells: 1251
            },
            {
                id: "U12345681",
                avatar: "https://i.pravatar.cc/504",
                username: "User8",
                shells: 1251
            }
        ],
        timestamp: Date.now()
    };

    fs.writeFileSync("cache.json", JSON.stringify(data, null, 2));

    return data;
}