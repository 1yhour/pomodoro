const ALARMS_NAME = "pomodoro";

export default defineBackground(() => {
  browser.runtime.onMessage.addListener((msg) => {
    if (msg.type === "START") {
      const endTime = Date.now() + msg.minutes * 60 * 1000;
      browser.alarms.create(ALARMS_NAME, { when: endTime })
      browser.storage.local.set({ timer: { running: true, endTime } })
    }
    if (msg.type === "STOP") {
      browser.alarms.clear(ALARMS_NAME)
      browser.storage.local.set({ timer: { running: false, endTime: null } })
    }
  })
  browser.alarms.onAlarm.addListener(async (alarm) => {
    if (alarm.name !== ALARMS_NAME) return
    browser.storage.local.set({ timer: { running: false, endTime: null } })
    browser.notifications.create({
      type: "basic",
      iconUrl: "/icon/Tomato.png",
      title: "Pomodoro",
      message: "Time is up!",
    })
  })
});
