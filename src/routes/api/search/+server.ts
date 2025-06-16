export async function GET({ url }) {
    const searchParams = url.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const search = searchParams.get("search") || "";

    if (!search) {
        return Response.json({
            error: "Search query is required",
        }, { status: 400 });
    }

    let data = [
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
        }
        ,
        {
            id: "U12345681",
            avatar: "https://i.pravatar.cc/501",
            username: "weaweae34",
            shells: 716
        }
        ,
        {
            id: "U12345681",
            avatar: "https://i.pravatar.cc/505",
            username: "wagaweg",
            shells: 8751
        }
        ,
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
    ];

    data = data.filter(user => user.username.toLowerCase().includes(search.toLowerCase()));

    if (data.length === 0) {
        return Response.json({
            error: "No users found",
        }, { status: 404 });
    }

    let pages = Math.ceil(data.length / 10);

    data = data.sort((a, b) => b.shells - a.shells);
    data = data.slice((page - 1) * 10, page * 10);

    return Response.json({
        users: data,
        pages,
    })
}