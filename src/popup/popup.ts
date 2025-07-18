class TimerPopup {
    private currentTabId: number = 0;
    private uiUpdateInterval: ReturnType<typeof setInterval> | null = null;

    constructor() {
        this.initializeUI();
        this.getCurrentTab();
        this.startUIUpdates();
    }

    private initializeUI(): void {
        const startButton = document.getElementById('startButton');
        startButton?.addEventListener('click', () => this.startTimer());

        const closeButton = document.getElementById('closeButton');
        closeButton?.addEventListener('click', () => this.closeCurrentTab());
    }

    private getCurrentTab(): void {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0]) {
                this.currentTabId = tabs[0].id!;
            }
        });
    }

    private startTimer(): void {
        const days = parseInt((<HTMLInputElement>document.getElementById('days')).value) || 0;
        const hours = parseInt((<HTMLInputElement>document.getElementById('hours')).value) || 0;
        const minutes = parseInt((<HTMLInputElement>document.getElementById('minutes')).value) || 0;
        const seconds = parseInt((<HTMLInputElement>document.getElementById('seconds')).value) || 0;

        const duration = (days * 86400) + (hours * 3600) + (minutes * 60) + seconds;

        if (duration > 0) {
            chrome.runtime.sendMessage({ 
                action: 'startTimer', 
                duration: duration,
                tabId: this.currentTabId
            }, (response) => {
                if (chrome.runtime.lastError) {
                    console.error('Error starting timer:', chrome.runtime.lastError);
                    return;
                }
                
                if (response && response.success) {
                    // Clear input fields
                    (<HTMLInputElement>document.getElementById('days')).value = '';
                    (<HTMLInputElement>document.getElementById('hours')).value = '';
                    (<HTMLInputElement>document.getElementById('minutes')).value = '';
                    (<HTMLInputElement>document.getElementById('seconds')).value = '';
                    
                    this.updateTimersTable();
                }
            });
        }
    }

    private startUIUpdates(): void {
        this.updateTimersTable();
        
        if (this.uiUpdateInterval) {
            clearInterval(this.uiUpdateInterval);
        }
        
        this.uiUpdateInterval = setInterval(() => {
            this.updateTimersTable();
        }, 1000);
    }

    private updateTimersTable(): void {
        chrome.runtime.sendMessage({ action: 'getAllTimers' }, (response) => {
            if (chrome.runtime.lastError) {
                console.error('Error getting timers:', chrome.runtime.lastError);
                return;
            }
            
            if (response && response.timers) {
                this.renderTimersTable(response.timers);
            }
        });
    }

    private renderTimersTable(timers: any[]): void {
        const tableBody = document.getElementById('timersTableBody');
        const noTimersMessage = document.getElementById('noTimersMessage');
        const timersTable = document.getElementById('timersTable');

        if (!tableBody || !noTimersMessage || !timersTable) return;

        if (timers.length === 0) {
            timersTable.classList.add('hidden');
            noTimersMessage.classList.remove('hidden');
            return;
        }

        timersTable.classList.remove('hidden');
        noTimersMessage.classList.add('hidden');

        tableBody.innerHTML = '';

        timers.forEach((timer) => {
            const row = document.createElement('tr');
            
            const days = Math.floor(timer.totalTime / 86400);
            const hours = Math.floor((timer.totalTime % 86400) / 3600);
            const minutes = Math.floor((timer.totalTime % 3600) / 60);
            const seconds = timer.totalTime % 60;
            
            const timeDisplay = `${String(days).padStart(2, '0')}:${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

            // Create cells
            const titleCell = document.createElement('td');
            titleCell.className = 'tab-title';
            titleCell.title = timer.title;
            titleCell.textContent = timer.title;

            const timeCell = document.createElement('td');
            timeCell.className = 'timer-display';
            timeCell.textContent = timeDisplay;

            const actionsCell = document.createElement('td');
            actionsCell.className = 'action-buttons';

            // Create switch button
            const switchBtn = document.createElement('button');
            switchBtn.className = 'switch-btn';
            switchBtn.textContent = 'Switch';
            switchBtn.addEventListener('click', () => this.switchToTab(timer.tabId));

            // Create cancel button
            const cancelBtn = document.createElement('button');
            cancelBtn.className = 'cancel-btn';
            cancelBtn.textContent = 'Cancel';
            cancelBtn.addEventListener('click', () => this.cancelTimer(timer.tabId));

            actionsCell.appendChild(switchBtn);
            actionsCell.appendChild(cancelBtn);

            row.appendChild(titleCell);
            row.appendChild(timeCell);
            row.appendChild(actionsCell);

            tableBody.appendChild(row);
        });
    }

    public switchToTab(tabId: number): void {
        chrome.runtime.sendMessage({ 
            action: 'switchToTab', 
            tabId: tabId 
        }, (response) => {
            if (chrome.runtime.lastError) {
                console.error('Error switching to tab:', chrome.runtime.lastError);
                return;
            }
            
            if (response && response.success) {
                window.close();
            }
        });
    }

    public cancelTimer(tabId: number): void {
        chrome.runtime.sendMessage({ 
            action: 'stopTimer', 
            tabId: tabId 
        }, (response) => {
            if (chrome.runtime.lastError) {
                console.error('Error canceling timer:', chrome.runtime.lastError);
                return;
            }
            
            if (response && response.success) {
                this.updateTimersTable();
            }
        });
    }

    private closeCurrentTab(): void {
        chrome.runtime.sendMessage({ 
            action: 'closeTab',
            tabId: this.currentTabId
        }, (response) => {
            if (chrome.runtime.lastError) {
                console.error('Error closing tab:', chrome.runtime.lastError);
            }
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new TimerPopup();
});