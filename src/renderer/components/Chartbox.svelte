<script>
import { onMount, createEventDispatcher } from 'svelte'
import { NightVision } from 'night-vision'

const dispatch = createEventDispatcher()

let chart // ref

// Generate some random data
function data() {
    return Array(30).fill(1).map((x, i) => [
        new Date(`${i+1} Nov 2022 GMT+0000`).getTime(),
        i * Math.random()
    ])
}

function onOvSelect(event) {
    dispatch('overlay-select', event)
}

onMount(() => {
    chart = new NightVision('chart-box', {
        autoResize: true
    })
    self.chart = chart

    chart.events.on('app:$overlay-select', onOvSelect)

    return () => {
        chart.events.off('app')
    }
})

</script>
<style>
#chart-box {
    width: 100%;
    height: 100%;
}
</style>
<div id="chart-box">
</div>