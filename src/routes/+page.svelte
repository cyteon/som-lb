<script lang="ts">
    import { browser } from "$app/environment";
    import { AreaSeries, createChart, type DeepPartial, type TimeChartOptions } from "lightweight-charts";
    import { onMount, tick } from "svelte";

    let data: {
        users: {
            slack_id: string;
            username: string;
            payouts: {
                amount: string;
                created_at: string;
                id: string;
                payable_type: string;
            }[];
            shells: number;
            image: string;
        }[];
        pages?: number;
        timestamp?: number;
        optedIn?: number;
    } = {
        users: [],
    };

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

    let loading: boolean = true;

    onMount(async () => {
        if (browser) {
            const urlParams = new URLSearchParams(window.location.search);

            const pageParam = urlParams.get("page");
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

        await fetchData();
    });

    async function fetchData() {
        try {
            let url = `/api/lb?page=${page}`;

            if (search.trim()) {
                url = `/api/search?search=${encodeURIComponent(search)}&page=${page}`;

                hadSearchParam = true;
            } else {
                hadSearchParam = false;
            }

            const response = await fetch(url);

            if (response.ok || (response.status === 404 && search.trim())) {
                data = await response.json();
                loading = false;
            } else {
                console.error("Failed to fetch leaderboard data");
                alert("Failed to fetch leaderboard data. Please try again later.");
            }
        } catch (error) {
            console.error("Error fetching leaderboard data:", error);
            alert("An error occurred while fetching leaderboard data. Please try again later.");
        }
    }

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

{#if loading}
    <div class="fixed inset-0 bg-black/60 flex flex-col items-center justify-center z-50">
        <svg width="128" height="128" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M12,1A11,11,0,1,0,23,12,11,11,0,0,0,12,1Zm0,19a8,8,0,1,1,8-8A8,8,0,0,1,12,20Z" opacity=".25" fill="#3b82f6"/>
            <path d="M10.14,1.16a11,11,0,0,0-9,8.92A1.59,1.59,0,0,0,2.46,12,1.52,1.52,0,0,0,4.11,10.7a8,8,0,0,1,6.66-6.61A1.42,1.42,0,0,0,12,2.69h0A1.57,1.57,0,0,0,10.14,1.16Z" fill="#3b82f6">
                <animateTransform attributeName="transform" type="rotate" dur="0.75s" values="0 12 12;360 12 12" repeatCount="indefinite"/>
            </path>
        </svg>

        <p class="text-2xl text-white mt-4">Loading...</p>
    </div>
{:else}
    <div class="flex flex-col items-center px-2">
        <h1 class="text-4xl md:text-6xl mt-16 brown">Shell Leaderboard</h1>
        <div class="flex md:text-lg">
            <a href="https://github.com/cyteon/som-lb" class="opacity-70 font-bold!">Source</a>
            <p class="brown opacity-40 mx-1">|</p>
            <a href="https://summer.hackclub.com" class="opacity-70 font-bold!">Summer of Making</a>
            <p class="brown opacity-40 mx-1">|</p>
            <p class="opacity-70 font-bold!">By <a href="https://cyteon.dev?utm_source=som-lb" class="font-bold!">Cyteon</a></p>
        </div>
        <div class="flex flex-col md:flex-row items-center">
            <div class="flex">
                <p class="opacity-70">
                    <span class="font-bold!">
                        {data.optedIn || 0}
                    </span> people found
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


        <div class="mt-8 bg border rounded-md p-2 flex">
            <input 
                type="text" 
                placeholder="Search for a user..." 
                class="px-2 py-1 border rounded-md w-full focus:outline-none"
                bind:value={search}
            />

            <button 
                class="bg-blue-400 px-4 py-1 rounded-md ml-2 disabled:opacity-80"
                on:click={async () => {
                    if (browser) {
                        await fetchData();

                        window.history.pushState({}, "", `?page=1&search=${encodeURIComponent(search)}`);
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
            {#if data.users?.length > 0}
                {#each data.users as user, index}
                    <div 
                        class="flex p-2 px-4 border rounded-md bg"
                    >
                        <p class="text-2xl my-auto mr-4">#{
                            hadSearchParam ? 
                                user.rank : 
                                index + 1 + (page - 1) * 10   
                        }</p>
                        <img src={user.image} alt={user.username} class="my-auto size-12 md:size-16 rounded-md" />
                        <button class="text-2xl my-auto ml-4 truncate max-w-2/5 hover:underline" on:click={async () => { 
                            popupData = user;

                            let currentShells = 0;

                            await tick();

                            let chartData = [
                                {
                                    value: 0, // everyone started with 0 soooo
                                    time: 1750053180 // 16th june 2025, 7:53am: SoM launch
                                }, 
                                ...user.payouts.map((p) => {
                                    currentShells += parseFloat(p.amount);

                                    return {
                                        value: currentShells,
                                        time: new Date(p.created_at).getTime() / 1000,
                                    }
                                })
                            ]

                            chartData.sort((a, b) => a.time - b.time);

                            const chartOptions: DeepPartial<TimeChartOptions> = { 
                                layout: { 
                                    textColor: "black", 
                                    background: { 
                                        color: "transparent" 
                                    },
                                    attributionLogo: false,
                                },
                                grid: {
                                    horzLines: {
                                        color: "#7c4a3320"
                                    },
                                    vertLines: {
                                        color: "#7c4a3320",
                                    }
                                },
                                timeScale: {
                                    timeVisible: true,
                                    borderColor: "#7c4a33",
                                },
                                rightPriceScale: {
                                    borderColor: "#7c4a33",
                                },
                            };

                            const chart = createChart(document.getElementById("chart")!, chartOptions);
                            const areaSeries = chart.addSeries(AreaSeries, { lineColor: "#2962FF", topColor: "#2962FF", bottomColor: "rgba(41, 98, 255, 0.28)" });
                        
                            areaSeries.setData(chartData);
                            chart.timeScale().fitContent();
                        }}>{user.username}</button>

                        <div class="ml-auto my-auto flex">
                            <p class="text-2xl text-right">{user.shells.toFixed(0)}</p>
                            <img src="/shell.png" alt="shell" class="inline my-1.5 w-6 h-6 ml-2" />
                        </div>
                    </div>
                {/each}
            {:else}
                <p class="text-lg text-center my-4">No users found.</p>
            {/if}
        </div>

        <div class="flex mt-4 mb-16 bg border rounded-md px-2">
            <button 
                class="text-lg my-auto mr-4 disabled:opacity-80 bg-blue-400 px-2 rounded-md"
                on:click={async () => {
                    if (page > 1) {
                        page--;

                        await fetchData();
                        window.history.pushState({}, "", `?page=${page}&search=${encodeURIComponent(search)}`);
                    }
                }}
                disabled={page <= 1}
            >
                &lt; Back
            </button>
            <p class="text-xl my-2">{page} / {data.pages || 1}</p>
            <button 
                class="text-lg my-auto ml-4 disabled:opacity-80 bg-blue-400 px-2 rounded-md" 
                on:click={async () => {
                    if (page < data.pages!) {
                        page++;
                        
                        await fetchData();
                        window.history.pushState({}, "", `?page=${page}&search=${encodeURIComponent(search)}`);
                    }
                }}
                disabled={page >= data.pages!}
            >
                Next &gt;
            </button>
        </div>
    </div>
{/if}

{#if popupData}
    <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-2">
        <div class="flex flex-col p-2 px-4 border rounded-md bg w-full md:w-1/2 max-h-3/4">
            <h1 class="text-3xl flex">
                {popupData.username} <button class="ml-auto text-3xl" on:click={() => { popupData = null }}>&times;</button>
            </h1>
            <p class="text-lg">Shells: {popupData.shells.toFixed(0)}</p>

            <h2 class="text-2xl mt-4">Transactions:</h2>

            <div class="border rounded-sm mt-2 max-h-96 overflow-y-auto">
                <table class="w-full">
                    <thead>
                        <tr>
                            <th class="text-left py-1 px-2 border-r">Amount</th>
                            <th class="text-left py-1 px-2 border-r">Type</th>
                            <th class="text-left py-1 px-2">Time</th>
                        </tr>
                    </thead>
                    <tbody class="md:text-lg">
                        {#each popupData.payouts as payout}
                            <tr>
                                <td class={"px-2 border-r border-t " + (parseFloat(payout.amount) > 0 ? "text-green-700" : "text-red-700")}>
                                    {parseFloat(payout.amount) > 0 ? "+" : ""}{payout.amount}
                                </td>
                                <td class="border border-b-0 px-2">
                                    {#if payout.payable_type === "User"}
                                        User Modified
                                    {:else if payout.payable_type === "ShopOrder"}
                                        {#if parseFloat(payout.amount) < 0}
                                            Shop Order
                                        {:else}
                                            Shop Refund
                                        {/if}
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

            <div class="w-full h-64 mt-4 mb-2 border px-2 pt-2 rounded-sm">
                <div id="chart" class="w-full h-full"></div>
            </div>
        </div>
    </div>
{/if}