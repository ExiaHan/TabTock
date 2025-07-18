class Timer {
    private duration: number = 0; // Fix: initialize duration to avoid undefined errors
    private intervalId: ReturnType<typeof setInterval> | null = null; // Fix: use correct type for browser
    private callback: () => void;

    constructor(callback: () => void) {
        this.callback = callback;
    }

    setDuration(days: number, hours: number, minutes: number, seconds: number) {
        this.duration = (days * 24 * 60 * 60) + (hours * 60 * 60) + (minutes * 60) + seconds;
    }

    start() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
        }

        this.intervalId = setInterval(() => {
            if (this.duration > 0) {
                this.duration--;
            } else {
                this.stop();
                this.callback();
            }
        }, 1000);
    }

    stop() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }

    getRemainingTime() {
        const days = Math.floor(this.duration / (24 * 60 * 60));
        const hours = Math.floor((this.duration % (24 * 60 * 60)) / (60 * 60));
        const minutes = Math.floor((this.duration % (60 * 60)) / 60);
        const seconds = this.duration % 60;
        return { days, hours, minutes, seconds };
    }
}

export default Timer;