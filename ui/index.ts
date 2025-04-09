import { createApp } from 'vue';
// @ts-ignore
import PlanVisualizer from './PlanVisualizer.vue';

// Simply create and mount the Vue app
const app = createApp(PlanVisualizer);
app.mount('#app');

// Note: The displayPlan function is defined directly in the PlanVisualizer.vue component
// and is exposed globally there. This file just needs to mount the app.
