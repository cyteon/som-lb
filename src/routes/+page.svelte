<script lang="ts">
    import { browser } from '$app/environment';
    import { onMount } from 'svelte';

    let users: {
        avatar: string;
        username: string;
        shells: number;
    }[] = [];
    let pages: number = 1;

    let page: number = 1;

    let hadSearchParam: boolean = false;
    let search: string = "";

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
            let data = await response.json();

            users = data.users;
            pages = data.pages;
        } else {
            console.error("Failed to fetch leaderboard data");
        }
    });
</script>

<div class="flex flex-col items-center h-full px-2">
    <h1 class="text-4xl md:text-6xl mt-16 brown">Shell Leaderboard</h1>
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
        {#each users as user, index}
            <div 
                class="flex p-2 px-4 border rounded-md bg"
            >
                <p class="text-2xl my-auto mr-4">#{
                    search.trim() || hadSearchParam ? 
                        user.rank : 
                        index + 1 + (page - 1) * 10   
                }</p>
                <img src={user.avatar} alt={user.username} class="w-16 h-16 rounded-md" />
                <h2 class="text-2xl my-auto ml-4 truncate max-w-1/4">{user.username}</h2>

                <div class="ml-auto my-auto flex">
                    <p class="text-2xl text-right">{parseInt(user.shells)}</p>
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