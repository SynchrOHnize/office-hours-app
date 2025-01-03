import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"

export const TruncatedText = ({ text }: { text: string }) => {
    if (!text) return null;
    const truncatedText = text.length > 30 ? text.substring(0, 30) + '...' : text;

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