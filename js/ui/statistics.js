// js/ui/statistics.js

import { renderXpOverTimeChart, renderAuditRatioChart } from '../charts.js';

class Statistics {
    constructor() {
        this.container = null;
        this.userData = null;
        this.charts = {}; // To hold references to chart instances
    }

    init(userData) {
        this.container = document.getElementById('statistics-section');
        if (!this.container) {
            console.error("Statistics section container not found");
            return;
        }
        this.userData = userData;
        this.renderLayout();
    }

    renderLayout() {
        this.container.innerHTML = `
            <h2>Statistics</h2>
            <div class="charts-container">
                <div id="xp-over-time-chart" class="chart"></div>
                <div id="audit-ratio-chart" class="chart"></div>
            </div>
        `;
        this.renderCharts();
    }

    renderCharts() {
        if (!this.userData) return;

        // Extract data for charts
        const xpData = this.userData.transaction;
        const auditData = {
            totalUp: this.userData.user[0].totalUp,
            totalDown: this.userData.user[0].totalDown
        };

        // Render charts using the new D3 functions
        renderXpOverTimeChart('#xp-over-time-chart', xpData);
        renderAuditRatioChart('#audit-ratio-chart', auditData);
    }

    show() {
        if (this.container) {
            this.container.classList.remove('hidden');
        }
    }

    hide() {
        if (this.container) {
            this.container.classList.add('hidden');
        }
    }
}

const statistics = new Statistics();
export default statistics;
