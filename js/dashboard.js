// Dashboard Manager
const Dashboard = {
  userData: null,
  xpTransactions: [],
  progresses: [],

  init() {
    // Load user data from localStorage
    const userDataStr = localStorage.getItem("userData");
    if (!userDataStr) {
      AuthHandler.logout();
      return;
    }

    this.userData = JSON.parse(userDataStr);
    this.processData();
    this.renderDashboard();
  },

  processData() {
    // Filter XP transactions
    this.xpTransactions = this.userData.transactions
      .filter((t) => t.type === "xp")
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

    this.progresses = this.userData.progresses || [];
  },

  renderDashboard() {
    this.updateUserInfo();
    this.updateStats();
    this.renderGraphs();
    this.renderRecentActivity();
  },

  updateUserInfo() {
    const login = document.getElementById("user-login");
    const userId = document.getElementById("user-id");
    const avatar = document.getElementById("user-avatar-text");

    if (login) login.textContent = this.userData.login;
    if (userId) userId.textContent = `ID: ${this.userData.id}`;
    if (avatar)
      avatar.textContent = this.userData.login.substring(0, 2).toUpperCase();
  },

  updateStats() {
    // Total XP
    const totalXP = this.xpTransactions.reduce((sum, t) => sum + t.amount, 0);
    const totalXPEl = document.getElementById("total-xp");
    if (totalXPEl) {
      totalXPEl.textContent = this.formatNumber(totalXP) + " XP";
    }

    // Audit Ratio
    const auditRatioEl = document.getElementById("audit-ratio");
    if (auditRatioEl) {
      const ratio =
        this.userData.auditRatio ||
        this.userData.totalUp / this.userData.totalDown;
      auditRatioEl.textContent = ratio.toFixed(2);
    }

    // Projects Passed
    const passed = this.progresses.filter((p) => p.grade === 1).length;
    const passedEl = document.getElementById("projects-passed");
    if (passedEl) passedEl.textContent = passed;

    // Success Rate
    const total = this.progresses.length;
    const successRate = total > 0 ? ((passed / total) * 100).toFixed(1) : 0;
    const successRateEl = document.getElementById("success-rate");
    if (successRateEl) successRateEl.textContent = successRate + "%";
  },

  renderGraphs() {
    this.renderXPTimeline();
    this.renderXPByProjects();
    this.renderAuditRatio();
    this.renderPassFailRatio();
  },

  renderXPTimeline() {
    const svg = document.getElementById("xp-timeline-graph");
    if (!svg || this.xpTransactions.length === 0) return;

    const width = 600;
    const height = 300;
    const padding = 60;

    svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
    svg.innerHTML = "";

    // Calculate cumulative XP
    let cumulative = 0;
    const points = this.xpTransactions.map((t) => {
      cumulative += t.amount;
      return { date: new Date(t.createdAt), xp: cumulative };
    });

    // Find min/max
    const maxXP = Math.max(...points.map((p) => p.xp));
    const minDate = points[0].date;
    const maxDate = points[points.length - 1].date;
    const dateRange = maxDate - minDate;

    // Create scales
    const xScale = (date) =>
      padding + ((date - minDate) / dateRange) * (width - padding * 2);
    const yScale = (xp) =>
      height - padding - (xp / maxXP) * (height - padding * 2);

    // Draw axes
    const axesGroup = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "g"
    );
    axesGroup.innerHTML = `
      <line x1="${padding}" y1="${height - padding}" x2="${
      width - padding
    }" y2="${height - padding}" 
            stroke="rgba(255,255,255,0.2)" stroke-width="2"/>
      <line x1="${padding}" y1="${padding}" x2="${padding}" y2="${
      height - padding
    }" 
            stroke="rgba(255,255,255,0.2)" stroke-width="2"/>
    `;
    svg.appendChild(axesGroup);

    // Draw grid lines
    const gridGroup = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "g"
    );
    for (let i = 0; i <= 5; i++) {
      const y = padding + (i * (height - padding * 2)) / 5;
      const line = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "line"
      );
      line.setAttribute("x1", padding);
      line.setAttribute("y1", y);
      line.setAttribute("x2", width - padding);
      line.setAttribute("y2", y);
      line.setAttribute("stroke", "rgba(255,255,255,0.05)");
      line.setAttribute("stroke-width", "1");
      gridGroup.appendChild(line);
    }
    svg.appendChild(gridGroup);

    // Draw line
    const pathData = points
      .map((p, i) => {
        const x = xScale(p.date);
        const y = yScale(p.xp);
        return i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
      })
      .join(" ");

    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", pathData);
    path.setAttribute("fill", "none");
    path.setAttribute("stroke", "#9969ff");
    path.setAttribute("stroke-width", "3");
    svg.appendChild(path);

    // Draw area under curve
    const areaData =
      pathData +
      ` L ${xScale(points[points.length - 1].date)} ${
        height - padding
      } L ${xScale(points[0].date)} ${height - padding} Z`;
    const area = document.createElementNS("http://www.w3.org/2000/svg", "path");
    area.setAttribute("d", areaData);
    area.setAttribute("fill", "rgba(153, 105, 255, 0.2)");
    svg.appendChild(area);

    // Draw points
    points.forEach((p) => {
      const circle = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "circle"
      );
      circle.setAttribute("cx", xScale(p.date));
      circle.setAttribute("cy", yScale(p.xp));
      circle.setAttribute("r", "4");
      circle.setAttribute("fill", "#9969ff");
      circle.setAttribute("stroke", "#fff");
      circle.setAttribute("stroke-width", "2");

      // Tooltip
      const title = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "title"
      );
      title.textContent = `${p.date.toLocaleDateString()}: ${this.formatNumber(
        p.xp
      )} XP`;
      circle.appendChild(title);

      svg.appendChild(circle);
    });

    // Labels
    const labelsGroup = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "g"
    );
    labelsGroup.innerHTML = `
      <text x="${width / 2}" y="${
      height - 10
    }" text-anchor="middle" fill="rgba(255,255,255,0.6)" font-size="12">Time</text>
      <text x="20" y="${
        height / 2
      }" text-anchor="middle" fill="rgba(255,255,255,0.6)" font-size="12" transform="rotate(-90, 20, ${
      height / 2
    })">XP</text>
    `;
    svg.appendChild(labelsGroup);
  },

  renderXPByProjects() {
    const svg = document.getElementById("xp-projects-graph");
    if (!svg || this.xpTransactions.length === 0) return;

    // Group XP by project path
    const projectXP = {};
    this.xpTransactions.forEach((t) => {
      const projectName = t.path.split("/").pop() || "Unknown";
      projectXP[projectName] = (projectXP[projectName] || 0) + t.amount;
    });

    // Get top 10 projects
    const topProjects = Object.entries(projectXP)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    const width = 600;
    const height = 300;
    const padding = 60;
    const barWidth = (width - padding * 2) / topProjects.length - 10;

    svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
    svg.innerHTML = "";

    const maxXP = Math.max(...topProjects.map((p) => p[1]));

    // Draw bars
    topProjects.forEach(([name, xp], i) => {
      const barHeight = (xp / maxXP) * (height - padding * 2);
      const x = padding + i * (barWidth + 10);
      const y = height - padding - barHeight;

      const bar = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "rect"
      );
      bar.setAttribute("x", x);
      bar.setAttribute("y", y);
      bar.setAttribute("width", barWidth);
      bar.setAttribute("height", barHeight);
      bar.setAttribute("fill", `hsl(${260 + i * 10}, 70%, 60%)`);
      bar.setAttribute("rx", "4");

      const title = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "title"
      );
      title.textContent = `${name}: ${this.formatNumber(xp)} XP`;
      bar.appendChild(title);

      svg.appendChild(bar);

      // Label
      const text = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "text"
      );
      text.setAttribute("x", x + barWidth / 2);
      text.setAttribute("y", height - padding + 20);
      text.setAttribute("text-anchor", "middle");
      text.setAttribute("fill", "rgba(255,255,255,0.6)");
      text.setAttribute("font-size", "10");
      text.textContent = name.substring(0, 8);
      svg.appendChild(text);
    });

    // Y-axis
    const axis = document.createElementNS("http://www.w3.org/2000/svg", "line");
    axis.setAttribute("x1", padding);
    axis.setAttribute("y1", padding);
    axis.setAttribute("x2", padding);
    axis.setAttribute("y2", height - padding);
    axis.setAttribute("stroke", "rgba(255,255,255,0.2)");
    axis.setAttribute("stroke-width", "2");
    svg.appendChild(axis);
  },

  renderAuditRatio() {
    const svg = document.getElementById("audit-ratio-graph");
    if (!svg) return;

    const width = 300;
    const height = 300;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = 100;

    svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
    svg.innerHTML = "";

    const totalUp = this.userData.totalUp || 0;
    const totalDown = this.userData.totalDown || 0;
    const total = totalUp + totalDown;

    if (total === 0) {
      svg.innerHTML =
        '<text x="150" y="150" text-anchor="middle" fill="rgba(255,255,255,0.6)">No audit data</text>';
      return;
    }

    const upPercent = (totalUp / total) * 100;
    const downPercent = (totalDown / total) * 100;

    // Calculate angles
    const upAngle = (upPercent / 100) * 360;
    const downAngle = (downPercent / 100) * 360;

    // Draw pie slices
    const upPath = this.describeArc(centerX, centerY, radius, 0, upAngle);
    const downPath = this.describeArc(
      centerX,
      centerY,
      radius,
      upAngle,
      upAngle + downAngle
    );

    const upSlice = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "path"
    );
    upSlice.setAttribute("d", upPath);
    upSlice.setAttribute("fill", "#2ecc71");
    upSlice.setAttribute("stroke", "#fff");
    upSlice.setAttribute("stroke-width", "2");
    const upTitle = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "title"
    );
    upTitle.textContent = `Given: ${this.formatNumber(
      totalUp
    )} (${upPercent.toFixed(1)}%)`;
    upSlice.appendChild(upTitle);
    svg.appendChild(upSlice);

    const downSlice = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "path"
    );
    downSlice.setAttribute("d", downPath);
    downSlice.setAttribute("fill", "#e74c3c");
    downSlice.setAttribute("stroke", "#fff");
    downSlice.setAttribute("stroke-width", "2");
    const downTitle = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "title"
    );
    downTitle.textContent = `Received: ${this.formatNumber(
      totalDown
    )} (${downPercent.toFixed(1)}%)`;
    downSlice.appendChild(downTitle);
    svg.appendChild(downSlice);

    // Center text
    const ratio = (totalUp / totalDown).toFixed(2);
    const centerText = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "text"
    );
    centerText.setAttribute("x", centerX);
    centerText.setAttribute("y", centerY);
    centerText.setAttribute("text-anchor", "middle");
    centerText.setAttribute("dominant-baseline", "middle");
    centerText.setAttribute("fill", "#fff");
    centerText.setAttribute("font-size", "24");
    centerText.setAttribute("font-weight", "bold");
    centerText.textContent = ratio;
    svg.appendChild(centerText);

    // Legend
    const legend = document.createElementNS("http://www.w3.org/2000/svg", "g");
    legend.innerHTML = `
      <rect x="20" y="20" width="15" height="15" fill="#2ecc71"/>
      <text x="40" y="32" fill="rgba(255,255,255,0.8)" font-size="12">Given</text>
      <rect x="20" y="45" width="15" height="15" fill="#e74c3c"/>
      <text x="40" y="57" fill="rgba(255,255,255,0.8)" font-size="12">Received</text>
    `;
    svg.appendChild(legend);
  },

  renderPassFailRatio() {
    const svg = document.getElementById("pass-fail-graph");
    if (!svg || this.progresses.length === 0) return;

    const passed = this.progresses.filter((p) => p.grade === 1).length;
    const failed = this.progresses.filter((p) => p.grade === 0).length;
    const total = passed + failed;

    const width = 300;
    const height = 300;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = 100;

    svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
    svg.innerHTML = "";

    if (total === 0) {
      svg.innerHTML =
        '<text x="150" y="150" text-anchor="middle" fill="rgba(255,255,255,0.6)">No project data</text>';
      return;
    }

    const passPercent = (passed / total) * 100;
    const failPercent = (failed / total) * 100;

    // Draw donut chart
    const passAngle = (passPercent / 100) * 360;
    const failAngle = (failPercent / 100) * 360;

    const passPath = this.describeArc(
      centerX,
      centerY,
      radius,
      0,
      passAngle,
      60
    );
    const failPath = this.describeArc(
      centerX,
      centerY,
      radius,
      passAngle,
      passAngle + failAngle,
      60
    );

    const passSlice = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "path"
    );
    passSlice.setAttribute("d", passPath);
    passSlice.setAttribute("fill", "#2ecc71");
    passSlice.setAttribute("stroke", "#fff");
    passSlice.setAttribute("stroke-width", "2");
    svg.appendChild(passSlice);

    const failSlice = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "path"
    );
    failSlice.setAttribute("d", failPath);
    failSlice.setAttribute("fill", "#e74c3c");
    failSlice.setAttribute("stroke", "#fff");
    failSlice.setAttribute("stroke-width", "2");
    svg.appendChild(failSlice);

    // Center text
    const centerGroup = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "g"
    );
    centerGroup.innerHTML = `
      <text x="${centerX}" y="${
      centerY - 10
    }" text-anchor="middle" fill="#fff" font-size="32" font-weight="bold">${passPercent.toFixed(
      0
    )}%</text>
      <text x="${centerX}" y="${
      centerY + 15
    }" text-anchor="middle" fill="rgba(255,255,255,0.6)" font-size="14">Success Rate</text>
    `;
    svg.appendChild(centerGroup);

    // Legend
    const legend = document.createElementNS("http://www.w3.org/2000/svg", "g");
    legend.innerHTML = `
      <circle cx="30" cy="30" r="8" fill="#2ecc71"/>
      <text x="45" y="35" fill="rgba(255,255,255,0.8)" font-size="12">Passed: ${passed}</text>
      <circle cx="30" cy="55" r="8" fill="#e74c3c"/>
      <text x="45" y="60" fill="rgba(255,255,255,0.8)" font-size="12">Failed: ${failed}</text>
    `;
    svg.appendChild(legend);
  },

  renderRecentActivity() {
    const container = document.getElementById("recent-activity");
    if (!container) return;

    const recent = this.userData.transactions
      .slice(0, 10)
      .map((t) => {
        const date = new Date(t.createdAt).toLocaleDateString();
        const type = t.type.toUpperCase();
        const amount =
          t.amount > 0
            ? `+${this.formatNumber(t.amount)}`
            : this.formatNumber(t.amount);
        const project = t.path.split("/").pop() || "Unknown";

        return `
          <div class="activity-item">
            <div class="activity-icon ${t.type}">${
          type === "XP" ? "⭐" : "📋"
        }</div>
            <div class="activity-details">
              <div class="activity-title">${project}</div>
              <div class="activity-meta">${date} • ${type}</div>
            </div>
            <div class="activity-value ${
              t.amount > 0 ? "positive" : "negative"
            }">${amount}</div>
          </div>
        `;
      })
      .join("");

    container.innerHTML = recent || '<p class="no-data">No recent activity</p>';
  },

  // Helper functions
  formatNumber(num) {
    return new Intl.NumberFormat("en-US").format(num);
  },

  describeArc(x, y, radius, startAngle, endAngle, innerRadius = 0) {
    const start = this.polarToCartesian(x, y, radius, endAngle);
    const end = this.polarToCartesian(x, y, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

    if (innerRadius > 0) {
      const innerStart = this.polarToCartesian(x, y, innerRadius, endAngle);
      const innerEnd = this.polarToCartesian(x, y, innerRadius, startAngle);
      return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 0 ${end.x} ${end.y} L ${innerEnd.x} ${innerEnd.y} A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 1 ${innerStart.x} ${innerStart.y} Z`;
    }

    return `M ${x} ${y} L ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 0 ${end.x} ${end.y} Z`;
  },

  polarToCartesian(centerX, centerY, radius, angleInDegrees) {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
    return {
      x: centerX + radius * Math.cos(angleInRadians),
      y: centerY + radius * Math.sin(angleInRadians),
    };
  },
};

// Initialize dashboard when view is shown
document.addEventListener("DOMContentLoaded", () => {
  const dashboardView = document.getElementById("dashboard-view");
  if (dashboardView) {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.target.style.display === "flex") {
          Dashboard.init();
        }
      });
    });

    observer.observe(dashboardView, {
      attributes: true,
      attributeFilter: ["style"],
    });
  }
});
