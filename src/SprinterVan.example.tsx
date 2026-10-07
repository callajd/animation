import { useState } from "react";
import {
  Brain,
  Circle,
  CircleCheck,
  Cog,
  Moon,
  RotateCcw,
  Smile,
  Sparkles,
  TriangleAlert,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import vanSvg from "./animation_ready_van.svg?raw";
import SprinterVan, { type SprinterVanExpression } from "./SprinterVan";

const EXPRESSIONS: readonly SprinterVanExpression[] = [
  "idle", "happy", "thinking", "working", "excited", "success", "concerned", "sleepy",
];

const MOODS: Record<SprinterVanExpression, {
  title: string;
  detail: string;
  description: string;
  icon: LucideIcon;
}> = {
  idle: { title: "Idle", detail: "Easy does it", description: "Curious pupils, little side glances, and an occasional blink. Move your pointer and your van follows along.", icon: Circle },
  happy: { title: "Happy", detail: "Good vibes", description: "Two little smiling crescents inside the black headlamps. It's a good day to hit the road.", icon: Smile },
  thinking: { title: "Thinking", detail: "Connecting the dots", description: "The pupils look up to one side with a questioning asymmetry, while the exhaust takes its time.", icon: Brain },
  working: { title: "Working", detail: "Making progress", description: "The pupils scan together as if reading a line of text. A quicker exhaust rhythm keeps things moving.", icon: Cog },
  excited: { title: "Excited", detail: "Let's go!", description: "Wide-eyed pupils, quick glances, and an energetic bounce. Adventure is calling.", icon: Sparkles },
  success: { title: "Success", detail: "Nailed it", description: "Smiling eyes and a celebratory hop. Replay it for another little victory.", icon: CircleCheck },
  concerned: { title: "Concerned", detail: "Something's up", description: "The pupils tilt inward with a worried look and the van leans gently. A little reassurance goes a long way.", icon: TriangleAlert },
  sleepy: { title: "Sleepy", detail: "Taking it slow", description: "The pupils settle into two sleepy dashes, with a slow sway and no exhaust. Even vans need a rest.", icon: Moon },
};

export function SprinterVanExample() {
  const [expression, setExpression] = useState<SprinterVanExpression>("idle");
  const [animate, setAnimate] = useState(true);
  const [pupilColor, setPupilColor] = useState("#ffffff");
  const [smokeColor, setSmokeColor] = useState("#000000");
  const [revision, setRevision] = useState(0);
  const mood = MOODS[expression];

  function reset() {
    setExpression("idle");
    setAnimate(true);
    setPupilColor("#ffffff");
    setSmokeColor("#000000");
    setRevision((value) => value + 1);
  }

  return (
    <section className="playground" aria-label="Animation playground">
      <div className="preview">
        <div className="preview-header">
          <span className="eyebrow">The live canvas</span>
          <span className="mood-badge"><span className="status-dot" />{mood.title}</span>
        </div>
        <div className="van-stage">
          <SprinterVan
            key={revision}
            svg={vanSvg}
            expression={expression}
            animate={animate}
            pupilColor={pupilColor}
            smokeColor={smokeColor}
            label="Sprinter van with expressive pupils inside black headlamps"
            className="van-artwork"
          />
        </div>
        <div className="preview-footer">
          <span className="motion-status"><span className={animate ? "status-dot" : "status-dot paused"} />{animate ? "Animation enabled" : "Motion paused"}</span>
          <Button variant="ghost" size="sm" disabled={!animate} onClick={() => setRevision((value) => value + 1)}>
            <RotateCcw aria-hidden="true" /> Replay
          </Button>
        </div>
      </div>

      <aside className="controls" aria-labelledby="controls-title">
        <div className="controls-heading">
          <div><p className="eyebrow">Make it your own</p><h2 id="controls-title">Pick a personality</h2></div>
          <span className="expression-count">08 moods</span>
        </div>
        <div className="expression-grid" role="group" aria-label="Expression">
          {EXPRESSIONS.map((value) => {
            const option = MOODS[value];
            const Icon = option.icon;
            return (
              <Button
                key={value}
                variant="outline"
                className="expression-button"
                aria-pressed={expression === value}
                onClick={() => {
                  if (value === expression) setRevision((current) => current + 1);
                  else setExpression(value);
                }}
              >
                <Icon aria-hidden="true" />
                <span><span className="expression-title">{option.title}</span><span className="expression-detail">{option.detail}</span></span>
              </Button>
            );
          })}
        </div>
        <p className="mood-description" aria-live="polite">{mood.description}</p>
        <div className="settings">
          <div className="animation-setting">
            <div><Label htmlFor="animate">Ambient animation</Label><p className="setting-hint">A little motion brings it to life.</p></div>
            <Switch id="animate" checked={animate} onCheckedChange={setAnimate} />
          </div>
          <div className="color-settings">
            <div className="color-setting">
              <Label htmlFor="pupils">Pupils</Label>
              <div className="color-input-row"><Input id="pupils" type="color" value={pupilColor} onChange={(event) => setPupilColor(event.currentTarget.value)} /><span>{pupilColor}</span></div>
            </div>
            <div className="color-setting">
              <Label htmlFor="exhaust">Exhaust</Label>
              <div className="color-input-row"><Input id="exhaust" type="color" value={smokeColor} onChange={(event) => setSmokeColor(event.currentTarget.value)} /><span>{smokeColor}</span></div>
            </div>
          </div>
        </div>
        <Button variant="ghost" className="reset-button" onClick={reset}><RotateCcw aria-hidden="true" /> Reset to defaults</Button>
      </aside>
    </section>
  );
}
