import { X } from "lucide-react";
import Image from "next/image";
import { useExitModal } from "~/store/use-exit-modal";
import { Progress } from "~/components/ui/progress";

type HeaderProps = {
  percentage: number;
};

export const Header = ({
  percentage,
}: HeaderProps) => {
  const { isOpen, open, close, onConfirm } = useExitModal();

  return (
    <>
      <header className="mx-auto flex w-full max-w-[1140px] items-center justify-between gap-x-7 px-10 pt-[20px] lg:pt-[50px]">
        <X
          onClick={open}
          className="cursor-pointer text-slate-500 transition hover:opacity-75"
        />
        <Progress value={percentage} />
      </header>

      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded shadow-lg">
            <p>Are you sure you want to exit?</p>
            <div className="mt-4 flex justify-end gap-4">
              <button onClick={close} className="px-4 py-2 bg-gray-300 rounded">
                No
              </button>
              <button onClick={onConfirm} className="px-4 py-2 bg-blue-500 text-white rounded">
                Yes
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};