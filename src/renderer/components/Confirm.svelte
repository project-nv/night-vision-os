<script>

import { createEventDispatcher } from 'svelte'

const dispatch = createEventDispatcher()

export let f 

function onYes() {
    if (f) f()
    dispatch('answer', 'yes')
}

function onNo() {
    dispatch('answer', 'no')
}

</script>

<!-- TODO: implement shortcuts
<svelte:window on:keydown={handleKeydown}/>
-->
<style>
.confirm-dlg-container {
    top: 0;
    position: absolute;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 100;
    display: grid;
    background-color: #0002;
}

.confirm-dlg {
    width: 420px;
    background-color: #14151c;
    color: rgba(255, 255, 255, 0.753);
    border-radius: 5px;
    font-size: 1.5em;
    padding: 20px;
    border: 1px solid #252732;
}
button {
    font-weight: 600;
    margin-top: 30px !important;
    cursor: pointer;
    font-size: 0.75em !important; 
    border: none;
    color: white;
    padding: 7px 10px;
    text-align: center;
    text-decoration: none;
    font-size: 16px;
    background: gray;
    border-radius: 3px;
    
}
button:hover {
    filter: brightness(1.1);
}
.nooooo {
    width: 100px;
    background-color: #cd3838;
}
</style>
{#if f}
<div class="confirm-dlg-container">
    <div class="confirm-dlg">
       Care to confirm?
        <div class="confirm-buttons">
            <button on:click={onYes}>YES</button>
            <button class="nooooo" on:click={onNo}>NO</button>
        </div>
    </div>
</div>
{/if}