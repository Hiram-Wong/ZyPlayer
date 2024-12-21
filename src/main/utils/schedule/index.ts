
interface RegisterScheduleOption {
  name: string;
  fun: Function;
  interval: number;
  [key: string]: any;
}

interface Schedule extends RegisterScheduleOption {
  isRunning?: boolean;
  instance?: any
}

const schedules = new Map<string, Schedule>()

function registerSchedule(schedule: RegisterScheduleOption): Schedule {
  if (hasSchedule(schedule.name)) {
    const thisSchedule = getSchedule(schedule.name)
    if (thisSchedule?.isRunning) {
      console.warn("has same name schedule and isRunning");
      return thisSchedule
    } else {
      schedules.set(schedule.name, schedule)
      return schedule
    }
  } else {
    schedules.set(schedule.name, schedule)
    return schedule
  }
}

function hasSchedule(name: string): boolean {
  return schedules.has(name)
}

function getSchedule(name: string): Schedule | undefined {
  return schedules.get(name);
}

function isRunningSchedule(name: string): boolean {
  return schedules.get(name)?.isRunning ? true : false
}

function runSchedule(name: string, initRun = true): void {
  const schedule = getSchedule(name)
  if (!schedule) {
    console.warn('not register this schedule')
    return
  }
  const { isRunning, instance, fun, interval } = schedule
  if (isRunning && instance) {
    instance.clear()
  }
  if (initRun) {
    fun()
  }
  schedules.set(name, {
    ...schedule,
    instance: EpSetInterval(() => {
      fun()
    }, interval),
    isRunning: true
  })
}

function stopSchedule(name: string): void {
  if (!hasSchedule(name)) {
    return
  } else {
    const thisSchedule = getSchedule(name)
    if (thisSchedule?.instance) {
      thisSchedule.instance.clear()
      schedules.set(name, {
        ...thisSchedule,
        instance: null,
        isRunning: false
      })
    }

  }
}

function clearSchedule(name: string): void {
  if (!hasSchedule(name)) {
    return
  } else {
    const thisSchedule = getSchedule(name)
    if (thisSchedule?.instance) {
      thisSchedule.instance.clear()
    }
    schedules.delete(name)
  }
}

function EpSetInterval(callback: any, delay: number) {
  let timeoutId = setTimeout(function repeat() {
    callback();
    timeoutId = setTimeout(repeat, delay);
  }, delay);

  return {
    clear() {
      clearTimeout(timeoutId);
    }
  };
}

function clearAllSchedule(): void {
  const schedulesArray = Array.from(schedules.values());
  schedulesArray.forEach(schedule => {
    if (schedule.instance) {
      schedule.instance.clear();
    }
  })
  schedules.clear()
}

export {
  registerSchedule,
  runSchedule,
  stopSchedule,
  clearSchedule,
  hasSchedule,
  getSchedule,
  isRunningSchedule,
  schedules,
  clearAllSchedule
}
