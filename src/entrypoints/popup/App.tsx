import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
export default function App() {
  const [endTime, setEndTime] = useState<number | null>(null);
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    browser.storage.local.get("timer").then((res: any) => {
      setEndTime(res.timer?.endTime ?? null);
    })
    const onChange = (changes: Record<string, any>) => {
      if(changes.timer){
        setEndTime(changes.timer?.newValue?.endTime ?? null);
      }
    }
    browser.storage.onChanged.addListener(onChange);
    return () => browser.storage.onChanged.removeListener(onChange);
  }, [])

   useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const remainingSeconds = endTime ? Math.max(0, Math.ceil((endTime - now) / 1000)) : 0;
  const mm = String(Math.floor(remainingSeconds / 60)).padStart(2, '0');
  const ss = String(remainingSeconds % 60).padStart(2, '0');
  return (
    <div className="w-75">
      <div className="text-4xl font-bold">{mm}:{ss}</div>
      <div>
        <Button onClick={() => browser.runtime.sendMessage({ type: "START", minutes: 0.5 })}>Start</Button>
      </div>
    </div>
  )
}