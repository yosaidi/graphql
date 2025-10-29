import { formatNumber, capitalize } from '../utils.js';

class Profile {
    constructor() {
        this.container = null;
        this.userData = null;
    }

    init(userData) {
        this.container = document.getElementById('profile-section');
        if (!this.container) {
            console.error("Profile section container not found");
            return;
        }
        this.userData = userData;
        this.render();
    }

    render() {
        if (!this.userData) return;

        const { user: userArray, totalXP } = this.userData;
        const user = userArray[0]; // Get the user object from the array
        const auditRatio = user.auditRatio ? user.auditRatio.toFixed(1) : 'N/A';

        this.container.innerHTML = `
            <div class="profile-header">
                <h2>${user.firstName} ${user.lastName}</h2>
                <p>@${user.login}</p>
            </div>
            <div class="profile-stats">
                <div class="stat-item">
                    <span class="stat-label">Total XP</span>
                    <span class="stat-value">${formatNumber(totalXP)}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Audit Ratio</span>
                    <span class="stat-value">${auditRatio}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Campus</span>
                    <span class="stat-value">${capitalize(user.campus)}</span>
                </div>
            </div>
        `;
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

const profile = new Profile();
export default profile;
