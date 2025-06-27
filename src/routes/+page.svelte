<script lang="ts">
    import { browser } from '$app/environment';
    import { onMount } from 'svelte';

    let data: {
        users: {
            slack_id: string;
            payouts: {
                amount: string;
                created_at: string;
                id: string;
                payable_type: string;
            }[];
            shells: number;
        }[];
        pages: number;
        timestamp: number;
        optedIn: number;
    } = {
        users: [],
    };
    let pages: number = 1;

    let page: number = 1;

    let hadSearchParam: boolean = false;
    let search: string = "";

    let popupData: {
        slack_id: string;
        payouts: {
            amount: string;
            created_at: string;
            id: string;
            payable_type: string;
        }[];
        shells: number;
    } | null = null;

    onMount(async () => {
        if (browser) {
            const urlParams = new URLSearchParams(window.location.search);

            const pageParam = urlParams.get('page');
            if (pageParam) {
                const parsedPage = parseInt(pageParam);
                if (!isNaN(parsedPage) && parsedPage > 0) {
                    page = parsedPage;
                }
            }

            search = urlParams.get("search") || "";

            if (search.trim()) {
                hadSearchParam = true;
            }
        }

        let url = `/api/lb?page=${page}`;

        if (search.trim()) {
            url = `/api/search?search=${encodeURIComponent(search)}&page=${page}`;
        }

        const response = await fetch(url);

        if (response.ok) {
            data = await response.json();
        } else {
            console.error("Failed to fetch leaderboard data");
        }
    });

    let currentTime: number = new Date().getTime();

    setInterval(() => {
        currentTime = new Date().getTime();
    }, 1000);

    function generateTimeString(timestamp: number): string {
        const diff = currentTime - timestamp;
        if (diff < 60000) {
            return `${Math.floor(diff / 1000)} seconds ago`;
        } else if (diff < 3600000) {
            return `${(diff / 60000).toFixed(1)} minutes ago`;
        } else if (diff < 86400000) {
            return `${(diff / 3600000).toFixed(1)} hours ago`;
        } else {
            return `${(diff / 86400000).toFixed(1)} days ago`;
        }
    }
</script>

