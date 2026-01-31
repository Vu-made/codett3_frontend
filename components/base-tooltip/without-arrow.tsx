import { Button } from '@/components/ui/base-button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/base-tooltip';

export default function BaseTooltipWithoutArrowDemo() {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger render={<Button variant="outline" />}>Display Tooltip</TooltipTrigger>
        <TooltipContent showArrow>
          <p>Get detailed information about this feature.</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
