<script>
</script>
<style>
.nvjs-spinner {
    display: inline-block;
    position: relative;
    width: 20px;
    height: 16px;
    margin: -4px 0px -1px 0px;
    opacity: 0.7;
}

.nvjs-spinner div {
    position: absolute;
    top: 8px;
    width: 4px;
    height: 4px;
    border-radius: 50%;
    animation-timing-function: cubic-bezier(1, 1, 1, 1);
}

.nvjs-spinner div:nth-child(1) {
    left: 2px;
    animation: nvjs-spinner1 0.6s infinite;
    opacity: 0.9;
}

.nvjs-spinner div:nth-child(2) {
    left: 2px;
    animation: nvjs-spinner2 0.6s infinite;
}

.nvjs-spinner div:nth-child(3) {
    left: 9px;
    animation: nvjs-spinner2 0.6s infinite;
}

.nvjs-spinner div:nth-child(4) {
    left: 16px;
    animation: nvjs-spinner3 0.6s infinite;
    opacity: 0.9;
}

@keyframes nvjs-spinner1 {
    0% {
        transform: scale(0);
    }

    100% {
        transform: scale(1);
    }
}

@keyframes nvjs-spinner3 {
    0% {
        transform: scale(1);
    }

    100% {
        transform: scale(0);
    }
}

@keyframes nvjs-spinner2 {
    0% {
        transform: translate(0, 0);
    }

    100% {
        transform: translate(7px, 0);
    }
}
</style>
    <div class="nvjs-spinner">
    {#each [1,2,3,4] as x, i}   
    <div style={`background: gray`}></div>
    {/each}
</div>