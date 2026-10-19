import { Loader2 } from 'lucide-react';

export default function AdminLoading({ message }: { message: string }) {
  return (
    <div className="py-16 flex flex-col items-center justify-center gap-2">
      <Loader2 className="w-8 h-8 text-amber-600 animate-spin" />
      <p className="text-gray-500 text-xs">{message}</p>
    </div>
  );
}