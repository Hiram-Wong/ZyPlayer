/**
 * Schedule option interface
 */
export interface RegisterScheduleOption {
  name: string;
  fun: () => void;
  interval: number;
  immediate?: boolean;
  [key: string]: any;
}

/**
 * Schedule interface
 */
export interface Schedule extends RegisterScheduleOption {
  isRunning?: boolean;
  instance?: any;
}

/**
 * Schedule manager class (Singleton)
 */
export class ScheduleManager {
  private static instance: ScheduleManager;
  private schedules: Map<string, Schedule>;

  private constructor() {
    this.schedules = new Map<string, Schedule>();
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): ScheduleManager {
    if (!ScheduleManager.instance) {
      ScheduleManager.instance = new ScheduleManager();
    }
    return ScheduleManager.instance;
  }

  /**
   * Register a new schedule
   * @param schedule Schedule options
   * @returns Schedule object
   */
  public registerSchedule(schedule: RegisterScheduleOption): Schedule {
    if (this.hasSchedule(schedule.name)) {
      const thisSchedule = this.getSchedule(schedule.name);
      if (thisSchedule?.isRunning) {
        this.stopSchedule(schedule.name);
      }
    }

    this.schedules.set(schedule.name, schedule);
    this.runSchedule(schedule.name);

    return schedule;
  }

  /**
   * Check if a schedule exists
   * @param name Schedule name
   * @returns Whether the schedule exists
   */
  public hasSchedule(name: string): boolean {
    return this.schedules.has(name);
  }

  /**
   * Get a schedule by name
   * @param name Schedule name
   * @returns Schedule object or undefined
   */
  public getSchedule(name: string): Schedule | undefined {
    return this.schedules.get(name);
  }

  /**
   * Check if a schedule is running
   * @param name Schedule name
   * @returns Whether the schedule is running
   */
  public isRunningSchedule(name: string): boolean {
    return !!this.schedules.get(name)?.isRunning;
  }

  /**
   * Run a schedule
   * @param name Schedule name
   */
  public runSchedule(name: string): void {
    const schedule = this.getSchedule(name);
    if (!schedule) {
      return;
    }

    const { isRunning, instance, immediate, fun, interval } = schedule;
    if (isRunning && instance) {
      instance.clear();
    }
    if (immediate) {
      fun();
    }
    this.schedules.set(name, {
      ...schedule,
      instance: this.createInterval(() => {
        fun();
      }, interval),
      isRunning: true,
    });
  }

  /**
   * Stop a schedule
   * @param name Schedule name
   */
  public stopSchedule(name: string): void {
    if (this.hasSchedule(name)) {
      const thisSchedule = this.getSchedule(name);
      if (thisSchedule?.instance) {
        thisSchedule.instance.clear();
        this.schedules.set(name, {
          ...thisSchedule,
          instance: null,
          isRunning: false,
        });
      }
    }
  }

  /**
   * Clear a schedule
   * @param name Schedule name
   */
  public clearSchedule(name: string): void {
    if (this.hasSchedule(name)) {
      const thisSchedule = this.getSchedule(name);
      if (thisSchedule?.instance) {
        thisSchedule.instance.clear();
      }
      this.schedules.delete(name);
    }
  }

  /**
   * Clear all schedules
   */
  public clearAllSchedules(): void {
    const schedulesArray = Array.from(this.schedules.values());
    schedulesArray.forEach((schedule) => {
      if (schedule.instance) {
        schedule.instance.clear();
      }
    });
    this.schedules.clear();
  }

  /**
   * Get all schedules
   * @returns Map of all schedules
   */
  public getAllSchedules(): Map<string, Schedule> {
    return this.schedules;
  }

  /**
   * Create an interval with better control than setInterval
   * @param callback Callback function
   * @param delay Delay in milliseconds
   * @returns Interval object with clear method
   */
  private createInterval(callback: () => void, delay: number) {
    let timeoutId = setTimeout(function repeat() {
      callback();
      timeoutId = setTimeout(repeat, delay);
    }, delay);

    return {
      clear() {
        clearTimeout(timeoutId);
      },
    };
  }
}

export const scheduleManager = ScheduleManager.getInstance();
