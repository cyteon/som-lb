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
        }

        const response = await fetch(`/api/lb?page=${page}`);

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
        <a href="https://github.com/cyteon/som-lb" class="opacity-70">Source</a>
        <p class="brown opacity-40 mx-1">|</p>
        <a href="https://summer.hackclub.com" class="opacity-70">Summer of Making</a>
        <p class="brown opacity-40 mx-1">|</p>
        <p class="opacity-70">By <a href="https://cyteon.dev?utm_source=som-lb">Cyteon</a></p>
    </div>

    <div
        class="w-full md:w-1/2 mt-8 space-y-2" 
    >
        {#each users as user, index}
            <div 
                class="flex p-2 px-4 border rounded-md bg"
            >
                <p class="text-2xl my-auto mr-4">#{index + 1 + (page - 1) * 10}</p>
                <img src={user.avatar} alt={user.username} class="w-16 h-16 rounded-md" />
                <h2 class="text-2xl my-auto ml-4 truncate max-w-1/4">{user.username}</h2>

                <div class="ml-auto my-auto flex">
                    <p class="text-2xl text-right">{parseInt(user.shells)}</p>
                    <img src="/shell.png" alt="shell" class="inline my-1.5 w-6 h-6 ml-2" />
                </div>
            </div>
        {/each}
    </div>

    <div class="flex mt-4 mb-16 bg border rounded-md px-4">
        <button 
            class="text-lg my-auto mr-4 disabled:opacity-80 bg-blue-400 px-2 rounded-md"
            on:click={() => {
                if (page > 1) {
                    page--;
                    window.location.search = `?page=${page}`;
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
                    window.location.search = `?page=${page}`;
                }
            }}
            disabled={page >= pages}
        >
            Next &gt;
        </button>
    </div>
</div>