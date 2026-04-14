import { Checkbox } from "@/shared/ui/shadCNComponents/ui/checkbox";
import { Label } from "@/shared/ui/shadCNComponents/ui/label";
import type { AppSettingsSectionDefinition } from "../model/types";

interface ImportSectionRowProps {
  definition: AppSettingsSectionDefinition;
  checked: boolean;
  onToggleSection: (sectionId: string, checked: boolean) => void;
}

export const ImportSectionRow = ({
  definition,
  checked,
  onToggleSection,
}: ImportSectionRowProps) => {
  const fieldId = `import-settings-${definition.id}`;

  const handleCheckedChange = (value: boolean | "indeterminate") => {
    if (value === "indeterminate") {
      return;
    }
    onToggleSection(definition.id, value);
  };

  return (
    <div className="flex gap-3 rounded-md border border-border bg-muted/30 px-3 py-2">
      <Checkbox
        id={fieldId}
        checked={checked}
        onCheckedChange={handleCheckedChange}
        className="mt-0.5"
      />
      <div className="min-w-0 flex-1 space-y-0.5">
        <Label htmlFor={fieldId} className="text-sm font-medium leading-tight">
          {definition.title}
        </Label>
        <p className="text-xs text-muted-foreground">{definition.description}</p>
      </div>
    </div>
  );
};
