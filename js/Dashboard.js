export class Dashboard {
  userData = null;
  xpTransactions = [];
  progresses = [];

  init() {
    const userDataStr = localStorage.getItem("userData");
    if (!userDataStr) {
      // If data is missing, force a logout to re-fetch
      const authEvent = new Event("force-logout");
      document.dispatchEvent(authEvent);
      return;
    }

    this.userData = JSON.parse(userDataStr);
    this.#processData();
    this.#renderDashboard();
  }

  #processData() {
    this.xpTransactions = this.userData.transactions
      .filter((t) => t.type === "xp" && t.path.includes("module"))
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    this.progresses = this.userData.progresses || [];
  }

  #renderDashboard() {
    this.#updateUserInfo();
    this.#updateStats();
    this.#renderGraphs();
  }

  #updateUserInfo() {
    const login = document.getElementById("user-login");
    const userId = document.getElementById("user-id");
    const avatar = document.getElementById("user-avatar-text");
    const welcomeName =
      this.userData.firstName && this.userData.lastName
        ? `${this.userData.firstName} ${this.userData.lastName}`
        : this.userData.login;

    if (login) login.textContent = `Welcome, ${welcomeName}!`;
    if (userId) userId.textContent = `Login: ${this.userData.id}`;
    if (avatar)
      avatar.textContent = this.userData.login.substring(0, 2).toUpperCase();
  }

  #updateStats() {
    const totalXP = this.userData.xp_total.aggregate.sum.amount;
    const totalXPEl = document.getElementById("total-xp");
    if (totalXPEl) {
      totalXPEl.textContent = this.#formatNumber(totalXP, "XP");
    }

    const auditRatioEl = document.getElementById("audit-ratio");
    if (auditRatioEl) {
      const ratio =
        this.userData.auditRatio ||
        this.userData.totalUp / this.userData.totalDown;
      auditRatioEl.textContent = ratio.toFixed(2);
    }

    const projects = this.progresses.filter((p) => p.object.type === "project");
    const passedProjects = projects.filter((p) => p.grade === 1).length;
    const passedEl = document.getElementById("projects-passed");
    if (passedEl) passedEl.textContent = passedProjects;

    const totalProjects = projects.length;
    const successRate =
      totalProjects > 0
        ? ((passedProjects / totalProjects) * 100).toFixed(1)
        : 0;
    const successRateEl = document.getElementById("success-rate");
    if (successRateEl) successRateEl.textContent = successRate + "%";
  }

  #renderGraphs() {
    this.#renderXPTimeline();
    this.#renderXPByProjects();
    this.#renderAuditRatio();
    this.#renderPassFailRatio();
    this.#renderCollaborationGraph();
  }

  #renderXPTimeline() {
    const svg = document.getElementById("xp-timeline-graph");
    if (!svg || this.xpTransactions.length === 0) return;

    const width = 600,
      height = 300,
      padding = 60;
    svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
    svg.innerHTML = "";

    let cumulative = 0;
    const points = this.xpTransactions.map((t) => {
      cumulative += t.amount;
      return { date: new Date(t.createdAt), xp: cumulative };
    });

    const maxXP = Math.max(...points.map((p) => p.xp));
    const minDate = points[0].date;
    const maxDate = points[points.length - 1].date;
    const dateRange = maxDate - minDate || 1; // Prevent division by zero

    const xScale = (date) =>
      padding + ((date - minDate) / dateRange) * (width - padding * 2);
    const yScale = (xp) =>
      height - padding - (xp / maxXP) * (height - padding * 2);

    const axesGroup = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "g"
    );
    axesGroup.innerHTML = `
      <line x1="${padding}" y1="${height - padding}" x2="${
      width - padding
    }" y2="${
      height - padding
    }" stroke="rgba(255,255,255,0.2)" stroke-width="2"/>
      <line x1="${padding}" y1="${padding}" x2="${padding}" y2="${
      height - padding
    }" stroke="rgba(255,255,255,0.2)" stroke-width="2"/>
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
      const title = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "title"
      );
      title.textContent = `${p.date.toLocaleDateString()}: ${this.#formatNumber(
        p.xp,
        "XP"
      )}`;
      circle.appendChild(title);
      svg.appendChild(circle);
    });
  }

  #renderXPByProjects() {
    const svg = document.getElementById("xp-projects-graph");
    if (!svg || this.xpTransactions.length === 0) return;

    const projectXP = {};
    this.xpTransactions.forEach((t) => {
      const projectName = t.path.split("/").pop() || "Unknown";
      projectXP[projectName] = (projectXP[projectName] || 0) + t.amount;
    });

    const topProjects = Object.entries(projectXP)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);
    const width = 600,
      height = 300,
      padding = 60;
    const barWidth = (width - padding * 2) / topProjects.length - 10;
    svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
    svg.innerHTML = "";

    const maxXP = Math.max(...topProjects.map((p) => p[1]));

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
      title.textContent = `${name}: ${this.#formatNumber(xp, "XP")}`;
      bar.appendChild(title);
      svg.appendChild(bar);

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
  }

  #renderAuditRatio() {
    const svg = document.getElementById("audit-ratio-graph");
    if (!svg) return;

    const width = 300,
      height = 300,
      centerX = width / 2,
      centerY = height / 2,
      radius = 100;
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
    const upAngle = (upPercent / 100) * 360;
    const downAngle = (downPercent / 100) * 360;

    const upPath = this.#describeArc(centerX, centerY, radius, 0, upAngle);
    const downPath = this.#describeArc(
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
    upTitle.textContent = `Given: ${this.#formatNumber(
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
    downTitle.textContent = `Received: ${this.#formatNumber(
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
  }

  #renderPassFailRatio() {
    const svg = document.getElementById("pass-fail-graph");
    if (!svg || !this.progresses) return;

    const projects = this.progresses.filter((p) => p.object.type === "project");
    const passed = projects.filter((p) => p.grade === 1).length;
    const failed = projects.filter((p) => p.grade === 0).length;
    const total = passed + failed;

    const width = 300,
      height = 300,
      centerX = width / 2,
      centerY = height / 2,
      radius = 100;
    svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
    svg.innerHTML = "";

    if (total === 0) {
      svg.innerHTML =
        '<text x="150" y="150" text-anchor="middle" fill="rgba(255,255,255,0.6)">No project data</text>';
      return;
    }

    const passPercent = (passed / total) * 100;
    const passAngle = (passPercent / 100) * 360;

    // Handle edge case where one is 100%
    const endAngle = passAngle === 360 ? 359.99 : passAngle;

    const passPath = this.#describeArc(
      centerX,
      centerY,
      radius,
      0,
      endAngle,
      60
    );
    const failPath = this.#describeArc(
      centerX,
      centerY,
      radius,
      endAngle,
      360,
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
    }" text-anchor="middle" fill="rgba(255,255,255,0.6)" font-size="14">Success</text>
    `;
    svg.appendChild(centerGroup);

    const legend = document.createElementNS("http://www.w3.org/2000/svg", "g");
    legend.innerHTML = `
      <circle cx="30" cy="30" r="8" fill="#2ecc71"/>
      <text x="45" y="35" fill="rgba(255,255,255,0.8)" font-size="12">Passed: ${passed}</text>
      <circle cx="30" cy="55" r="8" fill="#e74c3c"/>
      <text x="45" y="60" fill="rgba(255,255,255,0.8)" font-size="12">Failed: ${failed}</text>
    `;
    svg.appendChild(legend);
  }

  #renderCollaborationGraph() {
    const svg = document.getElementById("collaboration-graph");
    if (!svg || !this.progresses) return;

    const members = [];
    const currentUserLogin = this.userData.login;

    this.progresses.forEach((project) => {
      if (project.group && project.group.members) {
        project.group.members.forEach((member) => {
          const userlogin = member.userLogin;
          if (userlogin !== currentUserLogin) {
            let existingMember = members.find((m) => m.userlogin === userlogin);
            if (!existingMember) {
              members.push({ userlogin, times: 1 });
            } else {
              existingMember.times++;
            }
          }
        });
      }
    });

    const topCollaborators = members
      .sort((a, b) => b.times - a.times)
      .slice(0, 10);
    const width = 600,
      height = 300,
      padding = 60;

    svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
    svg.innerHTML = "";

    if (topCollaborators.length === 0) {
      svg.innerHTML =
        '<text x="300" y="150" text-anchor="middle" fill="rgba(255,255,255,0.6)">No collaboration data</text>';
      return;
    }

    const barWidth = (width - padding * 2) / topCollaborators.length - 10;
    const maxTimes = Math.max(...topCollaborators.map((p) => p.times));

    topCollaborators.forEach(({ userlogin, times }, i) => {
      const barHeight = (times / maxTimes) * (height - padding * 2);
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
      bar.setAttribute("fill", `hsl(${180 + i * 15}, 70%, 60%)`);
      bar.setAttribute("rx", "4");

      const title = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "title"
      );
      title.textContent = `${userlogin}: ${times} projects together`;
      bar.appendChild(title);
      svg.appendChild(bar);

      const text = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "text"
      );
      text.setAttribute("x", x + barWidth / 2);
      text.setAttribute("y", height - padding + 20);
      text.setAttribute("text-anchor", "middle");
      text.setAttribute("fill", "rgba(255,255,255,0.6)");
      text.setAttribute("font-size", "10");
      text.textContent = userlogin.substring(0, 8);
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
  }

  // --- Private Helper Functions ---

  #formatNumber(sizeInBytes, xp) {
    var result;
    if (sizeInBytes < 1000) {
      result = sizeInBytes + " B";
    } else if (sizeInBytes < 1000 * 1000) {
      if (xp === "XP") {
        result = Math.floor(sizeInBytes / 1000) + " kB";
      } else {
        result = (sizeInBytes / 1000).toFixed(2) + " KB";
      }
    } else {
      if (xp === "XP") {
        result = Math.floor(sizeInBytes / 1000 / 1000) + " MB";
      } else {
        sizeInBytes = (sizeInBytes / 1000 / 1000).toFixed(3);
        result = sizeInBytes.slice(0, 4) + " MB";
      }
    }
    return result;
  }

  #describeArc(x, y, radius, startAngle, endAngle, innerRadius = 0) {
    const start = this.#polarToCartesian(x, y, radius, endAngle);
    const end = this.#polarToCartesian(x, y, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

    if (innerRadius > 0) {
      const innerStart = this.#polarToCartesian(x, y, innerRadius, endAngle);
      const innerEnd = this.#polarToCartesian(x, y, innerRadius, startAngle);
      return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 0 ${end.x} ${end.y} L ${innerEnd.x} ${innerEnd.y} A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 1 ${innerStart.x} ${innerStart.y} Z`;
    }
    return `M ${x} ${y} L ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 0 ${end.x} ${end.y} Z`;
  }

  #polarToCartesian(centerX, centerY, radius, angleInDegrees) {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
    return {
      x: centerX + radius * Math.cos(angleInRadians),
      y: centerY + radius * Math.sin(angleInRadians),
    };
  }
}
