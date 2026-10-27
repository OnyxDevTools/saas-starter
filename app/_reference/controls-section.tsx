// filename: app/_reference/controls-section.tsx
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { SwitchField } from "@/components/ui/switch-field";
import { Textarea } from "@/components/ui/textarea";

function SectionHeading({
  title,
  description,
}: Readonly<{ title: string; description: string }>) {
  return (
    <div className="max-w-2xl space-y-2">
      <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
      <p className="text-muted-foreground text-sm leading-6">{description}</p>
    </div>
  );
}

export function ControlsSection() {
  return (
    <>
      <section className="space-y-6">
        <SectionHeading
          title="Buttons"
          description="Variants cover primary work, secondary actions, and destructive confirmation."
        />
        <div className="flex flex-wrap items-center gap-3">
          <Button>Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="destructive">Destructive</Button>
          <Button size="sm">Small</Button>
          <Button size="lg">Large</Button>
          <Button disabled>Disabled</Button>
        </div>
      </section>

      <section className="space-y-6">
        <SectionHeading
          title="Badges"
          description="Compact status labels for filters, counts, and state chips."
        />
        <div className="flex flex-wrap items-center gap-2">
          <Badge>Default</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="outline">Outline</Badge>
        </div>
      </section>

      <section className="space-y-6">
        <SectionHeading
          title="Form controls"
          description="Uncontrolled primitives for layout and affordance. Validated submission lives in Patterns."
        />
        <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
          <fieldset className="space-y-4">
            <legend className="mb-4 text-sm font-semibold">Text inputs</legend>
            <div className="space-y-2">
              <Label htmlFor="demo-invalid">Invalid email</Label>
              <Input
                id="demo-invalid"
                name="demo-invalid"
                type="email"
                defaultValue="not-an-email"
                aria-invalid="true"
                aria-describedby="demo-invalid-error"
              />
              <p id="demo-invalid-error" className="text-destructive text-sm">
                Enter a valid email address.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="demo-file">Attachment</Label>
              <Input id="demo-file" name="demo-file" type="file" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="demo-disabled">Disabled</Label>
              <Input
                id="demo-disabled"
                name="demo-disabled"
                defaultValue="Read only value"
                disabled
              />
            </div>
          </fieldset>

          <fieldset className="space-y-5">
            <legend className="mb-4 text-sm font-semibold">Selection</legend>
            <div className="space-y-2">
              <Label htmlFor="demo-role">Role</Label>
              <Select defaultValue="editor">
                <SelectTrigger id="demo-role">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="viewer">Viewer</SelectItem>
                    <SelectItem value="editor">Editor</SelectItem>
                    <SelectItem value="admin">Administrator</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-3">
              <Checkbox id="demo-terms" defaultChecked />
              <Label htmlFor="demo-terms">Accept terms</Label>
            </div>
            <div className="space-y-3">
              <Label>Visibility</Label>
              <RadioGroup defaultValue="private" aria-label="Visibility">
                <div className="flex items-center gap-3">
                  <RadioGroupItem value="private" id="demo-private" />
                  <Label htmlFor="demo-private">Private</Label>
                </div>
                <div className="flex items-center gap-3">
                  <RadioGroupItem value="shared" id="demo-shared" />
                  <Label htmlFor="demo-shared">Shared</Label>
                </div>
              </RadioGroup>
            </div>
            <div className="border-border/60 space-y-4 border-t pt-4">
              <SwitchField
                id="demo-notifications"
                label="Email notifications"
                defaultChecked
              />
              <SwitchField id="demo-digest" label="Weekly digest" />
            </div>
          </fieldset>

          <fieldset className="space-y-5 md:col-span-2 xl:col-span-1">
            <legend className="mb-4 text-sm font-semibold">
              Text and range
            </legend>
            <div className="space-y-2">
              <Label htmlFor="demo-description">Description</Label>
              <Textarea
                id="demo-description"
                name="demo-description"
                placeholder="Add a short description"
              />
            </div>
            <div className="space-y-3">
              <Label id="demo-progress-label">Progress</Label>
              <Slider
                thumbLabelledBy="demo-progress-label"
                defaultValue={[62]}
                max={100}
                step={1}
              />
              <div className="text-muted-foreground flex justify-between font-mono text-xs">
                <span>0</span>
                <span>100</span>
              </div>
            </div>
          </fieldset>
        </div>
      </section>
    </>
  );
}
