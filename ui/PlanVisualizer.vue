<template>
  <div class="plan-visualizer">
    <div class="plan-container">
      <pev2 
        v-if="plan" 
        :plan-source="plan" 
        :plan-query="query"
        class="pev2-component"
      ></pev2>
      <div v-else class="alert alert-info">
        No plan data available
      </div>
    </div>
  </div>
</template>

<script>
import { Plan } from 'pev2';
import 'pev2/dist/pev2.css';
import 'bootstrap/dist/css/bootstrap.min.css';

export default {
  name: "PlanVisualizer",
  components: {
    pev2: Plan,
  },
  data() {
    return {
      plan: null,
      query: '',
    }
  },
  created() {
    // Expose the displayPlan function globally
    window.displayPlan = this.displayPlan;
  },
  methods: {
    displayPlan(data) {
      try {
        // Hide loading indicator if it exists
        const loadingElement = document.getElementById('loading');
        if (loadingElement) {
          loadingElement.style.display = 'none';
        }
        
        // Update the query
        this.query = data.query || '';
        
        // Process the plan data to match PEV2's expected format
        
        // Update the plan
        this.plan = JSON.stringify(data.plan);
      } catch (error) {
        // Show error if error container exists
        const errorElement = document.getElementById('error');
        const errorMessageElement = document.getElementById('error-message');
        if (errorElement && errorMessageElement) {
          errorElement.style.display = 'block';
          errorMessageElement.textContent = 'Error displaying plan: ' + error.message;
        }
      }
    }
  }
};
</script>

<style scoped>
.plan-visualizer {
  display: flex;
  flex-direction: column;
  height: 100vh; /* Use viewport height to fill the entire window */
  width: 100vw; /* Use viewport width to fill the entire window */
  position: absolute; /* Position absolute to cover the entire window */
  top: 0;
  left: 0;
}

.query-container {
  padding: 10px;
  background-color: #f8f9fa;
  border-bottom: 1px solid #dee2e6;
  font-family: monospace;
  white-space: pre-wrap;
  max-height: 150px;
  overflow-y: auto;
}

.query-text {
  margin-top: 5px;
}

.plan-container {
  flex: 1;
  overflow: auto;
  padding: 30px 10px 10px 10px; /* Increased top padding to cover window controls */
}

/* Add styles for the PEV2 component to ensure it fills the container */
:deep(.pev2) {
  height: 100%;
  width: 100%;
}

.pev2-component {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
}

/* Override any PEV2 styles that might be causing the cutting issue */
:deep(.pev2-component .pev2) {
  min-height: 100%;
  overflow: auto;
}

:deep(.pev2-component .plan-container) {
  min-height: 100%;
  overflow: auto;
}

.alert {
  padding: 15px;
  margin-bottom: 20px;
  border: 1px solid transparent;
  border-radius: 4px;
}

.alert-info {
  color: #31708f;
  background-color: #d9edf7;
  border-color: #bce8f1;
}
</style>
