import Image from 'next/image';

export function HamburgerMascot({ className = '' }: { className?: string }) {
  return (
    <Image
      src="/Photoroom.png"
      alt="햄댕치"
      width={200}
      height={265}
      className={className}
    />
  );
}
