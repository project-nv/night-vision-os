<script>

import DsList from './DsList.svelte'
import OvList from './OvList.svelte'
import PropList from './PropList.svelte'
import Settings from './Settings.svelte'

const items = [
    {
        name: 'Datasets',
        compo: DsList,
        icon: '/assets/datasets2.png'
    }, 
    {
        name: 'Overlays',
        compo: OvList,
        icon: '/assets/overlays.png'
    }, 
    {
        name: 'Props',
        compo: PropList,
        icon: '/assets/props.png'
    }
]

let selected = items[0]  
let compoRef = null

export function setSelected(name, opt) {
    let item = items.find(x => x.name === name)
    if (item) selected = item
    if (opt && opt.item) {
        setTimeout(() => {
            compoRef.setSelected(opt.item)
        })
    }
}

function itemStyle(item) {
    return `
        background-image: url(${item.icon});
        filter: ${item === selected ? 
            'invert(1) brightness(0.7)' : 'auto'
        }; 
    `
}

</script>
<style>
#side-bar {
    width: 100%;
    height: 100%;
    background: #14151c;
}
.sidebar-menu {
    float: left;
    width: 50px;
    height: 100%;
    /*border-right: 1px solid #80808045;*/
    /*background: #c8cace05;*/
}
.menu-item {
    background-size: cover;
    filter: invert(1) brightness(0.4);
    width: 28px;
    height: 28px;
    margin: 11px;
    cursor: pointer;
}
.menu-item:hover {
    filter: invert(1) brightness(0.5);
}
.container {
    width: calc(100% - 50px);
    height: 100%;
    margin-left: 50px;
    overflow-y: auto;
    /*background: #c8cace05;*/
}
.container::-webkit-scrollbar {
  display: none;
}
:global(.component-header) {
    height: 35px;
    width: 100%;
    text-align: center;
    line-height: 50px; /* 35px; or 48px; */
    color: #444648;
    font-size: x-large;
    letter-spacing: 0.1em;
    font-weight: 700;
    user-select: none;
    margin-bottom: 13px;
}
:global(.nvjs-legend:first) {
   top: 20px;
}
</style>
{#key selected}
<div id="side-bar">
    <div class="sidebar-menu">
    {#each items as item, i}
        <div class="menu-item" style={itemStyle(item)}
            on:click={() => selected = items[i]}
            on:keypress={() => {}}>
        </div>
    {/each}
    </div>
    <div class="container">
        <svelte:component this={selected.compo}
            bind:this={compoRef}
            on:set-code on:show-picker
            on:picker-color on:reset-props
        />
    </div>
</div>
{/key}