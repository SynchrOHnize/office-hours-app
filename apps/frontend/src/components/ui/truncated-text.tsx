import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"

export const TruncatedText = ({ text, maxLength = 20 }: { text: string, maxLength?: number }) => {
    if (!text) return null;
    const truncatedText = text.length > maxLength ? text.substring(0, maxLength) + '...' : text;

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger className="text-left">
                    {truncatedText}
                </TooltipTrigger>
                <TooltipContent>
                    <p className="max-w-xs break-all">{text}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
};