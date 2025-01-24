import { useClickOutside } from "@/lib/hooks/useClickOutside";
import { X } from "lucide-react";
import Image from "next/image";
import { ReactNode } from "react"

type ModalProps = {
  title?: string | string[];
  show: boolean,
  onClose: () => void;
  children: ReactNode,
};

export default function Modal({ title, children, show, onClose }: ModalProps) {
  const ref = useClickOutside(onClose, show);
  return (
    <div className={`fixed top-0 left-0 w-full h-screen overflow-hidden bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center ${show ? "scale-1" : "scale-0"}`}>
      <section ref={ref} className="w-[96%] max-w-2xl flex flex-col gap-4 bg-white rounded-xl px-4 py-4">
        <X onClick={onClose} className="ml-auto w-max cursor-pointer text-black" />

        <h3 className="mx-auto text-2xl text-black text-center whitespace-nowrap font-medium">{title}</h3>

        {children}

        <div className="mx-auto mt-auto flex items-center gap-2">
          <small className="text-gray-500 text-xs sm:text-sm">
            Powered By Peer Protocol
          </small>
          <Image
            src="/images/LogoBlack.svg"
            height={20}
            width={20}
            alt="peer-protocol-logo"
            className="opacity-50"
          />
        </div>
      </section>
    </div>
  );
}