<div class="flex flex-col items-center h-full px-2 ">
    <h1 class="text-4xl md:text-6xl mt-16 brown">Shell Leaderboard</h1>
    <div class="flex flex-col md:flex-row items-center">
        <p class="opacity-70">
            Run
            <code class="border rounded-sm py-0.5 px-1 bg text-sm">/som-watch-my-balance</code>
            to opt in
        </p>
        <p class="brown opacity-40 mx-1 hidden md:block">|</p>
        <div class="flex">
            <p class="opacity-70">
                <span class="font-bold!">
                    {data.optedIn || 0}
                </span> opted-in
            </p>
            <p class="brown opacity-40 mx-1">|</p>
            <p class="opacity-70">
                {#if currentTime - (data.timestamp || 0) < 60000}
                    {
                        Math.floor((currentTime - (data.timestamp || 0)) / 1000)
                    } seconds ago
                {:else}
                    {
                        ((currentTime- (data.timestamp || 0)) / 60000).toFixed(1)
                    } minutes ago
                {/if}
            </p>
        </div>
    </div>
    <div class="flex md:text-lg">
        <a href="https://github.com/cyteon/som-lb" class="opacity-70 font-bold!">Source</a>
        <p class="brown opacity-40 mx-1">|</p>
        <a href="https://summer.hackclub.com" class="opacity-70 font-bold!">Summer of Making</a>
        <p class="brown opacity-40 mx-1">|</p>
        <p class="opacity-70 font-bold!">By <a href="https://cyteon.dev?utm_source=som-lb" class="font-bold!">Cyteon</a></p>
    </div>


    <div class="mt-8 bg border rounded-md p-2 flex">
        <input 
            type="text" 
            placeholder="Search for a user..." 
            class="px-2 py-1 border rounded-md w-full focus:outline-none"
            bind:value={search}
        />

        <button 
            class="bg-blue-400 px-4 py-1 rounded-md ml-2 disabled:opacity-80"
            on:click={() => {
                if (browser) {
                    window.location.search = `?page=1&search=${encodeURIComponent(search)}`;
                }
            }}
            
            disabled={!(search.trim() || hadSearchParam)}
        >
            Search
        </button>
    </div>

    <div
        class="w-full md:w-1/2 mt-4 space-y-2" 
    >
        {#each data.users as user, index}
            <div 
                class="flex p-2 px-4 border rounded-md bg"
            >
                <p class="text-2xl my-auto mr-4">#{
                    search.trim() || hadSearchParam ? 
                        user.rank : 
                        index + 1 + (page - 1) * 10   
                }</p>
                <img src={`https://cachet.dunkirk.sh/users/${user.slack_id}/r`} alt={user.username} class="my-auto size-12 md:size-16 rounded-md" />
                <button class="text-2xl my-auto ml-4 truncate max-w-2/5 hover:underline" on:click={() => { popupData = user }}>{user.username}</button>

                <div class="ml-auto my-auto flex">
                    <p class="text-2xl text-right">{user.shells.toFixed(0)}</p>
                    <img src="/shell.png" alt="shell" class="inline my-1.5 w-6 h-6 ml-2" />
                </div>
            </div>
        {/each}
    </div>

    <div class="flex mt-4 mb-16 bg border rounded-md px-2">
        <button 
            class="text-lg my-auto mr-4 disabled:opacity-80 bg-blue-400 px-2 rounded-md"
            on:click={() => {
                if (page > 1) {
                    page--;
                    window.location.search = `?page=${page}&search=${encodeURIComponent(search)}`;
                }
            }}
            disabled={page <= 1}
        >
            &lt; Back
        </button>
        <p class="text-xl my-2">{page} / {pages}</p>
        <button 
            class="text-lg my-auto ml-4 disabled:opacity-80 bg-blue-400 px-2 rounded-md" 
            on:click={() => {
                if (page < pages) {
                    page++;
                    window.location.search = `?page=${page}&search=${encodeURIComponent(search)}`;
                }
            }}
            disabled={page >= pages}
        >
            Next &gt;
        </button>
    </div>
</div>

{#if popupData}
    <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-2">
        <div class="flex flex-col p-2 px-4 border rounded-md bg w-full md:w-1/2">
            <h1 class="text-3xl flex">
                Data for {popupData.username} <button class="ml-auto text-3xl" on:click={() => { popupData = null }}>&times;</button>
            </h1>
            <p class="text-lg">Shells: {popupData.shells.toFixed(0)}</p>

            <h2 class="text-2xl mt-4">Transactions:</h2>

            <div class="border rounded-sm my-2">
                <table class="w-full">
                    <thead class="border-b">
                        <tr>
                            <th class="text-left py-1 px-2 border-r">Amount</th>
                            <th class="text-left py-1 px-2 border-r">Type</th>
                            <th class="text-left py-1 px-2">Time</th>
                        </tr>
                    </thead>
                    <tbody class="md:text-lg">
                        {#each popupData.payouts as payout}
                            <tr>
                                <td class={"px-2 border border-b-0 border-l-0 " + (parseFloat(payout.amount) > 0 ? "text-green-700" : "text-red-700")}>
                                    {parseFloat(payout.amount) > 0 ? "+" : ""}{payout.amount}
                                </td>
                                <td class="border border-b-0 px-2">
                                    {#if payout.payable_type === "User"}
                                        User Modified
                                    {:else if payout.payable_type === "ShopOrder"}
                                        Shop Order
                                    {:else}
                                        {payout.payable_type}
                                    {/if}
                                </td>
                                <td class="border border-b-0 border-r-0 px-2">{generateTimeString(new Date(payout.created_at).getTime())}</td>
                            </tr>
                        {/each}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
{/if}